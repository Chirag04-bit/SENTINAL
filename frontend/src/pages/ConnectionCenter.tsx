import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import { 
  getConnectedSources, 
  updateConnectedSources, 
  purgeUserData, 
  exportUserData, 
  getAuditLogs, 
  type AuditLogEntry 
} from '../services/userService';

interface SourceItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  explanation: string;
  benefits: string;
  risks: string;
}

const ALL_SOURCES: SourceItem[] = [
  { id: 'chrome', name: 'Chrome Browser Extension', category: 'Browsers', icon: '🌐', explanation: 'Scans active tabs, bookmarks, extensions, and downloads.', benefits: 'Blocks banking clones, phishing traps, and unsafe downloads.', risks: 'Queries browsing metadata and active domains.' },
  { id: 'firefox', name: 'Firefox Shield Add-on', category: 'Browsers', icon: '🦊', explanation: 'Monitors visited hosts and downloads indices.', benefits: 'Prevents cryptomining scripts and malicious redirects.', risks: 'Evaluates download links and domain headers.' },
  { id: 'gmail', name: 'Gmail Secure Scan', category: 'Communications', icon: '✉️', explanation: 'Scans raw mail bodies and file attachments.', benefits: 'Blocks invoice scams and credential phishing links.', risks: 'Accesses your mail content for pattern matching.' },
  { id: 'google_account', name: 'Google Cloud Ingest', category: 'Accounts', icon: '🔑', explanation: 'Monitors login locations and authorized OAuth sessions.', benefits: 'Detects impossible travel anomalies and credential leaks.', risks: 'Queries account connection logs via API.' },
  { id: 'windows_logs', name: 'Windows Defender Logs', category: 'Device', icon: '💻', explanation: 'Monitors startup registry, Defender alerts, and running processes.', benefits: 'Flags disabled firewalls and high-CPU cryptojackers.', risks: 'Ingests active process lists and firewall flags.' },
  { id: 'local_files', name: 'Downloads Scanner', category: 'Device', icon: '📂', explanation: 'Monitors local Desktop and Downloads folder directories.', benefits: 'Flags trojans and malicious installer payloads.', risks: 'Queries local index folders for file verification.' },
  { id: 'wifi', name: 'WiFi Connection Ingest', category: 'Network', icon: '📶', explanation: 'Evaluates WiFi SSIDs, encryption standards, and DNS configurations.', benefits: 'Warns about public WiFi traps and port scans.', risks: 'Monitors local wireless connection properties.' },
  { id: 'location_tracking', name: 'Location Coordinates', category: 'Network', icon: '📍', explanation: 'Accesses browser geographic coordinates on authentication.', benefits: 'Maps impossible travel speed logins.', risks: 'Traces your physical location.' },
];

export default function ConnectionCenter({ role }: { role: 'user' | 'admin' }) {
  const { user, login, token } = useAuth();
  const [sources, setSources] = useState<Record<string, boolean>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const srcRes = await getConnectedSources();
        setSources(srcRes || {});
        const logsRes = await getAuditLogs();
        setAuditLogs(logsRes || []);
      } catch (e) {
        console.error("Failed to load connection center data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleToggle = async (id: string) => {
    const updated = { ...sources, [id]: !sources[id] };
    try {
      const res = await updateConnectedSources(updated);
      setSources(res || updated);
      
      // Update local storage and context
      if (user) {
        const updatedUser = { ...user, connectedSources: updated };
        login(updatedUser, token || '');
      }

      // Reload audit log
      const logsRes = await getAuditLogs();
      setAuditLogs(logsRes || []);

      showMsg(`Source '${id}' ${updated[id] ? 'connected' : 'disconnected'} successfully.`);
    } catch (e) {
      console.error("Failed to toggle source state:", e);
    }
  };

  const handlePurge = async () => {
    if (!window.confirm("WARNING: This will permanently delete ALL threat events, alert logs, and scan history. This action cannot be undone. Proceed?")) {
      return;
    }
    try {
      await purgeUserData();
      // Reload audit log
      const logsRes = await getAuditLogs();
      setAuditLogs(logsRes || []);
      showMsg("All database alerts and events purged successfully.");
    } catch (e) {
      console.error("Failed to purge user logs:", e);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sentinel_security_backup_${user?.name.replace(/\s+/g, '_').toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reload audit log
      const logsRes = await getAuditLogs();
      setAuditLogs(logsRes || []);
      showMsg("Your personal data backup generated and downloaded.");
    } catch (e) {
      console.error("Failed to export data:", e);
    }
  };

  const showMsg = (txt: string) => {
    setActionMessage(txt);
    setTimeout(() => setActionMessage(null), 4000);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-blue-500 border-slate-700 animate-spin" />
      </div>
    );
  }

  const categories = Array.from(new Set(ALL_SOURCES.map(s => s.category)));

  return (
    <PageWrapper role={role} title="Connection Center" subtitle="Privacy authorization & feeds controller">
      <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-12">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-wide">Connection Center</h1>
            <p className="text-slate-400 text-sm">
              Control which feeds flow to the AI Security Engine. Permissions are 100% opt-in and revocable.
            </p>
          </div>
          {actionMessage && (
            <div className="px-4 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-pulse">
              {actionMessage}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Connection feeds */}
          <div className="lg:col-span-2 space-y-8">
            {categories.map(cat => {
              const catSources = ALL_SOURCES.filter(s => s.category === cat);
              return (
                <div key={cat} className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    {cat}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {catSources.map(s => {
                      const isConnected = !!sources[s.id];
                      return (
                        <div 
                          key={s.id}
                          className={`flex flex-col p-5 rounded-2xl border transition-all ${
                            isConnected 
                              ? 'bg-slate-900/60 border-slate-800 shadow-lg shadow-blue-900/5' 
                              : 'bg-slate-900/25 border-slate-850 hover:bg-slate-900/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-4">
                              <span className="text-2xl p-2 rounded-xl bg-slate-800/60 shrink-0">
                                {s.icon}
                              </span>
                              <div className="space-y-1">
                                <h4 className="font-semibold text-slate-200 text-sm">{s.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleToggle(s.id)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isConnected 
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/15'
                              }`}
                            >
                              {isConnected ? 'Disconnect' : 'Connect Source'}
                            </button>
                          </div>

                          {/* Extended Details */}
                          <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-2 text-[11px] text-slate-400 leading-relaxed">
                            <p><strong>Description:</strong> {s.explanation}</p>
                            <p><strong className="text-emerald-400/90">Benefits:</strong> {s.benefits}</p>
                            <p><strong className="text-yellow-500/90">Risks:</strong> {s.risks}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-8">
            
            {/* Privacy management */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6 backdrop-blur-md">
              <h3 className="font-bold text-white text-base">Privacy Center</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Export a complete backup payload of your account indices, or permanently delete threat logs stored inside this platform.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleExport}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                >
                  📥 Export My Data (JSON)
                </button>
                <button
                  onClick={handlePurge}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                >
                  ⚠️ Purge All Logs & Alerts
                </button>
              </div>
            </div>

            {/* Audit trail logs */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6 backdrop-blur-md">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Transparent Access Audit</h3>
                <p className="text-slate-400 text-[11px]">
                  Tracks exactly when and why the AI Engine queried your connected feeds.
                </p>
              </div>

              <div className="relative border-l border-slate-800 pl-4 space-y-6 max-h-96 overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic py-2">
                    No data access events logged yet.
                  </div>
                ) : (
                  auditLogs.map(l => (
                    <div key={l.id} className="relative space-y-1">
                      {/* Circle timeline dot */}
                      <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-blue-500 border border-slate-900" />
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-300">{l.action}</span>
                        <span>{new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Source: <span className="text-slate-400 font-medium">{l.source}</span> · Reason: {l.purpose}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </PageWrapper>
  );
}
