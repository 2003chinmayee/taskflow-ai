/**
 * useProjects.ts
 *
 * PURPOSE:
 * React Query hook for all project operations.
 * Handles fetching, creating, favoriting, deleting, archiving.
 *
 * WHY REACT QUERY?
 * It handles caching, loading states, and automatic refetching.
 * Without it you would write useEffect + useState for every API call.
 * With it — one line gives you data, isLoading, and error automatically.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { projectApi } from '../api/projectApi';
import { useOrgStore } from '../store/orgStore';
import type { CreateProjectPayload } from '../types/project';
import { useEffect } from 'react';
import { organizationApi } from '../api/organizationApi';

export const useProjects = () => {
  const queryClient = useQueryClient();
  const { currentOrg } = useOrgStore();
  const orgId = currentOrg?.id ?? '';

  useEffect(() => {
  if (currentOrg) return;
  organizationApi.list().then((res) => {
    const orgs = res.data.data;
    if (orgs?.length > 0) useOrgStore.getState().setCurrentOrg(orgs[0]);
  }).catch(() => {});
}, [currentOrg]);

  // ── Fetch projects ─────────────────────────────────────────────
  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ['projects', orgId],
    queryFn: () => projectApi.list(orgId),
    select: (res) => res.data.data,
    enabled: !!orgId,
  });

  // ── Fetch stats ────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ['project-stats', orgId],
    queryFn: () => projectApi.stats(orgId),
    select: (res) => res.data.data,
    enabled: !!orgId,
  });

  // ── Fetch recent ───────────────────────────────────────────────
  const { data: recent } = useQuery({
    queryKey: ['projects-recent', orgId],
    queryFn: () => projectApi.recent(orgId),
    select: (res) => res.data.data,
    enabled: !!orgId,
  });

  // ── Create project ─────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      projectApi.create(orgId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', orgId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', orgId] });
      toast.success('Project created!');
    },
    onError: () => toast.error('Failed to create project'),
  });

  // ── Favorite toggle ────────────────────────────────────────────
  const favoriteMutation = useMutation({
    mutationFn: (projectId: string) => projectApi.favorite(projectId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['projects', orgId] }),
  });

  // ── Delete project ─────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => projectApi.delete(projectId),
    onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['projects', orgId] });
  queryClient.invalidateQueries({ queryKey: ['project-stats', orgId] });
  queryClient.invalidateQueries({ queryKey: ['projects-recent', orgId] });
  toast.success('Project deleted');
},
    onError: () => toast.error('Failed to delete project'),
  });

  // ── Archive project ────────────────────────────────────────────
  const archiveMutation = useMutation({
    mutationFn: (projectId: string) => projectApi.archive(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      toast.success('Project archived');
    },
  });

  return {
    projects: projectsData?.content ?? [],
    totalProjects: projectsData?.totalElements ?? 0,
    stats,
    recent: recent ?? [],
    isLoading,
    error,
    createProject: createMutation.mutate,
    isCreating: createMutation.isPending,
    toggleFavorite: favoriteMutation.mutate,
    deleteProject: deleteMutation.mutate,
    archiveProject: archiveMutation.mutate,
  };

};

// ── Single Project Hook ──────────────────────────────────────────
export const useProject = (projectId: string) => {
  const queryClient = useQueryClient();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.get(projectId),
    select: (res) => res.data.data,
    enabled: !!projectId,
  });

  const favoriteMutation = useMutation({
    mutationFn: () => projectApi.favorite(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

 const archiveMutation = useMutation({
    mutationFn: () => projectApi.archive(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Project archived');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CreateProjectPayload>) =>
      projectApi.update(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated');
    },
    onError: () => toast.error('Failed to update project'),
  });

  return {
    project,
    isLoading,
    error,
    toggleFavorite: favoriteMutation.mutate,
    archiveProject: archiveMutation.mutate,
    updateProject: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};