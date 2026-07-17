/**
 * useAuth.ts
 *
 * PURPOSE:
 * A custom React hook that gives components easy access to
 * authentication actions — login, register, logout.
 *
 * WHY A HOOK AND NOT JUST THE STORE DIRECTLY?
 * The store handles DATA (saving tokens, user info).
 * This hook handles BEHAVIOUR (redirecting, showing toasts).
 * Pages stay clean — they just call login() and everything happens.
 *
 * HOW IT CONNECTS:
 * LoginPage → useAuth() → auth.store.ts → authApi.ts → Backend
 *
 * TYPESCRIPT TEACHING:
 * This file uses "void" return type — meaning the function
 * returns nothing. Just does its job and finishes.
 * In JavaScript you would never write return types at all.
 * In TypeScript, being explicit prevents bugs.
 */

import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth.store';
import type { LoginPayload, RegisterPayload } from '../api/authApi';

export const useAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pull actions and state from the store
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  } = useAuthStore();

  // ── Handle Login ───────────────────────────────────────────────
  // Calls the store login action.
  // On success → shows toast + redirects to /projects
  // On failure → store already saved the error, we show a toast
  const handleLogin = async (payload: LoginPayload): Promise<void> => {
    try {
      await login(payload);
      toast.success('Welcome back!');
      const redirect = searchParams.get('redirect');
      navigate(redirect ? redirect : '/projects');
    } catch {
      // error message is already in store.error
      // we also show a toast for immediate feedback
      toast.error(error ?? 'Login failed. Please try again.');
    }
  };

  // ── Handle Register ────────────────────────────────────────────
  const handleRegister = async (payload: RegisterPayload): Promise<void> => {
    try {
      await register(payload);
      toast.success('Account created! Welcome to TaskFlow.');
      const redirect = searchParams.get('redirect');
      navigate(redirect ? redirect : '/projects');
    } catch {
      toast.error(error ?? 'Registration failed. Please try again.');
    }
  };

  // ── Handle Logout ──────────────────────────────────────────────
  // Clears store + localStorage, redirects to login
  const handleLogout = (): void => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  // Return everything the component needs
  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions — note we return handle* versions, not raw store actions
    // This way pages always get navigation + toasts automatically
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
    clearError,
  };
};