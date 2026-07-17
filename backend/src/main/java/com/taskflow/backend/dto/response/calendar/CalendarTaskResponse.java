package com.taskflow.backend.dto.response.calendar;

import com.taskflow.backend.enums.TaskPriority;
import com.taskflow.backend.enums.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class CalendarTaskResponse {
    private String id;
    private String title;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate dueDate;
    private boolean overdue;
    private boolean dueToday;
    private String projectId;
    private String projectName;
    private String projectColor;
    private String assigneeId;
    private String assigneeName;
}