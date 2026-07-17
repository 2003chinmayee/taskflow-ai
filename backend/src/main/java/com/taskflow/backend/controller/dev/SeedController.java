package com.taskflow.backend.controller.dev;

import com.taskflow.backend.domain.Project;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.dev.SeedSummaryResponse;
import com.taskflow.backend.enums.ProjectStatus;
import com.taskflow.backend.repository.ProjectRepository;
import com.taskflow.backend.service.dev.SeedDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * TEMPORARY — demo data seed endpoint for portfolio testing only.
 *
 * DELETE THIS FILE and SeedDataService.java before pushing to a public
 * GitHub repo or deploying to production. Not protected by role checks
 * beyond requiring a valid login, since it's meant to be removed
 * entirely rather than left running anywhere permanent.
 */
@RestController
@RequiredArgsConstructor
public class SeedController {

    private final SeedDataService seedDataService;
    private final ProjectRepository projectRepository;

    @PostMapping("/api/v1/dev/seed-portfolio-demo")
    public ResponseEntity<ApiResponse<SeedSummaryResponse>> seed() {
        return ResponseEntity.ok(ApiResponse.success("Seed complete", seedDataService.seed()));
    }

    // TEMPORARY — one-time fix for existing demo data so the dashboard
    // shows realistic non-zero stats. Delete this endpoint along with
    // the rest of this dev-only controller before going to production.
    @PostMapping("/api/v1/dev/fix-demo-project-statuses")
    public ResponseEntity<ApiResponse<String>> fixDemoProjectStatuses(@RequestParam String orgId) {
        Project launch = projectRepository.findByOrgIdAndNameAndDeletedFalse(orgId, "TaskFlow SaaS Launch")
                .orElseThrow(() -> new RuntimeException("TaskFlow SaaS Launch not found"));
        launch.setStatus(ProjectStatus.ACTIVE);
        projectRepository.save(launch);

        Project mobile = projectRepository.findByOrgIdAndNameAndDeletedFalse(orgId, "Mobile App Companion")
                .orElseThrow(() -> new RuntimeException("Mobile App Companion not found"));
        mobile.setStatus(ProjectStatus.ON_HOLD);
        projectRepository.save(mobile);

        return ResponseEntity.ok(ApiResponse.success("Project statuses updated", "Done"));
    }
}