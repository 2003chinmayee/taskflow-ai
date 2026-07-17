import apiClient from '../lib/axios';
import type { CalendarTask, CalendarFilters } from '../types/calendar';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const calendarApi = {
  getTasks: (orgId: string, startDate: string, endDate: string, filters: CalendarFilters) =>
    apiClient.get<ApiResponse<CalendarTask[]>>('/api/v1/calendar/tasks', {
      params: {
        orgId,
        startDate,
        endDate,
        projectId: filters.projectId || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        assigneeId: filters.assigneeId || undefined,
        mineOnly: filters.mineOnly ?? false,
        includeCompleted: filters.includeCompleted ?? true,
      },
    }),
};