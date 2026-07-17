package com.taskflow.backend.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectProgressResponse {
    private String id;
    private String name;
    private String color;
    private String status;
    private int memberCount;
    private int taskCount;
    private int completedTaskCount;
    private double completionPercentage;
    private LocalDateTime dueDate;
}