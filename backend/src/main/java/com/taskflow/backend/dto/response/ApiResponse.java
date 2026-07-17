package com.taskflow.backend.dto.response;

// ─── What is a Generic class? ─────────────────────────────────────
// <T> means this class can hold ANY type of data
// ApiResponse<String>, ApiResponse<UserDTO>, ApiResponse<List<Task>>
// The same wrapper class works for all response types

// ─── @lombok annotations ──────────────────────────────────────────
// @Data = @Getter + @Setter + @ToString + @EqualsAndHashCode
// @Builder = enables builder pattern
// @AllArgsConstructor = constructor with all fields
// @NoArgsConstructor = constructor with no fields (required by Jackson/JSON)

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {

    // Every API response has these three fields:
    private boolean success;  // true = worked, false = failed
    private String message;   // Human readable message
    private T data;           // The actual response data (any type)

    // ─── Static factory methods ────────────────────────────────────
    // These make creating responses easy:
    // ApiResponse.success("User created", userData)
    // ApiResponse.error("Email already exists")

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}