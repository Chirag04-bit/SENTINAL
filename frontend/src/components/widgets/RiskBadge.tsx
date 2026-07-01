import type { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const CONFIG = {
  low:      { label: 'Low',      className: 'badge-low',      dot: 'bg-success' },
  medium:   { label: 'Medium',   className: 'badge-medium',   dot: 'bg-warning' },
  high:     { label: 'High',     className: 'badge-high',     dot: 'bg-orange-500' },
  critical: { label: 'Critical', className: 'badge-critical', dot: 'bg-danger animate-pulse' },
};

const SIZE = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1',
};

export default function RiskBadge({ level, score, size = 'md', showDot = true }: RiskBadgeProps) {
  const c = CONFIG[level];
  return (
    <span className={`${c.className} ${SIZE[size]} inline-flex items-center gap-1.5`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />}
      {c.label}
      {score !== undefined && <span className="opacity-75 font-mono">· {score}</span>}
    </span>
  );
}
