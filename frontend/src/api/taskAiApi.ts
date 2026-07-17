import apiClient from '../lib/axios';
import type { AiAnswerResponse, TaskAiActionType } from '../types/ai';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const taskAiApi = {
  ask: (taskId: string, question: string, action: TaskAiActionType) =>
    apiClient.post<ApiResponse<AiAnswerResponse>>(
      `/api/v1/tasks/${taskId}/ai/ask`,
      { question, action }
    ),

  applyTitle: (taskId: string, title: string) =>
    apiClient.post<ApiResponse<any>>(
      `/api/v1/tasks/${taskId}/ai/apply-title`,
      { title }
    ),

  applyDescription: (taskId: string, description: string) =>
    apiClient.post<ApiResponse<any>>(
      `/api/v1/tasks/${taskId}/ai/apply-description`,
      { description }
    ),

  applyPriority: (taskId: string, priority: string) =>
    apiClient.post<ApiResponse<any>>(
      `/api/v1/tasks/${taskId}/ai/apply-priority`,
      { priority }
    ),
};
