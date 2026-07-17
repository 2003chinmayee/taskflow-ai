package com.taskflow.backend.dto.response.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ProjectResponse {
    private String id;
    private String orgId;
    private String name;
    private String description;
    private String slug;
    private String color;
    private String iconUrl;
    private String coverUrl;
    private String status;
    private String visibility;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private String createdBy;
    private String ownedBy;
    private boolean pinned;
    private boolean favorite;
    private boolean template;
    private int memberCount;
    private int taskCount;
    private int completedTaskCount;
    private double completionPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}