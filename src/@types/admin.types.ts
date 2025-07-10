import { UserRole, UserStatus } from '../generated/prisma';

export interface AdminLoginParams {
  email: string;
  password: string;
}

export interface AdminRegisterParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface AdminUpdateParams {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface AdminResponse {
  success: boolean;
  message: string;
  data?: any;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface UserManagementParams {
  userId: string;
  action: 'suspend' | 'activate';
}

export interface AdminManagementParams {
  adminId: string;
  action: 'suspend' | 'activate' | 'delete';
} 