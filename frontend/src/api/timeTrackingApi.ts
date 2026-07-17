import apiClient from '../lib/axios';
import type {
  WorkLog,
  ActiveTimer,
  CreateManualWorkLogRequest,
  UpdateWorkLogRequest,
  ProjectTimeSummary,
  WorkLogPageResponse,
} from '../types/workLog';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const timeTrackingApi = {

  startTimer: (taskId: string) =>
    apiClient.post<ApiResponse<ActiveTimer>>(
      `/api/v1/tasks/${taskId}/timer/start`),

  stopTimer: (taskId: string) =>
    apiClient.post<ApiResponse<WorkLog>>(
      `/api/v1/tasks/${taskId}/timer/stop`),

  getActiveTimer: () =>
    apiClient.get<ApiResponse<ActiveTimer | null>>(
      '/api/v1/time-tracking/active-timer'),

  createManualWorkLog: (taskId: string, payload: CreateManualWorkLogRequest) =>
    apiClient.post<ApiResponse<WorkLog>>(
      `/api/v1/tasks/${taskId}/work-logs`, payload),

  getTaskWorkLogs: (taskId: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<WorkLogPageResponse>>(
      `/api/v1/tasks/${taskId}/work-logs`, { params: { page, size } }),

  updateWorkLog: (workLogId: string, payload: UpdateWorkLogRequest) =>
    apiClient.patch<ApiResponse<WorkLog>>(
      `/api/v1/work-logs/${workLogId}`, payload),

  deleteWorkLog: (workLogId: string) =>
    apiClient.delete<ApiResponse<void>>(
      `/api/v1/work-logs/${workLogId}`),

  getProjectTimeSummary: (projectId: string) =>
    apiClient.get<ApiResponse<ProjectTimeSummary>>(
      `/api/v1/projects/${projectId}/time-summary`),
};