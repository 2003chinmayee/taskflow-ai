import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { projectMemberApi } from '../api/projectMemberApi';
import type { ProjectMemberRole } from '../types/projectMember';

export function useProjectMembers(projectId: string) {
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectMemberApi.list(projectId).then(res => res.data.data),
    enabled: !!projectId,
  });

  const availableMembersQuery = useQuery({
    queryKey: ['project-available-members', projectId],
    queryFn: () => projectMemberApi.availableMembers(projectId).then(res => res.data.data),
    enabled: !!projectId,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project-available-members', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
  };

  const addMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: ProjectMemberRole }) =>
      projectMemberApi.add(projectId, userId, role),
    onSuccess: () => {
      invalidateAll();
      toast.success('Member added to project');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to add member');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: ProjectMemberRole }) =>
      projectMemberApi.updateRole(projectId, userId, role),
    onSuccess: () => {
      invalidateAll();
      toast.success('Role updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update role');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => projectMemberApi.remove(projectId, userId),
    onSuccess: () => {
      invalidateAll();
      toast.success('Member removed');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to remove member');
    },
  });

  return {
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
    error: membersQuery.error,
    availableMembers: availableMembersQuery.data ?? [],
    isLoadingAvailable: availableMembersQuery.isLoading,

    addMember: addMutation.mutate,
    isAdding: addMutation.isPending,
    addError: addMutation.error,

    updateRole: updateRoleMutation.mutate,
    isUpdatingRole: updateRoleMutation.isPending,

    removeMember: removeMutation.mutate,
    isRemoving: removeMutation.isPending,
  };
}