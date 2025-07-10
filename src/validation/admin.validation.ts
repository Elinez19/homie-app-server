import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const adminRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phoneNumber: z.string().optional()
});

export const adminUpdateSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional()
});

export const adminLogoutSchema = z.object({
  refreshToken: z.string()
});

export const requestAccessTokenSchema = z.object({
  refreshToken: z.string()
});

export const toggleSuspendSchema = z.object({
  action: z.enum(['suspend', 'activate']).optional()
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
export type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;
export type AdminLogoutInput = z.infer<typeof adminLogoutSchema>;
export type RequestAccessTokenInput = z.infer<typeof requestAccessTokenSchema>;
export type ToggleSuspendInput = z.infer<typeof toggleSuspendSchema>; 