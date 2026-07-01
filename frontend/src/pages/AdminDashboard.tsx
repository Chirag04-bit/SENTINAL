import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Radio, Users, AlertTriangle, Shield, Activity, Brain, MapPin } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/widgets/StatCard';
import RiskBadge from '../components/widgets/RiskBadge';
import { useLiveStream } from '../hooks/useLiveStream';
import {
  MOCK_STATS, MOCK_ALERTS, MOCK_EVENTS, MOCK_ALERT_TREND,
  MOCK_RISK_DIST, MOCK_THREAT_TYPES,
} from '../data/mockData';
import { CHART_COLORS, SEVERITY_CHART_COLORS } from '../utils/constants';
import { formatTime, getRiskLevel } from '../utils/formatters';
import { EVENT_TYPE_LABELS } from '../utils/constants';


const COLORS = { low: '#10B981', medium: '#F59E0B', high: '#F97316', critical: '#EF4444' };

export default function AdminDashboard() {
  const { events: liveEvents, eventsPerMin, isConnected } = useLiveStream(12);
  const [alertCount, setAlertCount] = useState(MOCK_STATS.totalAlerts);


  const recentAlerts = MOCK_ALERTS.filter(a => a.status === 'open').slice(0, 6);
  const statusColor  = (s: string) =>
    s === 'flagged' ? 'text-danger' : s === 'suspicious' ? 'text-warning' : 'text-success';
  const typeLabel = (t: string) => ({ fraud:'💳 Fraud', intrusion:'🌐 Intrusion', login:'🔑 Login', transaction:'💰 Txn', system:'⚙️ System' }[t] || t);

  const timeStr = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <PageWrapper role="admin" title="Security Operations Center" subtitle="Live threat monitoring & anomaly detection">
      <div className="page-content">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Events / Min"
            value={eventsPerMin}
            icon={<Radio className="w-5 h-5 text-accent" />}
            iconBg="bg-accent/15"
            variant="accent"
            trend={12}
            description="Number of suspicious events detected per minute right now."
          />
          <StatCard
            title="Total Users"
            value={MOCK_STATS.totalUsers}
            icon={<Users className="w-5 h-5 text-primary-light" />}
            iconBg="bg-primary/15"
            trend={3}
            description="Total accounts being monitored by SENTINEL."
          />
          <StatCard
            title="Open Alerts"
            value={alertCount}
            icon={<AlertTriangle className="w-5 h-5 text-danger" />}
            iconBg="bg-danger/15"
            variant="danger"
            trend={-8}
            description="Alerts that still need attention from the security team."
          />
          <StatCard
            title="Safe Users"
            value={`${MOCK_STATS.safeUsers}`}
            subtitle={`${Math.round(MOCK_STATS.safeUsers / MOCK_STATS.totalUsers * 100)}% of total`}
            icon={<Shield className="w-5 h-5 text-success" />}
            iconBg="bg-success/15"
            variant="success"
            description="Users currently showing no suspicious activity."
          />
          <StatCard
            title="System Health"
            value={`${MOCK_STATS.systemHealth}%`}
            icon={<Activity className="w-5 h-5 text-warning" />}
            iconBg="bg-warning/15"
            variant="warning"
            description="Current performance and uptime of the SENTINEL system."
          />
          <StatCard
            title="Model Confidence"
            value={`${MOCK_STATS.modelConfidence}%`}
            icon={<Brain className="w-5 h-5 text-secondary-light" />}
            iconBg="bg-secondary/15"
            description="How confident the AI model is in its current predictions."
          />
        </div>

        {/* ── ROW 2: Live Feed + Alert Timeline ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

          {/* Live Event Feed */}
          <div className="xl:col-span-3 chart-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="chart-title flex items-center gap-2">
                  <span className="live-dot" /> Live Event Stream
                </p>
                <p className="chart-desc">Real-time events processed by the detection engine</p>
              </div>
              <span className="badge badge-info text-[10px]">{liveEvents.length} events</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-white/5">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Risk</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveEvents.slice(0, 10).map((ev, i) => (
                    <tr key={ev.id} className={i === 0 ? 'bg-accent/5 animate-fade-in' : ''}>
                      <td className="font-mono text-[11px] text-slate-500">{timeStr(ev.timestamp)}</td>
                      <td className="text-xs">{ev.userName.split(' ')[0]}</td>
                      <td className="text-xs">{typeLabel(ev.type)}</td>
                      <td className="text-xs text-slate-400 max-w-[120px] truncate">{ev.location}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${ev.riskScore}%`,
                                background: ev.riskScore > 80 ? '#EF4444' : ev.riskScore > 60 ? '#F97316' : ev.riskScore > 30 ? '#F59E0B' : '#10B981'
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">{ev.riskScore}</span>
                        </div>
                      </td>
                      <td><span className={`text-[11px] font-semibold capitalize ${statusColor(ev.status)}`}>{ev.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alert Timeline (Area Chart) */}
          <div className="xl:col-span-2 chart-card">
            <p className="chart-title">Alert Timeline — 30 Days</p>
            <p className="chart-desc">Daily alert volume by severity. Spikes indicate threat surges.</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_ALERT_TREND.slice(-14)} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  {Object.entries(COLORS).map(([k, c]) => (
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="critical" stackId="1" stroke={COLORS.critical} fill={`url(#g-critical)`} />
                <Area type="monotone" dataKey="high"     stackId="1" stroke={COLORS.high}     fill={`url(#g-high)`} />
                <Area type="monotone" dataKey="medium"   stackId="1" stroke={COLORS.medium}   fill={`url(#g-medium)`} />
                <Area type="monotone" dataKey="low"      stackId="1" stroke={COLORS.low}      fill={`url(#g-low)`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── ROW 3: Risk Distribution + Threat Types + Recent Alerts ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

          {/* Risk Distribution Donut */}
          <div className="chart-card xl:col-span-1">
            <p className="chart-title">Risk Distribution</p>
            <p className="chart-desc">Users grouped by risk level. More green = safer system.</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={MOCK_RISK_DIST} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {MOCK_RISK_DIST.map((entry, i) => (
                    <Cell key={i} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} users`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {MOCK_RISK_DIST.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[10px] text-slate-400">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Threat Types */}
          <div className="chart-card xl:col-span-2">
            <p className="chart-title">Top Threat Types</p>
            <p className="chart-desc">Most common attack categories detected this month.</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MOCK_THREAT_TYPES} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {MOCK_THREAT_TYPES.map((_, i) => (
                    <Cell key={i} fill={['#EF4444','#F97316','#F59E0B','#06B6D4','#4F46E5','#10B981'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Critical Alerts */}
          <div className="chart-card xl:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="chart-title">Recent Open Alerts</p>
                <p className="chart-desc">Latest unresolved threats requiring attention.</p>
              </div>
              <button className="btn-ghost btn-sm text-xs" onClick={() => window.location.href='/admin/alerts'}>
                View All
              </button>
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
              {recentAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-white truncate">{alert.title}</span>
                      <RiskBadge level={alert.severity} score={alert.riskScore} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {alert.userName} · {alert.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 4: Users table ── */}
        <div className="chart-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="chart-title flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-light" /> User Risk Overview
              </p>
              <p className="chart-desc">All monitored users sorted by risk score. Click to view details.</p>
            </div>
            <div className="flex items-center gap-2">
              <input className="input h-7 w-40 text-xs" placeholder="Search users..." />
              <button className="btn-ghost btn-sm text-xs">Export CSV</button>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Last Login</th>
                  <th>Location</th>
                  <th>Open Alerts</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...MOCK_EVENTS.reduce((acc, ev) => {
                  if (!acc.has(ev.userId)) acc.set(ev.userId, ev);
                  return acc;
                }, new Map()).values()].slice(0, 10).map((ev: any, i) => {
                  const user = { riskScore: ev.riskScore, riskLevel: ev.riskScore > 80 ? 'critical' : ev.riskScore > 60 ? 'high' : ev.riskScore > 30 ? 'medium' : 'low' };
                  return (
                    <tr key={i} className="cursor-pointer">
                      <td className="font-medium text-white">{ev.userName}</td>
                      <td className="text-slate-500 font-mono text-[11px]">{ev.userName.toLowerCase().replace(' ', '.') + '@email.com'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{ width:`${ev.riskScore}%`, background: ev.riskScore > 80 ? '#EF4444' : ev.riskScore > 60 ? '#F97316' : ev.riskScore > 30 ? '#F59E0B' : '#10B981' }} />
                          </div>
                          <span className="text-xs font-mono">{ev.riskScore}</span>
                        </div>
                      </td>
                      <td><RiskBadge level={user.riskLevel as any} size="sm" /></td>
                      <td className="text-slate-500 text-xs font-mono">{new Date(ev.timestamp).toLocaleDateString()}</td>
                      <td className="text-xs text-slate-400">{ev.location}</td>
                      <td className="text-xs font-semibold text-danger">{Math.floor(Math.random() * 5)}</td>
                      <td><span className="badge badge-low text-[10px]">Active</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
