import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taskApi } from '../api/taskApi';
import type { CreateTaskPayload, UpdateTaskPayload } from '../types/task';

export const useTasks = (projectId: string) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const queryKey = ['tasks', projectId, search, statusFilter, priorityFilter];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => taskApi.list(projectId, {
      search: search || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      size: 50,
      sortBy: 'position',
      direction: 'asc',
    }),
    select: (res) => res.data.data,
    enabled: !!projectId,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project-stats'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskApi.create(projectId, payload),
    onSuccess: () => {
      invalidateAll();
      toast.success('Task created');
    },
    onError: () => toast.error('Failed to create task'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
      taskApi.update(projectId, taskId, payload),
    onSuccess: (_, variables) => {
      invalidateAll();
      // Only show toast for non-status-only updates (drag produces status-only updates)
      if (Object.keys(variables.payload).length > 1 || !variables.payload.status) {
        toast.success('Task updated');
      }
    },
    onError: (_, variables) => {
      // Rollback — refetch to restore real state
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      if (variables.payload.status) {
        toast.error('Failed to move task — restored to original position');
      } else {
        toast.error('Failed to update task');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => taskApi.delete(projectId, taskId),
    onSuccess: () => {
      invalidateAll();
      toast.success('Task deleted');
    },
    onError: () => toast.error('Failed to delete task'),
  });

  return {
    tasks: data?.content ?? [],
    totalTasks: data?.totalElements ?? 0,
    isLoading,
    error,
    refetch,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    createTask: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateTask: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteTask: deleteMutation.mutate,
  };
};
