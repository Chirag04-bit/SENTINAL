import { get } from './api';
import type { DashboardStats, AlertTrendPoint, RiskDistribution, ThreatTypeCount, HourlyHeatmapPoint } from '../types';

// ─── APIs ─────────────────────────────────────────────────────────────────────

/**
 * Fetches general system KPI card statistics (Admin only)
 */
export const getAnalyticsSummary = async (): Promise<DashboardStats> => {
  const res = await get<any>('/analytics/summary');
  return {
    totalEvents:      res.total_alerts * 2 + res.events_today,
    totalAlerts:      res.total_alerts,
    openAlerts:       res.open_alerts,
    criticalAlerts:   res.critical_alerts,
    totalUsers:       res.total_users,
    activeUsers:      res.total_users,
    flaggedUsers:     res.critical_alerts,
    safeUsers:        Math.max(0, res.total_users - res.critical_alerts),
    systemHealth:     94,
    modelConfidence:  Math.round(res.model_accuracy),
    eventsPerMinute:  res.events_per_min,
    resolvedToday:    res.total_alerts - res.open_alerts,
  };
};

/**
 * Fetches daily alert volume counts for the trend line charts
 */
export const getAlertTrends = async (): Promise<AlertTrendPoint[]> => {
  return get<AlertTrendPoint[]>('/analytics/trends');
};

/**
 * Fetches breakdown of monitored accounts per risk tier
 */
export const getRiskDistribution = async (): Promise<RiskDistribution[]> => {
  return get<RiskDistribution[]>('/analytics/risk-distribution');
};

/**
 * Fetches volume counts per threat/intrusion type
 */
export const getThreatTypes = async (): Promise<ThreatTypeCount[]> => {
  return get<ThreatTypeCount[]>('/analytics/threat-types');
};

/**
 * Fetches condensed hourly heatmap metrics for security logs
 */
export const getHourlyActivity = async (): Promise<HourlyHeatmapPoint[]> => {
  return get<HourlyHeatmapPoint[]>('/analytics/hourly-activity');
};
