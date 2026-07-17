package com.taskflow.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_settings")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectSettings {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "project_id", nullable = false, unique = true, length = 36)
    private String projectId;

    @Column(name = "allow_member_invite")
    @Builder.Default
    private boolean allowMemberInvite = true;

    @Column(name = "allow_guest_access")
    @Builder.Default
    private boolean allowGuestAccess = false;

    @Column(name = "enable_time_tracking")
    @Builder.Default
    private boolean enableTimeTracking = true;

    @Column(name = "enable_sprints")
    @Builder.Default
    private boolean enableSprints = false;

    @Column(name = "enable_milestones")
    @Builder.Default
    private boolean enableMilestones = true;

    @Column(name = "default_task_view", length = 20)
    @Builder.Default
    private String defaultTaskView = "BOARD";

    @Column(name = "notification_email")
    @Builder.Default
    private boolean notificationEmail = true;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}