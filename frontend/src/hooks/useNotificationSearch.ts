import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import type { NotificationType } from '../types/notification';

const PAGE_SIZE = 20;

export const useNotificationSearch = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [type, setType] = useState<NotificationType | undefined>(undefined);
  const [search, setSearch] = useState('');

  const searchQuery = useQuery({
    queryKey: ['notifications', 'search', page, type, search],
    queryFn: () =>
      notificationApi.search({
        page,
        size: PAGE_SIZE,
        type,
        search: search || undefined,
      }),
    select: (res) => res.data.data,
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

  const updateType = (value: NotificationType | undefined) => {
    setType(value);
    setPage(0);
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  return {
    notifications: searchQuery.data?.content ?? [],
    totalPages: searchQuery.data?.totalPages ?? 0,
    totalElements: searchQuery.data?.totalElements ?? 0,
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    refetch: searchQuery.refetch,

    page,
    setPage,
    type,
    setType: updateType,
    search,
    setSearch: updateSearch,

    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};