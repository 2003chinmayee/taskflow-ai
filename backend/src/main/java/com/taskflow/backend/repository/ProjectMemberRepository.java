package com.taskflow.backend.repository;

import com.taskflow.backend.domain.ProjectMember;
import com.taskflow.backend.enums.ProjectMemberRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, String> {
    Optional<ProjectMember> findByProjectIdAndUserIdAndActiveTrue(String projectId, String userId);
    boolean existsByProjectIdAndUserIdAndActiveTrue(String projectId, String userId);
    List<ProjectMember> findByProjectIdAndActiveTrue(String projectId);
    long countByProjectIdAndActiveTrue(String projectId);
    long countByProjectIdAndRoleAndActiveTrue(String projectId, ProjectMemberRole role);
    List<ProjectMember> findByUserIdAndActiveTrue(String userId);
    void deleteByProjectIdAndUserId(String projectId, String userId);
}
