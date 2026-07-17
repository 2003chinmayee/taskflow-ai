package com.taskflow.backend.dto.response.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private UserDTO user;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserDTO {
        private String id;
        private String email;
        private String name;
        private String avatarUrl;
        private String jobTitle;
        private String theme;
        private boolean emailVerified;
        private int onboardingStep;
    }
}