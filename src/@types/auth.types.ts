import { UserRole } from '../generated/prisma';

export interface RegisterUserParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface VerifyUserParams {
  userId: string;
  code: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  token: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}