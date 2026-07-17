package com.taskflow.backend.service;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.auth.LoginRequest;
import com.taskflow.backend.dto.request.auth.RegisterRequest;
import com.taskflow.backend.dto.response.auth.AuthResponse;
import com.taskflow.backend.repository.UserRepository;
import com.taskflow.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: {}", saved.getEmail());
        return buildAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository
                .findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    public void forgotPassword(String email) {
        userRepository.findByEmail(email.toLowerCase().trim()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiresAt(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            String resetLink = frontendUrl + "/reset-password/" + token;
            emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
        });
        // Intentionally silent if email doesn't exist — don't reveal which emails are registered
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link"));

        if (user.getResetTokenExpiresAt() == null || user.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired reset link");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);

        log.info("Password reset completed for {}", user.getEmail());
    }

    private AuthResponse buildAuthResponse(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("name", user.getName());

        String accessToken = jwtService.generateToken(user.getId(), claims);
        String refreshToken = UUID.randomUUID().toString();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .build())
                .build();
    }
}