package com.taskflow.backend.repository;

import com.taskflow.backend.domain.TaskAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, String> {

    List<TaskAttachment> findByTaskIdOrderByCreatedAtDesc(String taskId);

    Optional<TaskAttachment> findByIdAndTaskId(String id, String taskId);
}
