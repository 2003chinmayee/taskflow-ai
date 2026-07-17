package com.taskflow.backend.repository;

import com.taskflow.backend.domain.OrgMember;
import com.taskflow.backend.enums.OrgRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface OrgMemberRepository extends JpaRepository<OrgMember, String> {

    Optional<OrgMember> findByOrgIdAndUserIdAndIsActiveTrue(String orgId, String userId);

    boolean existsByOrgIdAndUserIdAndIsActiveTrue(String orgId, String userId);
    List<OrgMember> findByOrgIdAndIsActiveTrue(String orgId);

    long countByOrgIdAndRoleAndIsActiveTrue(String orgId, OrgRole role);

    long countByOrgIdAndIsActiveTrue(String orgId);
}