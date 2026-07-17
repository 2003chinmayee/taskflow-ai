import apiClient from '../lib/axios';
import type { CreateTaskPayload, UpdateTaskPayload, TaskPageResponse, Task } from '../types/task';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const taskApi = {

  list: (projectId: string, params?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    search?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  }) =>
    apiClient.get<ApiResponse<TaskPageResponse>>(
      `/api/v1/projects/${projectId}/tasks`,
      { params }
    ),

  get: (projectId: string, taskId: string) =>
    apiClient.get<ApiResponse<Task>>(
      `/api/v1/projects/${projectId}/tasks/${taskId}`
    ),

  create: (projectId: string, payload: CreateTaskPayload) =>
    apiClient.post<ApiResponse<Task>>(
      `/api/v1/projects/${projectId}/tasks`,
      payload
    ),

  update: (projectId: string, taskId: string, payload: UpdateTaskPayload) =>
    apiClient.patch<ApiResponse<Task>>(
      `/api/v1/projects/${projectId}/tasks/${taskId}`,
      payload
    ),

  delete: (projectId: string, taskId: string) =>
    apiClient.delete(
      `/api/v1/projects/${projectId}/tasks/${taskId}`
    ),
};