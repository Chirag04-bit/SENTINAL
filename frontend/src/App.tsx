import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ─── Context Providers ────────────────────────────────────────────────────────
import { AuthProvider }  from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

// ─── Guards ───────────────────────────────────────────────────────────────────
import AuthGuard from './components/guards/AuthGuard';
import RoleGuard from './components/guards/RoleGuard';

// ─── Error Boundary ───────────────────────────────────────────────────────────
import ErrorBoundary from './components/ui/ErrorBoundary';

// ─── Pages ────────────────────────────────────────────────────────────────────
import Landing       from './pages/Landing';
import Login         from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Alerts        from './pages/Alerts';
import Analytics     from './pages/Analytics';
import Reports       from './pages/Reports';
import Settings      from './pages/Settings';

// ─── Constants ────────────────────────────────────────────────────────────────
import { ROUTES } from './utils/constants';

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    // 1. AuthProvider — global auth state (must be outermost)
    <AuthProvider>
      {/* 2. AlertProvider — global unread alert state */}
      <AlertProvider>
        <BrowserRouter>
          {/* 3. Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0F1629',
                color: '#F8FAFC',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                fontSize: '13px',
              },
              duration: 4000,
            }}
          />

          {/* 4. Route definitions wrapped in ErrorBoundary */}
          <ErrorBoundary>
            <Routes>
              {/* ── Public Routes ── */}
              <Route path={ROUTES.HOME}  element={<Landing />} />
              <Route path={ROUTES.LOGIN} element={<Login />} />

              {/* ── Admin Routes (requires auth + admin role) ── */}
              <Route path={ROUTES.ADMIN_DASHBOARD} element={
                <AuthGuard><RoleGuard allowedRoles={['admin','analyst']}>
                  <ErrorBoundary><AdminDashboard /></ErrorBoundary>
                </RoleGuard></AuthGuard>
              } />
              <Route path={ROUTES.ADMIN_ALERTS} element={
                <AuthGuard><RoleGuard allowedRoles={['admin','analyst']}>
                  <ErrorBoundary><Alerts role="admin" /></ErrorBoundary>
                </RoleGuard></AuthGuard>
              } />
              <Route path={ROUTES.ADMIN_ANALYTICS} element={
                <AuthGuard><RoleGuard allowedRoles={['admin','analyst']}>
                  <ErrorBoundary><Analytics role="admin" /></ErrorBoundary>
                </RoleGuard></AuthGuard>
              } />
              <Route path={ROUTES.ADMIN_REPORTS} element={
                <AuthGuard><RoleGuard allowedRoles={['admin','analyst']}>
                  <ErrorBoundary><Reports role="admin" /></ErrorBoundary>
                </RoleGuard></AuthGuard>
              } />
              <Route path={ROUTES.ADMIN_SETTINGS} element={
                <AuthGuard><RoleGuard allowedRoles={['admin','analyst']}>
                  <ErrorBoundary><Settings role="admin" /></ErrorBoundary>
                </RoleGuard></AuthGuard>
              } />

              {/* ── User Routes (requires auth) ── */}
              <Route path={ROUTES.USER_DASHBOARD} element={
                <AuthGuard>
                  <ErrorBoundary><UserDashboard /></ErrorBoundary>
                </AuthGuard>
              } />
              <Route path={ROUTES.USER_ALERTS} element={
                <AuthGuard>
                  <ErrorBoundary><Alerts role="user" /></ErrorBoundary>
                </AuthGuard>
              } />
              <Route path={ROUTES.USER_ANALYTICS} element={
                <AuthGuard>
                  <ErrorBoundary><Analytics role="user" /></ErrorBoundary>
                </AuthGuard>
              } />
              <Route path={ROUTES.USER_REPORTS} element={
                <AuthGuard>
                  <ErrorBoundary><Reports role="user" /></ErrorBoundary>
                </AuthGuard>
              } />
              <Route path={ROUTES.USER_SETTINGS} element={
                <AuthGuard>
                  <ErrorBoundary><Settings role="user" /></ErrorBoundary>
                </AuthGuard>
              } />

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </AlertProvider>
    </AuthProvider>
  );
}
