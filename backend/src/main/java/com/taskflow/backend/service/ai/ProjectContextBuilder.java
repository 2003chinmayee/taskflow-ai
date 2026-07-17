package com.taskflow.backend.service.ai;

import com.taskflow.backend.domain.Task;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.ai.AiSourceStats;
import com.taskflow.backend.repository.ProjectActivityRepository;
import com.taskflow.backend.repository.TaskRepository;
import com.taskflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProjectContextBuilder {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectActivityRepository projectActivityRepository;

    public static class ProjectContext {
        public String promptText;
        public AiSourceStats sourceStats;
    }

    /**
     * Builds a compact, prompt-ready summary of a project's tasks for
     * Gemini. Only includes data the caller has already been verified to
     * access — this method does not perform its own access checks.
     */
    public ProjectContext build(String projectId, String projectName) {
        List<Task> tasks = taskRepository.findByProjectIdAndDeletedFalse(projectId);
        LocalDate today = LocalDate.now();

        List<Task> overdue = tasks.stream()
                .filter(t -> t.getStatus() != com.taskflow.backend.enums.TaskStatus.DONE)
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(today))
                .toList();

        List<Task> dueToday = tasks.stream()
                .filter(t -> t.getStatus() != com.taskflow.backend.enums.TaskStatus.DONE)
                .filter(t -> t.getDueDate() != null && t.getDueDate().isEqual(today))
                .toList();

        Map<String, Long> workloadByAssignee = tasks.stream()
                .filter(t -> t.getStatus() != com.taskflow.backend.enums.TaskStatus.DONE)
                .filter(t -> t.getAssigneeId() != null)
                .collect(Collectors.groupingBy(Task::getAssigneeId, Collectors.counting()));

        StringBuilder sb = new StringBuilder();
        sb.append("Project: ").append(projectName).append("\n");
        sb.append("Total tasks: ").append(tasks.size()).append("\n\n");

        sb.append("=== All tasks ===\n");
        for (Task t : tasks) {
            String assigneeName = t.getAssigneeId() != null
                    ? userRepository.findById(t.getAssigneeId()).map(User::getName).orElse("Unknown")
                    : "Unassigned";
            sb.append("- [").append(t.getStatus()).append("] \"").append(t.getTitle())
                    .append("\" | priority=").append(t.getPriority())
                    .append(" | assignee=").append(assigneeName)
                    .append(" | dueDate=").append(t.getDueDate() != null ? t.getDueDate() : "none")
                    .append("\n");
        }

        sb.append("\n=== Overdue tasks (").append(overdue.size()).append(") ===\n");
        for (Task t : overdue) {
            sb.append("- \"").append(t.getTitle()).append("\" was due ").append(t.getDueDate()).append("\n");
        }

        sb.append("\n=== Due today (").append(dueToday.size()).append(") ===\n");
        for (Task t : dueToday) {
            sb.append("- \"").append(t.getTitle()).append("\"\n");
        }

        sb.append("\n=== Workload by assignee (open tasks) ===\n");
        for (Map.Entry<String, Long> entry : workloadByAssignee.entrySet()) {
            String name = userRepository.findById(entry.getKey()).map(User::getName).orElse("Unknown");
            sb.append("- ").append(name).append(": ").append(entry.getValue()).append(" open task(s)\n");
        }

        long recentActivityCount = projectActivityRepository
                .findByProjectIdOrderByCreatedAtDesc(projectId, PageRequest.of(0, 50))
                .getTotalElements();

        ProjectContext context = new ProjectContext();
        context.promptText = sb.toString();
        context.sourceStats = AiSourceStats.builder()
                .taskCount(tasks.size())
                .commentCount(0)
                .activityCount((int) recentActivityCount)
                .build();
        return context;
    }
}