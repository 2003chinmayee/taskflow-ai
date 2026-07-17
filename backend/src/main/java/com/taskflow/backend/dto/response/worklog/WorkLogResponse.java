package com.taskflow.backend.dto.response.worklog;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class WorkLogResponse {
    private String id;
    private String taskId;
    private String taskTitle;
    private String projectId;
    private String projectName;
    private String userId;
    private String userName;
    private String description;
    private LocalDateTime startedAt;
    private LocalDateTime stoppedAt;
    private int durationMinutes;
    private LocalDate logDate;
    private boolean running;
    private LocalDateTime createdAt;
}