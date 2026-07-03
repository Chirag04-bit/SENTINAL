import axios from 'axios';
import type { Report } from '../types';
import { get, post } from './api';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GenerateReportRequest {
  type:     'daily' | 'weekly' | 'monthly' | 'custom';
  dateFrom: string;
  dateTo:   string;
  format:   'pdf' | 'csv';
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

export const mapReport = (r: any): Report => ({
  id:              r.id,
  title:           r.title,
  type:            r.type as any,
  dateFrom:        r.date_from,
  dateTo:          r.date_to,
  generatedAt:     r.generated_at,
  generatedBy:     r.generated_by || 'System',
  format:          r.format as any,
  totalAlerts:     r.total_alerts,
  criticalAlerts:  r.critical_alerts,
  summary:         r.summary || '',
});

// ─── APIs ─────────────────────────────────────────────────────────────────────

/**
 * Fetches list of previously generated reports.
 */
export const getReports = async (): Promise<Report[]> => {
  const res = await get<any[]>('/reports/');
  return res.map(mapReport);
};

/**
 * Generates a new report and returns its metadata.
 */
export const generateReport = async (request: GenerateReportRequest): Promise<Report> => {
  const res = await post<any>('/reports/generate', {
    type: request.type,
    date_from: request.dateFrom,
    date_to: request.dateTo,
    format: request.format,
  });
  return mapReport(res);
};

/**
 * Downloads a generated report file securely using the active user's JWT.
 */
export const downloadReportFile = async (reportId: string, title: string, format: string): Promise<void> => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  const response = await axios.get(`${API_BASE_URL}/reports/${reportId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob',
  });
  
  const blob = new Blob([response.data], {
    type: format.toLowerCase() === 'pdf' ? 'application/pdf' : 'text/csv'
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Format filename cleanly
  const safeTitle = title.replace(/\s+/g, '_');
  link.setAttribute('download', `${safeTitle}.${format.toLowerCase()}`);
  
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
