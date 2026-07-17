package com.taskflow.backend.controller;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.project.ProjectActivityResponse;
import com.taskflow.backend.service.ProjectActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class TaskActivityController {

    private final ProjectActivityService projectActivityService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @GetMapping("/api/v1/tasks/{taskId}/activities")
    public ResponseEntity<ApiResponse<Page<ProjectActivityResponse>>> list(
            @PathVariable String taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Activity retrieved",
                projectActivityService.getTaskActivity(taskId, uid(userDetails), page, size)));
    }
}