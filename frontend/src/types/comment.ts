export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  content: string;
  edited: boolean;
  deleted: boolean;
  mentionedUserIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  content: string;
  mentionedUserIds?: string[];
}

export interface UpdateCommentPayload {
  content: string;
  mentionedUserIds?: string[];
}

export interface CommentPageResponse {
  content: Comment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}