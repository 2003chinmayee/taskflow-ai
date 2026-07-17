import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taskCommentApi } from '../api/taskCommentApi';
import type {
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
} from '../types/comment';

const PAGE_SIZE = 20;

export const useTaskComments = (taskId: string, enabled: boolean) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Tracks the next backend page to fetch for "load older" (backend
  // pages are newest-first; page 0 = most recent batch already shown).
  const nextPageRef = useRef(0);
  const hasLoadedInitial = useRef(false);

  const loadInitial = useCallback(async () => {
    if (!taskId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await taskCommentApi.list(taskId, 0, PAGE_SIZE);
      const page = res.data.data;
      // Backend page is newest-first; reverse so this batch reads
      // oldest-to-newest, matching the chat-style UI.
      setComments([...page.content].reverse());
      nextPageRef.current = 1;
      setHasMore(!page.last);
      hasLoadedInitial.current = true;
    } catch {
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  const loadOlder = useCallback(async () => {
    if (!taskId || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await taskCommentApi.list(taskId, nextPageRef.current, PAGE_SIZE);
      const page = res.data.data;
      const olderBatch = [...page.content].reverse();
      setComments((prev) => [...olderBatch, ...prev]);
      nextPageRef.current += 1;
      setHasMore(!page.last);
    } catch {
      toast.error('Failed to load older comments');
    } finally {
      setIsLoadingMore(false);
    }
  }, [taskId, isLoadingMore, hasMore]);

  useEffect(() => {
    if (enabled && !hasLoadedInitial.current) {
      loadInitial();
    }
  }, [enabled, loadInitial]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateCommentPayload) =>
      taskCommentApi.create(taskId, payload),
    onSuccess: (res) => {
      setComments((prev) => [...prev, res.data.data]);
      toast.success('Comment posted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to post comment');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, payload }: { commentId: string; payload: UpdateCommentPayload }) =>
      taskCommentApi.update(taskId, commentId, payload),
    onSuccess: (res) => {
      const updated = res.data.data;
      setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success('Comment updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update comment');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => taskCommentApi.delete(taskId, commentId),
    onSuccess: (_res, commentId) => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, deleted: true, content: 'This comment was deleted' }
            : c
        )
      );
      toast.success('Comment deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete comment');
    },
  });

  return {
    comments,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadOlder,
    retryInitial: loadInitial,
    createComment: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateComment: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteComment: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};