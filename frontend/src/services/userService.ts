import type { User, ActivityItem, RiskScoreData } from '../types';
import { get, patch } from './api';

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
