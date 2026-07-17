package com.taskflow.backend.controller;

import com.taskflow.backend.domain.Task;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.ai.ApplyDescriptionRequest;
import com.taskflow.backend.dto.request.ai.ApplyPriorityRequest;
import com.taskflow.backend.dto.request.ai.ApplyTitleRequest;
import com.taskflow.backend.dto.request.ai.TaskAskRequest;
import com.taskflow.backend.dto.request.task.UpdateTaskRequest;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.ai.AiAnswerResponse;
import com.taskflow.backend.dto.response.task.TaskResponse;
import com.taskflow.backend.repository.TaskRepository;
import com.taskflow.backend.service.TaskService;
import com.taskflow.backend.service.ai.TaskAiService;
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
public class TaskAiController {

    private final TaskAiService taskAiService;
    private final TaskService taskService;
    private final TaskRepository taskRepository;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @PostMapping("/api/v1/tasks/{taskId}/ai/ask")
    public ResponseEntity<ApiResponse<AiAnswerResponse>> ask(
            @PathVariable String taskId,
            @Valid @RequestBody TaskAskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("AI answer generated",
                taskAiService.ask(taskId, uid(userDetails), request.getQuestion(), request.getAction())));
    }

    // ─── Apply endpoints: each goes through the existing, already-validated
    // TaskService.updateTask() — same permission checks (VIEWER blocked,
    // creator/assignee rule) and same Activity logging as manual Save
    // Changes. The AI suggestion is never written directly to the DB. ───

    @PostMapping("/api/v1/tasks/{taskId}/ai/apply-title")
    public ResponseEntity<ApiResponse<TaskResponse>> applyTitle(
            @PathVariable String taskId,
            @Valid @RequestBody ApplyTitleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String projectId = findProjectId(taskId);
        UpdateTaskRequest updateRequest = new UpdateTaskRequest();
        updateRequest.setTitle(request.getTitle());
        return ResponseEntity.ok(ApiResponse.success("Title updated",
                taskService.updateTask(projectId, taskId, updateRequest, uid(userDetails))));
    }

    @PostMapping("/api/v1/tasks/{taskId}/ai/apply-description")
    public ResponseEntity<ApiResponse<TaskResponse>> applyDescription(
            @PathVariable String taskId,
            @Valid @RequestBody ApplyDescriptionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String projectId = findProjectId(taskId);
        UpdateTaskRequest updateRequest = new UpdateTaskRequest();
        updateRequest.setDescription(request.getDescription());
        return ResponseEntity.ok(ApiResponse.success("Description updated",
                taskService.updateTask(projectId, taskId, updateRequest, uid(userDetails))));
    }

    @PostMapping("/api/v1/tasks/{taskId}/ai/apply-priority")
    public ResponseEntity<ApiResponse<TaskResponse>> applyPriority(
            @PathVariable String taskId,
            @Valid @RequestBody ApplyPriorityRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String projectId = findProjectId(taskId);
        UpdateTaskRequest updateRequest = new UpdateTaskRequest();
        updateRequest.setPriority(request.getPriority());
        return ResponseEntity.ok(ApiResponse.success("Priority updated",
                taskService.updateTask(projectId, taskId, updateRequest, uid(userDetails))));
    }

    private String findProjectId(String taskId) {
        Task task = taskRepository.findByIdAndDeletedFalse(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return task.getProjectId();
    }
}