package com.taskflow.backend.service;

import com.taskflow.backend.domain.OrgInvitation;
import com.taskflow.backend.domain.OrgMember;
import com.taskflow.backend.domain.Organization;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.request.org.InviteMemberRequest;
import com.taskflow.backend.dto.response.org.OrgInvitationResponse;
import com.taskflow.backend.enums.OrgRole;
import com.taskflow.backend.exception.ConflictException;
import com.taskflow.backend.exception.ForbiddenException;
import com.taskflow.backend.repository.OrgInvitationRepository;
import com.taskflow.backend.repository.OrgMemberRepository;
import com.taskflow.backend.repository.OrganizationRepository;
import com.taskflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value; // ← NEW IMPORT
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationService {

    private final OrgInvitationRepository invitationRepository;
    private final OrgMemberRepository orgMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${app.frontend-url}") // ← NEW FIELD
    private String frontendUrl;

    @Transactional
    public String inviteMember(String orgId, InviteMemberRequest request, String invitedBy) {
        organizationRepository.findByIdAndIsDeletedFalse(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        validateAdminAccess(orgId, invitedBy);

        String normalizedEmail = request.getEmail().toLowerCase().trim();

        if (invitationRepository.existsByOrgIdAndInviteeEmailAndStatus(
                orgId, normalizedEmail, OrgInvitation.InvitationStatus.PENDING)) {
            throw new ConflictException("A pending invitation already exists for this email.");
        }

        String token = UUID.randomUUID().toString();

        OrgInvitation invitation = OrgInvitation.builder()
                .id(UUID.randomUUID().toString())
                .orgId(orgId)
                .inviteeEmail(normalizedEmail)
                .role(request.getRole() != null ? request.getRole() : OrgRole.MEMBER)
                .tokenHash(token)
                .inviterUserId(invitedBy)
                .personalMessage(request.getPersonalMessage())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        invitationRepository.save(invitation);

        Organization org = organizationRepository.findByIdAndIsDeletedFalse(orgId).orElse(null);
        String inviteLink = frontendUrl + "/invite/" + token;
        emailService.sendInvitationEmail(normalizedEmail, org != null ? org.getName() : "your organization", inviteLink);

        log.info("Invitation sent to {} for org {}", normalizedEmail, orgId);
        return token;
    }

    @Transactional
    public void acceptInvitation(String token, String userId) {
        OrgInvitation invitation = invitationRepository.findByTokenHash(token)
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invitation has expired");
        }

        if (invitation.getStatus() == OrgInvitation.InvitationStatus.REVOKED) {
            throw new ForbiddenException("This invitation has been revoked");
        }

        if (invitation.getStatus() == OrgInvitation.InvitationStatus.ACCEPTED) {
            throw new RuntimeException("Invitation already accepted");
        }

        User acceptingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!acceptingUser.getEmail().equalsIgnoreCase(invitation.getInviteeEmail())) {
            throw new ForbiddenException("This invitation was not issued to your account");
        }

        boolean alreadyMember = orgMemberRepository
                .existsByOrgIdAndUserIdAndIsActiveTrue(invitation.getOrgId(), userId);
        if (alreadyMember) {
            throw new RuntimeException("You are already a member");
        }

        OrgMember member = OrgMember.builder()
                .id(UUID.randomUUID().toString())
                .orgId(invitation.getOrgId())
                .userId(userId)
                .role(invitation.getRole())
                .isActive(true)
                .joinedAt(LocalDateTime.now())
                .build();

        orgMemberRepository.save(member);

        invitation.setStatus(OrgInvitation.InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        Organization org = organizationRepository.findByIdAndIsDeletedFalse(invitation.getOrgId()).orElse(null);
        if (org != null) {
            notificationService.notifyOrgInvitationAccepted(
                    invitation.getInviterUserId(), userId, org.getId(), org.getName());
        }

        log.info("Invitation accepted by user {} for org {}",
                userId, invitation.getOrgId());
    }


    @Transactional
    public void revokeInvitation(String orgId, String invitationId,
                                 String requestingUserId) {
        validateAdminAccess(orgId, requestingUserId);

        OrgInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!invitation.getOrgId().equals(orgId)) {
            throw new RuntimeException("Invitation does not belong to this organization");
        }

        invitation.setStatus(OrgInvitation.InvitationStatus.REVOKED);
        invitationRepository.save(invitation);
        log.info("Invitation {} revoked by {}", invitationId, requestingUserId);
    }

    private void validateAdminAccess(String orgId, String userId) {
        OrgMember member = orgMemberRepository
                .findByOrgIdAndUserIdAndIsActiveTrue(orgId, userId)
                .orElseThrow(() -> new ForbiddenException("Access denied"));
        if (member.getRole() != OrgRole.ORG_ADMIN) {
            throw new ForbiddenException("Admin access required");
        }
    }

    @Transactional(readOnly = true)
    public List<OrgInvitationResponse> listPendingInvitations(String orgId, String requestingUserId) {
        validateAdminAccess(orgId, requestingUserId);
        LocalDateTime now = LocalDateTime.now();

        return invitationRepository
                .findByOrgIdAndStatusOrderByCreatedAtDesc(orgId, OrgInvitation.InvitationStatus.PENDING)
                .stream()
                .filter(inv -> inv.getExpiresAt().isAfter(now))
                .map(inv -> toResponse(inv, "PENDING"))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrgInvitationResponse> listInvitationHistory(String orgId, String requestingUserId) {
        validateAdminAccess(orgId, requestingUserId);
        LocalDateTime now = LocalDateTime.now();

        return invitationRepository.findByOrgIdOrderByCreatedAtDesc(orgId).stream()
                .filter(inv -> inv.getStatus() != OrgInvitation.InvitationStatus.PENDING
                        || inv.getExpiresAt().isBefore(now))
                .map(inv -> {
                    String computedStatus = inv.getStatus().name();
                    if (inv.getStatus() == OrgInvitation.InvitationStatus.PENDING
                            && inv.getExpiresAt().isBefore(now)) {
                        computedStatus = "EXPIRED";
                    }
                    return toResponse(inv, computedStatus);
                })
                .toList();
    }

    private OrgInvitationResponse toResponse(OrgInvitation inv, String status) {
        User inviter = userRepository.findById(inv.getInviterUserId()).orElse(null);
        return OrgInvitationResponse.builder()
                .id(inv.getId())
                .inviteeEmail(inv.getInviteeEmail())
                .role(inv.getRole())
                .invitedByName(inviter != null ? inviter.getName() : "Unknown")
                .status(status)
                .createdAt(inv.getCreatedAt())
                .expiresAt(inv.getExpiresAt())
                .acceptedAt(inv.getAcceptedAt())
                .build();
    }

    @Transactional
    public String resendInvitation(String orgId, String invitationId, String requestingUserId) {
        validateAdminAccess(orgId, requestingUserId);

        OrgInvitation old = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!old.getOrgId().equals(orgId)) {
            throw new RuntimeException("Invitation does not belong to this organization");
        }
        if (old.getStatus() == OrgInvitation.InvitationStatus.ACCEPTED) {
            throw new RuntimeException("Invitation already accepted");
        }
        if (old.getStatus() == OrgInvitation.InvitationStatus.REVOKED) {
            throw new RuntimeException("Invitation was already cancelled");
        }

        // Atomically replace: revoke the old row, then create exactly
        // one new pending invitation. Both happen in this @Transactional
        // method so partial writes never persist.
        old.setStatus(OrgInvitation.InvitationStatus.REVOKED);
        invitationRepository.save(old);

        String newToken = UUID.randomUUID().toString();
        OrgInvitation fresh = OrgInvitation.builder()
                .id(UUID.randomUUID().toString())
                .orgId(orgId)
                .inviteeEmail(old.getInviteeEmail())
                .role(old.getRole())
                .tokenHash(newToken)
                .inviterUserId(requestingUserId)
                .personalMessage(old.getPersonalMessage())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        invitationRepository.save(fresh);

        Organization org = organizationRepository.findByIdAndIsDeletedFalse(orgId).orElse(null);
        String inviteLink = frontendUrl + "/invite/" + newToken;
        emailService.sendInvitationEmail(old.getInviteeEmail(), org != null ? org.getName() : "your organization", inviteLink);

        log.info("Invitation resent to {} for org {}", old.getInviteeEmail(), orgId);
        return newToken;

    }
}