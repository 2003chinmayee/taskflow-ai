package com.taskflow.backend.service;

import com.taskflow.backend.domain.*;
import com.taskflow.backend.dto.request.project.CreateProjectRequest;
import com.taskflow.backend.dto.request.project.UpdateProjectRequest;
import com.taskflow.backend.dto.response.project.*;
import com.taskflow.backend.enums.*;
import com.taskflow.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectSettingsRepository projectSettingsRepository;
    private final ProjectFavoriteRepository projectFavoriteRepository;
    private final ProjectActivityService activityService;
    private final UserRepository userRepository;
    private final OrgMemberRepository orgMemberRepository;

    // ── Org-wide access check (ORG_ADMIN / PROJECT_MANAGER) ─────────
    private boolean canAccessAllProjects(String orgId, String userId) {
        return orgMemberRepository.findByOrgIdAndUserIdAndIsActiveTrue(orgId, userId)
                .map(m -> m.getRole() == com.taskflow.backend.enums.OrgRole.ORG_ADMIN
                        || m.getRole() == com.taskflow.backend.enums.OrgRole.PROJECT_MANAGER)
                .orElse(false);
    }

    @Transactional
    public ProjectResponse createProject(String orgId, CreateProjectRequest request, String userId) {
        String slug = generateSlug(request.getName(), orgId);

        Project project = Project.builder()
                .id(UUID.randomUUID().toString())
                .orgId(orgId)
                .name(request.getName().trim())
                .description(request.getDescription())
                .slug(slug)
                .color(request.getColor() != null ? request.getColor() : "#6366f1")
                .iconUrl(request.getIconUrl())
                .visibility(request.getVisibility() != null ? request.getVisibility() : ProjectVisibility.PUBLIC)
                .startDate(request.getStartDate())
                .dueDate(request.getDueDate())
                .createdBy(userId)
                .ownedBy(userId)
                .template(request.isTemplate())
                .build();

        Project saved = projectRepository.save(project);

        // Creator becomes OWNER
        ProjectMember owner = ProjectMember.builder()
                .id(UUID.randomUUID().toString())
                .projectId(saved.getId())
                .userId(userId)
                .role(ProjectMemberRole.OWNER)
                .addedBy(userId)
                .build();
        projectMemberRepository.save(owner);

        // Create default settings
        ProjectSettings settings = ProjectSettings.builder()
                .id(UUID.randomUUID().toString())
                .projectId(saved.getId())
                .build();
        projectSettingsRepository.save(settings);

        activityService.log(saved.getId(), userId, ActivityType.PROJECT_CREATED,
                "Project \"" + saved.getName() + "\" was created");

        log.info("Project created: {} in org: {} by user: {}", saved.getName(), orgId, userId);
        return toResponse(saved, userId);
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getProjects(String orgId, String userId, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sort));
        Page<Project> projects = canAccessAllProjects(orgId, userId)
                ? projectRepository.findAllProjectsInOrg(orgId, pageable)
                : projectRepository.findMemberAccessibleProjects(orgId, userId, pageable);
        return projects.map(p -> toResponse(p, userId));
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(String projectId, String userId) {
        Project project = findProject(projectId);
        validateAccess(projectId, userId, project);
        return toResponse(project, userId);
    }

    @Transactional
    public ProjectResponse updateProject(String projectId, UpdateProjectRequest request, String userId) {
        Project project = findProject(projectId);
        validateManagerAccess(projectId, userId);

        if (request.getName() != null) project.setName(request.getName().trim());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getColor() != null) project.setColor(request.getColor());
        if (request.getIconUrl() != null) project.setIconUrl(request.getIconUrl());
        if (request.getCoverUrl() != null) project.setCoverUrl(request.getCoverUrl());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getVisibility() != null) project.setVisibility(request.getVisibility());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getDueDate() != null) project.setDueDate(request.getDueDate());
        if (request.getPinned() != null) project.setPinned(request.getPinned());

        Project updated = projectRepository.save(project);
        activityService.log(projectId, userId, ActivityType.PROJECT_UPDATED,
                "Project settings were updated");
        return toResponse(updated, userId);
    }

    @Transactional
    public void deleteProject(String projectId, String userId) {
        Project project = findProject(projectId);
        if (!project.getOwnedBy().equals(userId))
            throw new RuntimeException("Only project owner can delete this project");

        project.setDeleted(true);
        project.setDeletedAt(LocalDateTime.now());
        project.setDeletedBy(userId);
        projectRepository.save(project);
        projectFavoriteRepository.deleteByProjectId(projectId);
        activityService.log(projectId, userId, ActivityType.PROJECT_DELETED, "Project was deleted");

    }

    @Transactional
    public ProjectResponse archiveProject(String projectId, String userId) {
        Project project = findProject(projectId);
        validateManagerAccess(projectId, userId);

        project.setStatus(ProjectStatus.ARCHIVED);
        project.setArchivedAt(LocalDateTime.now());
        project.setArchivedBy(userId);
        Project saved = projectRepository.save(project);
        activityService.log(projectId, userId, ActivityType.PROJECT_ARCHIVED, "Project was archived");
        return toResponse(saved, userId);
    }

    @Transactional
    public ProjectResponse restoreProject(String projectId, String userId) {
        Project project = findProject(projectId);
        validateManagerAccess(projectId, userId);

        project.setStatus(ProjectStatus.ACTIVE);
        project.setArchivedAt(null);
        project.setArchivedBy(null);
        Project saved = projectRepository.save(project);
        activityService.log(projectId, userId, ActivityType.PROJECT_RESTORED, "Project was restored");
        return toResponse(saved, userId);
    }

    @Transactional
    public boolean toggleFavorite(String projectId, String userId) {
        findProject(projectId);
        Optional<ProjectFavorite> existing = projectFavoriteRepository.findByProjectIdAndUserId(projectId, userId);

        if (existing.isPresent()) {
            projectFavoriteRepository.delete(existing.get());
            activityService.log(projectId, userId, ActivityType.PROJECT_UNFAVORITED, "Project removed from favorites");
            return false;
        } else {
            ProjectFavorite fav = ProjectFavorite.builder()
                    .id(UUID.randomUUID().toString())
                    .projectId(projectId)
                    .userId(userId)
                    .build();
            projectFavoriteRepository.save(fav);
            activityService.log(projectId, userId, ActivityType.PROJECT_FAVORITED, "Project added to favorites");
            return true;
        }
    }

    @Transactional
    public ProjectResponse duplicateProject(String projectId, String userId) {
        Project original = findProject(projectId);
        validateAccess(projectId, userId, original);

        String newName = original.getName() + " (Copy)";
        String newSlug = generateSlug(newName, original.getOrgId());

        Project copy = Project.builder()
                .id(UUID.randomUUID().toString())
                .orgId(original.getOrgId())
                .name(newName)
                .description(original.getDescription())
                .slug(newSlug)
                .color(original.getColor())
                .iconUrl(original.getIconUrl())
                .visibility(original.getVisibility())
                .createdBy(userId)
                .ownedBy(userId)
                .build();

        Project saved = projectRepository.save(copy);

        ProjectMember owner = ProjectMember.builder()
                .id(UUID.randomUUID().toString())
                .projectId(saved.getId())
                .userId(userId)
                .role(ProjectMemberRole.OWNER)
                .addedBy(userId)
                .build();
        projectMemberRepository.save(owner);

        ProjectSettings settings = ProjectSettings.builder()
                .id(UUID.randomUUID().toString())
                .projectId(saved.getId())
                .build();
        projectSettingsRepository.save(settings);

        activityService.log(saved.getId(), userId, ActivityType.PROJECT_DUPLICATED,
                "Project duplicated from \"" + original.getName() + "\"");
        return toResponse(saved, userId);
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> searchProjects(String orgId, String query, String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return projectRepository.searchProjects(orgId, query, pageable)
                .map(p -> toResponse(p, userId));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getPinnedProjects(String orgId, String userId) {
        List<Project> projects = canAccessAllProjects(orgId, userId)
                ? projectRepository.findAllPinnedProjectsInOrg(orgId)
                : projectRepository.findMemberPinnedProjects(orgId, userId);
        return projects.stream().map(p -> toResponse(p, userId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getRecentProjects(String orgId, String userId) {
        Pageable pageable = PageRequest.of(0, 5);
        List<Project> projects = canAccessAllProjects(orgId, userId)
                ? projectRepository.findAllRecentProjectsInOrg(orgId, pageable)
                : projectRepository.findMemberRecentProjects(orgId, userId, pageable);
        return projects.stream().map(p -> toResponse(p, userId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getFavoriteProjects(String userId) {
        return projectFavoriteRepository.findByUserId(userId).stream()
                .map(fav -> projectRepository.findByIdAndDeletedFalse(fav.getProjectId())
                        .map(p -> toResponse(p, userId)).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectStatsResponse getStats(String orgId, String userId) {
        List<Project> accessible = canAccessAllProjects(orgId, userId)
                ? projectRepository.findAllProjectsInOrg(orgId, Pageable.unpaged()).getContent()
                : projectRepository.findMemberAccessibleProjects(orgId, userId, Pageable.unpaged()).getContent();

        long total = accessible.size();
        long active = accessible.stream().filter(p -> p.getStatus() == ProjectStatus.ACTIVE).count();
        long completed = accessible.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count();
        long onHold = accessible.stream().filter(p -> p.getStatus() == ProjectStatus.ON_HOLD).count();
        long archived = accessible.stream().filter(p -> p.getStatus() == ProjectStatus.ARCHIVED).count();
        long favorites = projectFavoriteRepository.findByUserId(userId).stream()
                .filter(fav -> projectRepository.findByIdAndDeletedFalse(fav.getProjectId()).isPresent())
                .count();

        return ProjectStatsResponse.builder()
                .totalProjects((int) total)
                .activeProjects((int) active)
                .completedProjects((int) completed)
                .onHoldProjects((int) onHold)
                .archivedProjects((int) archived)
                .favoriteProjects((int) favorites)
                .averageCompletion(0.0)
                .build();
    }

    @Transactional
    public void transferOwnership(String projectId, String newOwnerId, String requestingUserId) {
        Project project = findProject(projectId);
        if (!project.getOwnedBy().equals(requestingUserId))
            throw new RuntimeException("Only current owner can transfer ownership");

        // Update old owner role to MANAGER
        projectMemberRepository.findByProjectIdAndUserIdAndActiveTrue(projectId, requestingUserId)
                .ifPresent(m -> { m.setRole(ProjectMemberRole.MANAGER); projectMemberRepository.save(m); });

        // New owner must already be a member
        ProjectMember newOwner = projectMemberRepository
                .findByProjectIdAndUserIdAndActiveTrue(projectId, newOwnerId)
                .orElseThrow(() -> new RuntimeException("New owner must be a project member"));
        newOwner.setRole(ProjectMemberRole.OWNER);
        projectMemberRepository.save(newOwner);

        project.setOwnedBy(newOwnerId);
        projectRepository.save(project);
        activityService.log(projectId, requestingUserId, ActivityType.OWNERSHIP_TRANSFERRED,
                "Project ownership transferred");
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> getMembers(String projectId, String userId) {
        validateAccess(projectId, userId, findProject(projectId));
        return projectMemberRepository.findByProjectIdAndActiveTrue(projectId).stream()
                .map(pm -> {
                    User user = userRepository.findById(pm.getUserId()).orElse(null);
                    return ProjectMemberResponse.builder()
                            .id(pm.getId())
                            .userId(pm.getUserId())
                            .name(user != null ? user.getName() : "Unknown")
                            .email(user != null ? user.getEmail() : "")
                            .role(pm.getRole())
                            .joinedAt(pm.getJoinedAt())
                            .build();
                }).collect(Collectors.toList());
    }

    // ─── Helpers ───────────────────────────────────────────────────

    private Project findProject(String projectId) {
        return projectRepository.findByIdAndDeletedFalse(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private void validateAccess(String projectId, String userId, Project project) {
        if (canAccessAllProjects(project.getOrgId(), userId)) return;
        if (project.getOwnedBy().equals(userId)) return;
        if (project.getCreatedBy().equals(userId)) return;
        if (projectMemberRepository.existsByProjectIdAndUserIdAndActiveTrue(projectId, userId)) return;
        throw new RuntimeException("Access denied to this project");
    }

    private void validateManagerAccess(String projectId, String userId) {
        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserIdAndActiveTrue(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        if (member.getRole() == ProjectMemberRole.VIEWER || member.getRole() == ProjectMemberRole.MEMBER)
            throw new RuntimeException("Manager or Owner access required");
    }

    private ProjectResponse toResponse(Project p, String userId) {
        boolean isFav = projectFavoriteRepository.existsByProjectIdAndUserId(p.getId(), userId);
        int completed = p.getCompletedTaskCount();
        int total = p.getTaskCount();
        double pct = total > 0 ? (completed * 100.0 / total) : 0.0;

        return ProjectResponse.builder()
                .id(p.getId())
                .orgId(p.getOrgId())
                .name(p.getName())
                .description(p.getDescription())
                .slug(p.getSlug())
                .color(p.getColor())
                .iconUrl(p.getIconUrl())
                .coverUrl(p.getCoverUrl())
                .status(p.getStatus().name())
                .visibility(p.getVisibility().name())
                .startDate(p.getStartDate())
                .dueDate(p.getDueDate())
                .createdBy(p.getCreatedBy())
                .ownedBy(p.getOwnedBy())
                .pinned(p.isPinned())
                .favorite(isFav)
                .template(p.isTemplate())
                .memberCount(p.getMemberCount())
                .taskCount(p.getTaskCount())
                .completedTaskCount(p.getCompletedTaskCount())
                .completionPercentage(pct)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private String generateSlug(String name, String orgId) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("")
                .toLowerCase().replaceAll("[^a-z0-9\\s-]", "")
                .trim().replaceAll("\\s+", "-");
        String base = slug;
        int counter = 1;
        while (projectRepository.existsBySlugAndDeletedFalse(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }
}