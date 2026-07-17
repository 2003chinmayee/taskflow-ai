package com.taskflow.backend.controller;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.project.CreateProjectRequest;
import com.taskflow.backend.dto.request.project.UpdateProjectRequest;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.project.*;
import com.taskflow.backend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    // ─── Create Project ────────────────────────────────────────────
    @PostMapping("/api/v1/organizations/{orgId}/projects")
    public ResponseEntity<ApiResponse<ProjectResponse>> create(
            @PathVariable String orgId,
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ProjectResponse project = projectService.createProject(orgId, request, uid(userDetails));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created", project));
    }

    // ─── List Projects ─────────────────────────────────────────────
    @GetMapping("/api/v1/organizations/{orgId}/projects")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> list(
            @PathVariable String orgId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "updatedAt") String sort,
            @AuthenticationPrincipal UserDetails userDetails) {
        Page<ProjectResponse> projects = projectService.getProjects(orgId, uid(userDetails), page, size, sort);
        return ResponseEntity.ok(ApiResponse.success("Projects retrieved", projects));
    }

    // ─── Get Project ───────────────────────────────────────────────
    @GetMapping("/api/v1/projects/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> get(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Project retrieved",
                projectService.getProject(projectId, uid(userDetails))));
    }

    // ─── Update Project ────────────────────────────────────────────
    @PatchMapping("/api/v1/projects/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> update(
            @PathVariable String projectId,
            @Valid @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Project updated",
                projectService.updateProject(projectId, request, uid(userDetails))));
    }

    // ─── Delete Project ────────────────────────────────────────────
    @DeleteMapping("/api/v1/projects/{projectId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        projectService.deleteProject(projectId, uid(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Project deleted"));
    }

    // ─── Archive / Restore ─────────────────────────────────────────
    @PostMapping("/api/v1/projects/{projectId}/archive")
    public ResponseEntity<ApiResponse<ProjectResponse>> archive(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Project archived",
                projectService.archiveProject(projectId, uid(userDetails))));
    }

    @PostMapping("/api/v1/projects/{projectId}/restore")
    public ResponseEntity<ApiResponse<ProjectResponse>> restore(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Project restored",
                projectService.restoreProject(projectId, uid(userDetails))));
    }

    // ─── Favorite ──────────────────────────────────────────────────
    @PostMapping("/api/v1/projects/{projectId}/favorite")
    public ResponseEntity<ApiResponse<Boolean>> favorite(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean isFav = projectService.toggleFavorite(projectId, uid(userDetails));
        return ResponseEntity.ok(ApiResponse.success(isFav ? "Added to favorites" : "Removed from favorites", isFav));
    }

    // ─── Duplicate ─────────────────────────────────────────────────
    @PostMapping("/api/v1/projects/{projectId}/duplicate")
    public ResponseEntity<ApiResponse<ProjectResponse>> duplicate(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Project duplicated",
                projectService.duplicateProject(projectId, uid(userDetails))));
    }

    // ─── Search ────────────────────────────────────────────────────
    @GetMapping("/api/v1/organizations/{orgId}/projects/search")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> search(
            @PathVariable String orgId,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Search results",
                projectService.searchProjects(orgId, query, uid(userDetails), page, size)));
    }

    // ─── Pinned / Recent / Favorites ───────────────────────────────
    @GetMapping("/api/v1/organizations/{orgId}/projects/pinned")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> pinned(
            @PathVariable String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Pinned projects",
                projectService.getPinnedProjects(orgId, uid(userDetails))));
    }

    @GetMapping("/api/v1/organizations/{orgId}/projects/recent")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> recent(
            @PathVariable String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Recent projects",
                projectService.getRecentProjects(orgId, uid(userDetails))));
    }

    @GetMapping("/api/v1/projects/favorites")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> favorites(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Favorite projects",
                projectService.getFavoriteProjects(uid(userDetails))));
    }

    // ─── Stats ─────────────────────────────────────────────────────
    @GetMapping("/api/v1/organizations/{orgId}/projects/stats")
    public ResponseEntity<ApiResponse<ProjectStatsResponse>> stats(
            @PathVariable String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Project stats",
                projectService.getStats(orgId, uid(userDetails))));
    }



    // ─── Transfer Ownership ────────────────────────────────────────
    @PostMapping("/api/v1/projects/{projectId}/transfer")
    public ResponseEntity<ApiResponse<Void>> transfer(
            @PathVariable String projectId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        projectService.transferOwnership(projectId, body.get("newOwnerId"), uid(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Ownership transferred"));
    }
}