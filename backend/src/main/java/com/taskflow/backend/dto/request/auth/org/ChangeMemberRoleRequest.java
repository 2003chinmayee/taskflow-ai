package com.taskflow.backend.dto.request.org;

import com.taskflow.backend.enums.OrgRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeMemberRoleRequest {

    @NotNull(message = "Role is required")
    private OrgRole role;
}