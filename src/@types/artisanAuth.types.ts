export interface ArtisanRegisterParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  businessName: string;
  businessLicense: string;
  taxId?: string;
  serviceCategories: string[];
  serviceAreas: string[];
  description?: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  qualifications?: string[];
  insuranceInfo?: string;
  workingHours?: string;
  maxJobDistance?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface ArtisanLoginParams {
  email: string;
  password: string;
}

export interface ArtisanVerifyParams {
  artisanId: string;
  code: string;
}

export interface ResetPasswordParams {
  token: string;
  password: string;
}

export interface ArtisanAuthResponse {
  success: boolean;
  message: string;
  data?: any;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
} 