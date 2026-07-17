import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { useOrgStore } from '../store/orgStore';

export function useDashboard() {
  const { currentOrg } = useOrgStore();
  const orgId = currentOrg?.id ?? '';

  const overviewQuery = useQuery({
    queryKey: ['dashboard-overview', orgId],
    queryFn: () => dashboardApi.overview(orgId).then(res => res.data.data),
    enabled: !!orgId,
  });

  const myTasksQuery = useQuery({
    queryKey: ['dashboard-my-tasks', orgId],
    queryFn: () => dashboardApi.myTasks(orgId).then(res => res.data.data),
    enabled: !!orgId,
  });

  const upcomingQuery = useQuery({
    queryKey: ['dashboard-upcoming', orgId],
    queryFn: () => dashboardApi.upcomingDeadlines(orgId).then(res => res.data.data),
    enabled: !!orgId,
  });

  const todaysFocusQuery = useQuery({
    queryKey: ['dashboard-todays-focus', orgId],
    queryFn: () => dashboardApi.todaysFocus(orgId).then(res => res.data.data),
    enabled: !!orgId,
  });

  const progressQuery = useQuery({
    queryKey: ['dashboard-progress', orgId],
    queryFn: () => dashboardApi.projectProgress(orgId).then(res => res.data.data),
    enabled: !!orgId,
  });

  return {
    orgId,
    overview: overviewQuery.data,
    isLoadingOverview: overviewQuery.isLoading,
    overviewError: overviewQuery.error,

    myTasks: myTasksQuery.data ?? [],
    isLoadingMyTasks: myTasksQuery.isLoading,

    upcomingDeadlines: upcomingQuery.data ?? [],
    isLoadingUpcoming: upcomingQuery.isLoading,

    todaysFocus: todaysFocusQuery.data,
    isLoadingTodaysFocus: todaysFocusQuery.isLoading,

    projectProgress: progressQuery.data ?? [],
    isLoadingProgress: progressQuery.isLoading,
  };
}