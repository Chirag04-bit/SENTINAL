import { useEffect, useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { AlertTimelineChart, RiskDistributionChart, ThreatTypesChart, ActivityHeatmap } from '../components/charts';
import { getAlertTrends, getRiskDistribution, getThreatTypes, getHourlyActivity } from '../services/analyticsService';
import type { AlertTrendPoint, RiskDistribution, ThreatTypeCount, HourlyHeatmapPoint } from '../types';

interface AnalyticsProps { role: 'user' | 'admin'; }

type DateRange = '7d' | '30d' | '90d';

export default function Analytics({ role }: AnalyticsProps) {
  const [range, setRange] = useState<DateRange>('30d');
  const [trends, setTrends] = useState<AlertTrendPoint[]>([]);
  const [riskDist, setRiskDist] = useState<RiskDistribution[]>([]);
  const [threatTypes, setThreatTypes] = useState<ThreatTypeCount[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<HourlyHeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [trendRes, riskRes, threatRes, hourlyRes] = await Promise.all([
          getAlertTrends(),
          getRiskDistribution(),
          getThreatTypes(),
          getHourlyActivity(),
        ]);
        setTrends(trendRes);
        setRiskDist(riskRes);
        setThreatTypes(threatRes);
        setHourlyActivity(hourlyRes);
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const trendData = trends.slice(-Math.min(days, trends.length));

  if (loading) {
    return (
      <PageWrapper role={role} title="Analytics" subtitle="Trends, patterns, and threat intelligence insights">
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

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
            <AlertTimelineChart data={trendData} height={260} showLegend={true} />
          </div>

          {/* Risk distribution donut */}
          <div className="chart-card">
            <p className="chart-title">Risk Distribution</p>
            <p className="chart-desc">Proportion of users by risk level. Green = safe, red = critical.</p>
            <RiskDistributionChart data={riskDist} height={200} innerRadius={50} outerRadius={80} showLabels={true} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              {riskDist.map(d => (
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
            <ThreatTypesChart data={threatTypes} height={220} yAxisWidth={120} radius={[0, 6, 6, 0]} />
          </div>

          {/* Hourly heatmap */}
          <div className="chart-card">
            <p className="chart-title">Activity Heatmap — Hour × Day</p>
            <p className="chart-desc">When attacks peak. Red = high activity, green = low. Watch for 2–4 AM spikes.</p>
            <ActivityHeatmap data={hourlyActivity} />
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
