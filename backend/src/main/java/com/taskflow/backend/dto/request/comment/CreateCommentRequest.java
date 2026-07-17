package com.taskflow.backend.dto.request.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateCommentRequest {

    @NotBlank(message = "Comment content cannot be empty")
    @Size(max = 5000, message = "Comment cannot exceed 5000 characters")
    private String content;

    private List<String> mentionedUserIds;
}