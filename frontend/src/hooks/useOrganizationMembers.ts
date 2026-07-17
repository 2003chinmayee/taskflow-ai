import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { organizationApi } from '../api/organizationApi';
import type { OrgRole } from '../types/organization';

export function useOrganizationMembers(orgId: string) {
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ['organization-members', orgId],
    queryFn: () => organizationApi.getMembers(orgId).then(res => res.data.data),
    enabled: !!orgId,
  });

  const pendingInvitationsQuery = useQuery({
    queryKey: ['organization-pending-invitations', orgId],
    queryFn: () => organizationApi.getPendingInvitations(orgId).then(res => res.data.data),
    enabled: !!orgId,
  });

  const invitationHistoryQuery = useQuery({
    queryKey: ['organization-invitation-history', orgId],
    queryFn: () => organizationApi.getInvitationHistory(orgId).then(res => res.data.data),
    enabled: !!orgId,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['organization-members', orgId] });
    queryClient.invalidateQueries({ queryKey: ['organization-pending-invitations', orgId] });
    queryClient.invalidateQueries({ queryKey: ['organization-invitation-history', orgId] });
  };

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role?: OrgRole }) =>
      organizationApi.inviteMember(orgId, { email, role }),
    onSuccess: () => {
      invalidateAll();
      toast.success('Invitation sent');
    },
    onError: (err: any) => {
      // Surfaces the exact backend message, including the 409
      // "A pending invitation already exists for this email." case.
      toast.error(err?.response?.data?.message ?? 'Failed to send invitation');
    },
  });

  const resendMutation = useMutation({
    mutationFn: (invitationId: string) =>
      organizationApi.resendInvitation(orgId, invitationId),
    onSuccess: () => {
      invalidateAll();
      toast.success('Invitation resent', { id: 'resend-invitation', duration: 8000 });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to resend invitation', { id: 'resend-invitation', duration: 8000 });
    },
  });
  
 const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => {
      console.log('[CANCEL] calling API for invitationId:', invitationId);
      return organizationApi.revokeInvitation(orgId, invitationId);
    },
    onSuccess: (data) => {
      console.log('[CANCEL] onSuccess fired, response data:', data);
      invalidateAll();
      console.log('[CANCEL] invalidateAll() called, about to fire toast');
      toast.success('Invitation cancelled', { id: 'cancel-invitation-test', duration: 8000 });
      console.log('[CANCEL] toast.success() call completed');
    },
    onError: (err: any) => {
      console.log('[CANCEL] onError fired, full error:', err);
      console.log('[CANCEL] err.response:', err?.response);
      toast.error(err?.response?.data?.message ?? 'Failed to cancel invitation');
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: OrgRole }) =>
      organizationApi.changeMemberRole(orgId, memberId, role),
    onSuccess: () => {
      invalidateAll();
      toast.success('Role updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update role');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) =>
      organizationApi.removeMember(orgId, memberId),
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
    isLoadingMembers: membersQuery.isLoading,
    membersError: membersQuery.error,
    refetchMembers: membersQuery.refetch,

    pendingInvitations: pendingInvitationsQuery.data ?? [],
    isLoadingPending: pendingInvitationsQuery.isLoading,
    pendingError: pendingInvitationsQuery.error,
    refetchPending: pendingInvitationsQuery.refetch,

    invitationHistory: invitationHistoryQuery.data ?? [],
    isLoadingHistory: invitationHistoryQuery.isLoading,
    historyError: invitationHistoryQuery.error,
    refetchHistory: invitationHistoryQuery.refetch,

    inviteMember: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,

    resendInvitation: resendMutation.mutate,
    isResending: resendMutation.isPending,

    revokeInvitation: revokeMutation.mutate,
    isRevoking: revokeMutation.isPending,

    changeRole: changeRoleMutation.mutate,
    isChangingRole: changeRoleMutation.isPending,

    removeMember: removeMutation.mutate,
    isRemoving: removeMutation.isPending,
  };
}