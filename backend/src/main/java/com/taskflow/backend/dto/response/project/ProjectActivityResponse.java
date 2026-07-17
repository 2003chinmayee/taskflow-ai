package com.taskflow.backend.dto.response.project;

import com.taskflow.backend.enums.ActivityType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectActivityResponse {
    private String id;
    private String projectId;
    private String taskId;
    private String userId;
    private String userName;
    private ActivityType type;
    private String description;
    private LocalDateTime createdAt;
}