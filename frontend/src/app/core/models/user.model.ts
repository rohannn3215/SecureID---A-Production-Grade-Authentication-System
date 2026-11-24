export type AuthProvider = 'LOCAL' | 'GOOGLE';
export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  imageUrl?: string | null;
  provider: AuthProvider;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface AdminStats {
  totalUsers: number;
  googleUsers: number;
  localUsers: number;
  adminUsers: number;
}
