// ─── SENTINEL TypeScript Type Definitions ────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'resolved' | 'dismissed';
export type AlertType = 'fraud' | 'intrusion' | 'login' | 'transaction' | 'system';
export type UserRole = 'user' | 'admin' | 'analyst';
export type ThreatType = 'brute_force' | 'sql_injection' | 'ddos' | 'phishing' | 'card_fraud' | 'account_takeover' | 'data_exfiltration' | 'malware';

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  isActive: boolean;
  lastLogin: string;
  location: string;
  device: string;
  joinedAt: string;
  totalAlerts: number;
  openAlerts: number;
}

// ─── Event ───────────────────────────────────────────────────────────────────
export interface SentinelEvent {
  id: string;
  userId: string;
  userName: string;
  type: AlertType;
  source: string;
  amount?: number;
  ipAddress: string;
  device: string;
  location: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  status: 'normal' | 'suspicious' | 'flagged';
  riskScore: number;
}

// ─── Alert ───────────────────────────────────────────────────────────────────
export interface Alert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventId: string;
  title: string;
  description: string;
  type: AlertType;
  severity: RiskLevel;
  riskScore: number;
  confidenceScore: number;
  reasons: string[];
  recommendedAction: string;
  status: AlertStatus;
  timestamp: string;
  resolvedAt?: string;
  ipAddress: string;
  device: string;
  location: string;
  country: string;
  amount?: number;
  // SHAP / XAI
  shapFactors: ShapFactor[];
}

export interface ShapFactor {
  feature: string;
  label: string;
  value: number;      // SHAP value (positive = increases risk)
  displayValue: string;
}

// ─── Risk Score ───────────────────────────────────────────────────────────────
export interface RiskScoreData {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  trend: number[];   // last 7 days
  updatedAt: string;
}

export interface RiskFactor {
  name: string;
  weight: number;
  signal: boolean;
  description: string;
}

// ─── Stats / KPIs ─────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalEvents: number;
  totalAlerts: number;
  openAlerts: number;
  criticalAlerts: number;
  totalUsers: number;
  activeUsers: number;
  flaggedUsers: number;
  safeUsers: number;
  systemHealth: number;
  modelConfidence: number;
  eventsPerMinute: number;
  resolvedToday: number;
}

// ─── Chart Data ───────────────────────────────────────────────────────────────
export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

export interface AlertTrendPoint {
  date: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
  total: number;
}

export interface HourlyHeatmapPoint {
  day: string;
  hour: number;
  value: number;
}

export interface RiskDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ThreatTypeCount {
  name: string;
  count: number;
  percentage: number;
}

// ─── Report ───────────────────────────────────────────────────────────────────
export interface Report {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  dateFrom: string;
  dateTo: string;
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'csv';
  totalAlerts: number;
  criticalAlerts: number;
  summary: string;
}

// ─── Map Point ────────────────────────────────────────────────────────────────
export interface ThreatMapPoint {
  id: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
  count: number;
  severity: RiskLevel;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  isRead: boolean;
  timestamp: string;
  link?: string;
}

// ─── Activity Timeline ────────────────────────────────────────────────────────
export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  type: AlertType | 'login' | 'logout' | 'settings';
  riskLevel: RiskLevel;
  icon: string;
}
