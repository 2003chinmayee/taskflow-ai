package com.taskflow.backend.dto.response.attachment;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AttachmentResponse {

    private String id;
    private String taskId;
    private String uploadedBy;
    private String uploaderName;
    private String originalFileName;
    private String mimeType;
    private long fileSizeBytes;
    private LocalDateTime createdAt;
}