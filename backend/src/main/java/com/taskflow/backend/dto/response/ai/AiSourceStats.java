package com.taskflow.backend.dto.response.ai;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiSourceStats {
    private int taskCount;
    private int commentCount;
    private int activityCount;
}