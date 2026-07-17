package com.taskflow.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_comment_mentions", indexes = {
        @Index(name = "idx_comment_mentions_comment_id", columnList = "comment_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskCommentMention {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "comment_id", nullable = false, length = 36)
    private String commentId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}