package com.taskflow.backend.controller;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.ai.ProjectAskRequest;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.ai.AiAnswerResponse;
import com.taskflow.backend.service.ai.ProjectAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ProjectAiController {

    private final ProjectAiService projectAiService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @PostMapping("/api/v1/projects/{projectId}/ai/ask")
    public ResponseEntity<ApiResponse<AiAnswerResponse>> ask(
            @PathVariable String projectId,
            @Valid @RequestBody ProjectAskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("AI answer generated",
                projectAiService.ask(projectId, uid(userDetails), request.getQuestion())));
    }
}