import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 30000;

export const useNotifications = (enabled: boolean) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationApi.list(0, PAGE_SIZE),
    select: (res) => res.data.data,
    enabled,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  const unreadCountQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationApi.unreadCount(),
    select: (res) => res.data.data.count,
    enabled,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: invalidateAll,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: invalidateAll,
  });

  return {
    notifications: listQuery.data?.content ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,

    unreadCount: unreadCountQuery.data ?? 0,

    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};