package com.taskflow.backend.controller;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.worklog.ActiveTimerResponse;
import com.taskflow.backend.dto.response.worklog.ProjectTimeSummaryResponse;
import com.taskflow.backend.service.WorkLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TimeTrackingController {

    private final WorkLogService workLogService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @GetMapping("/api/v1/time-tracking/active-timer")
    public ResponseEntity<ApiResponse<ActiveTimerResponse>> getActiveTimer(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Active timer retrieved",
                workLogService.getActiveTimer(uid(userDetails))));
    }

    @GetMapping("/api/v1/projects/{projectId}/time-summary")
    public ResponseEntity<ApiResponse<ProjectTimeSummaryResponse>> getProjectTimeSummary(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Time summary retrieved",
                workLogService.getProjectTimeSummary(projectId, uid(userDetails))));
    }
}