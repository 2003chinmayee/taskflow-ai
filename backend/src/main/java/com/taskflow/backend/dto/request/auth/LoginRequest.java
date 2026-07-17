package com.taskflow.backend.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    // Remember me = refresh token lives 7 days vs default
    // We use Boolean (capital B) not boolean (lowercase)
    // because Boolean can be null (user didn't send it)
    // boolean cannot be null
    private Boolean rememberMe = false;
}