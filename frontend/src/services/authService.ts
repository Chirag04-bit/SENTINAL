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
import { MOCK_USERS } from '../data/mockData';
// import { post } from './api';   ← Phase 7: uncomment

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
 *
 * Phase 7: Replace mock with:
 *   return post<AuthResponse>('/auth/login', credentials);
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 800));

  // Mock: accept any credentials, return first user
  const user = MOCK_USERS.find(u => u.email === credentials.email) ?? MOCK_USERS[0];
  return {
    user,
    access_token: `mock-jwt-token-${Date.now()}`,
    token_type:   'bearer',
  };
};

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Creates a new account and returns a JWT token + user object.
 *
 * Phase 7: Replace mock with:
 *   return post<AuthResponse>('/auth/register', data);
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  await new Promise(r => setTimeout(r, 1000));

  const newUser: User = {
    id:          `USR-${Date.now()}`,
    name:        data.name,
    email:       data.email,
    role:        'user',
    riskScore:   0,
    riskLevel:   'low',
    isActive:    true,
    lastLogin:   new Date().toISOString(),
    location:    'Unknown',
    device:      'Unknown',
    joinedAt:    new Date().toISOString(),
    totalAlerts: 0,
    openAlerts:  0,
  };

  return {
    user:         newUser,
    access_token: `mock-jwt-token-${Date.now()}`,
    token_type:   'bearer',
  };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Invalidates the current session on the server.
 *
 * Phase 7: Replace mock with:
 *   return post('/auth/logout');
 */
export const logout = async (): Promise<void> => {
  await new Promise(r => setTimeout(r, 200));
  // Server-side token invalidation happens here in Phase 7
};
