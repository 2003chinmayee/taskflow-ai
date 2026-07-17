package com.taskflow.backend.service.ai;

import com.taskflow.backend.domain.Project;
import com.taskflow.backend.dto.response.ai.AiAnswerResponse;
import com.taskflow.backend.repository.ProjectMemberRepository;
import com.taskflow.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectAiService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectContextBuilder projectContextBuilder;
    private final GeminiClient geminiClient;
    private final AiRateLimiter aiRateLimiter;

    private static final String SYSTEM_INSTRUCTION = """
            You are an AI assistant embedded in a project management tool called TaskFlow.
            You must answer ONLY using the project data provided below in the user prompt.
            Do not invent tasks, people, or facts that are not present in the data.
            If the data does not contain enough information to answer, say so clearly.
            Be concise and direct. Use plain text, no markdown headers.
            """;

    @Transactional(readOnly = true)
    public AiAnswerResponse ask(String projectId, String userId, String question) {
        Project project = projectRepository.findByIdAndDeletedFalse(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Access check: user must be an active member (or owner/creator on
        // public projects), mirroring the same rule used everywhere else
        // in this codebase (e.g. TaskService.validateProjectAccess).
        boolean hasAccess = "PUBLIC".equals(project.getVisibility().name())
                || project.getOwnedBy().equals(userId)
                || project.getCreatedBy().equals(userId)
                || projectMemberRepository.existsByProjectIdAndUserIdAndActiveTrue(projectId, userId);

        if (!hasAccess) {
            throw new RuntimeException("Access denied to this project");
        }

        if (!aiRateLimiter.tryConsume(userId)) {
            throw new RuntimeException("AI usage limit reached. Please wait a few minutes and try again.");
        }

        ProjectContextBuilder.ProjectContext context = projectContextBuilder.build(projectId, project.getName());

        String prompt = context.promptText + "\n\n=== User question ===\n" + question;

        String answer = geminiClient.generateContent(SYSTEM_INSTRUCTION, prompt);

        return AiAnswerResponse.builder()
                .answer(answer)
                .suggestions(List.of())
                .sourceStats(context.sourceStats)
                .build();
    }
}