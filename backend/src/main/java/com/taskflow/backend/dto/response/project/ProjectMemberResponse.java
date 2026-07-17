package com.taskflow.backend.dto.response.project;

import com.taskflow.backend.enums.ProjectMemberRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectMemberResponse {
    private String id;
    private String userId;
    private String name;
    private String email;
    private String avatarUrl;
    private ProjectMemberRole role;
    private boolean isOwner;
    private LocalDateTime joinedAt;
}