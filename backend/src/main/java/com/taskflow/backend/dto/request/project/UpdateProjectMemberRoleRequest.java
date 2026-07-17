package com.taskflow.backend.dto.request.project;

import com.taskflow.backend.enums.ProjectMemberRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateProjectMemberRoleRequest {

    @NotNull(message = "Role is required")
    private ProjectMemberRole role;
}