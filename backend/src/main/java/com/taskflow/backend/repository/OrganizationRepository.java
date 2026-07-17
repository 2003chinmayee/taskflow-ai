package com.taskflow.backend.repository;

import com.taskflow.backend.domain.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, String> {

    // Find all orgs that a user belongs to (via org_members join)
    @Query("""
        SELECT o FROM Organization o
        INNER JOIN OrgMember om ON om.orgId = o.id
        WHERE om.userId = :userId
        AND om.isActive = true
        AND o.isDeleted = false
        ORDER BY o.createdAt ASC
        """)
    List<Organization> findAllByUserId(@Param("userId") String userId);

    Optional<Organization> findByIdAndIsDeletedFalse(String id);

    boolean existsBySlug(String slug);

    Optional<Organization> findBySlugAndIsDeletedFalse(String slug);
}