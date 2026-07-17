package com.taskflow.backend.dto.request.ai;

import com.taskflow.backend.enums.TaskAiActionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskAskRequest {

    @NotBlank(message = "Question cannot be empty")
    @Size(max = 1000, message = "Question cannot exceed 1000 characters")
    private String question;

    @NotNull(message = "Action is required")
    private TaskAiActionType action;
}