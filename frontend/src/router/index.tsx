import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard, GuestGuard, OnboardingGuard } from "./guards";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProjectsPage from "../pages/projects/ProjectsPage";
import ProjectDetailPage from "../pages/projects/ProjectDetailPage";
import CalendarPage from "../pages/calendar/CalendarPage";
import AcceptInvitationPage from "../pages/auth/AcceptInvitationPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import OrganizationMembersPage from "../pages/organization/OrganizationMembersPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import MyTasksPage from "../pages/tasks/MyTasksPage";
import OnboardingPage from "../pages/onboarding/OnboardingPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public / guest-only routes */}
        <Route
          path="/login"
          element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          }
        />
        <Route
          path="/register"
          element={
            <GuestGuard>
              <RegisterPage />
            </GuestGuard>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestGuard>
              <ForgotPasswordPage />
            </GuestGuard>
          }
        />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/invite/:token" element={<AcceptInvitationPage />} />

        {/* Special: onboarding has its own guard, NOT AuthGuard,
            since AuthGuard would redirect away from /onboarding
            for users without an org (chicken-and-egg problem) */}
        <Route
          path="/onboarding"
          element={
            <OnboardingGuard>
              <OnboardingPage />
            </OnboardingGuard>
          }
        />

        {/* Protected routes — require auth AND an existing org */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/projects"
          element={
            <AuthGuard>
              <ProjectsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <AuthGuard>
              <ProjectDetailPage />
            </AuthGuard>
          }
        />
        <Route
          path="/calendar"
          element={
            <AuthGuard>
              <CalendarPage />
            </AuthGuard>
          }
        />
        <Route
          path="/organization/members"
          element={
            <AuthGuard>
              <OrganizationMembersPage />
            </AuthGuard>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <AuthGuard>
              <MyTasksPage />
            </AuthGuard>
          }
        />
        <Route
          path="/notifications"
          element={
            <AuthGuard>
              <NotificationsPage />
            </AuthGuard>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}