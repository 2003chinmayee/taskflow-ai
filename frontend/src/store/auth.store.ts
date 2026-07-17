import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/authApi';
import type { User, LoginRequest, RegisterRequest } from '../types/auth.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (fields: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (payload: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login(payload);
          const { accessToken, refreshToken, user } = res.data.data;
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false, error: null });
        } catch (err: any) {
          const message = err?.response?.data?.message ?? 'Login failed. Please try again.';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (payload: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.register(payload);
          const { accessToken, refreshToken, user } = res.data.data;
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false, error: null });
        } catch (err: any) {
          const message = err?.response?.data?.message ?? 'Registration failed. Please try again.';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: () => {
  set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null });
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('taskflow-org');
},

      updateUser: (fields: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
        })),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);