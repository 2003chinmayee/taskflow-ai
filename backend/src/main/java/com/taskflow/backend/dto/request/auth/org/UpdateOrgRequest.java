package com.taskflow.backend.dto.request.org;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateOrgRequest {

    @Size(min = 2, max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    private String logoUrl;
}