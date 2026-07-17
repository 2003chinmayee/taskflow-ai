package com.taskflow.backend.dto.response.org;

import com.taskflow.backend.enums.OrgRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrgMemberResponse {
    private String id;
    private String userId;
    private String name;
    private String email;
    private String avatarUrl;
    private OrgRole role;
    private LocalDateTime joinedAt;
    private boolean isOwner;
}