package com.taskflow.backend.service.ai;

import com.taskflow.backend.domain.Task;
import com.taskflow.backend.dto.response.ai.AiAnswerResponse;
import com.taskflow.backend.dto.response.ai.AiSuggestion;
import com.taskflow.backend.enums.TaskAiActionType;
import com.taskflow.backend.repository.ProjectMemberRepository;
import java.util.List;
import com.taskflow.backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskAiService {

    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskContextBuilder taskContextBuilder;
    private final GeminiClient geminiClient;
    private final AiRateLimiter aiRateLimiter;

    private static final String SYSTEM_INSTRUCTION = """
            You are an AI assistant embedded in a project management tool called TaskFlow.
            You must answer ONLY using the task data provided below in the user prompt.
            Do not invent comments, attachments, or facts that are not present in the data.
            Attachment info is metadata only (filename, type, size) — never assume file contents.
            Be concise and direct. Use plain text, no markdown headers.
            """;

    @Transactional(readOnly = true)
    public AiAnswerResponse ask(String taskId, String userId, String question, TaskAiActionType action) {
        Task task = taskRepository.findByIdAndDeletedFalse(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        boolean isMember = projectMemberRepository
                .existsByProjectIdAndUserIdAndActiveTrue(task.getProjectId(), userId);
        if (!isMember) {
            throw new RuntimeException("You are not a member of this project");
        }

        if (!aiRateLimiter.tryConsume(userId)) {
            throw new RuntimeException("AI usage limit reached. Please wait a few minutes and try again.");
        }

        TaskContextBuilder.TaskContext context = taskContextBuilder.build(task);

        String actionInstruction = buildActionInstruction(action);
        String prompt = context.promptText
                + "\n\n=== Requested action ===\n" + actionInstruction
                + "\n\n=== User question ===\n" + question;

        String answer = geminiClient.generateContent(SYSTEM_INSTRUCTION, prompt);

        List<AiSuggestion> suggestions = buildSuggestions(action, task, answer);

        return AiAnswerResponse.builder()
                .answer(answer)
                .suggestions(suggestions)
                .sourceStats(context.sourceStats)
                .build();
    }

    private List<AiSuggestion> buildSuggestions(TaskAiActionType action, Task task, String answer) {
        return switch (action) {
            case IMPROVE_DESCRIPTION -> List.of(AiSuggestion.builder()
                    .type("DESCRIPTION")
                    .currentValue(task.getDescription() != null ? task.getDescription() : "")
                    .suggestedValue(answer.trim())
                    .applicable(true)
                    .build());
            case SUGGEST_SUBTASKS -> List.of(AiSuggestion.builder()
                    .type("SUBTASKS")
                    .currentValue("")
                    .suggestedValue(answer.trim())
                    .applicable(false)
                    .build());
            default -> List.of();
        };
    }

    private String buildActionInstruction(TaskAiActionType action) {
        return switch (action) {
            case SUMMARIZE -> "Summarize the discussion and current state of this task in a few sentences.";
            case WHAT_CHANGED -> "Describe what has changed recently on this task, based on the activity and comment data provided.";
            case SUGGEST_NEXT_STEPS -> "Suggest concrete next steps to move this task forward.";
            case IMPROVE_DESCRIPTION -> "Rewrite the task description to be clearer and more actionable. Return only the improved description text.";
            case SUGGEST_SUBTASKS -> "Break this task down into a short checklist of subtasks. Return them as a simple list, one per line.";
            case FREEFORM -> "Answer the user's question naturally using the task data provided.";
        };
    }
}