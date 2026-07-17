import apiClient from '../lib/axios';
import type { DashboardOverview, MyTask, UpcomingDeadline, ProjectProgress, ActivityItem, TodaysFocus } from '../types/dashboard';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const dashboardApi = {
  overview: (orgId: string) =>
    apiClient.get<ApiResponse<DashboardOverview>>(
      '/api/v1/dashboard/overview', { params: { orgId } }),

  myTasks: (orgId: string) =>
    apiClient.get<ApiResponse<MyTask[]>>(
      '/api/v1/dashboard/my-tasks', { params: { orgId } }),

  upcomingDeadlines: (orgId: string) =>
    apiClient.get<ApiResponse<UpcomingDeadline[]>>(
      '/api/v1/dashboard/upcoming-deadlines', { params: { orgId } }),

  recentActivity: (orgId: string) =>
    apiClient.get<ApiResponse<ActivityItem[]>>(
      '/api/v1/dashboard/recent-activity', { params: { orgId } }),

  projectProgress: (orgId: string) =>
    apiClient.get<ApiResponse<ProjectProgress[]>>(
      '/api/v1/dashboard/project-progress', { params: { orgId } }),

  todaysFocus: (orgId: string) =>
    apiClient.get<ApiResponse<TodaysFocus>>(
      '/api/v1/dashboard/todays-focus', { params: { orgId } }),
};