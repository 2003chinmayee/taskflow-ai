package com.taskflow.backend.service.ai;

import com.taskflow.backend.domain.Task;
import com.taskflow.backend.domain.TaskAttachment;
import com.taskflow.backend.domain.TaskComment;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.domain.WorkLog;
import com.taskflow.backend.dto.response.ai.AiSourceStats;
import com.taskflow.backend.repository.ProjectActivityRepository;
import com.taskflow.backend.repository.TaskAttachmentRepository;
import com.taskflow.backend.repository.TaskCommentRepository;
import com.taskflow.backend.repository.UserRepository;
import com.taskflow.backend.repository.WorkLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TaskContextBuilder {

    private final TaskCommentRepository taskCommentRepository;
    private final TaskAttachmentRepository taskAttachmentRepository;
    private final WorkLogRepository workLogRepository;
    private final ProjectActivityRepository projectActivityRepository;
    private final UserRepository userRepository;

    public static class TaskContext {
        public String promptText;
        public AiSourceStats sourceStats;
    }

    /**
     * Builds a compact, prompt-ready summary of a single task for Gemini.
     * Only includes attachment metadata (filename, type, size) — never
     * file contents, per Module 12 scope. Caller must have already
     * verified project/task access before calling this.
     */
    public TaskContext build(Task task) {
        StringBuilder sb = new StringBuilder();

        sb.append("Task: \"").append(task.getTitle()).append("\"\n");
        sb.append("Status: ").append(task.getStatus()).append("\n");
        sb.append("Priority: ").append(task.getPriority()).append("\n");
        sb.append("Due date: ").append(task.getDueDate() != null ? task.getDueDate() : "none").append("\n");
        sb.append("Description: ").append(
                task.getDescription() != null && !task.getDescription().isBlank()
                        ? task.getDescription() : "(no description)"
        ).append("\n");

        String assigneeName = task.getAssigneeId() != null
                ? userRepository.findById(task.getAssigneeId()).map(User::getName).orElse("Unknown")
                : "Unassigned";
        sb.append("Assignee: ").append(assigneeName).append("\n\n");

        // Comments — most recent 20 (page 0), oldest-to-newest for readable discussion flow
        Page<TaskComment> commentPage = taskCommentRepository.findByTaskIdOrderByCreatedAtDesc(task.getId(), PageRequest.of(0, 20));
        List<TaskComment> comments = commentPage.getContent().reversed();
        sb.append("=== Comments (").append(comments.size()).append(") ===\n");
        for (TaskComment c : comments) {
            if (c.isDeleted()) continue;
            String authorName = userRepository.findById(c.getAuthorId()).map(User::getName).orElse("Unknown");
            sb.append("- ").append(authorName).append(": ").append(c.getContent()).append("\n");
        }

        // Attachments — metadata only, never file contents
        List<TaskAttachment> attachments = taskAttachmentRepository.findByTaskIdOrderByCreatedAtDesc(task.getId());
        sb.append("\n=== Attachments (").append(attachments.size()).append(") — metadata only ===\n");
        for (TaskAttachment a : attachments) {
            sb.append("- ").append(a.getOriginalFileName())
                    .append(" (").append(a.getMimeType()).append(", ")
                    .append(a.getFileSizeBytes() / 1024).append(" KB)\n");
        }

        // Work logs
        List<WorkLog> workLogs = workLogRepository.findByTaskIdAndDeletedFalse(task.getId());
        int totalMinutes = workLogRepository.sumMinutesByTaskId(task.getId());
        sb.append("\n=== Work logs (").append(workLogs.size()).append(" entries, ")
                .append(totalMinutes).append(" total minutes) ===\n");

        // Recent activity for this task (first page, newest-first)
        long activityCount = projectActivityRepository
                .findByTaskIdOrderByCreatedAtDesc(task.getId(), PageRequest.of(0, 20))
                .getTotalElements();
        sb.append("\n=== Recent activity events: ").append(activityCount).append(" ===\n");

        TaskContext context = new TaskContext();
        context.promptText = sb.toString();
        context.sourceStats = AiSourceStats.builder()
                .taskCount(1)
                .commentCount(comments.size())
                .activityCount((int) activityCount)
                .build();
        return context;
    }
}