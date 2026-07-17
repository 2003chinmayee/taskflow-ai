import apiClient from '../lib/axios';
import type { NotificationPageResponse } from '../types/notification';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const notificationApi = {
  list: (page: number, size: number) =>
    apiClient.get<ApiResponse<NotificationPageResponse>>(
      `/api/v1/notifications`,
      { params: { page, size } }
    ),

  search: (params: {
    page: number;
    size: number;
    type?: string;
    search?: string;
  }) =>
    apiClient.get<ApiResponse<NotificationPageResponse>>(
      `/api/v1/notifications/search`,
      { params }
    ),

  unreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>(
      `/api/v1/notifications/unread-count`
    ),

  markAsRead: (id: string) =>
    apiClient.patch<ApiResponse<null>>(
      `/api/v1/notifications/${id}/read`
    ),

  markAllAsRead: () =>
    apiClient.patch<ApiResponse<null>>(
      `/api/v1/notifications/mark-all-read`
    ),
};