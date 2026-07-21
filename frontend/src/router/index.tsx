// ─── What is React Router? ────────────────────────────────────────
// React Router manages navigation in a React app.
// Without it: the page reloads every time you click a link.
// With it: only the content changes, no page reload. (SPA behavior)

// ─── What is a Protected Route? ───────────────────────────────────
// Some pages require login (dashboard, projects, tasks).
// ProtectedRoute checks if user is logged in.
// If NOT logged in → redirect to /login
// If logged in → show the page

import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProjectsPage from "../pages/projects/ProjectsPage";
import ProjectDetailPage from "../pages/projects/ProjectDetailPage";
import CalendarPage from "../pages/calendar/CalendarPage";
import AcceptInvitationPage from '../pages/auth/AcceptInvitationPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import OrganizationMembersPage from '../pages/organization/OrganizationMembersPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import MyTasksPage from '../pages/tasks/MyTasksPage';
import OnboardingPage from '../pages/onboarding/OnboardingPage';

// ─── ProtectedRoute component ─────────────────────────────────────
// children: React.ReactNode means this component wraps other components
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If not authenticated, redirect to login
  // Navigate component from React Router does the redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the wrapped component
  return <>{children}</>;
}

// ─── PublicRoute component ────────────────────────────────────────
// Prevents logged-in users from seeing login/register pages
// If already logged in and you visit /login → redirect to /dashboard
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    const redirect = searchParams.get('redirect');
    return <Navigate to={redirect || "/dashboard"} replace />;
  }

  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public routes (redirect to dashboard if logged in) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected routes (redirect to login if not logged in) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="/invite/:token" element={<AcceptInvitationPage />} />

        <Route
          path="/organization/members"
          element={
            <ProtectedRoute>
              <OrganizationMembersPage />
            </ProtectedRoute>
          }
        />

       <Route
          path="/my-tasks"
          element={
            <ProtectedRoute>
              <MyTasksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
