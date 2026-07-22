import { useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useOrgStore } from "../store/orgStore";

// ─── AuthGuard ─────────────────────────────────────────────────────
// Wraps every protected route except /onboarding's special case.
// 1. Not logged in -> /login
// 2. Logged in -> ensure orgs have been fetched at least once this
//    session (fetchOrganizations is a no-op if already in flight,
//    and only runs once thanks to isInitialized)
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useOrgStore((s) => s.isInitialized);
  const fetchOrganizations = useOrgStore((s) => s.fetchOrganizations);

  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      fetchOrganizations();
    }
  }, [isAuthenticated, isInitialized, fetchOrganizations]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for the one-time org check before rendering anything that
  // might depend on currentOrg (dashboard, projects, etc.)
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-white/40">Loading...</p>
        </div>
      </div>
    );
  }

  const currentOrg = useOrgStore.getState().currentOrg;

  // Authenticated + initialized, but no workspace yet -> onboarding
  if (!currentOrg) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// ─── GuestGuard ────────────────────────────────────────────────────
// For /login, /register, /forgot-password.
// If already logged in, skip straight past them.
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    const redirect = searchParams.get("redirect");
    return <Navigate to={redirect || "/dashboard"} replace />;
  }

  return <>{children}</>;
}

// ─── OnboardingGuard ───────────────────────────────────────────────
// Wraps /onboarding specifically.
// - Not logged in -> /login
// - Logged in, orgs not yet checked -> wait
// - Logged in, already has an org -> /dashboard (never re-show onboarding)
// - Logged in, no org -> show onboarding
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useOrgStore((s) => s.isInitialized);
  const currentOrg = useOrgStore((s) => s.currentOrg);
  const fetchOrganizations = useOrgStore((s) => s.fetchOrganizations);

  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      fetchOrganizations();
    }
  }, [isAuthenticated, isInitialized, fetchOrganizations]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-white/40">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentOrg) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
