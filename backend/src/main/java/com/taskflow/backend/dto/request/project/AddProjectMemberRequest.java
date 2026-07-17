package com.taskflow.backend.dto.request.project;

import com.taskflow.backend.enums.ProjectMemberRole;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddProjectMemberRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    private ProjectMemberRole role = ProjectMemberRole.MEMBER;
}