import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Shield, AlertTriangle, Activity, Clock, Smartphone, MapPin } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/widgets/StatCard';
import RiskGauge from '../components/widgets/RiskGauge';
import AlertCard from '../components/widgets/AlertCard';
import { MOCK_ALERTS, MOCK_MY_RISK, MOCK_MY_ACTIVITY, MOCK_ALERT_TREND } from '../data/mockData';

const DEVICES = [
  { name: 'Chrome / Windows 11', icon: '💻', last: '2 hours ago', trusted: true  },
  { name: 'Safari / iPhone 14',  icon: '📱', last: '3 days ago',  trusted: true  },
  { name: 'Unknown Android',     icon: '❓', last: '6 days ago',  trusted: false },
];

const LOCATIONS = [
  { city: 'Mumbai, India',     flag: '🇮🇳', last: '2 hours ago',  usual: true  },
  { city: 'Bangalore, India',  flag: '🇮🇳', last: '3 days ago',   usual: true  },
  { city: 'Lagos, Nigeria',    flag: '🇳🇬', last: '6 days ago',   usual: false },
];

export default function UserDashboard() {
  const myAlerts = MOCK_ALERTS.filter(a => a.status === 'open').slice(0, 3);
  const score    = MOCK_MY_RISK.score;

  return (
    <PageWrapper role="user" title="My Security Dashboard" subtitle="Your personal threat intelligence overview">
      <div className="page-content">

        {/* ── Welcome Banner ── */}
        <div className="card-glow p-5 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-transparent to-transparent pointer-events-none" />
          <RiskGauge score={score} size="md" />
          <div className="flex-1 relative">
            <h2 className="text-xl font-bold text-white mb-1">Good Evening, Aryan 👋</h2>
            <p className="text-slate-400 text-sm mb-3">
              Your account looks <strong className="text-success">safe</strong> right now.
              No suspicious activity detected in the last 24 hours.
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
                <Shield className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-medium text-success">Account Protected</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">Last checked: Just now</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            {[
              { label: 'Open Alerts',    value: myAlerts.length, color: 'text-warning' },
              { label: 'Risk Score',     value: score,           color: 'text-success'  },
              { label: 'Devices',        value: DEVICES.length,  color: 'text-accent'   },
              { label: 'Locations',      value: LOCATIONS.length,color: 'text-primary-light' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-3 text-center">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── STAT ROW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="My Risk Score"  value={score}  icon={<Shield className="w-5 h-5 text-success" />}  iconBg="bg-success/15" variant="success" description="A score showing how risky your current activity appears. Lower is better." />
          <StatCard title="Open Alerts"    value={myAlerts.length} icon={<AlertTriangle className="w-5 h-5 text-warning" />} iconBg="bg-warning/15" variant="warning" description="Alerts are warnings about suspicious activities in your account." />
          <StatCard title="Active Sessions" value={1} icon={<Activity className="w-5 h-5 text-accent" />} iconBg="bg-accent/15" description="Number of active login sessions on your account right now." />
          <StatCard title="Trusted Devices" value={DEVICES.filter(d=>d.trusted).length} icon={<Smartphone className="w-5 h-5 text-primary-light" />} iconBg="bg-primary/15" description="Devices SENTINEL has seen before and considers safe." />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Left: Activity Timeline + Alerts */}
          <div className="xl:col-span-2 space-y-4">

            {/* Risk score trend */}
            <div className="chart-card">
              <p className="chart-title">My Risk Score — Last 7 Days</p>
              <p className="chart-desc">How your risk score has changed over the past week.</p>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={MOCK_MY_RISK.trend.map((v, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], score: v }))}
                  margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => [`${v} / 100`, 'Risk Score']} />
                  <Area type="monotone" dataKey="score" stroke="#10B981" fill="url(#scoreGrad)" strokeWidth={2} dot={{ fill:'#10B981', r:3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Activity */}
            <div className="chart-card">
              <p className="chart-title mb-3">Recent Activity Timeline</p>
              <p className="chart-desc">Your last 7 account activities with risk indicators.</p>
              <div className="space-y-0">
                {MOCK_MY_ACTIVITY.map((item, i) => (
                  <div key={item.id} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm flex-shrink-0">
                        {item.icon}
                      </div>
                      {i < MOCK_MY_ACTIVITY.length - 1 && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-3 bg-white/10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-white">{item.action}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-semibold capitalize ${
                            item.riskLevel === 'low' ? 'text-success' : item.riskLevel === 'medium' ? 'text-warning' : 'text-danger'
                          }`}>{item.riskLevel}</span>
                          <span className="text-[10px] text-slate-600">{new Date(item.timestamp).toLocaleString('en', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Alerts */}
            {myAlerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" /> My Open Alerts
                </h3>
                {myAlerts.map(a => <AlertCard key={a.id} alert={a} />)}
              </div>
            )}
          </div>

          {/* Right: Devices, Locations, Recommendations */}
          <div className="space-y-4">

            {/* Devices */}
            <div className="chart-card">
              <p className="chart-title mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-accent" /> Recent Devices
              </p>
              <p className="chart-desc">Devices that have accessed your account.</p>
              <div className="space-y-2">
                {DEVICES.map(d => (
                  <div key={d.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-xl">{d.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{d.name}</p>
                      <p className="text-[10px] text-slate-500">{d.last}</p>
                    </div>
                    <span className={`badge text-[10px] ${d.trusted ? 'badge-low' : 'badge-critical'}`}>
                      {d.trusted ? '✓ Trusted' : '⚠ Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="chart-card">
              <p className="chart-title mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" /> Recent Locations
              </p>
              <p className="chart-desc">Places your account has been accessed from.</p>
              <div className="space-y-2">
                {LOCATIONS.map(l => (
                  <div key={l.city} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-xl">{l.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white">{l.city}</p>
                      <p className="text-[10px] text-slate-500">{l.last}</p>
                    </div>
                    <span className={`badge text-[10px] ${l.usual ? 'badge-low' : 'badge-critical'}`}>
                      {l.usual ? 'Usual' : '⚠ New'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Recommendations */}
            <div className="chart-card">
              <p className="chart-title mb-3">🛡️ Security Recommendations</p>
              <div className="space-y-2">
                {[
                  { icon: '🔒', text: 'Enable two-factor authentication for extra security', action: 'Enable 2FA' },
                  { icon: '📱', text: 'Review the unknown Android device in your sessions', action: 'Review Device' },
                  { icon: '🌍', text: 'Login detected from Nigeria — confirm if this was you', action: 'Confirm Login' },
                ].map(({ icon, text, action }) => (
                  <div key={action} className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <p className="text-xs text-slate-300 mb-2">{icon} {text}</p>
                    <button className="text-[11px] text-accent font-semibold hover:underline">{action} →</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="chart-card">
              <p className="chart-title mb-3">⚡ Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Change Password', icon: '🔑' },
                  { label: 'Review Alerts',   icon: '🚨' },
                  { label: 'Download Report', icon: '📄' },
                  { label: 'Contact Support', icon: '💬' },
                ].map(({ label, icon }) => (
                  <button key={label} className="btn-ghost py-2.5 flex-col h-auto gap-1 text-center justify-center">
                    <span className="text-lg">{icon}</span>
                    <span className="text-[10px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
