package com.taskflow.backend.service;

import com.taskflow.backend.domain.Project;
import com.taskflow.backend.domain.Task;
import com.taskflow.backend.dto.response.dashboard.*;
import com.taskflow.backend.dto.response.project.ProjectActivityResponse;
import com.taskflow.backend.enums.ProjectStatus;
import com.taskflow.backend.enums.TaskStatus;
import com.taskflow.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import com.taskflow.backend.dto.response.dashboard.TodaysFocusResponse;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final OrgMemberRepository orgMemberRepository;
    private final ProjectActivityRepository projectActivityRepository;
    private final UserRepository userRepository;

    // ── Org-wide access check (ORG_ADMIN / PROJECT_MANAGER) ─────────
    private boolean canAccessAllProjects(String orgId, String userId) {
        return orgMemberRepository.findByOrgIdAndUserIdAndIsActiveTrue(orgId, userId)
                .map(m -> m.getRole() == com.taskflow.backend.enums.OrgRole.ORG_ADMIN
                        || m.getRole() == com.taskflow.backend.enums.OrgRole.PROJECT_MANAGER)
                .orElse(false);
    }

    @org.springframework.cache.annotation.Cacheable(value = "accessibleProjectIds", key = "#orgId + '-' + #userId")
    public List<String> getAccessibleProjectIds(String orgId, String userId) {
        return canAccessAllProjects(orgId, userId)
                ? projectRepository.findAllProjectIdsInOrg(orgId)
                : projectRepository.findMemberAccessibleProjectIds(orgId, userId);
    }

    @Transactional(readOnly = true)
    public DashboardOverviewResponse getOverview(String orgId, String userId) {
        List<String> projectIds = getAccessibleProjectIds(orgId, userId);

        List<Project> accessibleProjects = projectIds.stream()
                .map(pid -> projectRepository.findByIdAndDeletedFalse(pid).orElse(null))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        int totalProjects = accessibleProjects.size();
        int activeProjects = (int) accessibleProjects.stream().filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count();
        int archivedProjects = (int) accessibleProjects.stream().filter(p -> p.getStatus() == ProjectStatus.ARCHIVED).count();

        int totalTasks = projectIds.isEmpty() ? 0 : projectIds.stream()
                .mapToInt(taskRepository::countByProjectId).sum();
        int completedTasks = projectIds.isEmpty() ? 0 :
                taskRepository.countByProjectIdsAndStatus(projectIds, TaskStatus.DONE);
        int inProgressTasks = projectIds.isEmpty() ? 0 :
                taskRepository.countByProjectIdsAndStatus(projectIds, TaskStatus.IN_PROGRESS);
        int overdueTasks = projectIds.isEmpty() ? 0 :
                taskRepository.countOverdueTasks(projectIds, LocalDate.now());
        int myAssignedTasks = projectIds.isEmpty() ? 0 :
                taskRepository.countMyAssignedTasks(userId, projectIds);

        int teamMembers = (int) orgMemberRepository.countByOrgIdAndIsActiveTrue(orgId);

        return DashboardOverviewResponse.builder()
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .archivedProjects(archivedProjects)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .inProgressTasks(inProgressTasks)
                .overdueTasks(overdueTasks)
                .teamMembers(teamMembers)
                .myAssignedTasks(myAssignedTasks)
                .build();
    }

    @Transactional(readOnly = true)
    public List<MyTaskResponse> getMyTasks(String orgId, String userId) {
        List<String> projectIds = getAccessibleProjectIds(orgId, userId);
        if (projectIds.isEmpty()) return List.of();

        List<Task> tasks = taskRepository.findMyTasks(userId, projectIds);
        LocalDate today = LocalDate.now();

        return tasks.stream().map(t -> {
            Project project = projectRepository.findByIdAndDeletedFalse(t.getProjectId()).orElse(null);
            boolean isOverdue = t.getDueDate() != null && t.getDueDate().isBefore(today) && t.getStatus() != TaskStatus.DONE;
            return MyTaskResponse.builder()
                    .id(t.getId())
                    .title(t.getTitle())
                    .projectId(t.getProjectId())
                    .projectName(project != null ? project.getName() : "Unknown")
                    .projectColor(project != null ? project.getColor() : "#6366f1")
                    .status(t.getStatus())
                    .priority(t.getPriority())
                    .dueDate(t.getDueDate())
                    .overdue(isOverdue)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UpcomingDeadlineResponse> getUpcomingDeadlines(String orgId, String userId) {
        List<String> projectIds = getAccessibleProjectIds(orgId, userId);
        if (projectIds.isEmpty()) return List.of();

        List<Task> tasks = taskRepository.findUpcomingDeadlines(projectIds, LocalDate.now());

        return tasks.stream().limit(10).map(this::toDeadlineResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TodaysFocusResponse getTodaysFocus(String orgId, String userId) {
        List<String> projectIds = getAccessibleProjectIds(orgId, userId);
        if (projectIds.isEmpty()) {
            return TodaysFocusResponse.builder()
                    .dueToday(List.of())
                    .inReview(List.of())
                    .overdue(List.of())
                    .build();
        }

        LocalDate today = LocalDate.now();

        List<UpcomingDeadlineResponse> dueToday = taskRepository.findDueTodayTasks(projectIds, today)
                .stream().map(this::toDeadlineResponse).collect(Collectors.toList());

        List<UpcomingDeadlineResponse> inReview = taskRepository.findUpcomingDeadlines(projectIds, today.minusYears(5))
                .stream()
                .filter(t -> t.getStatus() == TaskStatus.IN_REVIEW)
                .filter(t -> t.getDueDate() == null || !t.getDueDate().isBefore(today))
                .limit(10)
                .map(this::toDeadlineResponse).collect(Collectors.toList());

        List<UpcomingDeadlineResponse> overdue = taskRepository.findUpcomingDeadlines(projectIds, today.minusYears(5))
                .stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(today))
                .limit(10)
                .map(this::toDeadlineResponse).collect(Collectors.toList());

        return TodaysFocusResponse.builder()
                .dueToday(dueToday)
                .inReview(inReview)
                .overdue(overdue)
                .build();
    }

    private UpcomingDeadlineResponse toDeadlineResponse(Task t) {
        Project project = projectRepository.findByIdAndDeletedFalse(t.getProjectId()).orElse(null);
        return UpcomingDeadlineResponse.builder()
                .taskId(t.getId())
                .taskTitle(t.getTitle())
                .projectId(t.getProjectId())
                .projectName(project != null ? project.getName() : "Unknown")
                .projectColor(project != null ? project.getColor() : "#6366f1")
                .dueDate(t.getDueDate())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ProjectActivityResponse> getRecentActivity(String orgId, String userId) {
        List<String> projectIds = getAccessibleProjectIds(orgId, userId);
        if (projectIds.isEmpty()) return List.of();

        return projectIds.stream()
                .flatMap(pid -> projectActivityRepository
                        .findByProjectIdOrderByCreatedAtDesc(pid, PageRequest.of(0, 10))
                        .getContent().stream())
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .map(a -> {
                    var user = userRepository.findById(a.getUserId()).orElse(null);
                    return ProjectActivityResponse.builder()
                            .id(a.getId())
                            .projectId(a.getProjectId())
                            .userId(a.getUserId())
                            .userName(user != null ? user.getName() : "Unknown")
                            .type(a.getType())
                            .description(a.getDescription())
                            .createdAt(a.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectProgressResponse> getProjectProgress(String orgId, String userId) {
        List<Project> projects = canAccessAllProjects(orgId, userId)
                ? projectRepository.findAllActiveProjectsInOrg(orgId)
                : projectRepository.findMemberActiveProjects(orgId, userId);

        return projects.stream().map(p -> {
            int total = p.getTaskCount();
            int completed = p.getCompletedTaskCount();
            double pct = total > 0 ? (completed * 100.0 / total) : 0.0;
            return ProjectProgressResponse.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .color(p.getColor())
                    .status(p.getStatus().name())
                    .memberCount(p.getMemberCount())
                    .taskCount(total)
                    .completedTaskCount(completed)
                    .completionPercentage(pct)
                    .dueDate(p.getDueDate())
                    .build();
        }).collect(Collectors.toList());
    }
}