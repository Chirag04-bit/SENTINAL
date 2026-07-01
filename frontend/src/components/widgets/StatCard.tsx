import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: number;        // percentage change
  description?: string; // "What does this show?"
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'accent';
  animate?: boolean;
}

const VARIANT_STYLES = {
  default: 'border-white/7',
  danger:  'border-danger/20  bg-danger/5',
  success: 'border-success/20 bg-success/5',
  warning: 'border-warning/20 bg-warning/5',
  accent:  'border-accent/20  bg-accent/5',
};

export default function StatCard({
  title, value, subtitle, icon, iconBg = 'bg-primary/15',
  trend, description, variant = 'default', animate = true,
}: StatCardProps) {
  const trendPositive = (trend ?? 0) >= 0;

  return (
    <div className={`stat-card ${VARIANT_STYLES[variant]} hover:-translate-y-0.5`}>
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold
            ${trendPositive ? 'text-success' : 'text-danger'}`}>
            {trendPositive
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />
            }
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-1">{title}</p>
        <p className={`text-2xl font-bold text-white ${animate ? 'animate-slide-up' : ''}`}>
          {value}
        </p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Explanation tooltip */}
      {description && (
        <div className="flex items-start gap-1.5 pt-1 border-t border-white/5">
          <span className="text-[10px] text-slate-600 leading-relaxed">
            ❓ <span className="italic">{description}</span>
          </span>
        </div>
      )}
    </div>
  );
}
