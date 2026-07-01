// ─── SENTINEL AlertContext ────────────────────────────────────────────────────
// Global alert notification state shared across all pages.
//
// Responsibilities:
//   • Track unread alert count (shown in TopBar badge)
//   • Provide markAllRead() action
//   • In Phase 7, this will receive real-time alerts from WebSocket
//
// Usage:
//   const { unreadCount, markAllRead } = useAlertContext();

import {
  createContext, useContext, useState, useCallback, type ReactNode,
} from 'react';
import { MOCK_ALERTS } from '../data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AlertContextType {
  unreadCount:  number;
  markAllRead:  () => void;
  incrementCount: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AlertContext = createContext<AlertContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AlertProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(
    () => MOCK_ALERTS.filter(a => a.status === 'open').length,
  );

  const markAllRead = useCallback(() => setUnreadCount(0), []);

  // Called by the live stream simulator when a new critical event arrives
  const incrementCount = useCallback(() => setUnreadCount(n => n + 1), []);

  return (
    <AlertContext.Provider value={{ unreadCount, markAllRead, incrementCount }}>
      {children}
    </AlertContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAlertContext(): AlertContextType {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlertContext must be used inside <AlertProvider>');
  return ctx;
}
