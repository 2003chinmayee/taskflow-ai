package com.taskflow.backend.service;

import com.taskflow.backend.domain.Project;
import com.taskflow.backend.domain.Task;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.domain.WorkLog;
import com.taskflow.backend.dto.request.worklog.CreateWorkLogRequest;
import com.taskflow.backend.dto.request.worklog.UpdateWorkLogRequest;
import com.taskflow.backend.dto.response.worklog.ActiveTimerResponse;
import com.taskflow.backend.dto.response.worklog.ProjectTimeSummaryResponse;
import com.taskflow.backend.dto.response.worklog.WorkLogResponse;
import com.taskflow.backend.enums.ActivityType;
import com.taskflow.backend.repository.ProjectMemberRepository;
import com.taskflow.backend.repository.ProjectRepository;
import com.taskflow.backend.repository.TaskRepository;
import com.taskflow.backend.repository.UserRepository;
import com.taskflow.backend.repository.WorkLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkLogService {

    private final WorkLogRepository workLogRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ProjectActivityService activityService;

    // ── Start timer ────────────────────────────────────────────────
    @Transactional
    public ActiveTimerResponse startTimer(String taskId, String userId) {
        Task task = findTask(taskId);
        Project project = validateAccess(task, userId);

        // Auto-stop any existing running timer for this user
        workLogRepository.findByUserIdAndRunningTrueAndDeletedFalse(userId)
                .ifPresent(existing -> stopRunningLog(existing));

        WorkLog log = WorkLog.builder()
                .id(UUID.randomUUID().toString())
                .taskId(taskId)
                .projectId(task.getProjectId())
                .userId(userId)
                .startedAt(LocalDateTime.now())
                .logDate(LocalDate.now())
                .running(true)
                .durationMinutes(0)
                .build();

        WorkLog saved = workLogRepository.save(log);
        activityService.log(task.getProjectId(), taskId, userId, ActivityType.TIMER_STARTED,
                "started the timer");

        return toActiveTimerResponse(saved, task, project);
    }

    // ── Stop timer ─────────────────────────────────────────────────
    @Transactional
    public WorkLogResponse stopTimer(String taskId, String userId) {
        WorkLog log = workLogRepository.findByUserIdAndRunningTrueAndDeletedFalse(userId)
                .orElseThrow(() -> new RuntimeException("No active timer found"));

        if (!log.getTaskId().equals(taskId)) {
            throw new RuntimeException("Active timer belongs to a different task");
        }

        WorkLog stopped = stopRunningLog(log);
        Task task = findTask(taskId);
        activityService.log(task.getProjectId(), taskId, userId, ActivityType.TIMER_STOPPED,
                "stopped the timer (" + formatMinutes(stopped.getDurationMinutes()) + ")");

        return toWorkLogResponse(stopped);
    }

    private WorkLog stopRunningLog(WorkLog log) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = Duration.between(log.getStartedAt(), now).toMinutes();
        log.setStoppedAt(now);
        log.setDurationMinutes((int) Math.max(minutes, 1));
        log.setRunning(false);
        return workLogRepository.save(log);
    }

    // ── Active timer for current user ───────────────────────────
    @Transactional(readOnly = true)
    public ActiveTimerResponse getActiveTimer(String userId) {
        return workLogRepository.findByUserIdAndRunningTrueAndDeletedFalse(userId)
                .map(log -> {
                    Task task = findTask(log.getTaskId());
                    Project project = projectRepository.findByIdAndDeletedFalse(task.getProjectId()).orElse(null);
                    return toActiveTimerResponse(log, task, project);
                })
                .orElse(null);
    }

    // ── Manual work log ─────────────────────────────────────────
    @Transactional
    public WorkLogResponse createManualLog(String taskId, CreateWorkLogRequest request, String userId) {
        Task task = findTask(taskId);
        validateAccess(task, userId);

        if (request.getLogDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Log date cannot be in the future");
        }
        if (request.getDurationMinutes() <= 0) {
            throw new RuntimeException("Duration must be greater than 0");
        }

        WorkLog log = WorkLog.builder()
                .id(UUID.randomUUID().toString())
                .taskId(taskId)
                .projectId(task.getProjectId())
                .userId(userId)
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .logDate(request.getLogDate())
                .running(false)
                .build();

        WorkLog saved = workLogRepository.save(log);
        activityService.log(task.getProjectId(), taskId, userId, ActivityType.WORK_LOG_CREATED,
                "logged " + formatMinutes(request.getDurationMinutes()));

        return toWorkLogResponse(saved);
    }

    // ── List work logs for a task ───────────────────────────────
    @Transactional(readOnly = true)
    public Page<WorkLogResponse> getWorkLogs(String taskId, String userId, int page, int size) {
        Task task = findTask(taskId);
        validateAccess(task, userId);

        return workLogRepository.findByTaskIdAndDeletedFalseOrderByLogDateDescCreatedAtDesc(
                taskId, PageRequest.of(page, size)
        ).map(this::toWorkLogResponse);
    }

    // ── Update work log ─────────────────────────────────────────
    @Transactional
    public WorkLogResponse updateWorkLog(String workLogId, UpdateWorkLogRequest request, String userId) {
        WorkLog log = workLogRepository.findByIdAndDeletedFalse(workLogId)
                .orElseThrow(() -> new RuntimeException("Work log not found"));

        if (!log.getUserId().equals(userId)) {
            Task task = findTask(log.getTaskId());
            validateManagerAccess(task.getProjectId(), userId);
        }

        if (request.getDurationMinutes() != null) {
            if (request.getDurationMinutes() <= 0) throw new RuntimeException("Duration must be greater than 0");
            log.setDurationMinutes(request.getDurationMinutes());
        }
        if (request.getLogDate() != null) {
            if (request.getLogDate().isAfter(LocalDate.now())) throw new RuntimeException("Log date cannot be in the future");
            log.setLogDate(request.getLogDate());
        }
        if (request.getDescription() != null) {
            log.setDescription(request.getDescription());
        }

        WorkLog saved = workLogRepository.save(log);
        Task task = findTask(log.getTaskId());
        activityService.log(log.getProjectId(), log.getTaskId(), userId, ActivityType.WORK_LOG_UPDATED,
                "updated a work log");

        return toWorkLogResponse(saved);
    }

    // ── Delete work log ──────────────────────────────────────────
    @Transactional
    public void deleteWorkLog(String workLogId, String userId) {
        WorkLog log = workLogRepository.findByIdAndDeletedFalse(workLogId)
                .orElseThrow(() -> new RuntimeException("Work log not found"));

        if (!log.getUserId().equals(userId)) {
            Task task = findTask(log.getTaskId());
            validateManagerAccess(task.getProjectId(), userId);
        }

        log.setDeleted(true);
        workLogRepository.save(log);

        Task task = findTask(log.getTaskId());
        activityService.log(log.getProjectId(), log.getTaskId(), userId, ActivityType.WORK_LOG_DELETED,
                "deleted a work log");
    }

    // ── Project time summary ─────────────────────────────────────
    @Transactional(readOnly = true)
    public ProjectTimeSummaryResponse getProjectTimeSummary(String projectId, String userId) {
        Project project = projectRepository.findByIdAndDeletedFalse(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateProjectAccess(project, userId);

        List<WorkLog> logs = workLogRepository.findByProjectIdAndDeletedFalse(projectId);
        int totalMinutes = logs.stream().mapToInt(WorkLog::getDurationMinutes).sum();

        Map<String, Integer> byUserMinutes = logs.stream()
                .collect(Collectors.groupingBy(WorkLog::getUserId, Collectors.summingInt(WorkLog::getDurationMinutes)));

        List<ProjectTimeSummaryResponse.UserTimeEntry> byUser = byUserMinutes.entrySet().stream()
                .map(e -> {
                    User user = userRepository.findById(e.getKey()).orElse(null);
                    return ProjectTimeSummaryResponse.UserTimeEntry.builder()
                            .userId(e.getKey())
                            .userName(user != null ? user.getName() : "Unknown")
                            .totalMinutes(e.getValue())
                            .formatted(formatMinutes(e.getValue()))
                            .build();
                })
                .sorted(Comparator.comparingInt(ProjectTimeSummaryResponse.UserTimeEntry::getTotalMinutes).reversed())
                .collect(Collectors.toList());

        Map<String, Integer> byTaskMinutes = logs.stream()
                .collect(Collectors.groupingBy(WorkLog::getTaskId, Collectors.summingInt(WorkLog::getDurationMinutes)));

        List<ProjectTimeSummaryResponse.TaskTimeEntry> byTask = byTaskMinutes.entrySet().stream()
                .map(e -> {
                    Task task = taskRepository.findByIdAndDeletedFalse(e.getKey()).orElse(null);
                    return ProjectTimeSummaryResponse.TaskTimeEntry.builder()
                            .taskId(e.getKey())
                            .taskTitle(task != null ? task.getTitle() : "Deleted task")
                            .totalMinutes(e.getValue())
                            .formatted(formatMinutes(e.getValue()))
                            .build();
                })
                .sorted(Comparator.comparingInt(ProjectTimeSummaryResponse.TaskTimeEntry::getTotalMinutes).reversed())
                .collect(Collectors.toList());

        return ProjectTimeSummaryResponse.builder()
                .totalMinutes(totalMinutes)
                .totalFormatted(formatMinutes(totalMinutes))
                .byUser(byUser)
                .byTask(byTask)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────

    private Task findTask(String taskId) {
        return taskRepository.findByIdAndDeletedFalse(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    private Project validateAccess(Task task, String userId) {
        Project project = projectRepository.findByIdAndDeletedFalse(task.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateProjectAccess(project, userId);
        return project;
    }

    private void validateProjectAccess(Project project, String userId) {
        if (project.getVisibility().name().equals("PUBLIC")) return;
        if (project.getOwnedBy().equals(userId)) return;
        if (project.getCreatedBy().equals(userId)) return;
        if (projectMemberRepository.existsByProjectIdAndUserIdAndActiveTrue(project.getId(), userId)) return;
        throw new RuntimeException("Access denied to this project");
    }

    private void validateManagerAccess(String projectId, String userId) {
        var member = projectMemberRepository.findByProjectIdAndUserIdAndActiveTrue(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        if (member.getRole().name().equals("VIEWER") || member.getRole().name().equals("MEMBER")) {
            throw new RuntimeException("You can only edit or delete your own work logs");
        }
    }

    private String formatMinutes(int minutes) {
        int h = minutes / 60;
        int m = minutes % 60;
        if (h == 0) return m + "m";
        if (m == 0) return h + "h";
        return h + "h " + m + "m";
    }

    private ActiveTimerResponse toActiveTimerResponse(WorkLog log, Task task, Project project) {
        return ActiveTimerResponse.builder()
                .workLogId(log.getId())
                .taskId(log.getTaskId())
                .taskTitle(task.getTitle())
                .projectId(log.getProjectId())
                .projectName(project != null ? project.getName() : "Unknown")
                .projectColor(project != null ? project.getColor() : "#6366f1")
                .startedAt(log.getStartedAt())
                .build();
    }

    private WorkLogResponse toWorkLogResponse(WorkLog log) {
        Task task = taskRepository.findByIdAndDeletedFalse(log.getTaskId()).orElse(null);
        Project project = task != null ? projectRepository.findByIdAndDeletedFalse(task.getProjectId()).orElse(null) : null;
        User user = userRepository.findById(log.getUserId()).orElse(null);

        return WorkLogResponse.builder()
                .id(log.getId())
                .taskId(log.getTaskId())
                .taskTitle(task != null ? task.getTitle() : "Deleted task")
                .projectId(log.getProjectId())
                .projectName(project != null ? project.getName() : "Unknown")
                .userId(log.getUserId())
                .userName(user != null ? user.getName() : "Unknown")
                .description(log.getDescription())
                .startedAt(log.getStartedAt())
                .stoppedAt(log.getStoppedAt())
                .durationMinutes(log.getDurationMinutes())
                .logDate(log.getLogDate())
                .running(log.isRunning())
                .createdAt(log.getCreatedAt())
                .build();
    }
}