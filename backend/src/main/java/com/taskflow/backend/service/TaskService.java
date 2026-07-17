package com.taskflow.backend.service;

import com.taskflow.backend.domain.Project;
import com.taskflow.backend.domain.Task;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.task.CreateTaskRequest;
import com.taskflow.backend.dto.request.task.UpdateTaskRequest;
import com.taskflow.backend.domain.ProjectMember;
import com.taskflow.backend.dto.response.task.TaskResponse;
import com.taskflow.backend.enums.ProjectMemberRole;
import com.taskflow.backend.enums.TaskPriority;
import com.taskflow.backend.enums.TaskStatus;
import com.taskflow.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.taskflow.backend.enums.ActivityType;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ProjectActivityService activityService;
    private final NotificationService notificationService;



    @Transactional
    public TaskResponse createTask(String projectId, CreateTaskRequest request, String userId) {
        Project project = findProject(projectId);
        ProjectMember requesterMember = requireProjectMember(projectId, userId);
        if (requesterMember.getRole() == ProjectMemberRole.VIEWER) {
            throw new RuntimeException("Viewers cannot create tasks");
        }

        TaskStatus status = request.getStatus() != null ? request.getStatus() : TaskStatus.TODO;
        TaskPriority priority = request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM;

        int position = taskRepository.findMaxPositionByProjectIdAndStatus(projectId, status) + 1;

        Task task = Task.builder()
                .id(UUID.randomUUID().toString())
                .projectId(projectId)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .status(status)
                .priority(priority)
                .assigneeId(request.getAssigneeId())
                .createdBy(userId)
                .dueDate(request.getDueDate())
                .position(position)
                .build();

        if (status == TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
        }

        Task saved = taskRepository.save(task);
        updateProjectStats(project);
        activityService.log(projectId, saved.getId(), userId, ActivityType.TASK_CREATED,
                "created this task");

        if (saved.getAssigneeId() != null) {
            notificationService.notifyTaskAssigned(saved.getAssigneeId(), userId, saved.getId(), projectId, saved.getTitle());
        }

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasks(String projectId, String userId,
                                       String status, String priority,
                                       String assigneeId, String search,
                                       int page, int size, String sortBy, String direction) {
        Project project = findProject(projectId);
        validateProjectAccess(projectId, userId, project);

        TaskStatus taskStatus = status != null ? TaskStatus.valueOf(status) : null;
        TaskPriority taskPriority = priority != null ? TaskPriority.valueOf(priority) : null;

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return taskRepository.findTasks(projectId, taskStatus, taskPriority, assigneeId, search, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(String projectId, String taskId, String userId) {
        Project project = findProject(projectId);
        validateProjectAccess(projectId, userId, project);
        Task task = findTask(taskId, projectId);
        return toResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(String projectId, String taskId,
                                   UpdateTaskRequest request, String userId) {
        Project project = findProject(projectId);
        Task task = findTask(taskId, projectId);
        validateCanEditTask(projectId, userId, task);

        String previousAssigneeId = task.getAssigneeId();

        if (request.getTitle() != null) task.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getAssigneeId() != null) task.setAssigneeId(request.getAssigneeId());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getPosition() != null) task.setPosition(request.getPosition());

        boolean assigneeChanged = request.getAssigneeId() != null
                && !request.getAssigneeId().equals(previousAssigneeId);

        TaskStatus previousStatus = task.getStatus();
        boolean statusChanged = request.getStatus() != null && request.getStatus() != previousStatus;

        if (request.getStatus() != null && request.getStatus() != task.getStatus()) {
            task.setStatus(request.getStatus());

            if (request.getStatus() == TaskStatus.DONE && previousStatus != TaskStatus.DONE) {
                task.setCompletedAt(LocalDateTime.now());
            } else if (request.getStatus() != TaskStatus.DONE) {
                task.setCompletedAt(null);
            }
        }

        Task updated = taskRepository.save(task);
        updateProjectStats(project);

        if (statusChanged) {
            if (request.getStatus() == TaskStatus.DONE) {
                activityService.log(projectId, taskId, userId, ActivityType.TASK_COMPLETED,
                        "completed this task");
            } else {
                activityService.log(projectId, taskId, userId, ActivityType.TASK_STATUS_CHANGED,
                        "changed status from " + formatStatus(previousStatus) + " to " + formatStatus(request.getStatus()));
            }
            if (updated.getAssigneeId() != null) {
                notificationService.notifyTaskStatusChanged(updated.getAssigneeId(), userId, taskId, projectId,
                        updated.getTitle(), formatStatus(updated.getStatus()));
            }
        } else {
            activityService.log(projectId, taskId, userId, ActivityType.TASK_UPDATED,
                    "updated this task");
        }

        if (assigneeChanged) {
            notificationService.notifyTaskAssigned(updated.getAssigneeId(), userId, taskId, projectId, updated.getTitle());
        }

        return toResponse(updated);
    }

    @Transactional
    public void deleteTask(String projectId, String taskId, String userId) {
        Project project = findProject(projectId);
        Task task = findTask(taskId, projectId);
        validateCanEditTask(projectId, userId, task);

        task.setDeleted(true);
        taskRepository.save(task);
        updateProjectStats(project);
        activityService.log(projectId, taskId, userId, ActivityType.TASK_DELETED,
                "deleted this task");
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private Project findProject(String projectId) {
        return projectRepository.findByIdAndDeletedFalse(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private Task findTask(String taskId, String projectId) {
        Task task = taskRepository.findByIdAndDeletedFalse(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if (!task.getProjectId().equals(projectId))
            throw new RuntimeException("Task does not belong to this project");
        return task;
    }

    private void validateProjectAccess(String projectId, String userId, Project project) {
        if (project.getVisibility().name().equals("PUBLIC")) return;
        if (project.getOwnedBy().equals(userId)) return;
        if (project.getCreatedBy().equals(userId)) return;
        if (projectMemberRepository.existsByProjectIdAndUserIdAndActiveTrue(projectId, userId)) return;
        throw new RuntimeException("Access denied to this project");
    }

    private ProjectMember requireProjectMember(String projectId, String userId) {
        return projectMemberRepository.findByProjectIdAndUserIdAndActiveTrue(projectId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));
    }

    private void validateCanEditTask(String projectId, String userId, Task task) {
        ProjectMember member = requireProjectMember(projectId, userId);

        if (member.getRole() == ProjectMemberRole.OWNER || member.getRole() == ProjectMemberRole.MANAGER) {
            return;
        }
        if (member.getRole() == ProjectMemberRole.VIEWER) {
            throw new RuntimeException("Viewers cannot edit or delete tasks");
        }
        boolean isCreator = task.getCreatedBy().equals(userId);
        boolean isAssignee = userId.equals(task.getAssigneeId());
        if (!isCreator && !isAssignee) {
            throw new RuntimeException("You can only edit tasks you created or are assigned to");
        }
    }

    private void updateProjectStats(Project project) {
        int total = taskRepository.countByProjectId(project.getId());
        int completed = taskRepository.countCompletedByProjectId(project.getId());
        project.setTaskCount(total);
        project.setCompletedTaskCount(completed);
        projectRepository.save(project);
    }

    // Converts enum-style status (e.g. IN_PROGRESS) into readable text (e.g. "In Progress")
    // regardless of how many status values exist, so this never needs updating if statuses change.
    private String formatStatus(TaskStatus status) {
        String[] words = status.name().toLowerCase().split("_");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1));
        }
        return sb.toString();
    }

    private TaskResponse toResponse(Task t) {
        String assigneeName = null;
        if (t.getAssigneeId() != null) {
            assigneeName = userRepository.findById(t.getAssigneeId())
                    .map(User::getName).orElse("Unknown");
        }
        return TaskResponse.builder()
                .id(t.getId())
                .projectId(t.getProjectId())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .priority(t.getPriority())
                .assigneeId(t.getAssigneeId())
                .assigneeName(assigneeName)
                .createdBy(t.getCreatedBy())
                .dueDate(t.getDueDate())
                .position(t.getPosition())
                .completedAt(t.getCompletedAt())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}