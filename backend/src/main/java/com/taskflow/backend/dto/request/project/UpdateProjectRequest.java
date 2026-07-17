package com.taskflow.backend.dto.request.project;

import com.taskflow.backend.enums.ProjectStatus;
import com.taskflow.backend.enums.ProjectVisibility;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateProjectRequest {

    @Size(min = 2, max = 100)
    private String name;

    @Size(max = 2000)
    private String description;

    private String color;
    private String iconUrl;
    private String coverUrl;
    private ProjectStatus status;
    private ProjectVisibility visibility;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private Boolean pinned;
}