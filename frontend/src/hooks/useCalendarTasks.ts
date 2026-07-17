import { useQuery, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from '../api/calendarApi';
import { useOrgStore } from '../store/orgStore';
import type { CalendarFilters } from '../types/calendar';

export function useCalendarTasks(startDate: string, endDate: string, filters: CalendarFilters) {
  const { currentOrg } = useOrgStore();
  const orgId = currentOrg?.id ?? '';
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['calendar-tasks', orgId, startDate, endDate, filters],
    queryFn: () => calendarApi.getTasks(orgId, startDate, endDate, filters).then(res => res.data.data),
    enabled: !!orgId && !!startDate && !!endDate,
  });

  const invalidateCalendar = () => {
    queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
  };

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    invalidateCalendar,
  };
}