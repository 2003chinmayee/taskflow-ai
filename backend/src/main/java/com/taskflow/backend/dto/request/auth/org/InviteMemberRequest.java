package com.taskflow.backend.dto.request.org;

import com.taskflow.backend.enums.OrgRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InviteMemberRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email required")
    private String email;

    @NotNull(message = "Role is required")
    private OrgRole role;

    private String personalMessage;
}