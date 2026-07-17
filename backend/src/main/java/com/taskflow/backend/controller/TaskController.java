package com.taskflow.backend.controller;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.task.CreateTaskRequest;
import com.taskflow.backend.dto.request.task.UpdateTaskRequest;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.task.TaskResponse;
import com.taskflow.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @PostMapping("/api/v1/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> create(
            @PathVariable String projectId,
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created",
                        taskService.createTask(projectId, request, uid(userDetails))));
    }

    @GetMapping("/api/v1/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> list(
            @PathVariable String projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String assigneeId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved",
                taskService.getTasks(projectId, uid(userDetails),
                        status, priority, assigneeId, search,
                        page, size, sortBy, direction)));
    }

    @GetMapping("/api/v1/projects/{projectId}/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> get(
            @PathVariable String projectId,
            @PathVariable String taskId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Task retrieved",
                taskService.getTask(projectId, taskId, uid(userDetails))));
    }

    @PatchMapping("/api/v1/projects/{projectId}/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> update(
            @PathVariable String projectId,
            @PathVariable String taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Task updated",
                taskService.updateTask(projectId, taskId, request, uid(userDetails))));
    }

    @DeleteMapping("/api/v1/projects/{projectId}/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String projectId,
            @PathVariable String taskId,
            @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteTask(projectId, taskId, uid(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Task deleted"));
    }
}