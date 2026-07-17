package com.taskflow.backend.domain;

import com.taskflow.backend.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_recipient_read_created", columnList = "recipient_id,is_read,created_at"),
        @Index(name = "idx_notifications_recipient_created", columnList = "recipient_id,created_at"),
        @Index(name = "idx_notifications_task_id", columnList = "task_id"),
        @Index(name = "idx_notifications_project_id", columnList = "project_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "recipient_id", nullable = false, length = 36)
    private String recipientId;

    @Column(name = "actor_id", length = 36)
    private String actorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private NotificationType type;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "message", nullable = false, length = 300)
    private String message;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;

    @Column(name = "project_id", length = 36)
    private String projectId;

    @Column(name = "task_id", length = 36)
    private String taskId;

    @Column(name = "organization_id", length = 36)
    private String organizationId;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}