import apiClient from '../lib/axios';
import type {
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
  CommentPageResponse,
} from '../types/comment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const taskCommentApi = {

  list: (taskId: string, page: number, size: number) =>
    apiClient.get<ApiResponse<CommentPageResponse>>(
      `/api/v1/tasks/${taskId}/comments`,
      { params: { page, size } }
    ),

  create: (taskId: string, payload: CreateCommentPayload) =>
    apiClient.post<ApiResponse<Comment>>(
      `/api/v1/tasks/${taskId}/comments`,
      payload
    ),

  update: (taskId: string, commentId: string, payload: UpdateCommentPayload) =>
    apiClient.patch<ApiResponse<Comment>>(
      `/api/v1/tasks/${taskId}/comments/${commentId}`,
      payload
    ),

  delete: (taskId: string, commentId: string) =>
    apiClient.delete<ApiResponse<null>>(
      `/api/v1/tasks/${taskId}/comments/${commentId}`
    ),
};