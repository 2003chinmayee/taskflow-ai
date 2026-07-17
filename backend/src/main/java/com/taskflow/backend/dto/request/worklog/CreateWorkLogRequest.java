package com.taskflow.backend.dto.request.worklog;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateWorkLogRequest {

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    @Max(value = 500, message = "Description too long")
    private String description;
}