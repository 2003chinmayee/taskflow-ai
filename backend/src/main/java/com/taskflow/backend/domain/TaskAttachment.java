package com.taskflow.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_attachments", indexes = {
        @Index(name = "idx_task_attachments_task_id", columnList = "task_id"),
        @Index(name = "idx_task_attachments_uploaded_by", columnList = "uploaded_by")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TaskAttachment {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "task_id", nullable = false, length = 36)
    private String taskId;

    @Column(name = "uploaded_by", nullable = false, length = 36)
    private String uploadedBy;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "stored_file_name", nullable = false, length = 100, unique = true)
    private String storedFileName;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "file_size_bytes", nullable = false)
    private long fileSizeBytes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}