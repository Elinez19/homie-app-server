import { z } from "zod";

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phoneNumber: z.string().optional(),
  role: z.enum(["CUSTOMER", "ARTISAN", "ADMIN"]).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const userVerificationSchema = z.object({
  code: z.string().min(6).max(6)
});

export const logoutSchema = z.object({
  refreshToken: z.string()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8)
});

export const requestAccessTokenSchema = z.object({
  refreshToken: z.string()
});

export const registerArtisanSchema = z.object({
  businessName: z.string().min(2),
  businessLicense: z.string(),
  taxId: z.string().optional(),
  serviceCategories: z.array(z.string()),
  serviceAreas: z.array(z.string()),
  description: z.string().optional(),
  hourlyRate: z.number().optional(),
  yearsOfExperience: z.number().optional(),
  qualifications: z.array(z.string()).optional()
});

// Artisan Authentication Schemas
export const artisanRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phoneNumber: z.string().optional(),
  businessName: z.string().min(2),
  businessLicense: z.string(),
  taxId: z.string().optional(),
  serviceCategories: z.array(z.string()),
  serviceAreas: z.array(z.string()),
  description: z.string().optional(),
  hourlyRate: z.number().optional(),
  yearsOfExperience: z.number().optional(),
  qualifications: z.array(z.string()).optional(),
  insuranceInfo: z.string().optional(),
  workingHours: z.string().optional(),
  maxJobDistance: z.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional()
});

export const artisanLoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const artisanVerificationSchema = z.object({
  code: z.string().min(6).max(6)
});

export const artisanLogoutSchema = z.object({
  refreshToken: z.string()
});

export const artisanForgotPasswordSchema = z.object({
  email: z.string().email()
});

export const artisanResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8)
});

export const artisanRequestAccessTokenSchema = z.object({
  refreshToken: z.string()
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserVerificationInput = z.infer<typeof userVerificationSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RequestAccessTokenInput = z.infer<typeof requestAccessTokenSchema>;
export type RegisterArtisanInput = z.infer<typeof registerArtisanSchema>;
export type ArtisanRegisterInput = z.infer<typeof artisanRegisterSchema>;
export type ArtisanLoginInput = z.infer<typeof artisanLoginSchema>;
export type ArtisanVerificationInput = z.infer<typeof artisanVerificationSchema>;
export type ArtisanLogoutInput = z.infer<typeof artisanLogoutSchema>;
export type ArtisanForgotPasswordInput = z.infer<typeof artisanForgotPasswordSchema>;
export type ArtisanResetPasswordInput = z.infer<typeof artisanResetPasswordSchema>;
export type ArtisanRequestAccessTokenInput = z.infer<typeof artisanRequestAccessTokenSchema>;
