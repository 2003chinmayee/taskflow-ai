package com.taskflow.backend.repository;

import com.taskflow.backend.domain.ProjectSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectSettingsRepository extends JpaRepository<ProjectSettings, String> {
    Optional<ProjectSettings> findByProjectId(String projectId);
}