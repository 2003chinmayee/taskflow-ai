import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { organizationApi } from '../api/organizationApi';

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationApi.list().then(res => res.data.data),
  });
}

export function useOrgActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['organizations'] });
  };

  const createOrg = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      organizationApi.create(payload),
    onSuccess: () => { invalidate(); toast.success('Organization created'); },
    onError: () => toast.error('Failed to create organization'),
  });

  const inviteMember = useMutation({
    mutationFn: ({ orgId, email, role }: { orgId: string; email: string; role?: string }) =>
      organizationApi.inviteMember(orgId, { email, role }),
    onSuccess: () => toast.success('Invitation sent'),
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to send invitation'),
  });

  const acceptInvitation = useMutation({
    mutationFn: (token: string) => organizationApi.acceptInvitation(token),
    onSuccess: () => { invalidate(); toast.success('Joined organization'); },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to accept invitation'),
  });

  const removeMember = useMutation({
    mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
      organizationApi.removeMember(orgId, memberId),
    onSuccess: () => { invalidate(); toast.success('Member removed'); },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to remove member'),
  });

  const changeMemberRole = useMutation({
    mutationFn: ({ orgId, memberId, role }: { orgId: string; memberId: string; role: string }) =>
      organizationApi.changeMemberRole(orgId, memberId, role),
    onSuccess: () => { invalidate(); toast.success('Role updated'); },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to update role'),
  });

  return {
    createOrg: createOrg.mutate,
    isCreatingOrg: createOrg.isPending,

    inviteMember: inviteMember.mutate,
    isInviting: inviteMember.isPending,

    acceptInvitation: acceptInvitation.mutate,
    isAccepting: acceptInvitation.isPending,

    removeMember: removeMember.mutate,
    changeMemberRole: changeMemberRole.mutate,
  };
}