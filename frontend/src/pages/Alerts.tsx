import { useState } from 'react';
import { Filter, Search, AlertTriangle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import AlertCard from '../components/widgets/AlertCard';
import { MOCK_ALERTS } from '../data/mockData';
import type { RiskLevel, AlertStatus, AlertType } from '../types';

interface AlertsProps { role: 'user' | 'admin'; }

export default function Alerts({ role }: AlertsProps) {
  const [search,   setSearch]   = useState('');
  const [severity, setSeverity] = useState<RiskLevel | 'all'>('all');
  const [status,   setStatus]   = useState<AlertStatus | 'all'>('all');
  const [type,     setType]     = useState<AlertType | 'all'>('all');

  const filtered = MOCK_ALERTS.filter(a => {
    if (severity !== 'all' && a.severity !== severity) return false;
    if (status   !== 'all' && a.status   !== status)   return false;
    if (type     !== 'all' && a.type     !== type)     return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) &&
        !a.userName.toLowerCase().includes(search.toLowerCase()) &&
        !a.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total:    MOCK_ALERTS.length,
    open:     MOCK_ALERTS.filter(a => a.status === 'open').length,
    critical: MOCK_ALERTS.filter(a => a.severity === 'critical').length,
    resolved: MOCK_ALERTS.filter(a => a.status === 'resolved').length,
  };

  const SEVERITY_OPTS: (RiskLevel | 'all')[] = ['all','low','medium','high','critical'];
  const STATUS_OPTS:   (AlertStatus | 'all')[] = ['all','open','resolved','dismissed'];
  const TYPE_OPTS:     (AlertType | 'all')[] = ['all','fraud','intrusion','login','transaction'];

  return (
    <PageWrapper role={role} title="Alert Center" subtitle="All detected threats with AI explanations">
      <div className="page-content">

        {/* Summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Alerts', value: counts.total,    color: 'text-white'   },
            { label: 'Open',         value: counts.open,     color: 'text-warning' },
            { label: 'Critical',     value: counts.critical, color: 'text-danger'  },
            { label: 'Resolved',     value: counts.resolved, color: 'text-success' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center hover:-translate-y-0.5">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="card p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input className="input pl-9 h-8 text-xs w-full" placeholder="Search alerts, users, locations..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select className="input h-8 text-xs w-28" value={severity} onChange={e => setSeverity(e.target.value as any)}>
              {SEVERITY_OPTS.map(o => <option key={o} value={o}>{o === 'all' ? 'All Levels' : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
            <select className="input h-8 text-xs w-28" value={status} onChange={e => setStatus(e.target.value as any)}>
              {STATUS_OPTS.map(o => <option key={o} value={o}>{o === 'all' ? 'All Status' : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
            <select className="input h-8 text-xs w-28" value={type} onChange={e => setType(e.target.value as any)}>
              {TYPE_OPTS.map(o => <option key={o} value={o}>{o === 'all' ? 'All Types' : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
            <button className="btn-ghost btn-sm text-xs" onClick={() => { setSeverity('all'); setStatus('all'); setType('all'); setSearch(''); }}>
              Clear
            </button>
          </div>
          <span className="text-xs text-slate-500 ml-auto">{filtered.length} results</span>
        </div>

        {/* Alert list */}
        {filtered.length === 0 ? (
          <div className="card p-12 flex flex-col items-center gap-4">
            <AlertTriangle className="w-10 h-10 text-slate-600" />
            <p className="text-slate-500 text-sm">No alerts match your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
