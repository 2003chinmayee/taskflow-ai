package com.taskflow.backend.controller;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.comment.CreateCommentRequest;
import com.taskflow.backend.dto.request.comment.UpdateCommentRequest;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.comment.CommentResponse;
import com.taskflow.backend.service.TaskCommentService;
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
public class TaskCommentController {

    private final TaskCommentService taskCommentService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @PostMapping("/api/v1/tasks/{taskId}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> create(
            @PathVariable String taskId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment posted",
                        taskCommentService.createComment(taskId, request, uid(userDetails))));
    }

    @GetMapping("/api/v1/tasks/{taskId}/comments")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> list(
            @PathVariable String taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Comments retrieved",
                taskCommentService.getComments(taskId, uid(userDetails), page, size)));
    }

    @PatchMapping("/api/v1/tasks/{taskId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> update(
            @PathVariable String taskId,
            @PathVariable String commentId,
            @Valid @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Comment updated",
                taskCommentService.updateComment(taskId, commentId, request, uid(userDetails))));
    }

    @DeleteMapping("/api/v1/tasks/{taskId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String taskId,
            @PathVariable String commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        taskCommentService.deleteComment(taskId, commentId, uid(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Comment deleted"));
    }
}