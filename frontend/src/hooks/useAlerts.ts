// ─── useAlerts ────────────────────────────────────────────────────────────────
// Fetches, filters, and manages alert state.
// Phase 7: Replace mock data source with alertService.getAlerts() API call.
//
// Usage:
//   const { alerts, filters, setFilters, loading, error } = useAlerts();

import { useState, useMemo } from 'react';
import { MOCK_ALERTS } from '../data/mockData';
import type { Alert, RiskLevel, AlertStatus, AlertType } from '../types';
import { useDebounce } from './useDebounce';

export interface AlertFilters {
  search:   string;
  severity: RiskLevel | 'all';
  status:   AlertStatus | 'all';
  type:     AlertType | 'all';
}

const DEFAULT_FILTERS: AlertFilters = {
  search:   '',
  severity: 'all',
  status:   'all',
  type:     'all',
};

interface UseAlertsResult {
  alerts:     Alert[];
  allAlerts:  Alert[];
  filters:    AlertFilters;
  setFilters: (f: Partial<AlertFilters>) => void;
  clearFilters: () => void;
  loading:    boolean;
  error:      string | null;
  totalCount: number;
  openCount:  number;
  criticalCount: number;
}

export function useAlerts(): UseAlertsResult {
  const [filters, _setFilters]  = useState<AlertFilters>(DEFAULT_FILTERS);
  // Phase 7: Replace with API state
  const [loading]  = useState(false);
  const [error]    = useState<string | null>(null);

  const debouncedSearch = useDebounce(filters.search, 300);

  const setFilters = (partial: Partial<AlertFilters>) =>
    _setFilters(prev => ({ ...prev, ...partial }));

  const clearFilters = () => _setFilters(DEFAULT_FILTERS);

  // ── Filtering logic ───────────────────────────────────────────────────────
  const alerts = useMemo(() => {
    return MOCK_ALERTS.filter(a => {
      if (filters.severity !== 'all' && a.severity !== filters.severity) return false;
      if (filters.status   !== 'all' && a.status   !== filters.status)   return false;
      if (filters.type     !== 'all' && a.type     !== filters.type)     return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        return (
          a.title.toLowerCase().includes(q)    ||
          a.userName.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filters.severity, filters.status, filters.type, debouncedSearch]);

  return {
    alerts,
    allAlerts:    MOCK_ALERTS,
    filters,
    setFilters,
    clearFilters,
    loading,
    error,
    totalCount:   MOCK_ALERTS.length,
    openCount:    MOCK_ALERTS.filter(a => a.status === 'open').length,
    criticalCount:MOCK_ALERTS.filter(a => a.severity === 'critical').length,
  };
}
