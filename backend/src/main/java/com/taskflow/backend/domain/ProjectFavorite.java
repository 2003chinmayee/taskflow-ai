package com.taskflow.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_favorites",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "user_id"}))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectFavorite {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "project_id", nullable = false, length = 36)
    private String projectId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}