package com.taskflow.backend.dto.request.ai;

import com.taskflow.backend.enums.TaskPriority;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplyPriorityRequest {

    @NotNull(message = "Priority is required")
    private TaskPriority priority;
}