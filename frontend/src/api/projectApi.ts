import apiClient from '../lib/axios';
import type { CreateProjectPayload, PageResponse, Project, ProjectStats } from '../types/project';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const projectApi = {

  create: (orgId: string, payload: CreateProjectPayload) =>
    apiClient.post<ApiResponse<Project>>(
      `/api/v1/organizations/${orgId}/projects`, payload),

  list: (orgId: string, page = 0, size = 12) =>
    apiClient.get<ApiResponse<PageResponse<Project>>>(
      `/api/v1/organizations/${orgId}/projects`, { params: { page, size } }),

  get: (projectId: string) =>
    apiClient.get<ApiResponse<Project>>(`/api/v1/projects/${projectId}`),

  update: (projectId: string, payload: Partial<CreateProjectPayload>) =>
    apiClient.patch<ApiResponse<Project>>(
      `/api/v1/projects/${projectId}`, payload),

  delete: (projectId: string) =>
    apiClient.delete(`/api/v1/projects/${projectId}`),

  archive: (projectId: string) =>
    apiClient.post<ApiResponse<Project>>(
      `/api/v1/projects/${projectId}/archive`),

  restore: (projectId: string) =>
    apiClient.post<ApiResponse<Project>>(
      `/api/v1/projects/${projectId}/restore`),

  favorite: (projectId: string) =>
    apiClient.post<ApiResponse<boolean>>(
      `/api/v1/projects/${projectId}/favorite`),

  duplicate: (projectId: string) =>
    apiClient.post<ApiResponse<Project>>(
      `/api/v1/projects/${projectId}/duplicate`),

  search: (orgId: string, query: string) =>
    apiClient.get<ApiResponse<PageResponse<Project>>>(
      `/api/v1/organizations/${orgId}/projects/search`, { params: { query } }),

  stats: (orgId: string) =>
    apiClient.get<ApiResponse<ProjectStats>>(
      `/api/v1/organizations/${orgId}/projects/stats`),

  pinned: (orgId: string) =>
    apiClient.get<ApiResponse<Project[]>>(
      `/api/v1/organizations/${orgId}/projects/pinned`),

  recent: (orgId: string) =>
    apiClient.get<ApiResponse<Project[]>>(
      `/api/v1/organizations/${orgId}/projects/recent`),

  favorites: () =>
    apiClient.get<ApiResponse<Project[]>>('/api/v1/projects/favorites'),
};