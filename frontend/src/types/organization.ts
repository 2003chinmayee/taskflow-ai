export type OrgRole = 'ORG_ADMIN' | 'PROJECT_MANAGER' | 'MEMBER' | 'GUEST';

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  slug: string;
  plan: string;
  createdBy: string;
  memberCount: number;
  currentUserRole: OrgRole | null;
  isOwner: boolean;
  createdAt: string;
}

export interface OrgMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: OrgRole;
  joinedAt: string;
  isOwner: boolean;
}

// Matches backend OrgInvitation.InvitationStatus, plus "EXPIRED"
// which is computed on the backend (not stored) when a PENDING
// invitation's expiresAt has passed.
export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export interface OrgInvitation {
  id: string;
  inviteeEmail: string;
  role: OrgRole;
  invitedByName: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
}

export interface CreateOrgPayload {
  name: string;
  description?: string;
}

export interface InviteMemberPayload {
  email: string;
  role?: OrgRole;
  personalMessage?: string;
}