package com.taskflow.backend.service;

import com.taskflow.backend.domain.Project;
import com.taskflow.backend.domain.ProjectMember;
import com.taskflow.backend.domain.Task;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.project.AddProjectMemberRequest;
import com.taskflow.backend.dto.response.project.ProjectMemberResponse;
import com.taskflow.backend.enums.ProjectMemberRole;
import com.taskflow.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.taskflow.backend.dto.request.project.UpdateProjectMemberRoleRequest;
import com.taskflow.backend.dto.response.project.AvailableMemberResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.taskflow.backend.enums.ActivityType;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final OrgMemberRepository orgMemberRepository;
    private final TaskRepository taskRepository;
    private final ProjectActivityService activityService;
    private final NotificationService notificationService;

    // ── List project members ─────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> getProjectMembers(String projectId, String requesterId) {
        findProject(projectId);
        return projectMemberRepository.findByProjectIdAndActiveTrue(projectId)
                .stream()
                .map(pm -> {
                    User user = userRepository.findById(pm.getUserId()).orElse(null);
                    return toResponse(pm, user, projectId);
                })
                .collect(Collectors.toList());
    }

    // ── Add member ───────────────────────────────────────────────
    @Transactional
    public ProjectMemberResponse addMember(String projectId, AddProjectMemberRequest request, String requesterId) {
        Project project = findProject(projectId);

        // Only owner or manager can add members
        validateCanManageMembers(projectId, requesterId);

        String userId = request.getUserId();

        // User must exist
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // User must be an org member
        if (!orgMemberRepository.existsByOrgIdAndUserIdAndIsActiveTrue(project.getOrgId(), userId)) {
            throw new RuntimeException("User is not a member of this organization");
        }

        // No duplicates
        if (projectMemberRepository.existsByProjectIdAndUserIdAndActiveTrue(projectId, userId)) {
            throw new RuntimeException("User is already a member of this project");
        }

        ProjectMemberRole role = request.getRole() != null ? request.getRole() : ProjectMemberRole.MEMBER;

        ProjectMember member = ProjectMember.builder()
                .id(UUID.randomUUID().toString())
                .projectId(projectId)
                .userId(userId)
                .role(role)
                .active(true)
                .addedBy(requesterId)
                .build();

        ProjectMember saved = projectMemberRepository.save(member);

        // Update project member count
        updateMemberCount(project);

        activityService.log(projectId, requesterId, ActivityType.MEMBER_ADDED,
                user.getName() + " was added to the project");

        notificationService.notifyProjectMemberAdded(userId, requesterId, projectId, project.getName());

        return toResponse(saved, user, projectId);
    }

    // ── Remove member ────────────────────────────────────────────
    @Transactional
    public void removeMember(String projectId, String userId, String requesterId) {
        Project project = findProject(projectId);

        // Only owner or manager can remove members
        validateCanManageMembers(projectId, requesterId);

        // Cannot remove the project owner
        if (project.getOwnedBy().equals(userId)) {
            throw new RuntimeException("Cannot remove the project owner");
        }

        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserIdAndActiveTrue(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found in this project"));

        // Soft delete
        member.setActive(false);
        member.setRemovedAt(LocalDateTime.now());
        projectMemberRepository.save(member);

        // Unassign tasks assigned to this user in this project
        List<Task> assignedTasks = taskRepository.findByProjectIdAndAssigneeIdAndDeletedFalse(projectId, userId);
        assignedTasks.forEach(task -> {
            task.setAssigneeId(null);
            taskRepository.save(task);
        });

        // Update project member count
        updateMemberCount(project);

        User removedUser = userRepository.findById(userId).orElse(null);
        activityService.log(projectId, requesterId, ActivityType.MEMBER_REMOVED,
                (removedUser != null ? removedUser.getName() : "A member") + " was removed from the project");
    }

    // ── Available org members not yet in project ────────────────
    @Transactional(readOnly = true)
    public List<AvailableMemberResponse> getAvailableMembers(String projectId, String requesterId) {
        Project project = findProject(projectId);

        List<String> existingMemberIds = projectMemberRepository
                .findByProjectIdAndActiveTrue(projectId)
                .stream()
                .map(ProjectMember::getUserId)
                .collect(Collectors.toList());

        return orgMemberRepository.findByOrgIdAndIsActiveTrue(project.getOrgId())
                .stream()
                .filter(om -> !existingMemberIds.contains(om.getUserId()))
                .map(om -> {
                    User user = userRepository.findById(om.getUserId()).orElse(null);
                    return AvailableMemberResponse.builder()
                            .userId(om.getUserId())
                            .name(user != null ? user.getName() : "Unknown")
                            .email(user != null ? user.getEmail() : "")
                            .avatarUrl(user != null ? user.getAvatarUrl() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ── Update member role ───────────────────────────────────────
    @Transactional
    public ProjectMemberResponse updateMemberRole(String projectId, String userId,
                                                  UpdateProjectMemberRoleRequest request, String requesterId) {
        Project project = findProject(projectId);
        validateCanManageMembers(projectId, requesterId);

        if (project.getOwnedBy().equals(userId)) {
            throw new RuntimeException("Cannot change the project owner's role");
        }
        if (request.getRole() == ProjectMemberRole.OWNER) {
            throw new RuntimeException("Cannot assign OWNER role directly");
        }

        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserIdAndActiveTrue(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found in this project"));

        member.setRole(request.getRole());
        ProjectMember saved = projectMemberRepository.save(member);

        User user = userRepository.findById(userId).orElse(null);
        activityService.log(projectId, requesterId, ActivityType.MEMBER_ROLE_CHANGED,
                (user != null ? user.getName() : "A member") + "'s role was changed to " + request.getRole());

        notificationService.notifyProjectRoleChanged(userId, requesterId, projectId, project.getName(), request.getRole().name());

        return toResponse(saved, user, projectId);
    }

    // ── Helpers ──────────────────────────────────────────────────

    private Project findProject(String projectId) {
        return projectRepository.findByIdAndDeletedFalse(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private void validateCanManageMembers(String projectId, String userId) {
        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserIdAndActiveTrue(projectId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));

        if (member.getRole() != ProjectMemberRole.OWNER &&
                member.getRole() != ProjectMemberRole.MANAGER) {
            throw new RuntimeException("You don't have permission to manage members");
        }
    }

    private void updateMemberCount(Project project) {
        long count = projectMemberRepository.countByProjectIdAndActiveTrue(project.getId());
        project.setMemberCount((int) count);
        projectRepository.save(project);
    }

    private ProjectMemberResponse toResponse(ProjectMember pm, User user, String projectId) {
        Project project = projectRepository.findByIdAndDeletedFalse(projectId).orElse(null);
        boolean isOwner = project != null && project.getOwnedBy().equals(pm.getUserId());
        return ProjectMemberResponse.builder()
                .id(pm.getId())
                .userId(pm.getUserId())
                .name(user != null ? user.getName() : "Unknown")
                .email(user != null ? user.getEmail() : "")
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .role(pm.getRole())
                .isOwner(isOwner)
                .joinedAt(pm.getJoinedAt())
                .build();
    }
}