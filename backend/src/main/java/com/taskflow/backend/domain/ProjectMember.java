package com.taskflow.backend.domain;

import com.taskflow.backend.enums.ProjectMemberRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_members", indexes = {
        @Index(name = "idx_pm_project_id", columnList = "project_id"),
        @Index(name = "idx_pm_user_id", columnList = "user_id"),
        @Index(name = "idx_pm_project_user", columnList = "project_id,user_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectMember {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "project_id", nullable = false, length = 36)
    private String projectId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectMemberRole role = ProjectMemberRole.MEMBER;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    @Column(name = "added_by", length = 36)
    private String addedBy;

    @CreationTimestamp
    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "removed_at")
    private LocalDateTime removedAt;
}