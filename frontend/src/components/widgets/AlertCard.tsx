import { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import type { Alert } from '../../types';
import RiskBadge from './RiskBadge';
import { resolveAlert, dismissAlert } from '../../services/alertService';
import toast from 'react-hot-toast';

interface AlertCardProps {
  alert: Alert;
  expanded?: boolean;
  onResolve?: () => void;
  onDismiss?: () => void;
}

const TYPE_ICON: Record<string, string> = {
  fraud: '💳', intrusion: '🌐', login: '🔑', transaction: '💰', system: '⚙️',
};

const SEVERITY_BORDER: Record<string, string> = {
  low:      'border-l-success',
  medium:   'border-l-warning',
  high:     'border-l-orange-500',
  critical: 'border-l-danger',
};

export default function AlertCard({ alert, expanded: defaultExpanded = false, onResolve, onDismiss }: AlertCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [status, setStatus]     = useState(alert.status);

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const resolve = async () => {
    try {
      await resolveAlert(alert.id);
      setStatus('resolved');
      toast.success('Alert marked as resolved');
      if (onResolve) onResolve();
    } catch (err) {
      toast.error('Failed to resolve alert');
      console.error(err);
    }
  };

  const dismiss = async () => {
    try {
      await dismissAlert(alert.id);
      setStatus('dismissed');
      toast('Alert dismissed', { icon: '🗑️' });
      if (onDismiss) onDismiss();
    } catch (err) {
      toast.error('Failed to dismiss alert');
      console.error(err);
    }
  };

  return (
    <div className={`card border-l-4 ${SEVERITY_BORDER[alert.severity]} transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">{TYPE_ICON[alert.type]}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
              <RiskBadge level={alert.severity} score={alert.riskScore} size="sm" />
              {status === 'resolved' && <span className="badge badge-low text-[10px]">✓ Resolved</span>}
              {status === 'dismissed' && <span className="badge badge-muted text-[10px]">Dismissed</span>}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {alert.userName} · {alert.location} · {timeAgo(alert.timestamp)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs text-slate-600 font-mono">{alert.id}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-white/5 px-4 pb-4 space-y-4 animate-slide-up">

          {/* Meta info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            {[
              { label: 'Device',     value: alert.device },
              { label: 'IP Address', value: alert.ipAddress },
              { label: 'Location',   value: alert.location },
              { label: 'Confidence', value: `${alert.confidenceScore}%` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">{label}</p>
                <p className="text-xs text-slate-300 font-mono mt-0.5 truncate" title={value}>{value}</p>
              </div>
            ))}
          </div>

          {/* Why flagged */}
          <div className="bg-danger/5 border border-danger/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-danger" />
              <p className="text-xs font-semibold text-danger">Why was this flagged?</p>
            </div>
            <ul className="space-y-1">
              {alert.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-danger mt-0.5">●</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* SHAP contribution bars */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              AI Feature Contributions
            </p>
            <div className="space-y-2">
              {alert.shapFactors.map((f) => {
                const isPos = f.value >= 0;
                const pct   = Math.min(Math.abs(f.value) * 200, 100);
                return (
                  <div key={f.feature} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-36 truncate">{f.label}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700
                          ${isPos ? 'bg-danger' : 'bg-success'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono w-20 text-right
                      ${isPos ? 'text-danger' : 'text-success'}`}>
                      {isPos ? '+' : ''}{f.value.toFixed(2)} · {f.displayValue}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended action */}
          <div className="bg-accent/5 border border-accent/15 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-1">
              Recommended Action
            </p>
            <p className="text-xs text-slate-300">{alert.recommendedAction}</p>
          </div>

          {/* Actions */}
          {status === 'open' && (
            <div className="flex items-center gap-2 pt-1">
              <button onClick={resolve} className="btn btn-sm bg-success/15 text-success border border-success/20 hover:bg-success/25">
                <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
              </button>
              <button onClick={dismiss} className="btn-ghost btn-sm">
                <XCircle className="w-3.5 h-3.5" /> Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
