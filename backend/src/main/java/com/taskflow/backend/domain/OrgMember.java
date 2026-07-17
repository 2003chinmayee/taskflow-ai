package com.taskflow.backend.domain;

import com.taskflow.backend.enums.OrgRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "org_members")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgMember {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @Column(name = "org_id", nullable = false, length = 36)
    private String orgId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private OrgRole role = OrgRole.MEMBER;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "removed_at")
    private LocalDateTime removedAt;

    @Column(name = "removed_by", length = 36)
    private String removedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // Joined table: fetch user details alongside member record
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
    }
}