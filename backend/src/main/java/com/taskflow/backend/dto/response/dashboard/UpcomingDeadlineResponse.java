package com.taskflow.backend.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UpcomingDeadlineResponse {
    private String taskId;
    private String taskTitle;
    private String projectId;
    private String projectName;
    private String projectColor;
    private LocalDate dueDate;
}