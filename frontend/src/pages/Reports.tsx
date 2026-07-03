import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { getReports, generateReport, downloadReportFile } from '../services/reportService';
import type { Report } from '../types';
import toast from 'react-hot-toast';

interface ReportsProps { role: 'user' | 'admin'; }

type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom';

export default function Reports({ role }: ReportsProps) {
  const [type, setType]       = useState<ReportType>('weekly');
  const [dateFrom, setFrom]   = useState('2026-06-01');
  const [dateTo, setTo]       = useState('2026-06-29');
  const [generating, setGen]  = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const generate = async () => {
    setGen(true);
    try {
      await generateReport({ type, dateFrom, dateTo, format: 'pdf' });
      toast.success('Report generated! Ready for download.');
      await loadReports();
    } catch (err) {
      toast.error('Failed to generate report.');
      console.error(err);
    } finally {
      setGen(false);
    }
  };

  const handleDownload = async (reportId: string, title: string, format: string) => {
    try {
      await downloadReportFile(reportId, title, format);
      toast.success('Downloaded successfully!');
    } catch (err) {
      toast.error('Download failed.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <PageWrapper role={role} title="Reports" subtitle="Generate, preview, and export security reports">
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper role={role} title="Reports" subtitle="Generate, preview, and export security reports">
      <div className="page-content">

        {/* Generate panel */}
        <div className="card-glow p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-1">Generate New Report</h3>
          <p className="text-sm text-slate-500 mb-5">Choose a report type and date range to create a comprehensive security summary.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Type selector */}
            <div>
              <label className="section-label">Report Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['daily','weekly','monthly','custom'] as ReportType[]).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all border
                      ${type === t
                        ? 'bg-primary text-white border-primary/50'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div>
              <label className="section-label">From Date</label>
              <input type="date" className="input text-xs" value={dateFrom} onChange={e => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="section-label">To Date</label>
              <input type="date" className="input text-xs" value={dateTo} onChange={e => setTo(e.target.value)} />
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-end gap-2">
              <button onClick={generate} disabled={generating}
                className="btn-accent py-2.5 justify-center">
                {generating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <><FileText className="w-4 h-4" /> Generate Report</>
                )}
              </button>
              <div className="flex gap-2">
                <button onClick={() => toast('Click "Download" in the table below after generating a report', { icon: 'ℹ️' })} className="btn-ghost btn-sm flex-1 justify-center gap-1">
                  <Download className="w-3.5 h-3.5" /> PDF / CSV
                </button>
              </div>
            </div>
          </div>

          {/* AI Summary preview */}
          <div className="bg-accent/5 border border-accent/15 rounded-lg p-4">
            <p className="text-xs font-semibold text-accent mb-2">🧠 AI Report Summary Preview</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              For the period <strong className="text-white">{dateFrom}</strong> to <strong className="text-white">{dateTo}</strong>:
              SENTINEL processed <strong className="text-white">312 events</strong> and generated <strong className="text-white">87 alerts</strong>.
              The most common threat type was <strong className="text-white">Card Fraud (38%)</strong>.
              <strong className="text-danger"> 12 critical incidents</strong> were detected, of which <strong className="text-success">9 were resolved</strong>.
              Peak activity occurred on <strong className="text-white">Wednesday between 2–4 AM</strong>.
              System model confidence maintained at <strong className="text-white">91%</strong> throughout the period.
            </p>
          </div>
        </div>

        {/* Past Reports */}
        <div className="chart-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="chart-title">Past Reports</p>
              <p className="chart-desc">Previously generated reports available for download.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Type</th>
                  <th>Period</th>
                  <th>Generated</th>
                  <th>Total Alerts</th>
                  <th>Critical</th>
                  <th>Format</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-xs text-slate-500 py-6">No reports generated yet.</td>
                  </tr>
                ) : (
                  reports.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div>
                          <p className="font-medium text-white">{r.title}</p>
                          <p className="text-[10px] text-slate-600 font-mono">{r.id}</p>
                        </div>
                      </td>
                      <td><span className="badge badge-info capitalize text-[10px]">{r.type}</span></td>
                      <td className="text-xs text-slate-400">
                        {new Date(r.dateFrom).toLocaleDateString()} → {new Date(r.dateTo).toLocaleDateString()}
                      </td>
                      <td className="text-xs text-slate-500">
                        {new Date(r.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="font-semibold">{r.totalAlerts}</td>
                      <td className="text-danger font-semibold">{r.criticalAlerts}</td>
                      <td>
                        <span className={`badge text-[10px] ${r.format === 'pdf' ? 'badge-high' : 'badge-medium'}`}>
                          {r.format.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDownload(r.id, r.title, r.format)} className="btn-ghost btn-sm px-2 py-1 text-[10px] gap-1">
                            <Download className="w-3 h-3" /> Download
                          </button>
                        </div>
                      </td>
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
