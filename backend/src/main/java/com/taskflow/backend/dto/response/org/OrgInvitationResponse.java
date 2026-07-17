package com.taskflow.backend.dto.response.org;

import com.taskflow.backend.enums.OrgRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrgInvitationResponse {
    private String id;
    private String inviteeEmail;
    private OrgRole role;
    private String invitedByName;
    private String status;       // PENDING / ACCEPTED / REVOKED / EXPIRED (computed)
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime acceptedAt;
}