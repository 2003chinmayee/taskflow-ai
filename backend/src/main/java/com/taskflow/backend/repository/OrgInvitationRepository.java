package com.taskflow.backend.repository;

import com.taskflow.backend.domain.OrgInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrgInvitationRepository extends JpaRepository<OrgInvitation, String> {

    Optional<OrgInvitation> findByTokenHash(String tokenHash);

    boolean existsByOrgIdAndInviteeEmailAndStatus(
            String orgId, String email, OrgInvitation.InvitationStatus status);

    Optional<OrgInvitation> findByOrgIdAndInviteeEmailAndStatus(
            String orgId, String email, OrgInvitation.InvitationStatus status);

    List<OrgInvitation> findByOrgIdOrderByCreatedAtDesc(String orgId);

    List<OrgInvitation> findByOrgIdAndStatusOrderByCreatedAtDesc(
            String orgId, OrgInvitation.InvitationStatus status);
}