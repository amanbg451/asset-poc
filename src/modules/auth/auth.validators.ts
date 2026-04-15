// src/modules/auth/auth.validators.ts
import { z } from 'zod';

// Define schemas
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .optional(),
  role: z.enum(['admin', 'manager', 'employee', 'viewer'])
    .default('employee')
    .optional(),
});

// Type inference from schemas (automatically generates TypeScript types)
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Validation functions
export function validateLogin(data: unknown) {
  return loginSchema.safeParse(data);
}

export function validateRegister(data: unknown) {
  return registerSchema.safeParse(data);
}