import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { projectAiApi } from '../api/projectAiApi';

export const useProjectAi = (projectId: string) => {
  const askMutation = useMutation({
    mutationFn: (question: string) => projectAiApi.ask(projectId, question),
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'AI request failed. Please try again.');
    },
  });

  return {
    ask: askMutation.mutate,
    askAsync: askMutation.mutateAsync,
    isAsking: askMutation.isPending,
    answer: askMutation.data?.data.data,
    error: askMutation.error,
    reset: askMutation.reset,
  };
};