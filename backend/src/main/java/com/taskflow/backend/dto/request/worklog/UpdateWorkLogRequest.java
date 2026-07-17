package com.taskflow.backend.dto.request.worklog;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateWorkLogRequest {

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    private LocalDate logDate;

    private String description;
}