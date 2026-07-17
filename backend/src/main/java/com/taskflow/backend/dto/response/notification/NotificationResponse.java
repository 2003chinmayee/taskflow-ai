package com.taskflow.backend.dto.response.notification;

import com.taskflow.backend.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private String id;
    private String actorId;
    private String actorName;
    private NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private String projectId;
    private String taskId;
    private String organizationId;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}