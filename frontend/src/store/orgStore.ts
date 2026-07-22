import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { organizationApi } from '../api/organizationApi';

interface Organization {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  logoUrl: string | null;
  plan: string;
  createdBy: string;
  memberCount: number;
  currentUserRole: string | null;
  isOwner: boolean;
  createdAt: string;
}

interface OrgState {
  currentOrg: Organization | null;
  isInitialized: boolean;
  isLoading: boolean;
  setCurrentOrg: (org: Organization) => void;
  clearOrg: () => void;
  fetchOrganizations: () => Promise<void>;
  reset: () => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      currentOrg: null,
      isInitialized: false,
      isLoading: false,

      setCurrentOrg: (org) => set({ currentOrg: org }),

      clearOrg: () => set({ currentOrg: null }),

      // Fetches the user's organizations exactly once per session.
      // Called by AuthGuard on first protected-route access.
      // Safe to call again after workspace creation/switching (it overwrites state).
      fetchOrganizations: async () => {
        if (get().isLoading) return; // prevent duplicate concurrent calls
        set({ isLoading: true });
        try {
          const res = await organizationApi.list();
          const orgs = res.data.data;
          if (orgs && orgs.length > 0) {
            set({ currentOrg: orgs[0], isInitialized: true, isLoading: false });
          } else {
            set({ currentOrg: null, isInitialized: true, isLoading: false });
          }
        } catch {
          set({ isInitialized: true, isLoading: false });
        }
      },

      // Full reset on logout so stale org data never leaks into the next session
      reset: () => set({ currentOrg: null, isInitialized: false, isLoading: false }),
    }),
    {
      name: 'taskflow-org',
      partialize: (state) => ({ currentOrg: state.currentOrg }),
    }
  )
);