package com.taskflow.backend.repository;

import com.taskflow.backend.domain.TaskComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TaskCommentRepository extends JpaRepository<TaskComment, String> {

    Page<TaskComment> findByTaskIdOrderByCreatedAtDesc(String taskId, Pageable pageable);

    Optional<TaskComment> findByIdAndTaskId(String id, String taskId);
}