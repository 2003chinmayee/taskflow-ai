package com.taskflow.backend.controller;

import com.taskflow.backend.dto.request.auth.LoginRequest;
import com.taskflow.backend.dto.request.auth.RegisterRequest;
import com.taskflow.backend.dto.request.auth.ForgotPasswordRequest;
import com.taskflow.backend.dto.request.auth.ResetPasswordRequest;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.auth.AuthResponse;
import com.taskflow.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// ─── @RestController ──────────────────────────────────────────────
// Combines @Controller + @ResponseBody
// @Controller = this class handles HTTP requests
// @ResponseBody = return values are automatically converted to JSON

// ─── @RequestMapping ──────────────────────────────────────────────
// All endpoints in this controller start with /api/v1/auth
// So register endpoint = POST /api/v1/auth/register

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ─── @PostMapping ─────────────────────────────────────────────
    // This method handles POST /api/v1/auth/register

    // ─── @RequestBody ─────────────────────────────────────────────
    // Converts the incoming JSON body to a RegisterRequest object

    // ─── @Valid ───────────────────────────────────────────────────
    // Triggers the validation annotations in RegisterRequest
    // (@NotBlank, @Email, @Size)
    // If validation fails, Spring automatically returns 400 Bad Request

    // ─── ResponseEntity ───────────────────────────────────────────
    // Allows us to control the HTTP status code in addition to the body
    // ResponseEntity.status(201).body(data) = HTTP 201 Created

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse authResponse = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)  // 201 Created
                .body(ApiResponse.success("Account created successfully", authResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("If that email exists, a reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successful"));
    }

    // Health check for auth module
    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<String>> ping() {
        return ResponseEntity.ok(ApiResponse.success("Auth module is running", "pong"));
    }
}