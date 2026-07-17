import { useCallback, useEffect, useRef, useState } from 'react';
import { taskActivityApi } from '../api/taskActivityApi';
import type { Activity } from '../types/activity';

const PAGE_SIZE = 20;

export const useTaskActivity = (taskId: string, enabled: boolean) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Backend pages are newest-first; page 0 = most recent batch already
  // shown. Activity displays newest-first too, so no reversal needed —
  // "load older" simply appends the next page to the bottom of the list.
  const nextPageRef = useRef(0);
  const hasLoadedInitial = useRef(false);

  const loadInitial = useCallback(async () => {
    if (!taskId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await taskActivityApi.list(taskId, 0, PAGE_SIZE);
      const page = res.data.data;
      setActivities(page.content);
      nextPageRef.current = 1;
      setHasMore(!page.last);
      hasLoadedInitial.current = true;
    } catch {
      setError('Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  const loadOlder = useCallback(async () => {
    if (!taskId || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await taskActivityApi.list(taskId, nextPageRef.current, PAGE_SIZE);
      const page = res.data.data;
      setActivities((prev) => [...prev, ...page.content]);
      nextPageRef.current += 1;
      setHasMore(!page.last);
    } catch {
      setError('Failed to load older activity');
    } finally {
      setIsLoadingMore(false);
    }
  }, [taskId, isLoadingMore, hasMore]);

  useEffect(() => {
    if (enabled && !hasLoadedInitial.current) {
      loadInitial();
    }
  }, [enabled, loadInitial]);

  return {
    activities,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadOlder,
    retryInitial: loadInitial,
  };
};