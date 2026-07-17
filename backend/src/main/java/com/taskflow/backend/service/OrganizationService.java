package com.taskflow.backend.service;

import com.taskflow.backend.domain.OrgMember;
import com.taskflow.backend.domain.Organization;
import com.taskflow.backend.dto.request.org.CreateOrgRequest;
import com.taskflow.backend.dto.request.org.UpdateOrgRequest;
import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.org.OrgMemberResponse;
import com.taskflow.backend.dto.response.org.OrgResponse;
import com.taskflow.backend.enums.OrgRole;
import com.taskflow.backend.exception.ForbiddenException;
import com.taskflow.backend.repository.OrgMemberRepository;
import com.taskflow.backend.repository.OrganizationRepository;
import com.taskflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrgMemberRepository orgMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrgResponse createOrganization(CreateOrgRequest request, String userId) {
        String slug = generateSlug(request.getName());
        Organization org = Organization.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName().trim())
                .description(request.getDescription())
                .slug(slug)
                .createdBy(userId)
                .build();
        Organization saved = organizationRepository.save(org);
        OrgMember creatorMember = OrgMember.builder()
                .id(UUID.randomUUID().toString())
                .orgId(saved.getId())
                .userId(userId)
                .role(OrgRole.ORG_ADMIN)
                .isActive(true)
                .joinedAt(LocalDateTime.now())
                .build();
        orgMemberRepository.save(creatorMember);
        log.info("Organization created: {} by user: {}", saved.getName(), userId);
        return buildOrgResponse(saved, userId, 1);
    }

    @Transactional(readOnly = true)
    public List<OrgResponse> getUserOrganizations(String userId) {
        return organizationRepository.findAllByUserId(userId)
                .stream()
                .map(org -> {
                    int count = (int) orgMemberRepository
                            .countByOrgIdAndRoleAndIsActiveTrue(org.getId(), OrgRole.MEMBER)
                            + (int) orgMemberRepository
                            .countByOrgIdAndRoleAndIsActiveTrue(org.getId(), OrgRole.ORG_ADMIN);
                    return buildOrgResponse(org, userId, count);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public OrgResponse getOrganization(String orgId, String userId) {
        Organization org = organizationRepository.findByIdAndIsDeletedFalse(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        validateMembership(orgId, userId);
        long memberCount = orgMemberRepository
                .countByOrgIdAndRoleAndIsActiveTrue(orgId, OrgRole.MEMBER)
                + orgMemberRepository
                .countByOrgIdAndRoleAndIsActiveTrue(orgId, OrgRole.ORG_ADMIN);
        return buildOrgResponse(org, userId, (int) memberCount);
    }

    @Transactional
    public OrgResponse updateOrganization(String orgId, UpdateOrgRequest request, String userId) {
        Organization org = organizationRepository.findByIdAndIsDeletedFalse(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        validateAdminAccess(orgId, userId);
        if (request.getName() != null) org.setName(request.getName().trim());
        if (request.getDescription() != null) org.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) org.setLogoUrl(request.getLogoUrl());
        Organization updated = organizationRepository.save(org);
        return buildOrgResponse(updated, userId, 0);
    }

    @Transactional
    public void deleteOrganization(String orgId, String userId) {
        Organization org = organizationRepository.findByIdAndIsDeletedFalse(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        if (!org.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Only the organization owner can delete it");
        }
        org.setDeleted(true);
        org.setDeletedAt(LocalDateTime.now());
        org.setDeletedBy(userId);
        organizationRepository.save(org);
    }

    @Transactional
    public void removeMember(String orgId, String targetUserId, String requestingUserId) {
        validateAdminAccess(orgId, requestingUserId);
        Organization org = organizationRepository.findByIdAndIsDeletedFalse(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        if (org.getCreatedBy().equals(targetUserId)) {
            throw new RuntimeException("Cannot remove the organization owner");
        }
        OrgMember target = orgMemberRepository
                .findByOrgIdAndUserIdAndIsActiveTrue(orgId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        if (target.getRole() == OrgRole.ORG_ADMIN) {
            long adminCount = orgMemberRepository
                    .countByOrgIdAndRoleAndIsActiveTrue(orgId, OrgRole.ORG_ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot remove the only admin.");
            }
        }
        target.setActive(false);
        target.setRemovedAt(LocalDateTime.now());
        target.setRemovedBy(requestingUserId);
        orgMemberRepository.save(target);
    }

    @Transactional
    public void changeMemberRole(String orgId, String targetUserId,
                                 OrgRole newRole, String requestingUserId) {
        validateAdminAccess(orgId, requestingUserId);
        OrgMember target = orgMemberRepository
                .findByOrgIdAndUserIdAndIsActiveTrue(orgId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        if (target.getRole() == OrgRole.ORG_ADMIN && newRole != OrgRole.ORG_ADMIN) {
            long adminCount = orgMemberRepository
                    .countByOrgIdAndRoleAndIsActiveTrue(orgId, OrgRole.ORG_ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot demote the only admin.");
            }
        }
        target.setRole(newRole);
        orgMemberRepository.save(target);
    }

    @Transactional
    public void leaveOrganization(String orgId, String userId) {
        Organization org = organizationRepository.findByIdAndIsDeletedFalse(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        if (org.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Owner cannot leave. Transfer ownership first.");
        }
        OrgMember member = orgMemberRepository
                .findByOrgIdAndUserIdAndIsActiveTrue(orgId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member"));
        if (member.getRole() == OrgRole.ORG_ADMIN) {
            long adminCount = orgMemberRepository
                    .countByOrgIdAndRoleAndIsActiveTrue(orgId, OrgRole.ORG_ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot leave — you are the only admin.");
            }
        }
        member.setActive(false);
        member.setRemovedAt(LocalDateTime.now());
        orgMemberRepository.save(member);
    }

    private void validateMembership(String orgId, String userId) {
        if (!orgMemberRepository.existsByOrgIdAndUserIdAndIsActiveTrue(orgId, userId)) {
            throw new ForbiddenException("You are not a member of this organization");
        }
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
    public List<OrgMemberResponse> getMembers(String orgId, String requestingUserId) {
        validateAdminAccess(orgId, requestingUserId);
        Organization org = organizationRepository.findByIdAndIsDeletedFalse(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        return orgMemberRepository.findByOrgIdAndIsActiveTrue(orgId).stream()
                .map(m -> {
                    User user = userRepository.findById(m.getUserId()).orElse(null);
                    return OrgMemberResponse.builder()
                            .id(m.getId())
                            .userId(m.getUserId())
                            .name(user != null ? user.getName() : "Unknown")
                            .email(user != null ? user.getEmail() : "")
                            .avatarUrl(user != null ? user.getAvatarUrl() : null)
                            .role(m.getRole())
                            .joinedAt(m.getJoinedAt())
                            .isOwner(org.getCreatedBy().equals(m.getUserId()))
                            .build();
                })
                .toList();
    }

    private OrgResponse buildOrgResponse(Organization org, String userId, int memberCount) {
        OrgMember member = orgMemberRepository
                .findByOrgIdAndUserIdAndIsActiveTrue(org.getId(), userId)
                .orElse(null);
        return OrgResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .description(org.getDescription())
                .logoUrl(org.getLogoUrl())
                .slug(org.getSlug())
                .plan(org.getPlan().name())
                .createdBy(org.getCreatedBy())
                .memberCount(memberCount)
                .currentUserRole(member != null ? member.getRole().name() : null)
                .isOwner(org.getCreatedBy().equals(userId))
                .createdAt(org.getCreatedAt())
                .build();
    }

    private String generateSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");
        String base = slug;
        int counter = 1;
        while (organizationRepository.existsBySlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }
}