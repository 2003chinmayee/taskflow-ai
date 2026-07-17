import apiClient from '../lib/axios';
import type { AiAnswerResponse } from '../types/ai';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const projectAiApi = {
  ask: (projectId: string, question: string) =>
    apiClient.post<ApiResponse<AiAnswerResponse>>(
      `/api/v1/projects/${projectId}/ai/ask`,
      { question }
    ),
};
