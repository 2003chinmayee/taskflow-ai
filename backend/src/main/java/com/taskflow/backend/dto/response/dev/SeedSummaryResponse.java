package com.taskflow.backend.dto.response.dev;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SeedSummaryResponse {
    private List<String> created;
    private List<String> skipped;
}