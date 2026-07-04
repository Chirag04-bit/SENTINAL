import type { User, ActivityItem, RiskScoreData } from '../types';
import { get, patch, post } from './api';

// ─── Mapper ───────────────────────────────────────────────────────────────────

export const mapUser = (u: any): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  riskScore: u.risk_score,
  riskLevel: u.risk_level,
  isActive: u.is_active,
  lastLogin: u.last_login || '',
  location: u.location || '',
  device: u.device || '',
  joinedAt: u.joined_at,
  totalAlerts: u.total_alerts,
  openAlerts: u.open_alerts,
  hasCompletedOnboarding: u.has_completed_onboarding,
  connectedSources: u.connected_sources ? (typeof u.connected_sources === 'string' ? JSON.parse(u.connected_sources) : u.connected_sources) : {},
});

// ─── APIs ─────────────────────────────────────────────────────────────────────

/**
 * Fetches monitored user list (Admin only)
 */
export const getUsers = async (page = 1, limit = 20): Promise<{ data: User[]; total: number }> => {
  const res = await get<any>('/users/', { page, limit });
  return {
    data: (res.data || []).map(mapUser),
    total: res.total,
  };
};

/**
 * Updates details of the current logged-in user profile
 */
export const updateProfile = async (updates: Partial<User>): Promise<User> => {
  const res = await patch<any>('/users/me', {
    name: updates.name,
    location: updates.location,
    device: updates.device,
  });
  return mapUser(res);
};

/**
 * Fetches risk level metrics, factors, and trend for current user
 */
export const getMyRiskDetail = async (): Promise<RiskScoreData> => {
  return get<RiskScoreData>('/users/me/risk');
};

/**
 * Fetches recent activity list for current user
 */
export const getMyActivity = async (): Promise<ActivityItem[]> => {
  return get<ActivityItem[]>('/users/me/activity');
};

/**
 * Marks onboarding process as completed
 */
export const completeOnboarding = async (): Promise<void> => {
  await post('/users/me/onboarding/complete');
};

/**
 * Retrieves the user's connection status dictionary
 */
export const getConnectedSources = async (): Promise<Record<string, boolean>> => {
  return get<Record<string, boolean>>('/users/me/sources');
};

/**
 * Updates connection states in the user profile settings
 */
export const updateConnectedSources = async (sources: Record<string, boolean>): Promise<Record<string, boolean>> => {
  const res = await post<any>('/users/me/sources', sources);
  return res.connected_sources;
};

/**
 * Erases all threat events, database alerts, and system audit logs
 */
export const purgeUserData = async (): Promise<void> => {
  await post('/users/me/data/delete');
};

/**
 * Exposes a structured JSON download block of the user profile, event lists, and alerts
 */
export const exportUserData = async (): Promise<any> => {
  return get<any>('/users/me/data/export');
};

export interface AuditLogEntry {
  id: string;
  action: string;
  source: string;
  purpose: string;
  timestamp: string;
}

/**
 * Retrieves the security access audit trail logs
 */
export const getAuditLogs = async (): Promise<AuditLogEntry[]> => {
  return get<AuditLogEntry[]>('/users/me/audit-logs');
};

/**
 * Updates the user's active GPS coordinates in the database
 */
export const updateMyLocation = async (latitude: number, longitude: number): Promise<string> => {
  const res = await post<any>('/users/me/location', { latitude, longitude });
  return res.location;
};
