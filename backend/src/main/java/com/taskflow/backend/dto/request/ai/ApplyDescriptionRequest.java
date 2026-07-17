package com.taskflow.backend.dto.request.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplyDescriptionRequest {

    @NotBlank(message = "Description cannot be empty")
    private String description;
}