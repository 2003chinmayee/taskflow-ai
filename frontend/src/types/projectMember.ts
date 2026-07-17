export type ProjectMemberRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export interface ProjectMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: ProjectMemberRole;
  isOwner: boolean;
  joinedAt: string;
}

export interface AvailableMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}