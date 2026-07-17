package com.taskflow.backend.dto.response.ai;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiAnswerResponse {

    private String answer;

    private List<AiSuggestion> suggestions;

    private AiSourceStats sourceStats;

    // Always included so the frontend can show the required disclaimer
    // verbatim, regardless of question type.
    @Builder.Default
    private String disclaimer = "AI suggestions may be incomplete. Review before applying changes.";
}