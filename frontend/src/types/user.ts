export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  language: "uk" | "en" | "ru";
  avatar: string | null;
  phone: string;
  bio: string;
  timezone: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  language?: string;
}
