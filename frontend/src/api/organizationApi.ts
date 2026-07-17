/**
 * organizationApi.ts
 *
 * PURPOSE:
 * All API calls related to organizations.
 *
 * PATTERN:
 * Same as authApi.ts — plain object, one function per endpoint.
 * Uses shared apiClient from lib/axios.ts
 */

import apiClient from '../lib/axios';
import type { OrgMember, OrgInvitation } from '../types/organization';

// ─── Types ─────────────────────────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  logoUrl: string | null;
  plan: string;
  createdBy: string;
  memberCount: number;
  currentUserRole: string | null;
  isOwner: boolean;
  createdAt: string;
}

export interface CreateOrgPayload {
  name: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Organization API ───────────────────────────────────────────────
export const organizationApi = {

  /** POST /api/v1/organizations */
  create: (payload: CreateOrgPayload) =>
    apiClient.post<ApiResponse<Organization>>('/api/v1/organizations', payload),

  /** GET /api/v1/organizations */
  list: () =>
    apiClient.get<ApiResponse<Organization[]>>('/api/v1/organizations'),

  /** GET /api/v1/organizations/:id */
  get: (orgId: string) =>
    apiClient.get<ApiResponse<Organization>>(`/api/v1/organizations/${orgId}`),

  /** PATCH /api/v1/organizations/:id */
  update: (orgId: string, payload: Partial<CreateOrgPayload>) =>
    apiClient.patch<ApiResponse<Organization>>(
      `/api/v1/organizations/${orgId}`, payload),

      /** DELETE /api/v1/organizations/:id */
  delete: (orgId: string) =>
    apiClient.delete(`/api/v1/organizations/${orgId}`),

  /** POST /api/v1/organizations/:orgId/members/invite */
  inviteMember: (orgId: string, payload: { email: string; role?: string; personalMessage?: string }) =>
    apiClient.post<ApiResponse<string>>(
      `/api/v1/organizations/${orgId}/members/invite`, payload),

  /** POST /api/v1/organizations/invitations/:token/accept */
  acceptInvitation: (token: string) =>
    apiClient.post<ApiResponse<void>>(
      `/api/v1/organizations/invitations/${token}/accept`),

  /** DELETE /api/v1/organizations/:orgId/invitations/:invitationId */
  revokeInvitation: (orgId: string, invitationId: string) =>
    apiClient.delete<ApiResponse<void>>(
      `/api/v1/organizations/${orgId}/invitations/${invitationId}`),

  /** GET /api/v1/organizations/:orgId/members */
  getMembers: (orgId: string) =>
    apiClient.get<ApiResponse<OrgMember[]>>(
      `/api/v1/organizations/${orgId}/members`),

  /** GET /api/v1/organizations/:orgId/invitations/pending */
  getPendingInvitations: (orgId: string) =>
    apiClient.get<ApiResponse<OrgInvitation[]>>(
      `/api/v1/organizations/${orgId}/invitations/pending`),

  /** GET /api/v1/organizations/:orgId/invitations/history */
  getInvitationHistory: (orgId: string) =>
    apiClient.get<ApiResponse<OrgInvitation[]>>(
      `/api/v1/organizations/${orgId}/invitations/history`),

  /** POST /api/v1/organizations/:orgId/invitations/:invitationId/resend */
  resendInvitation: (orgId: string, invitationId: string) =>
    apiClient.post<ApiResponse<string>>(
      `/api/v1/organizations/${orgId}/invitations/${invitationId}/resend`),

  /** DELETE /api/v1/organizations/:orgId/members/:memberId */
  removeMember: (orgId: string, memberId: string) =>
    apiClient.delete<ApiResponse<void>>(
      `/api/v1/organizations/${orgId}/members/${memberId}`),

  /** PATCH /api/v1/organizations/:orgId/members/:memberId/role */
  changeMemberRole: (orgId: string, memberId: string, role: string) =>
    apiClient.patch<ApiResponse<void>>(
      `/api/v1/organizations/${orgId}/members/${memberId}/role`, { role }),

  /** DELETE /api/v1/organizations/:orgId/members/leave */
  leaveOrg: (orgId: string) =>
    apiClient.delete<ApiResponse<void>>(
      `/api/v1/organizations/${orgId}/members/leave`),
};
  