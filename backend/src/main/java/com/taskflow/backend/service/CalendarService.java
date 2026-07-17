package com.taskflow.backend.service;

import com.taskflow.backend.domain.Project;
import com.taskflow.backend.domain.Task;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.calendar.CalendarTaskResponse;
import com.taskflow.backend.enums.TaskPriority;
import com.taskflow.backend.enums.TaskStatus;
import com.taskflow.backend.repository.OrgMemberRepository;
import com.taskflow.backend.repository.ProjectRepository;
import com.taskflow.backend.repository.TaskRepository;
import com.taskflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final OrgMemberRepository orgMemberRepository;

    // ── Org-wide access check (ORG_ADMIN / PROJECT_MANAGER) ─────────
    private boolean canAccessAllProjects(String orgId, String userId) {
        return orgMemberRepository.findByOrgIdAndUserIdAndIsActiveTrue(orgId, userId)
                .map(m -> m.getRole() == com.taskflow.backend.enums.OrgRole.ORG_ADMIN
                        || m.getRole() == com.taskflow.backend.enums.OrgRole.PROJECT_MANAGER)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public List<CalendarTaskResponse> getCalendarTasks(
            String orgId, String userId, LocalDate startDate, LocalDate endDate,
            String projectId, String status, String priority, String assigneeId,
            boolean mineOnly, boolean includeCompleted) {

        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new RuntimeException("Invalid date range");
        }

        List<String> projectIds = canAccessAllProjects(orgId, userId)
                ? projectRepository.findAllProjectIdsInOrg(orgId)
                : projectRepository.findMemberAccessibleProjectIds(orgId, userId);

        if (projectId != null && !projectId.isBlank()) {
            if (!projectIds.contains(projectId)) {
                throw new RuntimeException("Access denied to this project");
            }
            projectIds = List.of(projectId);
        }

        if (projectIds.isEmpty()) return List.of();

        TaskStatus taskStatus = (status != null && !status.isBlank()) ? TaskStatus.valueOf(status) : null;
        TaskPriority taskPriority = (priority != null && !priority.isBlank()) ? TaskPriority.valueOf(priority) : null;
        String effectiveAssigneeId = mineOnly ? userId : (assigneeId != null && !assigneeId.isBlank() ? assigneeId : null);

        List<Task> tasks = taskRepository.findCalendarTasks(
                projectIds, startDate, endDate, taskStatus, taskPriority, effectiveAssigneeId, includeCompleted);

        LocalDate today = LocalDate.now();

        return tasks.stream().map(t -> {
            Project project = projectRepository.findByIdAndDeletedFalse(t.getProjectId()).orElse(null);
            String assigneeName = null;
            if (t.getAssigneeId() != null) {
                User assignee = userRepository.findById(t.getAssigneeId()).orElse(null);
                assigneeName = assignee != null ? assignee.getName() : "Unknown";
            }
            boolean isOverdue = t.getDueDate() != null && t.getDueDate().isBefore(today) && t.getStatus() != TaskStatus.DONE;
            boolean isDueToday = t.getDueDate() != null && t.getDueDate().isEqual(today);

            return CalendarTaskResponse.builder()
                    .id(t.getId())
                    .title(t.getTitle())
                    .status(t.getStatus())
                    .priority(t.getPriority())
                    .dueDate(t.getDueDate())
                    .overdue(isOverdue)
                    .dueToday(isDueToday)
                    .projectId(t.getProjectId())
                    .projectName(project != null ? project.getName() : "Unknown")
                    .projectColor(project != null ? project.getColor() : "#6366f1")
                    .assigneeId(t.getAssigneeId())
                    .assigneeName(assigneeName)
                    .build();
        }).collect(Collectors.toList());
    }
}