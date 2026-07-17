package com.taskflow.backend.dto.request.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplyTitleRequest {

    @NotBlank(message = "Title cannot be empty")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
}