import { useEffect, useState } from 'react';
import { Radio, Users, AlertTriangle, Shield, Activity, Brain, MapPin } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/widgets/StatCard';
import RiskBadge from '../components/widgets/RiskBadge';
import { AlertTimelineChart, RiskDistributionChart, ThreatTypesChart } from '../components/charts';
import { useLiveStream } from '../hooks/useLiveStream';
import { getAnalyticsSummary, getAlertTrends, getRiskDistribution, getThreatTypes } from '../services/analyticsService';
import { getAlerts } from '../services/alertService';
import { getUsers } from '../services/userService';
import { get, post } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OnboardingWizard } from '../components/widgets/OnboardingWizard';
import type { DashboardStats, AlertTrendPoint, RiskDistribution, ThreatTypeCount, Alert, User } from '../types';

export default function AdminDashboard() {
  const { user, login, token } = useAuth();
  const { events: liveEvents, eventsPerMin } = useLiveStream(12);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trendData, setTrendData] = useState<AlertTrendPoint[]>([]);
  const [riskDist, setRiskDist] = useState<RiskDistribution[]>([]);
  const [threatTypes, setThreatTypes] = useState<ThreatTypeCount[]>([]);
  const [monitoredUsers, setMonitoredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [simulatorRunning, setSimulatorRunning] = useState(false);
  const [simulatorLoading, setSimulatorLoading] = useState(false);

  const fetchSimulatorStatus = async () => {
    try {
      const res = await get<any>('/events/simulator/status');
      setSimulatorRunning(res.is_running);
    } catch (e) {
      console.warn("Simulator status endpoint unavailable", e);
    }
  };

  const toggleSimulator = async () => {
    setSimulatorLoading(true);
    try {
      if (simulatorRunning) {
        await post('/events/simulator/stop');
        setSimulatorRunning(false);
      } else {
        await post('/events/simulator/start');
        setSimulatorRunning(true);
      }
    } catch (err) {
      console.error("Error toggling simulator:", err);
    } finally {
      setSimulatorLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, alertsData, trendRes, riskRes, threatRes, usersRes] = await Promise.all([
          getAnalyticsSummary(),
          getAlerts({ limit: 6, status: 'open' }),
          getAlertTrends(),
          getRiskDistribution(),
          getThreatTypes(),
          getUsers(1, 10),
        ]);
        setStats(statsData);
        setAlerts(alertsData.data);
        setTrendData(trendRes);
        setRiskDist(riskRes);
        setThreatTypes(threatRes);
        setMonitoredUsers(usersRes.data);
        await fetchSimulatorStatus();
      } catch (err) {
        console.error("Error loading SOC dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const statusColor  = (s: string) =>
    s === 'flagged' ? 'text-danger' : s === 'suspicious' ? 'text-warning' : 'text-success';
  const typeLabel = (t: string) => ({ fraud:'💳 Fraud', intrusion:'🌐 Intrusion', login:'🔑 Login', transaction:'💰 Txn', system:'⚙️ System' }[t] || t);

  const timeStr = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (loading) {
    return (
      <PageWrapper role="admin" title="Security Operations Center" subtitle="Live threat monitoring & anomaly detection">
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper role="admin" title="Security Operations Center" subtitle="Live threat monitoring & anomaly detection">
      {user && !user.hasCompletedOnboarding && (
        <OnboardingWizard 
          user={user} 
          onComplete={(updatedUser) => login(updatedUser, token || '')} 
        />
      )}
      <div className="page-content">

        {/* ── SIMULATOR CONTROL BANNER ── */}
        <div className="card-glow p-4 rounded-2xl flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${simulatorRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">Real-Time ML Ingestion Stream (Real Data)</h3>
              <p className="text-xs text-slate-400">Streams live transactions/packets from Kaggle & NSL-KDD through active RandomForest classifiers.</p>
            </div>
          </div>
          <button 
            disabled={simulatorLoading}
            onClick={toggleSimulator}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition-all border flex items-center gap-2
              ${simulatorRunning 
                ? 'bg-rose-950/20 text-rose-400 border-rose-500/30 hover:bg-rose-900/30' 
                : 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/30'}`}
          >
            {simulatorLoading ? 'Updating...' : simulatorRunning ? 'Stop Simulator Stream' : 'Start Simulator Stream'}
          </button>
        </div>

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
            value={stats?.totalUsers ?? 0}
            icon={<Users className="w-5 h-5 text-primary-light" />}
            iconBg="bg-primary/15"
            trend={3}
            description="Total accounts being monitored by SENTINEL."
          />
          <StatCard
            title="Open Alerts"
            value={stats?.openAlerts ?? 0}
            icon={<AlertTriangle className="w-5 h-5 text-danger" />}
            iconBg="bg-danger/15"
            variant="danger"
            trend={-8}
            description="Alerts that still need attention from the security team."
          />
          <StatCard
            title="Safe Users"
            value={`${stats?.safeUsers ?? 0}`}
            subtitle={`${Math.round((stats?.safeUsers ?? 0) / (stats?.totalUsers || 1) * 100)}% of total`}
            icon={<Shield className="w-5 h-5 text-success" />}
            iconBg="bg-success/15"
            variant="success"
            description="Users currently showing no suspicious activity."
          />
          <StatCard
            title="System Health"
            value={`${stats?.systemHealth ?? 94}%`}
            icon={<Activity className="w-5 h-5 text-warning" />}
            iconBg="bg-warning/15"
            variant="warning"
            description="Current performance and uptime of the SENTINEL system."
          />
          <StatCard
            title="Model Confidence"
            value={`${stats?.modelConfidence ?? 91}%`}
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
            <AlertTimelineChart data={trendData.slice(-14)} />
          </div>
        </div>

        {/* ── ROW 3: Risk Distribution + Threat Types + Recent Alerts ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

          {/* Risk Distribution Donut */}
          <div className="chart-card xl:col-span-1">
            <p className="chart-title">Risk Distribution</p>
            <p className="chart-desc">Users grouped by risk level. More green = safer system.</p>
            <RiskDistributionChart data={riskDist} />
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {riskDist.map(d => (
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
            <ThreatTypesChart data={threatTypes} />
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
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No open alerts.</p>
              ) : (
                alerts.map(alert => (
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
                ))
              )}
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
                {monitoredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-xs text-slate-500 py-6">No monitored users found.</td>
                  </tr>
                ) : (
                  monitoredUsers.map((u, i) => (
                    <tr key={i} className="cursor-pointer">
                      <td className="font-medium text-white">{u.name}</td>
                      <td className="text-slate-500 font-mono text-[11px]">{u.email}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{ width:`${u.riskScore}%`, background: u.riskScore > 80 ? '#EF4444' : u.riskScore > 60 ? '#F97316' : u.riskScore > 30 ? '#F59E0B' : '#10B981' }} />
                          </div>
                          <span className="text-xs font-mono">{u.riskScore}</span>
                        </div>
                      </td>
                      <td><RiskBadge level={u.riskLevel} size="sm" /></td>
                      <td className="text-slate-500 text-xs font-mono">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                      <td className="text-xs text-slate-400">{u.location || 'Unknown'}</td>
                      <td className="text-xs font-semibold text-danger">{u.openAlerts}</td>
                      <td><span className="badge badge-low text-[10px]">{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
