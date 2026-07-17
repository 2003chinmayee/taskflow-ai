import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taskAiApi } from '../api/taskAiApi';
import type { TaskAiActionType } from '../types/ai';

export const useTaskAi = (taskId: string) => {
  const askMutation = useMutation({
    mutationFn: ({ question, action }: { question: string; action: TaskAiActionType }) =>
      taskAiApi.ask(taskId, question, action),
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'AI request failed. Please try again.');
    },
  });

  const applyTitleMutation = useMutation({
    mutationFn: (title: string) => taskAiApi.applyTitle(taskId, title),
    onSuccess: () => toast.success('Title updated'),
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to apply title');
    },
  });

  const applyDescriptionMutation = useMutation({
    mutationFn: (description: string) => taskAiApi.applyDescription(taskId, description),
    onSuccess: () => toast.success('Description updated'),
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to apply description');
    },
  });

  const applyPriorityMutation = useMutation({
    mutationFn: (priority: string) => taskAiApi.applyPriority(taskId, priority),
    onSuccess: () => toast.success('Priority updated'),
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to apply priority');
    },
  });

  return {
    ask: askMutation.mutate,
    askAsync: askMutation.mutateAsync,
    isAsking: askMutation.isPending,
    answer: askMutation.data?.data.data,
    error: askMutation.error,
    reset: askMutation.reset,

    applyTitle: applyTitleMutation.mutate,
    isApplyingTitle: applyTitleMutation.isPending,

    applyDescription: applyDescriptionMutation.mutate,
    isApplyingDescription: applyDescriptionMutation.isPending,

    applyPriority: applyPriorityMutation.mutate,
    isApplyingPriority: applyPriorityMutation.isPending,
  };
};