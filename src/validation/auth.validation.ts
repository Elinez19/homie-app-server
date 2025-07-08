import { z } from "zod";

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phoneNumber: z.string().optional(),
  role: z.enum(["CUSTOMER", "SERVICE_PROVIDER", "ADMIN"]).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const registerServiceProviderSchema = z.object({
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

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterServiceProviderInput = z.infer<typeof registerServiceProviderSchema>;
