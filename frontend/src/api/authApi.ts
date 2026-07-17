/**
 * authApi.ts
 *
 * PURPOSE:
 * Contains every API call related to authentication.
 * Login, Register, Logout — all in one place.
 *
 * WHY HERE AND NOT IN services/auth.service.ts?
 * We deleted auth.service.ts because it used a different pattern.
 * Now ALL api calls live in src/api/ folder.
 * One folder, one pattern, no confusion.
 *
 * HOW IT CONNECTS:
 * authApi.ts → uses apiClient from lib/axios.ts → hits Spring Boot backend
 */

import apiClient from '../lib/axios';

// ─── TypeScript Interfaces ─────────────────────────────────────────
// These define the SHAPE of data we send and receive.
// If you mistype a field name, TypeScript will warn you immediately.
// Interview tip: "Interfaces are contracts — they guarantee structure."

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  jobTitle: string | null;
  theme: 'DARK' | 'LIGHT';
  emailVerified: boolean;
  onboardingStep: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Auth API Object ───────────────────────────────────────────────
// Plain object with functions — one function per endpoint.
// No classes, no complexity. This is the modern React pattern.

export const authApi = {

  /**
   * POST /api/v1/auth/login
   * Sends email + password, receives JWT tokens + user info.
   */
  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', payload),

  /**
   * POST /api/v1/auth/register
   * Creates a new user account, receives JWT tokens + user info.
   */
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', payload),

  /**
   * POST /api/v1/auth/logout
   * Tells the backend to invalidate the token.
   * We wrap in try/catch in the store — even if this fails,
   * we still clear localStorage and redirect to login.
   */
  logout: () =>
    apiClient.post('/api/v1/auth/logout'),

  /**
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<void>>('/api/v1/auth/forgot-password', { email }),

  /**
   * POST /api/v1/auth/reset-password
   */
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<ApiResponse<void>>('/api/v1/auth/reset-password', { token, newPassword }),

};