import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { timeTrackingApi } from '../api/timeTrackingApi';
import type { CreateManualWorkLogRequest, UpdateWorkLogRequest } from '../types/workLog';

// ── Shared invalidation used by every mutation ──────────────────
function useInvalidateTimeTracking() {
  const queryClient = useQueryClient();

  return (taskId?: string, projectId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['active-timer'] });
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['task-work-logs', taskId] });
    }
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      queryClient.invalidateQueries({ queryKey: ['project-time-summary', projectId] });
    }
    queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-activity'] });
    queryClient.invalidateQueries({ queryKey: ['project-activity'] });
  };
}

// ── Global time tracking hook ────────────────────────────────────
export function useTimeTracking() {
  const invalidateAll = useInvalidateTimeTracking();

  const activeTimerQuery = useQuery({
    queryKey: ['active-timer'],
    queryFn: () => timeTrackingApi.getActiveTimer().then(res => res.data.data),
  });

  const startTimerMutation = useMutation({
    mutationFn: (taskId: string) => timeTrackingApi.startTimer(taskId),
    onSuccess: (_, taskId) => {
      invalidateAll(taskId);
      toast.success('Timer started');
    },
    onError: () => toast.error('Failed to start timer'),
  });

  const stopTimerMutation = useMutation({
    mutationFn: (taskId: string) => timeTrackingApi.stopTimer(taskId),
    onSuccess: (res, taskId) => {
      const projectId = res.data.data.projectId;
      invalidateAll(taskId, projectId);
      toast.success('Timer stopped');
    },
    onError: () => toast.error('Failed to stop timer'),
  });

  const createManualWorkLogMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: CreateManualWorkLogRequest }) =>
      timeTrackingApi.createManualWorkLog(taskId, payload),
    onSuccess: (res, variables) => {
      invalidateAll(variables.taskId, res.data.data.projectId);
      toast.success('Work log added');
    },
    onError: () => toast.error('Failed to add work log'),
  });

  const updateWorkLogMutation = useMutation({
    mutationFn: ({ workLogId, payload }: { workLogId: string; payload: UpdateWorkLogRequest }) =>
      timeTrackingApi.updateWorkLog(workLogId, payload),
    onSuccess: (res) => {
      invalidateAll(res.data.data.taskId, res.data.data.projectId);
      toast.success('Work log updated');
    },
    onError: () => toast.error('Failed to update work log'),
  });

  const deleteWorkLogMutation = useMutation({
    mutationFn: ({ workLogId }: { workLogId: string; taskId?: string; projectId?: string }) =>
      timeTrackingApi.deleteWorkLog(workLogId),
    onSuccess: (_, variables) => {
      invalidateAll(variables.taskId, variables.projectId);
      toast.success('Work log deleted');
    },
    onError: () => toast.error('Failed to delete work log'),
  });

  return {
    activeTimer: activeTimerQuery.data ?? null,
    isLoadingActiveTimer: activeTimerQuery.isLoading,
    activeTimerError: activeTimerQuery.error,

    startTimer: startTimerMutation.mutate,
    isStartingTimer: startTimerMutation.isPending,

    stopTimer: stopTimerMutation.mutate,
    isStoppingTimer: stopTimerMutation.isPending,

    createManualWorkLog: createManualWorkLogMutation.mutate,
    isCreatingWorkLog: createManualWorkLogMutation.isPending,

    updateWorkLog: updateWorkLogMutation.mutate,
    isUpdatingWorkLog: updateWorkLogMutation.isPending,

    deleteWorkLog: deleteWorkLogMutation.mutate,
    isDeletingWorkLog: deleteWorkLogMutation.isPending,
  };
}

// ── Task-scoped work log list hook ────────────────────────────────
export function useTaskWorkLogs(taskId: string, page = 0, size = 20) {
  const query = useQuery({
    queryKey: ['task-work-logs', taskId, page, size],
    queryFn: () => timeTrackingApi.getTaskWorkLogs(taskId, page, size).then(res => res.data.data),
    enabled: !!taskId,
  });

  return {
    workLogs: query.data?.content ?? [],
    totalElements: query.data?.totalElements ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}

// ── Project-scoped time summary hook ──────────────────────────────
export function useProjectTimeSummary(projectId: string) {
  const query = useQuery({
    queryKey: ['project-time-summary', projectId],
    queryFn: () => timeTrackingApi.getProjectTimeSummary(projectId).then(res => res.data.data),
    enabled: !!projectId,
  });

  return {
    summary: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}