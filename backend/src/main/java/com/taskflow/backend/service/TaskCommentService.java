package com.taskflow.backend.service;

import com.taskflow.backend.domain.ProjectMember;
import com.taskflow.backend.domain.Task;
import com.taskflow.backend.domain.TaskComment;
import com.taskflow.backend.domain.TaskCommentMention;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.comment.CreateCommentRequest;
import com.taskflow.backend.dto.request.comment.UpdateCommentRequest;
import com.taskflow.backend.dto.response.comment.CommentResponse;
import com.taskflow.backend.enums.ActivityType;
import com.taskflow.backend.enums.ProjectMemberRole;
import com.taskflow.backend.repository.ProjectMemberRepository;
import com.taskflow.backend.repository.TaskCommentMentionRepository;
import com.taskflow.backend.repository.TaskCommentRepository;
import com.taskflow.backend.repository.TaskRepository;
import com.taskflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskCommentService {

    private final TaskCommentRepository taskCommentRepository;
    private final TaskCommentMentionRepository taskCommentMentionRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ProjectActivityService activityService;
    private final NotificationService notificationService;

    @Transactional
    public CommentResponse createComment(String taskId, CreateCommentRequest request, String userId) {
        Task task = findTask(taskId);
        ProjectMember member = requireProjectMember(task.getProjectId(), userId);

        if (member.getRole() == ProjectMemberRole.VIEWER) {
            throw new RuntimeException("Viewers cannot post comments");
        }

        List<String> mentionIds = dedupe(request.getMentionedUserIds());
        validateMentions(task.getProjectId(), mentionIds);

        TaskComment comment = TaskComment.builder()
                .id(UUID.randomUUID().toString())
                .taskId(taskId)
                .authorId(userId)
                .content(request.getContent().trim())
                .build();

        TaskComment saved = taskCommentRepository.save(comment);
        saveMentions(saved.getId(), mentionIds);

        activityService.log(task.getProjectId(), taskId, userId, ActivityType.TASK_COMMENT_CREATED,
                "Commented on task \"" + task.getTitle() + "\"");

        for (String mentionedUserId : mentionIds) {
            notificationService.notifyCommentMention(mentionedUserId, userId, taskId, task.getProjectId(), task.getTitle());
        }

        // Notify the assignee too, unless they authored the comment
        // themselves or were already @mentioned above (avoids a
        // duplicate notification for the same comment event).
        String assigneeId = task.getAssigneeId();
        boolean assigneeShouldBeNotified = assigneeId != null
                && !assigneeId.equals(userId)
                && !mentionIds.contains(assigneeId);
        if (assigneeShouldBeNotified) {
            notificationService.notifyTaskCommentAdded(assigneeId, userId, taskId, task.getProjectId(), task.getTitle());
        }

        return toResponse(saved, mentionIds);
    }
    @Transactional(readOnly = true)
    public Page<CommentResponse> getComments(String taskId, String userId, int page, int size) {
        Task task = findTask(taskId);
        requireProjectMember(task.getProjectId(), userId);

        Pageable pageable = PageRequest.of(page, size);
        return taskCommentRepository.findByTaskIdOrderByCreatedAtDesc(taskId, pageable)
                .map(c -> toResponse(c, getMentionIds(c.getId())));
    }

    @Transactional
    public CommentResponse updateComment(String taskId, String commentId, UpdateCommentRequest request, String userId) {
        Task task = findTask(taskId);
        requireProjectMember(task.getProjectId(), userId);
        TaskComment comment = findComment(commentId, taskId);

        if (comment.isDeleted()) {
            throw new RuntimeException("Cannot edit a deleted comment");
        }
        if (!comment.getAuthorId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comment");
        }

        List<String> mentionIds = dedupe(request.getMentionedUserIds());
        validateMentions(task.getProjectId(), mentionIds);

        comment.setContent(request.getContent().trim());
        comment.setEdited(true);
        TaskComment updated = taskCommentRepository.save(comment);

        taskCommentMentionRepository.deleteByCommentId(commentId);
        saveMentions(commentId, mentionIds);

        activityService.log(task.getProjectId(), taskId, userId, ActivityType.TASK_COMMENT_UPDATED,
                "Edited a comment on task \"" + task.getTitle() + "\"");

        for (String mentionedUserId : mentionIds) {
            notificationService.notifyCommentMention(mentionedUserId, userId, taskId, task.getProjectId(), task.getTitle());
        }

        return toResponse(updated, mentionIds);
    }

    @Transactional
    public void deleteComment(String taskId, String commentId, String userId) {
        Task task = findTask(taskId);
        ProjectMember member = requireProjectMember(task.getProjectId(), userId);
        TaskComment comment = findComment(commentId, taskId);

        if (comment.isDeleted()) {
            throw new RuntimeException("Comment already deleted");
        }

        boolean isAuthor = comment.getAuthorId().equals(userId);
        boolean isModerator = member.getRole() == ProjectMemberRole.OWNER
                || member.getRole() == ProjectMemberRole.MANAGER;

        if (!isAuthor && !isModerator) {
            throw new RuntimeException("You cannot delete this comment");
        }

        comment.setDeleted(true);
        taskCommentRepository.save(comment);

        activityService.log(task.getProjectId(), taskId, userId, ActivityType.TASK_COMMENT_DELETED,
                "Deleted a comment on task \"" + task.getTitle() + "\"");
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private Task findTask(String taskId) {
        return taskRepository.findByIdAndDeletedFalse(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    private TaskComment findComment(String commentId, String taskId) {
        return taskCommentRepository.findByIdAndTaskId(commentId, taskId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
    }

    private ProjectMember requireProjectMember(String projectId, String userId) {
        return projectMemberRepository.findByProjectIdAndUserIdAndActiveTrue(projectId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));
    }

    private List<String> dedupe(List<String> ids) {
        if (ids == null) return new ArrayList<>();
        return ids.stream().distinct().collect(Collectors.toList());
    }

    private void validateMentions(String projectId, List<String> mentionIds) {
        for (String mentionedUserId : mentionIds) {
            boolean isActiveMember = projectMemberRepository
                    .existsByProjectIdAndUserIdAndActiveTrue(projectId, mentionedUserId);
            if (!isActiveMember) {
                throw new RuntimeException("One or more mentioned users are not active members of this project.");
            }
        }
    }

    private void saveMentions(String commentId, List<String> mentionIds) {
        for (String mentionedUserId : mentionIds) {
            TaskCommentMention mention = TaskCommentMention.builder()
                    .id(UUID.randomUUID().toString())
                    .commentId(commentId)
                    .userId(mentionedUserId)
                    .build();
            taskCommentMentionRepository.save(mention);
        }
    }

    private List<String> getMentionIds(String commentId) {
        return taskCommentMentionRepository.findByCommentId(commentId).stream()
                .map(TaskCommentMention::getUserId)
                .collect(Collectors.toList());
    }

    private CommentResponse toResponse(TaskComment c, List<String> mentionIds) {
        String authorName = userRepository.findById(c.getAuthorId())
                .map(User::getName).orElse("Unknown");

        String content = c.isDeleted() ? "This comment was deleted" : c.getContent();

        return CommentResponse.builder()
                .id(c.getId())
                .taskId(c.getTaskId())
                .authorId(c.getAuthorId())
                .authorName(authorName)
                .content(content)
                .edited(c.isEdited())
                .deleted(c.isDeleted())
                .mentionedUserIds(mentionIds)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}