package com.taskflow.backend.domain;

import com.taskflow.backend.enums.ProjectStatus;
import com.taskflow.backend.enums.ProjectVisibility;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "projects", indexes = {
        @Index(name = "idx_project_org_id", columnList = "org_id"),
        @Index(name = "idx_project_status", columnList = "status"),
        @Index(name = "idx_project_slug", columnList = "slug"),
        @Index(name = "idx_project_created_by", columnList = "created_by")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Project {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "org_id", nullable = false, length = 36)
    private String orgId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(unique = true, nullable = false, length = 120)
    private String slug;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "cover_url")
    private String coverUrl;

    @Column(name = "color", length = 7)
    @Builder.Default
    private String color = "#6366f1";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.PLANNING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectVisibility visibility = ProjectVisibility.PUBLIC;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_by", nullable = false, length = 36)
    private String createdBy;

    @Column(name = "owned_by", nullable = false, length = 36)
    private String ownedBy;

    @Column(name = "is_pinned")
    @Builder.Default
    private boolean pinned = false;

    @Column(name = "is_template")
    @Builder.Default
    private boolean template = false;

    @Column(name = "is_deleted")
    @Builder.Default
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by", length = 36)
    private String deletedBy;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "archived_by", length = 36)
    private String archivedBy;

    @Column(name = "member_count")
    @Builder.Default
    private int memberCount = 1;

    @Column(name = "task_count")
    @Builder.Default
    private int taskCount = 0;

    @Column(name = "completed_task_count")
    @Builder.Default
    private int completedTaskCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}