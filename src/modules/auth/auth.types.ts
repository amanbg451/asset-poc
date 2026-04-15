// src/modules/auth/auth.types.ts
import { LoginInput, RegisterInput } from './auth.validators';

// Re-export Zod inferred types
export type { LoginInput, RegisterInput };

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
}

export interface UserPayload {
  id: number;
  email: string;
  role: string;
}