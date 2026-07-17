package com.taskflow.backend.service.dev;

import com.taskflow.backend.domain.Organization;
import com.taskflow.backend.domain.OrgMember;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.comment.CreateCommentRequest;
import com.taskflow.backend.dto.request.project.AddProjectMemberRequest;
import com.taskflow.backend.dto.request.project.CreateProjectRequest;
import com.taskflow.backend.dto.request.task.CreateTaskRequest;
import com.taskflow.backend.dto.response.dev.SeedSummaryResponse;
import com.taskflow.backend.dto.response.project.ProjectResponse;
import com.taskflow.backend.dto.response.task.TaskResponse;
import com.taskflow.backend.enums.OrgRole;
import com.taskflow.backend.enums.ProjectMemberRole;
import com.taskflow.backend.enums.ProjectVisibility;
import com.taskflow.backend.enums.TaskPriority;
import com.taskflow.backend.enums.TaskStatus;
import com.taskflow.backend.repository.OrgMemberRepository;
import com.taskflow.backend.repository.OrganizationRepository;
import com.taskflow.backend.repository.UserRepository;
import com.taskflow.backend.service.ProjectMemberService;
import com.taskflow.backend.service.ProjectService;
import com.taskflow.backend.service.TaskCommentService;
import com.taskflow.backend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * TEMPORARY demo-data seed service for portfolio testing only.
 *
 * DELETE THIS FILE (and SeedController.java) before pushing to a public
 * GitHub repo or deploying to production. Passwords below are demo-only
 * and intentionally hardcoded in this throwaway file — never commit them
 * to a permanent part of the codebase.
 *
 * Idempotency: if the owner account already exists, the whole seed is
 * treated as already run and this method does nothing further.
 */
@Service
@RequiredArgsConstructor
public class SeedDataService {

    private static final String OWNER_EMAIL = "chinmayee.owner@taskflow-demo.com";
    private static final String OWNER_PASSWORD = "Owner#TaskFlow2026!";
    private static final String SHARED_PASSWORD = "Demo#TaskFlow2026!";

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrgMemberRepository orgMemberRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ProjectService projectService;
    private final ProjectMemberService projectMemberService;
    private final TaskService taskService;
    private final TaskCommentService taskCommentService;

    @Transactional
    public SeedSummaryResponse seed() {
        List<String> created = new ArrayList<>();
        List<String> skipped = new ArrayList<>();

        if (userRepository.existsByEmail(OWNER_EMAIL)) {
            skipped.add("Demo data already exists (owner account found) — seed skipped entirely.");
            return SeedSummaryResponse.builder().created(created).skipped(skipped).build();
        }

        // ── Users ──────────────────────────────────────────────────
        Map<String, String> userIds = new HashMap<>();

        userIds.put("chinmayee", createUser("Chinmayee Patil", OWNER_EMAIL, OWNER_PASSWORD));
        created.add("User: Chinmayee Patil (owner)");

        String[][] people = {
                {"aarav", "Aarav Sharma", "aarav.sharma@taskflow-demo.com"},
                {"priya", "Priya Deshmukh", "priya.deshmukh@taskflow-demo.com"},
                {"rohan", "Rohan Kulkarni", "rohan.kulkarni@taskflow-demo.com"},
                {"sneha", "Sneha Joshi", "sneha.joshi@taskflow-demo.com"},
                {"aditya", "Aditya Patil", "aditya.patil@taskflow-demo.com"},
                {"kavya", "Kavya Nair", "kavya.nair@taskflow-demo.com"},
                {"rahul", "Rahul Mehta", "rahul.mehta@taskflow-demo.com"},
                {"neha", "Neha Singh", "neha.singh@taskflow-demo.com"},
                {"vikram", "Vikram Rao", "vikram.rao@taskflow-demo.com"},
        };
        for (String[] p : people) {
            userIds.put(p[0], createUser(p[1], p[2], SHARED_PASSWORD));
            created.add("User: " + p[1]);
        }

        // ── Organization ───────────────────────────────────────────
        Organization org = Organization.builder()
                .id(UUID.randomUUID().toString())
                .name("TaskFlow Product Studio")
                .description("Demo organization for portfolio testing")
                .slug("taskflow-product-studio")
                .createdBy(userIds.get("chinmayee"))
                .build();
        organizationRepository.save(org);
        created.add("Organization: TaskFlow Product Studio");

        addOrgMember(org.getId(), userIds.get("chinmayee"), OrgRole.ORG_ADMIN);
        addOrgMember(org.getId(), userIds.get("aarav"), OrgRole.MEMBER);
        addOrgMember(org.getId(), userIds.get("priya"), OrgRole.MEMBER);
        addOrgMember(org.getId(), userIds.get("rohan"), OrgRole.MEMBER);
        addOrgMember(org.getId(), userIds.get("sneha"), OrgRole.MEMBER);
        addOrgMember(org.getId(), userIds.get("aditya"), OrgRole.MEMBER);
        addOrgMember(org.getId(), userIds.get("kavya"), OrgRole.MEMBER);
        addOrgMember(org.getId(), userIds.get("rahul"), OrgRole.MEMBER);
        addOrgMember(org.getId(), userIds.get("neha"), OrgRole.GUEST);
        addOrgMember(org.getId(), userIds.get("vikram"), OrgRole.GUEST);
        created.add("Org memberships: 10 users added to TaskFlow Product Studio");

        // ── Project 1: TaskFlow SaaS Launch ─────────────────────────
        String project1Id = createProject(org.getId(), userIds.get("chinmayee"),
                "TaskFlow SaaS Launch",
                "Core SaaS platform launch: authentication, workspaces, task management, and AI assistant.");
        created.add("Project: TaskFlow SaaS Launch");

        addProjectMember(project1Id, userIds.get("chinmayee"), userIds.get("aarav"), ProjectMemberRole.MANAGER);
        addProjectMember(project1Id, userIds.get("chinmayee"), userIds.get("priya"), ProjectMemberRole.MEMBER);
        addProjectMember(project1Id, userIds.get("chinmayee"), userIds.get("rohan"), ProjectMemberRole.MEMBER);
        addProjectMember(project1Id, userIds.get("chinmayee"), userIds.get("sneha"), ProjectMemberRole.MEMBER);
        addProjectMember(project1Id, userIds.get("chinmayee"), userIds.get("kavya"), ProjectMemberRole.MEMBER);
        addProjectMember(project1Id, userIds.get("chinmayee"), userIds.get("neha"), ProjectMemberRole.VIEWER);
        created.add("Project 1 memberships added");

        seedProject1Tasks(project1Id, userIds, created);

        // ── Project 2: Mobile App Companion ─────────────────────────
        String project2Id = createProject(org.getId(), userIds.get("chinmayee"),
                "Mobile App Companion",
                "Native mobile companion app: authentication, offline sync, and push notifications.");
        created.add("Project: Mobile App Companion");

        addProjectMember(project2Id, userIds.get("chinmayee"), userIds.get("priya"), ProjectMemberRole.MANAGER);
        addProjectMember(project2Id, userIds.get("chinmayee"), userIds.get("aarav"), ProjectMemberRole.MEMBER);
        addProjectMember(project2Id, userIds.get("chinmayee"), userIds.get("sneha"), ProjectMemberRole.MEMBER);
        addProjectMember(project2Id, userIds.get("chinmayee"), userIds.get("aditya"), ProjectMemberRole.MEMBER);
        addProjectMember(project2Id, userIds.get("chinmayee"), userIds.get("rahul"), ProjectMemberRole.MEMBER);
        addProjectMember(project2Id, userIds.get("chinmayee"), userIds.get("vikram"), ProjectMemberRole.VIEWER);
        created.add("Project 2 memberships added");

        seedProject2Tasks(project2Id, userIds, created);

        return SeedSummaryResponse.builder().created(created).skipped(skipped).build();
    }

    // ─── Task seeding ──────────────────────────────────────────────

    private void seedProject1Tasks(String projectId, Map<String, String> u, List<String> created) {
        String t1 = createTask(projectId, u.get("aarav"),
                "Authentication and RBAC audit",
                "Review the JWT authentication flow end to end and confirm role-based access control is correctly enforced across all project and task endpoints. Check token expiry handling on the frontend and verify VIEWER restrictions cannot be bypassed via direct API calls.",
                TaskPriority.HIGH, TaskStatus.DONE, LocalDate.of(2026, 7, 3), u.get("aarav"));
        addComment(t1, u.get("aarav"), "Went through every endpoint — RBAC checks are consistent, VIEWER is correctly blocked everywhere including AI apply endpoints.");
        addComment(t1, u.get("chinmayee"), "Great work, this was our biggest security risk area. Closing this out.");
        created.add("Task: Authentication and RBAC audit");

        String t2 = createTask(projectId, u.get("priya"),
                "Organization onboarding workflow",
                "Design and implement the first-time onboarding flow for new organizations: invite teammates, set up the first project, and configure basic org settings. Should feel guided, not overwhelming, for a non-technical founder persona.",
                TaskPriority.MEDIUM, TaskStatus.IN_PROGRESS, LocalDate.of(2026, 7, 14), u.get("priya"));
        addComment(t2, u.get("priya"), "First draft of the onboarding steps is done, working on the invite-teammates screen now.");
        addComment(t2, u.get("rohan"), "Suggest adding a skip option — some users just want to explore first.");
        created.add("Task: Organization onboarding workflow");

        String t3 = createTask(projectId, u.get("rohan"),
                "Kanban workflow performance",
                "Investigate reported lag when dragging cards on boards with 50+ tasks. Profile the drag-and-drop re-render path and optimize position updates to avoid full board re-fetches on every drop.",
                TaskPriority.MEDIUM, TaskStatus.IN_REVIEW, LocalDate.of(2026, 7, 5), u.get("rohan"));
        addComment(t3, u.get("rohan"), "Found it — we were re-fetching the whole task list on every drag end. Switched to optimistic local reordering.");
        addComment(t3, u.get("sneha"), "Tested on a board with 80 tasks, feels much smoother now.");
        created.add("Task: Kanban workflow performance");

        String t4 = createTask(projectId, u.get("sneha"),
                "AI assistant quality testing",
                "Run structured test cases against the AI assistant covering project summaries, overdue detection, task suggestions, and permission boundaries. Document any hallucinated or inaccurate responses for follow-up.",
                TaskPriority.URGENT, TaskStatus.IN_PROGRESS, LocalDate.of(2026, 7, 9), u.get("sneha"));
        addComment(t4, u.get("sneha"), "Overdue detection and summaries are accurate so far. Testing the apply-suggestion flow next.");
        addComment(t4, u.get("kavya"), "Make sure to test it as a VIEWER too — confirm apply is blocked server-side, not just hidden.");
        created.add("Task: AI assistant quality testing");

        String t5 = createTask(projectId, u.get("kavya"),
                "Production deployment and release QA",
                "Prepare the production deployment checklist covering environment variables, database migrations, and rollback plan. Run a full regression pass across auth, tasks, comments, attachments, and AI features before the public launch.",
                TaskPriority.URGENT, TaskStatus.TODO, LocalDate.of(2026, 7, 16), u.get("kavya"));
        addComment(t5, u.get("kavya"), "Drafting the QA checklist now — will share for review by end of week.");
        addComment(t5, u.get("aarav"), "Let's also add a smoke test for the Gemini rate limiter before we go live.");
        created.add("Task: Production deployment and release QA");
    }

    private void seedProject2Tasks(String projectId, Map<String, String> u, List<String> created) {
        String t1 = createTask(projectId, u.get("aarav"),
                "Mobile login and session handling",
                "Implement secure login on the mobile app with refresh-token rotation and biometric unlock for returning sessions. Handle token expiry gracefully without forcing a full re-login on every app open.",
                TaskPriority.HIGH, TaskStatus.DONE, LocalDate.of(2026, 7, 1), u.get("aarav"));
        addComment(t1, u.get("aarav"), "Biometric unlock is working on both iOS and Android test devices.");
        addComment(t1, u.get("priya"), "Nice, this removes a big friction point from the original flow.");
        created.add("Task: Mobile login and session handling");

        String t2 = createTask(projectId, u.get("sneha"),
                "Dashboard API integration",
                "Wire the mobile dashboard screen to the existing backend dashboard endpoints — task counts, recent activity, and upcoming deadlines. Reuse the same DTOs as the web app where possible to avoid duplicate backend work.",
                TaskPriority.MEDIUM, TaskStatus.IN_PROGRESS, LocalDate.of(2026, 7, 12), u.get("sneha"));
        addComment(t2, u.get("sneha"), "Task counts and activity feed are wired up, working on the upcoming deadlines widget now.");
        addComment(t2, u.get("aditya"), "Let me know when it's ready — I'll help test on a low-end Android device for performance.");
        created.add("Task: Dashboard API integration");

        String t3 = createTask(projectId, u.get("aditya"),
                "Offline task sync",
                "Build local caching and a conflict-resolution strategy so users can view and update tasks while offline, syncing changes automatically once connectivity returns. Must handle the case where the same task was edited both offline and on the web.",
                TaskPriority.HIGH, TaskStatus.IN_REVIEW, LocalDate.of(2026, 7, 4), u.get("aditya"));
        addComment(t3, u.get("aditya"), "Basic offline caching works. Conflict resolution currently just takes the most recent edit — good enough for v1.");
        addComment(t3, u.get("rahul"), "Tested airplane mode for 10 minutes then reconnected — sync worked correctly.");
        created.add("Task: Offline task sync");

        String t4 = createTask(projectId, u.get("rahul"),
                "Push notification preferences",
                "Add a settings screen letting users control which events trigger push notifications (mentions, due-date reminders, assignment changes). Default to a sensible minimal set to avoid notification fatigue on first install.",
                TaskPriority.LOW, TaskStatus.TODO, LocalDate.of(2026, 7, 20), u.get("rahul"));
        addComment(t4, u.get("rahul"), "Drafting the settings UI — thinking three simple toggles instead of granular per-event controls.");
        addComment(t4, u.get("priya"), "Agreed, keep it simple for v1, we can expand later based on feedback.");
        created.add("Task: Push notification preferences");

        String t5 = createTask(projectId, u.get("priya"),
                "Release QA and Play Store preparation",
                "Complete final regression testing on physical devices, prepare Play Store listing assets (screenshots, description, privacy policy link), and submit for internal testing track before public release.",
                TaskPriority.URGENT, TaskStatus.TODO, LocalDate.of(2026, 7, 22), u.get("priya"));
        addComment(t5, u.get("priya"), "Screenshots are ready, still need final copy for the store description.");
        addComment(t5, u.get("aarav"), "I'll have the privacy policy link ready by tomorrow.");
        created.add("Task: Release QA and Play Store preparation");
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private String createUser(String name, String email, String plainPassword) {
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(plainPassword))
                .build();
        return userRepository.save(user).getId();
    }

    private void addOrgMember(String orgId, String userId, OrgRole role) {
        OrgMember member = OrgMember.builder()
                .id(UUID.randomUUID().toString())
                .orgId(orgId)
                .userId(userId)
                .role(role)
                .isActive(true)
                .joinedAt(LocalDateTime.now())
                .build();
        orgMemberRepository.save(member);
    }

    private String createProject(String orgId, String creatorUserId, String name, String description) {
        CreateProjectRequest request = new CreateProjectRequest();
        request.setName(name);
        request.setDescription(description);
        request.setVisibility(ProjectVisibility.PUBLIC);
        ProjectResponse response = projectService.createProject(orgId, request, creatorUserId);
        return response.getId();
    }

    private void addProjectMember(String projectId, String requesterId, String userId, ProjectMemberRole role) {
        AddProjectMemberRequest request = new AddProjectMemberRequest();
        request.setUserId(userId);
        request.setRole(role);
        projectMemberService.addMember(projectId, request, requesterId);
    }

    private String createTask(String projectId, String creatorUserId, String title, String description,
                              TaskPriority priority, TaskStatus status, LocalDate dueDate, String assigneeId) {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setPriority(priority);
        request.setStatus(status);
        request.setDueDate(dueDate);
        request.setAssigneeId(assigneeId);
        TaskResponse response = taskService.createTask(projectId, request, creatorUserId);
        return response.getId();
    }

    private void addComment(String taskId, String authorUserId, String content) {
        CreateCommentRequest request = new CreateCommentRequest();
        request.setContent(content);
        taskCommentService.createComment(taskId, request, authorUserId);
    }
}