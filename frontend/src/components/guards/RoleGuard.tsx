// ─── SENTINEL RoleGuard ───────────────────────────────────────────────────────
// Restricts access to routes based on user role.
// Shows a 403-style screen if the user's role doesn't match.
//
// Usage (in App.tsx):
//   <Route path="/admin" element={
//     <AuthGuard>
//       <RoleGuard allowedRoles={['admin', 'analyst']}>
//         <AdminDashboard />
//       </RoleGuard>
//     </AuthGuard>
//   } />

import { type ReactNode } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface RoleGuardProps {
  children:     ReactNode;
  allowedRoles: UserRole[];
}

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();

  // Demo mode: bypass role check
  if (DEMO_MODE) return <>{children}</>;

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-fade-in">
        <div className="card border-danger/20 bg-danger/5 p-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-danger/15 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400 mb-2">
            You do not have permission to view this page.
          </p>
          <p className="text-xs text-slate-600 mb-6">
            Required role: <strong className="text-white">{allowedRoles.join(' or ')}</strong>
            {user && <> · Your role: <strong className="text-warning">{user.role}</strong></>}
          </p>
          <button onClick={() => window.history.back()} className="btn-ghost">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
