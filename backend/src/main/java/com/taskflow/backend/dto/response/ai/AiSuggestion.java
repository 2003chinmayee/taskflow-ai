package com.taskflow.backend.dto.response.ai;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiSuggestion {

    // "TITLE" | "DESCRIPTION" | "PRIORITY" | "SUBTASKS"
    private String type;

    private String currentValue;

    private String suggestedValue;

    // True only for TITLE/DESCRIPTION/PRIORITY — these have a real Apply
    // action. SUBTASKS is always false: copy-only text, no Apply endpoint,
    // since no subtask/checklist entity exists in this project yet.
    private boolean applicable;
}