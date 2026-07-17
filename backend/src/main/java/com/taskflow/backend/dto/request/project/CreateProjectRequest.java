package com.taskflow.backend.dto.request.project;

import com.taskflow.backend.enums.ProjectVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
    private String name;

    @Size(max = 2000, message = "Description too long")
    private String description;

    private String color;
    private String iconUrl;
    private ProjectVisibility visibility;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private boolean template;
}