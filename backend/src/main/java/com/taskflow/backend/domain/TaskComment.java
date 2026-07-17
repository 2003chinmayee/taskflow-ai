package com.taskflow.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_comments", indexes = {
        @Index(name = "idx_task_comments_task_id", columnList = "task_id"),
        @Index(name = "idx_task_comments_author_id", columnList = "author_id"),
        @Index(name = "idx_task_comments_created_at", columnList = "created_at")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskComment {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "task_id", nullable = false, length = 36)
    private String taskId;

    @Column(name = "author_id", nullable = false, length = 36)
    private String authorId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_edited", nullable = false)
    @Builder.Default
    private boolean edited = false;

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