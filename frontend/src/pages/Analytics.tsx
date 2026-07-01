import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import PageWrapper from '../components/layout/PageWrapper';
import { MOCK_ALERT_TREND, MOCK_RISK_DIST, MOCK_THREAT_TYPES, MOCK_HOURLY } from '../data/mockData';

interface AnalyticsProps { role: 'user' | 'admin'; }

type DateRange = '7d' | '30d' | '90d';

const COLORS = ['#EF4444','#F97316','#F59E0B','#06B6D4','#4F46E5','#10B981'];

export default function Analytics({ role }: AnalyticsProps) {
  const [range, setRange] = useState<DateRange>('30d');
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const trendData = MOCK_ALERT_TREND.slice(-Math.min(days, MOCK_ALERT_TREND.length));

  // Hourly heatmap — last 7 days condensed
  const hourlyMax = Math.max(...MOCK_HOURLY.map(h => h.value));
  const HOURS     = Array.from({ length: 24 }, (_, i) => i);
  const DAYS      = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const heatColor = (v: number) => {
    const ratio = v / hourlyMax;
    if (ratio < 0.2)  return 'rgba(16,185,129,0.15)';
    if (ratio < 0.4)  return 'rgba(245,158,11,0.2)';
    if (ratio < 0.7)  return 'rgba(249,115,22,0.35)';
    return 'rgba(239,68,68,0.5)';
  };

  return (
    <PageWrapper role={role} title="Analytics" subtitle="Trends, patterns, and threat intelligence insights">
      <div className="page-content">

        {/* Date filter */}
        <div className="flex items-center gap-2">
          {(['7d','30d','90d'] as DateRange[]).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`btn btn-sm ${range === r ? 'bg-primary text-white' : 'btn-ghost'}`}>
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Alerts',    value: trendData.reduce((s, d) => s + d.total, 0),    color: 'text-white'   },
            { label: 'Critical Alerts', value: trendData.reduce((s, d) => s + d.critical, 0), color: 'text-danger'  },
            { label: 'Avg Daily',       value: Math.round(trendData.reduce((s,d)=>s+d.total,0)/trendData.length), color: 'text-accent' },
            { label: 'Peak Day',        value: Math.max(...trendData.map(d => d.total)),        color: 'text-warning' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center hover:-translate-y-0.5">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Alert trend area chart */}
          <div className="chart-card xl:col-span-2">
            <p className="chart-title">Alert Volume Over Time</p>
            <p className="chart-desc">Daily count of alerts by severity level. Spikes indicate threat surges.</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  {['critical','high','medium','low'].map((k, i) => {
                    const c = ['#EF4444','#F97316','#F59E0B','#10B981'][i];
                    return (
                      <linearGradient key={k} id={`aGrad-${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={c} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={c} stopOpacity={0}   />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="critical" stackId="1" name="Critical" stroke="#EF4444" fill="url(#aGrad-critical)" />
                <Area type="monotone" dataKey="high"     stackId="1" name="High"     stroke="#F97316" fill="url(#aGrad-high)" />
                <Area type="monotone" dataKey="medium"   stackId="1" name="Medium"   stroke="#F59E0B" fill="url(#aGrad-medium)" />
                <Area type="monotone" dataKey="low"      stackId="1" name="Low"      stroke="#10B981" fill="url(#aGrad-low)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Risk distribution donut */}
          <div className="chart-card">
            <p className="chart-title">Risk Distribution</p>
            <p className="chart-desc">Proportion of users by risk level. Green = safe, red = critical.</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={MOCK_RISK_DIST} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {MOCK_RISK_DIST.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {MOCK_RISK_DIST.map(d => (
                <div key={d.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02]">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-slate-300">{d.name}</span>
                  <span className="text-xs font-bold text-white ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Threat types bar */}
          <div className="chart-card">
            <p className="chart-title">Top Threat Categories</p>
            <p className="chart-desc">Most common attack types. These tell you what to prioritize defending against.</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_THREAT_TYPES} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip formatter={(v: any) => [`${v} alerts`, 'Count']} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {MOCK_THREAT_TYPES.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly heatmap */}
          <div className="chart-card">
            <p className="chart-title">Activity Heatmap — Hour × Day</p>
            <p className="chart-desc">When attacks peak. Red = high activity, green = low. Watch for 2–4 AM spikes.</p>
            <div className="mt-3 overflow-x-auto">
              <div className="flex gap-1 mb-1">
                <div className="w-8" />
                {HOURS.filter(h => h % 4 === 0).map(h => (
                  <div key={h} className="text-[9px] text-slate-600 w-5 text-center">{h}h</div>
                ))}
              </div>
              {DAYS.map(day => (
                <div key={day} className="flex items-center gap-1 mb-1">
                  <div className="text-[9px] text-slate-500 w-8 text-right pr-1">{day}</div>
                  {HOURS.map(hour => {
                    const point = MOCK_HOURLY.find(h => h.day === day && h.hour === hour);
                    return (
                      <div key={hour} title={`${day} ${hour}:00 — ${point?.value ?? 0} events`}
                        className="w-5 h-5 rounded-sm transition-all hover:scale-125 cursor-pointer"
                        style={{ background: heatColor(point?.value ?? 0) }} />
                    );
                  })}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[9px] text-slate-600">Low</span>
                {['rgba(16,185,129,0.15)','rgba(245,158,11,0.2)','rgba(249,115,22,0.35)','rgba(239,68,68,0.5)'].map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-sm" style={{ background: c }} />
                ))}
                <span className="text-[9px] text-slate-600">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Summary Table */}
        <div className="chart-card">
          <p className="chart-title mb-3">Monthly Summary</p>
          <p className="chart-desc mb-4">Month-by-month breakdown of threat activity.</p>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Alerts</th>
                  <th>Critical</th>
                  <th>High</th>
                  <th>Medium</th>
                  <th>Low</th>
                  <th>Resolved</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {['January','February','March','April','May','June'].map((m, i) => {
                  const total = 80 + i * 15 + Math.floor(Math.random() * 20);
                  const crit  = Math.floor(total * 0.12);
                  return (
                    <tr key={m}>
                      <td className="font-medium text-white">{m} 2026</td>
                      <td className="font-bold">{total}</td>
                      <td className="text-danger font-semibold">{crit}</td>
                      <td className="text-orange-400">{Math.floor(total * 0.2)}</td>
                      <td className="text-warning">{Math.floor(total * 0.35)}</td>
                      <td className="text-success">{Math.floor(total * 0.33)}</td>
                      <td className="text-slate-400">{Math.floor(total * 0.7)}</td>
                      <td>
                        <span className={`text-xs font-semibold ${i > 2 ? 'text-danger' : 'text-success'}`}>
                          {i > 2 ? '↑' : '↓'} {Math.abs(i - 3) * 4 + 2}%
                        </span>
                      </td>
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
