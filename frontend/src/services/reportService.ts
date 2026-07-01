// ─── SENTINEL Report Service ──────────────────────────────────────────────────
// Report generation and download operations.
// Phase 7: POST /reports/generate, GET /reports

import type { Report } from '../types';
import { MOCK_REPORTS } from '../data/mockData';
// import { get, post } from './api';  ← Phase 7: uncomment

export interface GenerateReportRequest {
  type:     'daily' | 'weekly' | 'monthly' | 'custom';
  dateFrom: string;
  dateTo:   string;
  format:   'pdf' | 'csv';
}

/**
 * Fetches list of previously generated reports.
 * Phase 7: return get<Report[]>('/reports');
 */
export const getReports = async (): Promise<Report[]> => {
  await new Promise(r => setTimeout(r, 300));
  return MOCK_REPORTS;
};

/**
 * Generates a new report and returns its metadata.
 * Phase 7: return post<Report>('/reports/generate', request);
 */
export const generateReport = async (request: GenerateReportRequest): Promise<Report> => {
  await new Promise(r => setTimeout(r, 1500));
  return {
    id:             `RPT-${Date.now()}`,
    title:          `${request.type.charAt(0).toUpperCase() + request.type.slice(1)} Security Report`,
    type:           request.type,
    dateFrom:       request.dateFrom,
    dateTo:         request.dateTo,
    generatedAt:    new Date().toISOString(),
    generatedBy:    'Current User',
    format:         request.format,
    totalAlerts:    87,
    criticalAlerts: 12,
    summary:        'Report generated successfully. All threat data included.',
  };
};

// ─── User Service ─────────────────────────────────────────────────────────────
// Keeping user service in same file for simplicity — will split if it grows.

import type { User } from '../types';
import { MOCK_USERS } from '../data/mockData';

/**
 * Fetches all users (admin only).
 * Phase 7: return get<User[]>('/users');
 */
export const getUsers = async (): Promise<User[]> => {
  await new Promise(r => setTimeout(r, 400));
  return MOCK_USERS;
};

/**
 * Updates current user profile.
 * Phase 7: return patch<User>('/users/me', updates);
 */
export const updateProfile = async (updates: Partial<User>): Promise<User> => {
  await new Promise(r => setTimeout(r, 600));
  return { ...MOCK_USERS[0], ...updates };
};
