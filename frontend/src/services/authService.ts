// ─── SENTINEL Auth Service ────────────────────────────────────────────────────
// All authentication API calls live here.
//
// Current state:  Returns mock responses (simulates backend)
// Phase 7 swap:   Uncomment the real API calls below each mock block
//
// Endpoints (Phase 5):
//   POST /auth/login    → { access_token, user }
//   POST /auth/register → { access_token, user }
//   POST /auth/logout   → 204 No Content

import type { User } from '../types';
import { post } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface RegisterRequest {
  name:     string;
  email:    string;
  password: string;
}

export interface AuthResponse {
  user:          User;
  access_token:  string;
  token_type:    'bearer';
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticates a user and returns a JWT token + user object.
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  return post<AuthResponse>('/auth/login', credentials);
};

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Creates a new account and returns a JWT token + user object.
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  return post<AuthResponse>('/auth/register', data);
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Invalidates the current session on the server.
 */
export const logout = async (): Promise<void> => {
  await post('/auth/logout');
};
