import { UserRole } from '../generated/prisma';

export interface OAuthProfile {
  id: string;
  displayName: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails?: Array<{
    value: string;
    verified?: boolean;
  }>;
  photos?: Array<{
    value: string;
  }>;
  provider: string;
}

export interface OAuthUserData {
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: UserRole;
  isEmailVerified: boolean;
}

export interface OAuthCallbackParams {
  user: any;
  role?: UserRole;
}

export interface OAuthResponse {
  success: boolean;
  message: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  user?: any;
} 