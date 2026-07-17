/**
 * orgStore.ts
 *
 * PURPOSE:
 * Stores the currently selected organization globally.
 *
 * WHY WE NEED THIS:
 * Many API calls need orgId (projects, members, settings).
 * Instead of passing orgId through props everywhere,
 * we store it here and any component reads it directly.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  setCurrentOrg: (org: Organization) => void;
  clearOrg: () => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      currentOrg: null,
      setCurrentOrg: (org) => set({ currentOrg: org }),
      clearOrg: () => set({ currentOrg: null }),
    }),
    { name: 'taskflow-org' }
  )
);