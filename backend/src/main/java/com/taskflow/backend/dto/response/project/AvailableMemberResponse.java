package com.taskflow.backend.dto.response.project;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AvailableMemberResponse {
    private String userId;
    private String name;
    private String email;
    private String avatarUrl;
}