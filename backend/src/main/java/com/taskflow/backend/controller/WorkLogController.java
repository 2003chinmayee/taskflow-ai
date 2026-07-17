package com.taskflow.backend.controller;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.worklog.CreateWorkLogRequest;
import com.taskflow.backend.dto.request.worklog.UpdateWorkLogRequest;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.worklog.ActiveTimerResponse;
import com.taskflow.backend.dto.response.worklog.WorkLogResponse;
import com.taskflow.backend.service.WorkLogService;
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
public class WorkLogController {

    private final WorkLogService workLogService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @PostMapping("/api/v1/tasks/{taskId}/timer/start")
    public ResponseEntity<ApiResponse<ActiveTimerResponse>> startTimer(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Timer started",
                workLogService.startTimer(taskId, uid(userDetails))));
    }

    @PostMapping("/api/v1/tasks/{taskId}/timer/stop")
    public ResponseEntity<ApiResponse<WorkLogResponse>> stopTimer(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Timer stopped",
                workLogService.stopTimer(taskId, uid(userDetails))));
    }

    @PostMapping("/api/v1/tasks/{taskId}/work-logs")
    public ResponseEntity<ApiResponse<WorkLogResponse>> createWorkLog(
            @PathVariable String taskId,
            @Valid @RequestBody CreateWorkLogRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Work log created",
                        workLogService.createManualLog(taskId, request, uid(userDetails))));
    }

    @GetMapping("/api/v1/tasks/{taskId}/work-logs")
    public ResponseEntity<ApiResponse<Page<WorkLogResponse>>> listWorkLogs(
            @PathVariable String taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Work logs retrieved",
                workLogService.getWorkLogs(taskId, uid(userDetails), page, size)));
    }

    @PatchMapping("/api/v1/work-logs/{workLogId}")
    public ResponseEntity<ApiResponse<WorkLogResponse>> updateWorkLog(
            @PathVariable String workLogId,
            @Valid @RequestBody UpdateWorkLogRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Work log updated",
                workLogService.updateWorkLog(workLogId, request, uid(userDetails))));
    }

    @DeleteMapping("/api/v1/work-logs/{workLogId}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkLog(
            @PathVariable String workLogId,
            @AuthenticationPrincipal UserDetails userDetails) {
        workLogService.deleteWorkLog(workLogId, uid(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Work log deleted"));
    }
}