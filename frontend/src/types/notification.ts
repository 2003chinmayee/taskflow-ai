export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_DUE_SOON'
  | 'TASK_COMMENT_ADDED'
  | 'COMMENT_MENTION'
  | 'PROJECT_MEMBER_ADDED'
  | 'PROJECT_ROLE_CHANGED'
  | 'ORG_INVITATION_ACCEPTED';

export interface Notification {
  id: string;
  actorId: string | null;
  actorName: string | null;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  projectId: string | null;
  taskId: string | null;
  organizationId: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationPageResponse {
  content: Notification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}