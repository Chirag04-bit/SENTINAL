import type { Alert, RiskLevel, AlertStatus, AlertType } from '../types';
import { get, patch } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlertFiltersDTO {
  severity?: RiskLevel;
  status?:   AlertStatus;
  type?:     AlertType;
  page?:     number;
  limit?:    number;
}

export interface PaginatedAlerts {
  data:  Alert[];
  total: number;
  page:  number;
  pages: number;
  open:  number;
  critical: number;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

export const mapAlert = (a: any): Alert => ({
  id: a.id,
  userId: a.user_id,
  userName: a.user_name || 'Monitored User',
  userEmail: a.user_email || '',
  eventId: a.event_id || '',
  title: a.title,
  description: a.description || '',
  type: a.type,
  severity: a.severity as RiskLevel,
  riskScore: a.risk_score,
  confidenceScore: a.confidence_score || 91,
  reasons: a.reasons || [a.description || 'Suspicious indicators detected.'],
  recommendedAction: a.recommendation || 'No action required.',
  status: a.status as AlertStatus,
  timestamp: a.created_at,
  resolvedAt: a.resolved_at || undefined,
  ipAddress: a.ip_address || 'N/A',
  device: a.device || 'N/A',
  location: a.location || 'N/A',
  country: a.location ? a.location.split(', ').pop() || 'IN' : 'IN',
  amount: a.amount,
  shapFactors: (a.shap_values || []).map((s: any) => ({
    feature: s.feature || 'unknown',
    label: s.factor || 'Factor',
    value: s.contribution || 0,
    displayValue: s.detail || (s.direction === 'positive' ? 'Increases risk' : 'Reduces risk')
  }))
});

// ─── Get all alerts (Admin) ───────────────────────────────────────────────────

export const getAlerts = async (
  filters: AlertFiltersDTO = {},
): Promise<PaginatedAlerts> => {
  const params: any = {};
  if (filters.severity && (filters.severity as any) !== 'all') params.severity = filters.severity;
  if (filters.status && (filters.status as any) !== 'all') params.status = filters.status;
  if (filters.type && (filters.type as any) !== 'all') params.type = filters.type;
  params.page = filters.page ?? 1;
  params.limit = filters.limit ?? 20;

  const res = await get<any>('/alerts/', params);
  return {
    data: (res.data || []).map(mapAlert),
    total: res.total,
    page: res.page,
    pages: res.pages,
    open: res.open || 0,
    critical: res.critical || 0,
  };
};

// ─── Get user alerts ──────────────────────────────────────────────────────────

export const getMyAlerts = async (
  filters: AlertFiltersDTO = {},
): Promise<PaginatedAlerts> => {
  const params: any = {};
  params.page = filters.page ?? 1;
  params.limit = filters.limit ?? 20;

  const res = await get<any>('/alerts/my', params);
  return {
    data: (res.data || []).map(mapAlert),
    total: res.total,
    page: res.page,
    pages: res.pages,
    open: res.open || 0,
    critical: res.critical || 0,
  };
};

// ─── Get single alert ─────────────────────────────────────────────────────────

export const getAlertById = async (id: string): Promise<Alert | null> => {
  try {
    const res = await get<any>(`/alerts/${id}`);
    return mapAlert(res);
  } catch {
    return null;
  }
};

// ─── Resolve alert ────────────────────────────────────────────────────────────

export const resolveAlert = async (id: string): Promise<void> => {
  await patch(`/alerts/${id}/resolve`);
};

// ─── Dismiss alert ────────────────────────────────────────────────────────────

export const dismissAlert = async (id: string): Promise<void> => {
  await patch(`/alerts/${id}/dismiss`);
};
