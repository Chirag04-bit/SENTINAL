// ─── SENTINEL Constants ───────────────────────────────────────────────────────
// Single source of truth for all magic values.
// Never hardcode these anywhere else — always import from here.

// ─── API ──────────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
export const API_TIMEOUT_MS = 10_000;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const TOKEN_KEY       = 'sentinel_token';
export const USER_KEY        = 'sentinel_user';
export const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 hours

// ─── Risk Score Thresholds ────────────────────────────────────────────────────
export const RISK_THRESHOLDS = {
  LOW:      { min: 0,  max: 30  },
  MEDIUM:   { min: 31, max: 60  },
  HIGH:     { min: 61, max: 80  },
  CRITICAL: { min: 81, max: 100 },
} as const;

// ─── Risk Colors (Tailwind-compatible) ────────────────────────────────────────
export const RISK_COLORS = {
  low:      { text: 'text-success',      bg: 'bg-success/10',      border: 'border-success/20',      hex: '#10B981' },
  medium:   { text: 'text-warning',      bg: 'bg-warning/10',      border: 'border-warning/20',      hex: '#F59E0B' },
  high:     { text: 'text-orange-400',   bg: 'bg-orange-500/10',   border: 'border-orange-500/20',   hex: '#F97316' },
  critical: { text: 'text-danger',       bg: 'bg-danger/10',       border: 'border-danger/20',       hex: '#EF4444' },
} as const;

// ─── Chart Colors ─────────────────────────────────────────────────────────────
export const CHART_COLORS = {
  primary:   '#2563EB',
  accent:    '#06B6D4',
  success:   '#10B981',
  warning:   '#F59E0B',
  danger:    '#EF4444',
  orange:    '#F97316',
  purple:    '#4F46E5',
  muted:     '#334155',
} as const;

export const SEVERITY_CHART_COLORS = {
  low:      CHART_COLORS.success,
  medium:   CHART_COLORS.warning,
  high:     CHART_COLORS.orange,
  critical: CHART_COLORS.danger,
} as const;

// ─── Live Stream ──────────────────────────────────────────────────────────────
export const LIVE_STREAM_INTERVAL_MS = 2_500; // New event every 2.5 seconds
export const LIVE_FEED_MAX_ROWS      = 20;    // Max rows shown in live table

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;

// ─── Alert Status Labels ──────────────────────────────────────────────────────
export const ALERT_STATUS_LABELS = {
  open:      'Open',
  resolved:  'Resolved',
  dismissed: 'Dismissed',
} as const;

// ─── Event Type Labels + Icons ────────────────────────────────────────────────
export const EVENT_TYPE_LABELS: Record<string, string> = {
  fraud:       '💳 Fraud',
  intrusion:   '🌐 Intrusion',
  login:       '🔑 Login',
  transaction: '💰 Transaction',
  system:      '⚙️ System',
};

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME:             '/',
  LOGIN:            '/login',
  ADMIN_DASHBOARD:  '/admin',
  ADMIN_ALERTS:     '/admin/alerts',
  ADMIN_ANALYTICS:  '/admin/analytics',
  ADMIN_REPORTS:    '/admin/reports',
  ADMIN_SETTINGS:   '/admin/settings',
  USER_DASHBOARD:   '/dashboard',
  USER_ALERTS:      '/alerts',
  USER_ANALYTICS:   '/analytics',
  USER_REPORTS:     '/reports',
  USER_SETTINGS:    '/settings',
} as const;
