export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  jobTitle: string | null;
  theme: 'DARK' | 'LIGHT';
  emailVerified: boolean;
  onboardingStep: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}