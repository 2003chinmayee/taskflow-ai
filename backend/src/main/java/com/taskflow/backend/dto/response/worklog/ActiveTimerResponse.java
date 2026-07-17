package com.taskflow.backend.dto.response.worklog;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ActiveTimerResponse {
    private String workLogId;
    private String taskId;
    private String taskTitle;
    private String projectId;
    private String projectName;
    private String projectColor;
    private LocalDateTime startedAt;
}