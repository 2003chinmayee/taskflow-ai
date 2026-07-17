package com.taskflow.backend.dto.request.task;

import com.taskflow.backend.enums.TaskPriority;
import com.taskflow.backend.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateTaskRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    private String assigneeId;

    private LocalDate dueDate;
}