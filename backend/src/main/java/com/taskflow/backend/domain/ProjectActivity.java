package com.taskflow.backend.domain;

import com.taskflow.backend.enums.ActivityType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_activities", indexes = {
        @Index(name = "idx_pa_project_id", columnList = "project_id"),
        @Index(name = "idx_pa_user_id", columnList = "user_id"),
        @Index(name = "idx_pa_created_at", columnList = "created_at")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectActivity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "project_id", nullable = false, length = 36)
    private String projectId;

    @Column(name = "task_id", length = 36)
    private String taskId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "meta_data", columnDefinition = "TEXT")
    private String metaData;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}