package com.taskflow.backend.service;

import com.taskflow.backend.domain.ProjectActivity;
import com.taskflow.backend.domain.ProjectMember;
import com.taskflow.backend.domain.Task;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.project.ProjectActivityResponse;
import com.taskflow.backend.enums.ActivityType;
import com.taskflow.backend.repository.ProjectActivityRepository;
import com.taskflow.backend.repository.ProjectMemberRepository;
import com.taskflow.backend.repository.TaskRepository;
import com.taskflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectActivityService {

    private final ProjectActivityRepository projectActivityRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Transactional
    public void log(String projectId, String userId, ActivityType type, String description) {
        log(projectId, null, userId, type, description);
    }

    @Transactional
    public void log(String projectId, String taskId, String userId, ActivityType type, String description) {
        ProjectActivity activity = ProjectActivity.builder()
                .id(UUID.randomUUID().toString())
                .projectId(projectId)
                .taskId(taskId)
                .userId(userId)
                .type(type)
                .description(description)
                .build();
        projectActivityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public List<ProjectActivityResponse> getProjectActivity(String projectId, int limit) {
        Page<ProjectActivity> page = projectActivityRepository
                .findByProjectIdOrderByCreatedAtDesc(projectId, PageRequest.of(0, limit));
        return page.getContent().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProjectActivityResponse> getTaskActivity(String taskId, String userId, int page, int size) {
        Task task = taskRepository.findByIdAndDeletedFalse(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // VIEWER is allowed to read — this only checks active membership, not role.
        projectMemberRepository.findByProjectIdAndUserIdAndActiveTrue(task.getProjectId(), userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));

        return projectActivityRepository
                .findByTaskIdOrderByCreatedAtDesc(taskId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    private ProjectActivityResponse toResponse(ProjectActivity a) {
        // Safe lookup: if the user was later removed from the project (or deleted),
        // userRepository.findById returns empty — we fall back to "Unknown" instead
        // of throwing, so historical activity always renders.
        String userName = userRepository.findById(a.getUserId())
                .map(User::getName)
                .orElse("Unknown user");

        return ProjectActivityResponse.builder()
                .id(a.getId())
                .projectId(a.getProjectId())
                .taskId(a.getTaskId())
                .userId(a.getUserId())
                .userName(userName)
                .type(a.getType())
                .description(a.getDescription())
                .createdAt(a.getCreatedAt())
                .build();
    }
}