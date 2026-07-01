// ─── SENTINEL Formatters ──────────────────────────────────────────────────────
// Pure functions for formatting data for display.
// No side effects. No React. Fully testable.

import type { RiskLevel } from '../types';
import { RISK_THRESHOLDS, RISK_COLORS } from './constants';

// ─── Date & Time ──────────────────────────────────────────────────────────────

/**
 * Returns a human-readable relative time string.
 * @example timeAgo('2026-06-29T10:00:00Z') → "3 hours ago"
 */
export const timeAgo = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60)   return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)   return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)     return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)      return `${days}d ago`;
  return formatDate(isoString);
};

/**
 * Formats ISO date to a readable date string.
 * @example formatDate('2026-06-29T10:00:00Z') → "Jun 29, 2026"
 */
export const formatDate = (isoString: string): string =>
  new Date(isoString).toLocaleDateString('en', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

/**
 * Formats ISO date to date + time.
 * @example formatDateTime('2026-06-29T10:30:00Z') → "Jun 29, 2026 · 10:30 AM"
 */
export const formatDateTime = (isoString: string): string => {
  const d = new Date(isoString);
  return `${formatDate(isoString)} · ${d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`;
};

/**
 * Formats time only.
 * @example formatTime('2026-06-29T10:30:45Z') → "10:30:45 AM"
 */
export const formatTime = (isoString: string): string =>
  new Date(isoString).toLocaleTimeString('en', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

// ─── Numbers & Currency ───────────────────────────────────────────────────────

/**
 * Formats a number as Indian Rupees.
 * @example formatINR(12500) → "₹12,500"
 */
export const formatINR = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

/**
 * Formats a number with commas.
 * @example formatNumber(1000000) → "1,000,000"
 */
export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('en-IN').format(n);

/**
 * Formats a percentage.
 * @example formatPercent(0.845) → "84.5%"
 */
export const formatPercent = (ratio: number, decimals = 1): string =>
  `${(ratio * 100).toFixed(decimals)}%`;

/**
 * Abbreviates large numbers.
 * @example abbreviate(1500000) → "1.5M"
 */
export const abbreviate = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

// ─── Risk ─────────────────────────────────────────────────────────────────────

/**
 * Returns the risk level string for a given score.
 * @example getRiskLevel(75) → "high"
 */
export const getRiskLevel = (score: number): RiskLevel => {
  if (score <= RISK_THRESHOLDS.LOW.max)      return 'low';
  if (score <= RISK_THRESHOLDS.MEDIUM.max)   return 'medium';
  if (score <= RISK_THRESHOLDS.HIGH.max)     return 'high';
  return 'critical';
};

/**
 * Returns Tailwind color classes for a risk level.
 */
export const getRiskColors = (level: RiskLevel) => RISK_COLORS[level];

/**
 * Returns the hex color for chart rendering.
 */
export const getRiskHex = (level: RiskLevel): string => RISK_COLORS[level].hex;

/**
 * Formats a risk score with its level label.
 * @example formatRisk(85) → "85 · Critical"
 */
export const formatRisk = (score: number): string => {
  const level = getRiskLevel(score);
  return `${score} · ${level.charAt(0).toUpperCase() + level.slice(1)}`;
};

// ─── Strings ──────────────────────────────────────────────────────────────────

/**
 * Capitalizes the first letter of a string.
 */
export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Truncates a string to maxLength and appends '…'.
 */
export const truncate = (s: string, maxLength = 40): string =>
  s.length > maxLength ? `${s.slice(0, maxLength)}…` : s;

/**
 * Extracts initials from a full name.
 * @example getInitials('Aryan Sharma') → "AS"
 */
export const getInitials = (name: string): string =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

/**
 * Generates a consistent avatar background color from a string.
 */
export const getAvatarColor = (name: string): string => {
  const colors = ['from-primary to-accent','from-secondary to-primary','from-accent to-success',
                  'from-warning to-danger','from-success to-accent'];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};
