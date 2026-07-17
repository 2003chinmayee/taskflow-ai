package com.taskflow.backend.dto.response.dashboard;

import com.taskflow.backend.enums.TaskPriority;
import com.taskflow.backend.enums.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class MyTaskResponse {
    private String id;
    private String title;
    private String projectId;
    private String projectName;
    private String projectColor;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate dueDate;
    private boolean overdue;
}