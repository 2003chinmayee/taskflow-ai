export type ProjectMemberRole = 'OWNER' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'TESTER' | 'VIEWER';

export interface ProjectMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: ProjectMemberRole;
  isOwner: boolean;
  joinedAt: string;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canManageMembers: boolean;
}

export interface AvailableMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}