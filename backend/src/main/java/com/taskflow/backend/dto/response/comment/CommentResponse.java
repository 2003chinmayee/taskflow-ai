package com.taskflow.backend.dto.response.comment;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class CommentResponse {

    private String id;
    private String taskId;
    private String authorId;
    private String authorName;
    private String content;
    private boolean edited;
    private boolean deleted;
    private List<String> mentionedUserIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}