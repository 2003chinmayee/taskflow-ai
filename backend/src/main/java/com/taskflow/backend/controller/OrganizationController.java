package com.taskflow.backend.controller;

import com.taskflow.backend.dto.request.org.ChangeMemberRoleRequest;
import com.taskflow.backend.dto.request.org.CreateOrgRequest;
import com.taskflow.backend.dto.request.org.InviteMemberRequest;
import com.taskflow.backend.dto.request.org.UpdateOrgRequest;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.org.OrgInvitationResponse;
import com.taskflow.backend.dto.response.org.OrgMemberResponse;
import com.taskflow.backend.dto.response.org.OrgResponse;
import com.taskflow.backend.service.InvitationService;
import com.taskflow.backend.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;
    private final InvitationService invitationService;

    private String getUserId(UserDetails userDetails) {
        return ((com.taskflow.backend.domain.User) userDetails).getId(); // returns UUID ✅
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrgResponse>> createOrg(
            @Valid @RequestBody CreateOrgRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrgResponse org = organizationService.createOrganization(request, getUserId(userDetails));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Organization created", org));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrgResponse>>> getMyOrgs(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<OrgResponse> orgs = organizationService.getUserOrganizations(getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Organizations retrieved", orgs));
    }

    @GetMapping("/{orgId}")
    public ResponseEntity<ApiResponse<OrgResponse>> getOrg(
            @PathVariable String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrgResponse org = organizationService.getOrganization(orgId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Organization retrieved", org));
    }

    @PatchMapping("/{orgId}")
    public ResponseEntity<ApiResponse<OrgResponse>> updateOrg(
            @PathVariable String orgId,
            @Valid @RequestBody UpdateOrgRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrgResponse org = organizationService.updateOrganization(orgId, request, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Organization updated", org));
    }

    @DeleteMapping("/{orgId}")
    public ResponseEntity<ApiResponse<Void>> deleteOrg(
            @PathVariable String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        organizationService.deleteOrganization(orgId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Organization deleted"));
    }

    @PostMapping("/{orgId}/members/invite")
    public ResponseEntity<ApiResponse<String>> inviteMember(
            @PathVariable String orgId,
            @Valid @RequestBody InviteMemberRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String token = invitationService.inviteMember(orgId, request, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Invitation sent", token));
    }

    @GetMapping("/{orgId}/members")
    public ResponseEntity<ApiResponse<List<OrgMemberResponse>>> getMembers(
            @PathVariable String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<OrgMemberResponse> members = organizationService.getMembers(orgId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Members retrieved", members));
    }

    @GetMapping("/{orgId}/invitations/pending")
    public ResponseEntity<ApiResponse<List<OrgInvitationResponse>>> getPendingInvitations(
            @PathVariable String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<OrgInvitationResponse> invitations =
                invitationService.listPendingInvitations(orgId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Pending invitations retrieved", invitations));
    }

    @GetMapping("/{orgId}/invitations/history")
    public ResponseEntity<ApiResponse<List<OrgInvitationResponse>>> getInvitationHistory(
            @PathVariable String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<OrgInvitationResponse> invitations =
                invitationService.listInvitationHistory(orgId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Invitation history retrieved", invitations));
    }

    @PostMapping("/{orgId}/invitations/{invitationId}/resend")
    public ResponseEntity<ApiResponse<String>> resendInvitation(
            @PathVariable String orgId,
            @PathVariable String invitationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String token = invitationService.resendInvitation(orgId, invitationId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Invitation resent", token));
    }

    @PostMapping("/invitations/{token}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptInvitation(
            @PathVariable String token,
            @AuthenticationPrincipal UserDetails userDetails) {
        invitationService.acceptInvitation(token, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Invitation accepted"));
    }

    @DeleteMapping("/{orgId}/invitations/{invitationId}")
    public ResponseEntity<ApiResponse<Void>> revokeInvitation(
            @PathVariable String orgId,
            @PathVariable String invitationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        invitationService.revokeInvitation(orgId, invitationId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Invitation revoked"));
    }

    @DeleteMapping("/{orgId}/members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable String orgId,
            @PathVariable String memberId,
            @AuthenticationPrincipal UserDetails userDetails) {
        organizationService.removeMember(orgId, memberId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Member removed"));
    }

    @PatchMapping("/{orgId}/members/{memberId}/role")
    public ResponseEntity<ApiResponse<Void>> changeMemberRole(
            @PathVariable String orgId,
            @PathVariable String memberId,
            @Valid @RequestBody ChangeMemberRoleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        organizationService.changeMemberRole(
                orgId, memberId, request.getRole(), getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Role updated"));
    }

    @DeleteMapping("/{orgId}/members/leave")
    public ResponseEntity<ApiResponse<Void>> leaveOrg(
            @PathVariable String orgId,
            @AuthenticationPrincipal UserDetails userDetails) {
        organizationService.leaveOrganization(orgId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Left organization"));
    }
}