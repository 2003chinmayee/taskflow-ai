package com.taskflow.backend.domain;

import com.taskflow.backend.enums.OrgRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "org_invitations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgInvitation {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @Column(name = "org_id", nullable = false, length = 36)
    private String orgId;

    @Column(name = "inviter_user_id", nullable = false, length = 36)
    private String inviterUserId;

    @Column(name = "invitee_email", nullable = false, length = 254)
    private String inviteeEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private OrgRole role = OrgRole.MEMBER;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "personal_message", length = 200)
    private String personalMessage;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private InvitationStatus status = InvitationStatus.PENDING;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum InvitationStatus {
        PENDING, ACCEPTED, DECLINED, REVOKED, EXPIRED
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}