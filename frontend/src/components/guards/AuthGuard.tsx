// ─── SENTINEL AuthGuard ───────────────────────────────────────────────────────
// Protects any route that requires authentication.
// Redirects unauthenticated users to /login while preserving the intended URL.
//
// Why needed?
//   Without this, anyone can visit /admin or /dashboard directly without logging in.
//   The guard checks AuthContext and redirects before the page renders.
//
// Usage (in App.tsx):
//   <Route path="/dashboard" element={
//     <AuthGuard><UserDashboard /></AuthGuard>
//   } />
//
// Note: In demo mode (VITE_DEMO_MODE=true), the guard is bypassed
//       so users can explore without logging in. This is the current default.

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

interface AuthGuardProps {
  children: ReactNode;
}

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false'; // default: demo on

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While restoring session from localStorage, show skeleton
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center gap-4 flex-col">
        <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Restoring session...</p>
      </div>
    );
  }

  // Demo mode: bypass auth check (remove in production)
  if (DEMO_MODE) return <>{children}</>;

  // Not authenticated: redirect to login, preserve intended path
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
