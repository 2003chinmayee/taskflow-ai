import apiClient from '../lib/axios';
import type { ProjectMember, AvailableMember, ProjectMemberRole } from '../types/projectMember';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const projectMemberApi = {

  list: (projectId: string) =>
    apiClient.get<ApiResponse<ProjectMember[]>>(
      `/api/v1/projects/${projectId}/members`),

  availableMembers: (projectId: string) =>
    apiClient.get<ApiResponse<AvailableMember[]>>(
      `/api/v1/projects/${projectId}/available-members`),

  add: (projectId: string, userId: string, role: ProjectMemberRole) =>
    apiClient.post<ApiResponse<ProjectMember>>(
      `/api/v1/projects/${projectId}/members`, { userId, role }),

  updateRole: (projectId: string, userId: string, role: ProjectMemberRole) =>
    apiClient.patch<ApiResponse<ProjectMember>>(
      `/api/v1/projects/${projectId}/members/${userId}/role`, { role }),

  remove: (projectId: string, userId: string) =>
    apiClient.delete(`/api/v1/projects/${projectId}/members/${userId}`),
};