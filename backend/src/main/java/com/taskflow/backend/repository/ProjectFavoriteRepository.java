package com.taskflow.backend.repository;

import com.taskflow.backend.domain.ProjectFavorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectFavoriteRepository extends JpaRepository<ProjectFavorite, String> {
    boolean existsByProjectIdAndUserId(String projectId, String userId);
    Optional<ProjectFavorite> findByProjectIdAndUserId(String projectId, String userId);
    List<ProjectFavorite> findByUserId(String userId);
    void deleteByProjectId(String projectId);

}