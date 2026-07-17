package com.taskflow.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_logs", indexes = {
        @Index(name = "idx_wl_task_id", columnList = "task_id"),
        @Index(name = "idx_wl_project_id", columnList = "project_id"),
        @Index(name = "idx_wl_user_id", columnList = "user_id"),
        @Index(name = "idx_wl_is_running", columnList = "is_running")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class WorkLog {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "task_id", nullable = false, length = 36)
    private String taskId;

    @Column(name = "project_id", nullable = false, length = 36)
    private String projectId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "stopped_at")
    private LocalDateTime stoppedAt;

    @Column(name = "duration_minutes", nullable = false)
    @Builder.Default
    private int durationMinutes = 0;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "is_running", nullable = false)
    @Builder.Default
    private boolean running = false;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}