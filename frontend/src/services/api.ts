// ─── SENTINEL API Base Instance ───────────────────────────────────────────────
// Axios instance pre-configured for the SENTINEL backend.
//
// Responsibilities:
//   • Set base URL and timeout from environment variables
//   • Attach JWT token to every request via request interceptor
//   • Handle 401 (token expired) globally via response interceptor
//   • Standardise error objects into a consistent format
//
// Phase 7 activation: Set VITE_API_URL=http://localhost:8000 in .env
// Currently: all service functions return mock data instead of calling Axios.

import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS, TOKEN_KEY } from '../utils/constants';

// ─── Axios instance ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: { 
    'Content-Type': 'application/json'
  },
});

// ─── Request interceptor — attach token ───────────────────────────────────────

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — handle auth errors ───────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage and redirect to login
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(formatError(error));
  },
);

// ─── Error formatter ─────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status:  number;
  detail:  unknown;
}

export const formatError = (error: AxiosError): ApiError => ({
  message: (error.response?.data as any)?.detail ?? error.message ?? 'Unexpected error',
  status:  error.response?.status ?? 0,
  detail:  error.response?.data,
});

// ─── Generic request helpers ─────────────────────────────────────────────────

export const get    = <T>(url: string, params?: object) =>
  apiClient.get<T>(url, { params }).then(r => r.data);

export const post   = <T>(url: string, body?: object) =>
  apiClient.post<T>(url, body).then(r => r.data);

export const patch  = <T>(url: string, body?: object) =>
  apiClient.patch<T>(url, body).then(r => r.data);

export const del    = <T>(url: string) =>
  apiClient.delete<T>(url).then(r => r.data);
