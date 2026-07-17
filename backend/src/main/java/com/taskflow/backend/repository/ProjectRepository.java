package com.taskflow.backend.repository;

import com.taskflow.backend.domain.Project;
import com.taskflow.backend.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, String> {

    // ── Full org access (ORG_ADMIN / PROJECT_MANAGER) ──────────────
    @Query("SELECT p FROM Project p WHERE p.orgId = :orgId AND p.deleted = false")
    Page<Project> findAllProjectsInOrg(@Param("orgId") String orgId, Pageable pageable);

    // ── Member-restricted access (MEMBER role) ──────────────────────
    @Query("SELECT p FROM Project p WHERE p.orgId = :orgId AND p.deleted = false " +
            "AND EXISTS (SELECT pm FROM ProjectMember pm WHERE pm.projectId = p.id AND pm.userId = :userId AND pm.active = true)")
    Page<Project> findMemberAccessibleProjects(@Param("orgId") String orgId,
                                               @Param("userId") String userId,
                                               Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.orgId = :orgId AND p.deleted = false AND p.pinned = true")
    List<Project> findAllPinnedProjectsInOrg(@Param("orgId") String orgId);

    @Query("SELECT p FROM Project p WHERE p.orgId = :orgId AND p.deleted = false " +
            "AND p.pinned = true " +
            "AND EXISTS (SELECT pm FROM ProjectMember pm WHERE pm.projectId = p.id AND pm.userId = :userId AND pm.active = true)")
    List<Project> findMemberPinnedProjects(@Param("orgId") String orgId, @Param("userId") String userId);

    @Query("SELECT p FROM Project p WHERE p.orgId = :orgId AND p.deleted = false " +
            "AND LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Project> searchProjects(@Param("orgId") String orgId,
                                 @Param("query") String query,
                                 Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.orgId = :orgId AND p.deleted = false " +
            "AND p.status = :status")
    Page<Project> findByStatus(@Param("orgId") String orgId,
                               @Param("status") ProjectStatus status,
                               Pageable pageable);

    Optional<Project> findByIdAndDeletedFalse(String id);

    boolean existsBySlugAndDeletedFalse(String slug);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.orgId = :orgId AND p.deleted = false AND p.status = :status")
    long countByOrgIdAndStatus(@Param("orgId") String orgId, @Param("status") ProjectStatus status);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.orgId = :orgId AND p.deleted = false")
    long countByOrgId(@Param("orgId") String orgId);

    @Query("SELECT p FROM Project p WHERE p.orgId = :orgId AND p.deleted = false " +
            "ORDER BY p.updatedAt DESC")
    List<Project> findAllRecentProjectsInOrg(@Param("orgId") String orgId, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.orgId = :orgId AND p.deleted = false " +
            "AND EXISTS (SELECT pm FROM ProjectMember pm WHERE pm.projectId = p.id AND pm.userId = :userId AND pm.active = true) " +
            "ORDER BY p.updatedAt DESC")
    List<Project> findMemberRecentProjects(@Param("orgId") String orgId, @Param("userId") String userId, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.orgId = :orgId AND p.deleted = false " +
            "AND p.status = 'ACTIVE' ORDER BY p.updatedAt DESC")
    List<Project> findAllActiveProjectsInOrg(@Param("orgId") String orgId);

    @Query("SELECT p FROM Project p WHERE p.orgId = :orgId AND p.deleted = false " +
            "AND p.status = 'ACTIVE' " +
            "AND EXISTS (SELECT pm FROM ProjectMember pm WHERE pm.projectId = p.id AND pm.userId = :userId AND pm.active = true) " +
            "ORDER BY p.updatedAt DESC")
    List<Project> findMemberActiveProjects(@Param("orgId") String orgId, @Param("userId") String userId);

    @Query("SELECT p.id FROM Project p WHERE p.orgId = :orgId AND p.deleted = false")
    List<String> findAllProjectIdsInOrg(@Param("orgId") String orgId);

    @Query("SELECT p.id FROM Project p WHERE p.orgId = :orgId AND p.deleted = false " +
            "AND EXISTS (SELECT pm FROM ProjectMember pm WHERE pm.projectId = p.id AND pm.userId = :userId AND pm.active = true)")
    List<String> findMemberAccessibleProjectIds(@Param("orgId") String orgId, @Param("userId") String userId);

    Optional<Project> findByOrgIdAndNameAndDeletedFalse(String orgId, String name);
}