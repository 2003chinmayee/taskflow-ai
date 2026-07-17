package com.taskflow.backend.controller;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.dashboard.*;
import com.taskflow.backend.dto.response.project.ProjectActivityResponse;
import com.taskflow.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @GetMapping("/api/v1/dashboard/overview")
    public ResponseEntity<ApiResponse<DashboardOverviewResponse>> overview(
            @RequestParam String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Overview retrieved",
                dashboardService.getOverview(orgId, uid(userDetails))));
    }

    @GetMapping("/api/v1/dashboard/my-tasks")
    public ResponseEntity<ApiResponse<List<MyTaskResponse>>> myTasks(
            @RequestParam String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("My tasks retrieved",
                dashboardService.getMyTasks(orgId, uid(userDetails))));
    }

    @GetMapping("/api/v1/dashboard/upcoming-deadlines")
    public ResponseEntity<ApiResponse<List<UpcomingDeadlineResponse>>> upcomingDeadlines(
            @RequestParam String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Upcoming deadlines retrieved",
                dashboardService.getUpcomingDeadlines(orgId, uid(userDetails))));
    }

    @GetMapping("/api/v1/dashboard/todays-focus")
    public ResponseEntity<ApiResponse<TodaysFocusResponse>> todaysFocus(
            @RequestParam String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Today's focus retrieved",
                dashboardService.getTodaysFocus(orgId, uid(userDetails))));
    }

    @GetMapping("/api/v1/dashboard/recent-activity")
    public ResponseEntity<ApiResponse<List<ProjectActivityResponse>>> recentActivity(
            @RequestParam String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Recent activity retrieved",
                dashboardService.getRecentActivity(orgId, uid(userDetails))));
    }

    @GetMapping("/api/v1/dashboard/project-progress")
    public ResponseEntity<ApiResponse<List<ProjectProgressResponse>>> projectProgress(
            @RequestParam String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Project progress retrieved",
                dashboardService.getProjectProgress(orgId, uid(userDetails))));
    }
}