package com.taskflow.backend.dto.response.org;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrgResponse {
    private String id;
    private String name;
    private String description;
    private String logoUrl;
    private String slug;
    private String plan;
    private String createdBy;
    private int memberCount;
    private String currentUserRole;
    private boolean isOwner;
    private LocalDateTime createdAt;
}