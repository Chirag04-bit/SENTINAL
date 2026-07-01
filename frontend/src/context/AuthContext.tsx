// ─── SENTINEL AuthContext ─────────────────────────────────────────────────────
// Global authentication state and actions.
// Every component can call useAuth() instead of prop-drilling user/role/token.
//
// Responsibilities:
//   • Store the current user and JWT token (persisted to localStorage)
//   • Expose login(), logout(), and hasRole() helpers
//   • Automatically restore session on page refresh
//
// Usage:
//   const { user, login, logout, isAuthenticated } = useAuth();

import {
  createContext, useContext, useState, useCallback,
  useEffect, type ReactNode,
} from 'react';
import type { User } from '../types';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
}

interface AuthActions {
  login:   (user: User, token: string) => void;
  logout:  () => void;
  hasRole: (role: 'user' | 'admin' | 'analyst') => boolean;
}

type AuthContextType = AuthState & AuthActions;

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true while restoring session

  // ── Restore session from localStorage on first load ──────────────────────
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser  = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback((newUser: User, newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
    setToken(newToken);
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  }, []);

  // ── hasRole ───────────────────────────────────────────────────────────────
  const hasRole = useCallback(
    (role: 'user' | 'admin' | 'analyst') => user?.role === role,
    [user],
  );

  return (
    <AuthContext.Provider value={{
      user, token,
      isAuthenticated: !!user && !!token,
      isLoading,
      login, logout, hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access auth state and actions from any component.
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
