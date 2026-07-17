package com.taskflow.backend.dto.response.task;

import com.taskflow.backend.enums.TaskPriority;
import com.taskflow.backend.enums.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TaskResponse {
    private String id;
    private String projectId;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private String assigneeId;
    private String assigneeName;
    private String createdBy;
    private LocalDate dueDate;
    private int position;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}