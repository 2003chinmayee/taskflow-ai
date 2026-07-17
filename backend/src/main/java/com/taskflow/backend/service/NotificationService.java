package com.taskflow.backend.service;

import com.taskflow.backend.domain.Notification;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.notification.NotificationResponse;
import com.taskflow.backend.enums.NotificationType;
import com.taskflow.backend.exception.ForbiddenException;
import com.taskflow.backend.exception.NotFoundException;
import com.taskflow.backend.repository.NotificationRepository;
import com.taskflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Creates and queries in-app notifications. Separate from
 * ProjectActivityService — activity is project/task history visible to
 * members; notifications are personal alerts visible only to the
 * recipient. Every creation method takes an explicit recipientId
 * resolved by the caller from trusted server-side data (never from
 * frontend input), and every read/write query method scopes by the
 * authenticated caller's own userId.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── Queries (recipient-scoped) ──────────────────────────────

    @Transactional(readOnly = true)
    public Page<NotificationResponse> list(String recipientId, int page, int size) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(recipientId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> search(String recipientId, NotificationType type, String search, int page, int size) {
        return notificationRepository
                .searchNotifications(recipientId, type, search, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long unreadCount(String recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalse(recipientId);
    }

    @Transactional
    public void markAsRead(String notificationId, String recipientId) {
        int updated = notificationRepository.markAsRead(notificationId, recipientId, LocalDateTime.now());
        if (updated == 0) {
            throw new NotFoundException("Notification not found");
        }
    }

    @Transactional
    public void markAllAsRead(String recipientId) {
        notificationRepository.markAllAsRead(recipientId, LocalDateTime.now());
    }

    // ─── Creation methods (one per event type, called from Stage 2 hooks) ───

    @Transactional
    public void notifyTaskAssigned(String recipientId, String actorId, String taskId, String projectId, String taskTitle) {
        if (recipientId.equals(actorId)) return; // never notify self
        create(recipientId, actorId, NotificationType.TASK_ASSIGNED,
                "Task assigned",
                actorName(actorId) + " assigned you to \"" + taskTitle + "\".",
                projectId, taskId, null);
    }

    @Transactional
    public void notifyTaskStatusChanged(String recipientId, String actorId, String taskId, String projectId,
                                        String taskTitle, String newStatus) {
        if (recipientId.equals(actorId)) return;
        create(recipientId, actorId, NotificationType.TASK_STATUS_CHANGED,
                "Task status updated",
                actorName(actorId) + " changed \"" + taskTitle + "\" to " + newStatus + ".",
                projectId, taskId, null);
    }

    @Transactional
    public void notifyCommentMention(String recipientId, String actorId, String taskId, String projectId, String taskTitle) {
        if (recipientId.equals(actorId)) return;
        create(recipientId, actorId, NotificationType.COMMENT_MENTION,
                "You were mentioned",
                actorName(actorId) + " mentioned you in a comment on \"" + taskTitle + "\".",
                projectId, taskId, null);
    }

    @Transactional
    public void notifyTaskCommentAdded(String recipientId, String actorId, String taskId, String projectId, String taskTitle) {
        if (recipientId.equals(actorId)) return;
        create(recipientId, actorId, NotificationType.TASK_COMMENT_ADDED,
                "New comment",
                actorName(actorId) + " commented on \"" + taskTitle + "\".",
                projectId, taskId, null);
    }

    @Transactional
    public void notifyProjectMemberAdded(String recipientId, String actorId, String projectId, String projectName) {
        if (recipientId.equals(actorId)) return;
        create(recipientId, actorId, NotificationType.PROJECT_MEMBER_ADDED,
                "Added to project",
                actorName(actorId) + " added you to \"" + projectName + "\".",
                projectId, null, null);
    }

    @Transactional
    public void notifyProjectRoleChanged(String recipientId, String actorId, String projectId, String projectName, String newRole) {
        if (recipientId.equals(actorId)) return;
        create(recipientId, actorId, NotificationType.PROJECT_ROLE_CHANGED,
                "Role updated",
                "Your role in \"" + projectName + "\" was changed to " + newRole + ".",
                projectId, null, null);
    }

    @Transactional
    public void notifyOrgInvitationAccepted(String recipientId, String actorId, String organizationId, String organizationName) {
        if (recipientId.equals(actorId)) return;
        create(recipientId, actorId, NotificationType.ORG_INVITATION_ACCEPTED,
                "Invitation accepted",
                actorName(actorId) + " accepted your invitation to " + organizationName + ".",
                null, null, organizationId);
    }

    @Transactional
    public void notifyTaskDueSoon(String recipientId, String taskId, String projectId, String taskTitle) {
        // Dedup: skip if this exact recipient+task+type already has a
        // notification created within the last 24 hours — prevents the
        // hourly scheduler from spamming repeated "due soon" alerts for
        // the same task, even across backend restarts, since this check
        // hits the database rather than relying on in-memory state.
        boolean alreadyNotified = notificationRepository.existsByRecipientIdAndTaskIdAndTypeAndCreatedAtAfter(
                recipientId, taskId, NotificationType.TASK_DUE_SOON, LocalDateTime.now().minusHours(24));
        if (alreadyNotified) return;

        create(recipientId, null, NotificationType.TASK_DUE_SOON,
                "Task due soon",
                "\"" + taskTitle + "\" is due in less than 24 hours.",
                projectId, taskId, null);
    }

    // ─── Helpers ────────────────────────────────────────────────

    private void create(String recipientId, String actorId, NotificationType type,
                        String title, String message, String projectId, String taskId, String organizationId) {
        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .recipientId(recipientId)
                .actorId(actorId)
                .type(type)
                .title(title)
                .message(message)
                .projectId(projectId)
                .taskId(taskId)
                .organizationId(organizationId)
                .build();
        Notification saved = notificationRepository.save(notification);

        // Push over WebSocket to this specific recipient only. The
        // "/user/{recipientId}/queue/notifications" destination is
        // resolved by Spring using the Principal set during STOMP
        // CONNECT (see JwtStompChannelInterceptor) â€” convertAndSendToUser
        // handles that resolution internally, so we just pass the
        // recipientId as the "user" argument. Existing 30s polling in
        // useNotifications.ts remains active as a fallback if this
        // delivery is missed (e.g. socket briefly disconnected).
        messagingTemplate.convertAndSendToUser(
                recipientId,
                "/queue/notifications",
                toResponse(saved)
        );
    }

    private String actorName(String actorId) {
        if (actorId == null) return "Someone";
        return userRepository.findById(actorId).map(User::getName).orElse("Someone");
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .actorId(n.getActorId())
                .actorName(n.getActorId() != null ? actorName(n.getActorId()) : null)
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .read(n.isRead())
                .projectId(n.getProjectId())
                .taskId(n.getTaskId())
                .organizationId(n.getOrganizationId())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .build();
    }
}