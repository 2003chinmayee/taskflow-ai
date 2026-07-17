package com.taskflow.backend.controller;

import com.taskflow.backend.domain.TaskAttachment;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.attachment.AttachmentResponse;
import com.taskflow.backend.service.TaskAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class TaskAttachmentController {

    private final TaskAttachmentService taskAttachmentService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @PostMapping(value = "/api/v1/tasks/{taskId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttachmentResponse>> upload(
            @PathVariable String taskId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attachment uploaded",
                        taskAttachmentService.upload(taskId, file, uid(userDetails))));
    }

    @GetMapping("/api/v1/tasks/{taskId}/attachments")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> list(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Attachments retrieved",
                taskAttachmentService.list(taskId, uid(userDetails))));
    }

    @GetMapping("/api/v1/tasks/{taskId}/attachments/{attachmentId}/download")
    public ResponseEntity<InputStreamResource> download(
            @PathVariable String taskId,
            @PathVariable String attachmentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        TaskAttachment attachment = taskAttachmentService.getForDownload(taskId, attachmentId, uid(userDetails));
        InputStream fileStream = taskAttachmentService.loadFileStream(attachment);

        String safeFileName = sanitizeFileNameForHeader(attachment.getOriginalFileName());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeFileName + "\"")
                .header("X-Content-Type-Options", "nosniff")
                .contentType(MediaType.parseMediaType(attachment.getMimeType()))
                .contentLength(attachment.getFileSizeBytes())
                .body(new InputStreamResource(fileStream));
    }

    @DeleteMapping("/api/v1/tasks/{taskId}/attachments/{attachmentId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String taskId,
            @PathVariable String attachmentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        taskAttachmentService.delete(taskId, attachmentId, uid(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Attachment deleted"));
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private String sanitizeFileNameForHeader(String fileName) {
        // Strip CR/LF to prevent header injection, and strip quotes that
        // would break out of the Content-Disposition filename="..." value.
        String sanitized = fileName.replaceAll("[\\r\\n\"]", "");
        // Encode as ISO-8859-1-safe fallback; browsers handle UTF-8 in
        // filename via RFC 5987 but plain filename="" is safest baseline.
        return new String(sanitized.getBytes(StandardCharsets.UTF_8), StandardCharsets.ISO_8859_1);
    }
}