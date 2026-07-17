import apiClient from '../lib/axios';
import type { Activity, ActivityPageResponse } from '../types/activity';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const taskActivityApi = {
  list: (taskId: string, page: number, size: number) =>
    apiClient.get<ApiResponse<ActivityPageResponse>>(
      `/api/v1/tasks/${taskId}/activities`,
      { params: { page, size } }
    ),
};

export type { Activity };
