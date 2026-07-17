package com.taskflow.backend.repository;

import com.taskflow.backend.domain.ProjectActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectActivityRepository extends JpaRepository<ProjectActivity, String> {
    Page<ProjectActivity> findByProjectIdOrderByCreatedAtDesc(String projectId, Pageable pageable);

    Page<ProjectActivity> findByTaskIdOrderByCreatedAtDesc(String taskId, Pageable pageable);
}