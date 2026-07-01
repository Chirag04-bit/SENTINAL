// ─── SENTINEL Alert Service ───────────────────────────────────────────────────
// All alert-related API calls.
//
// Phase 7 swap: Uncomment real API calls, remove mock returns.
//
// Endpoints (Phase 5):
//   GET   /alerts             → Alert[]
//   GET   /alerts/{id}        → Alert
//   PATCH /alerts/{id}/resolve → Alert
//   PATCH /alerts/{id}/dismiss → Alert

import type { Alert, RiskLevel, AlertStatus, AlertType } from '../types';
import { MOCK_ALERTS } from '../data/mockData';
// import { get, patch } from './api';  ← Phase 7: uncomment

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
}

// ─── Get all alerts ───────────────────────────────────────────────────────────

/**
 * Fetches paginated, filtered alerts.
 * Phase 7: return get<PaginatedAlerts>('/alerts', filters);
 */
export const getAlerts = async (
  filters: AlertFiltersDTO = {},
): Promise<PaginatedAlerts> => {
  await new Promise(r => setTimeout(r, 300));

  let data = [...MOCK_ALERTS];
  if (filters.severity) data = data.filter(a => a.severity === filters.severity);
  if (filters.status)   data = data.filter(a => a.status   === filters.status);
  if (filters.type)     data = data.filter(a => a.type     === filters.type);

  const page  = filters.page  ?? 1;
  const limit = filters.limit ?? 20;
  const start = (page - 1) * limit;

  return {
    data:  data.slice(start, start + limit),
    total: data.length,
    page,
    pages: Math.ceil(data.length / limit),
  };
};

// ─── Get single alert ─────────────────────────────────────────────────────────

/**
 * Fetches a single alert by ID.
 * Phase 7: return get<Alert>(`/alerts/${id}`);
 */
export const getAlertById = async (id: string): Promise<Alert | null> => {
  await new Promise(r => setTimeout(r, 200));
  return MOCK_ALERTS.find(a => a.id === id) ?? null;
};

// ─── Resolve alert ────────────────────────────────────────────────────────────

/**
 * Marks an alert as resolved.
 * Phase 7: return patch<Alert>(`/alerts/${id}/resolve`);
 */
export const resolveAlert = async (id: string): Promise<Alert> => {
  await new Promise(r => setTimeout(r, 400));
  const alert = MOCK_ALERTS.find(a => a.id === id);
  if (!alert) throw new Error(`Alert ${id} not found`);
  return { ...alert, status: 'resolved', resolvedAt: new Date().toISOString() };
};

// ─── Dismiss alert ────────────────────────────────────────────────────────────

/**
 * Marks an alert as dismissed.
 * Phase 7: return patch<Alert>(`/alerts/${id}/dismiss`);
 */
export const dismissAlert = async (id: string): Promise<Alert> => {
  await new Promise(r => setTimeout(r, 300));
  const alert = MOCK_ALERTS.find(a => a.id === id);
  if (!alert) throw new Error(`Alert ${id} not found`);
  return { ...alert, status: 'dismissed' };
};
