package com.taskflow.backend.service;

import com.taskflow.backend.domain.ProjectMember;
import com.taskflow.backend.domain.Task;
import com.taskflow.backend.domain.TaskAttachment;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.attachment.AttachmentResponse;
import com.taskflow.backend.enums.ActivityType;
import com.taskflow.backend.enums.ProjectMemberRole;
import com.taskflow.backend.exception.ForbiddenException;
import com.taskflow.backend.exception.NotFoundException;
import com.taskflow.backend.repository.ProjectMemberRepository;
import com.taskflow.backend.repository.TaskAttachmentRepository;
import com.taskflow.backend.repository.TaskRepository;
import com.taskflow.backend.repository.UserRepository;
import com.taskflow.backend.service.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskAttachmentService {

    private final TaskAttachmentRepository taskAttachmentRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ProjectActivityService activityService;
    private final FileStorageService fileStorageService;

    @Value("${app.file.max-attachment-size-mb}")
    private long maxSizeMb;

    @Value("${app.file.allowed-extensions}")
    private String allowedExtensionsCsv;

    private static final Map<String, String> EXTENSION_TO_MIME = Map.ofEntries(
            Map.entry("pdf", "application/pdf"),
            Map.entry("doc", "application/msword"),
            Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            Map.entry("png", "image/png"),
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg"),
            Map.entry("txt", "text/plain"),
            Map.entry("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    );

    @Transactional
    public AttachmentResponse upload(String taskId, MultipartFile file, String userId) {
        Task task = findTask(taskId);
        ProjectMember member = requireProjectMember(task.getProjectId(), userId);

        if (member.getRole() == ProjectMemberRole.VIEWER) {
            throw new ForbiddenException("Viewers cannot upload attachments");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new RuntimeException("File name is missing");
        }

        String extension = extractExtension(originalFileName);
        validateExtension(extension);
        validateMimeType(extension, file.getContentType());
        validateSize(file.getSize());

        String storedFileName = UUID.randomUUID() + "." + extension;

        fileStorageService.store(file, taskId, storedFileName);

        TaskAttachment attachment = TaskAttachment.builder()
                .id(UUID.randomUUID().toString())
                .taskId(taskId)
                .uploadedBy(userId)
                .originalFileName(originalFileName)
                .storedFileName(storedFileName)
                .mimeType(file.getContentType())
                .fileSizeBytes(file.getSize())
                .build();

        TaskAttachment saved;
        try {
            saved = taskAttachmentRepository.save(attachment);
        } catch (RuntimeException e) {
            // DB save failed after disk write succeeded — clean up the orphan file
            fileStorageService.delete(taskId, storedFileName);
            throw e;
        }

        activityService.log(task.getProjectId(), taskId, userId, ActivityType.TASK_ATTACHMENT_UPLOADED,
                "Uploaded attachment \"" + originalFileName + "\" to task \"" + task.getTitle() + "\"");

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> list(String taskId, String userId) {
        Task task = findTask(taskId);
        requireProjectMember(task.getProjectId(), userId);

        return taskAttachmentRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskAttachment getForDownload(String taskId, String attachmentId, String userId) {
        Task task = findTask(taskId);
        requireProjectMember(task.getProjectId(), userId);
        return findAttachment(attachmentId, taskId);
    }

    public InputStream loadFileStream(TaskAttachment attachment) {
        return fileStorageService.load(attachment.getTaskId(), attachment.getStoredFileName());
    }

    @Transactional
    public void delete(String taskId, String attachmentId, String userId) {
        Task task = findTask(taskId);
        ProjectMember member = requireProjectMember(task.getProjectId(), userId);
        TaskAttachment attachment = findAttachment(attachmentId, taskId);

        boolean isUploader = attachment.getUploadedBy().equals(userId);
        boolean isModerator = member.getRole() == ProjectMemberRole.OWNER
                || member.getRole() == ProjectMemberRole.MANAGER;

        if (!isUploader && !isModerator) {
            throw new ForbiddenException("You cannot delete this attachment");
        }

        boolean fileDeleted = fileStorageService.delete(taskId, attachment.getStoredFileName());
        if (!fileDeleted) {
            log.error("Attachment file missing or could not be deleted on disk: taskId={}, storedFileName={}",
                    taskId, attachment.getStoredFileName());
            throw new RuntimeException("Could not delete the attachment file. Please try again.");
        }

        taskAttachmentRepository.delete(attachment);

        activityService.log(task.getProjectId(), taskId, userId, ActivityType.TASK_ATTACHMENT_DELETED,
                "Deleted attachment \"" + attachment.getOriginalFileName() + "\" from task \"" + task.getTitle() + "\"");
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private Task findTask(String taskId) {
        return taskRepository.findByIdAndDeletedFalse(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found"));
    }

    private TaskAttachment findAttachment(String attachmentId, String taskId) {
        return taskAttachmentRepository.findByIdAndTaskId(attachmentId, taskId)
                .orElseThrow(() -> new NotFoundException("Attachment not found"));
    }

    private ProjectMember requireProjectMember(String projectId, String userId) {
        return projectMemberRepository.findByProjectIdAndUserIdAndActiveTrue(projectId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this project"));
    }

    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex == -1 || dotIndex == fileName.length() - 1) {
            throw new RuntimeException("File must have a valid extension");
        }
        return fileName.substring(dotIndex + 1).toLowerCase();
    }

    private void validateExtension(String extension) {
        Set<String> allowed = Set.of(allowedExtensionsCsv.toLowerCase().split(","));
        if (!allowed.contains(extension)) {
            throw new RuntimeException("File type not allowed: ." + extension);
        }
    }

    private void validateMimeType(String extension, String declaredMimeType) {
        String expectedMime = EXTENSION_TO_MIME.get(extension);
        if (expectedMime == null || declaredMimeType == null || !declaredMimeType.equalsIgnoreCase(expectedMime)) {
            throw new RuntimeException("File content type does not match its extension");
        }
    }

    private void validateSize(long sizeBytes) {
        long maxBytes = maxSizeMb * 1024 * 1024;
        if (sizeBytes > maxBytes) {
            throw new RuntimeException("File exceeds maximum size of " + maxSizeMb + "MB");
        }
    }

    private AttachmentResponse toResponse(TaskAttachment a) {
        String uploaderName = userRepository.findById(a.getUploadedBy())
                .map(User::getName).orElse("Unknown");

        return AttachmentResponse.builder()
                .id(a.getId())
                .taskId(a.getTaskId())
                .uploadedBy(a.getUploadedBy())
                .uploaderName(uploaderName)
                .originalFileName(a.getOriginalFileName())
                .mimeType(a.getMimeType())
                .fileSizeBytes(a.getFileSizeBytes())
                .createdAt(a.getCreatedAt())
                .build();
    }
}