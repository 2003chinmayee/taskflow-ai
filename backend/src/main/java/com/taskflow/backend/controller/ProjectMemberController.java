package com.taskflow.backend.controller;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.project.AddProjectMemberRequest;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.project.ProjectMemberResponse;
import com.taskflow.backend.service.ProjectMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.taskflow.backend.dto.request.project.UpdateProjectMemberRoleRequest;
import com.taskflow.backend.dto.response.project.AvailableMemberResponse;


import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;
    private final com.taskflow.backend.service.ProjectActivityService projectActivityService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @GetMapping("/api/v1/projects/{projectId}/activity")
    public ResponseEntity<ApiResponse<List<com.taskflow.backend.dto.response.project.ProjectActivityResponse>>> activity(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Activity retrieved",
                projectActivityService.getProjectActivity(projectId, 5)));
    }

    @GetMapping("/api/v1/projects/{projectId}/members")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponse>>> list(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Members retrieved",
                projectMemberService.getProjectMembers(projectId, uid(userDetails))));
    }


    @GetMapping("/api/v1/projects/{projectId}/available-members")
    public ResponseEntity<ApiResponse<List<AvailableMemberResponse>>> availableMembers(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Available members retrieved",
                projectMemberService.getAvailableMembers(projectId, uid(userDetails))));
    }

    @PatchMapping("/api/v1/projects/{projectId}/members/{userId}/role")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> updateRole(
            @PathVariable String projectId,
            @PathVariable String userId,
            @Valid @RequestBody UpdateProjectMemberRoleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Role updated",
                projectMemberService.updateMemberRole(projectId, userId, request, uid(userDetails))));
    }

    @PostMapping("/api/v1/projects/{projectId}/members")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> add(
            @PathVariable String projectId,
            @Valid @RequestBody AddProjectMemberRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Member added",
                        projectMemberService.addMember(projectId, request, uid(userDetails))));
    }

    @DeleteMapping("/api/v1/projects/{projectId}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable String projectId,
            @PathVariable String userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        projectMemberService.removeMember(projectId, userId, uid(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Member removed"));
    }
}