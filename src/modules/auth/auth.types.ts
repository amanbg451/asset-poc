export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
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