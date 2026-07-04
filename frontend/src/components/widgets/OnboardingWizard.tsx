import { useState } from 'react';
import { completeOnboarding, updateConnectedSources } from '../../services/userService';
import type { User } from '../../types';

interface OnboardingWizardProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

interface PermissionItem {
  id: string;
  name: string;
  category: string;
  explanation: string;
  dataCollected: string;
  processing: string;
  localOnly: boolean;
  icon: string;
}

const ALL_PERMISSIONS: PermissionItem[] = [
  { id: 'browser_history', name: 'Browser History', category: 'Browser', explanation: 'Scans recently visited URLs for phishing, spoofing, and malicious redirection signatures.', dataCollected: 'Recently visited URLs, domain hostnames, and visit timestamps.', processing: 'Matched against local threat registries.', localOnly: true, icon: '🌐' },
  { id: 'downloads', name: 'Downloads Folder', category: 'Storage', explanation: 'Monitors the downloads folder to intercept malware payloads immediately upon capture.', dataCollected: 'Downloaded file names, lengths, SHA256 hashes.', processing: 'Evaluated for static binary signature matches.', localOnly: true, icon: '📥' },
  { id: 'desktop', name: 'Desktop Folder', category: 'Storage', explanation: 'Allows folder scan auditing of active executables on your Desktop.', dataCollected: 'File names, sizes, execution headers.', processing: 'Static code scanning.', localOnly: true, icon: '🖥️' },
  { id: 'documents', name: 'Documents Folder', category: 'Storage', explanation: 'Allows folder scan auditing of files inside your Documents directory.', dataCollected: 'Documents directory file metadata and hashes.', processing: 'Signature pattern matching.', localOnly: true, icon: '📂' },
  { id: 'gmail', name: 'Gmail Secure Scan', category: 'Email', explanation: 'Analyzes incoming mail to flag phishing traps, BEC scams, and malicious attachments.', dataCollected: 'Email body bodies, sender addresses, links, and attachments.', processing: 'SPF/DKIM alignment and NLP classification.', localOnly: false, icon: '📧' },
  { id: 'outlook', name: 'Outlook Secure Scan', category: 'Email', explanation: 'Analyzes Outlook mails for credential harvesting and invoice scams.', dataCollected: 'Inbox emails metadata, headers, attachments.', processing: 'Reputation analysis and anomaly score.', localOnly: false, icon: '✉️' },
  { id: 'network', name: 'Network Monitoring', category: 'Network', icon: '📶', explanation: 'Sniffs active TCP/UDP packet logs to alert on port scanning and spoofing attempts.', dataCollected: 'IP headers, source/destination ports, packet sizes.', processing: 'Heuristics port audits.', localOnly: true },
  { id: 'processes', name: 'Running Processes', category: 'System', icon: '⚙️', explanation: 'Monitors running system processes to flag hidden cryptominers or keyloggers.', dataCollected: 'Process name, PID, CPU/RAM percentages, path.', processing: 'Active telemetry comparisons.', localOnly: true },
  { id: 'installed_apps', name: 'Installed Applications', category: 'System', icon: '💿', explanation: 'Audits installed software inventory to list outdated or vulnerable applications.', dataCollected: 'Software titles, publishers, versions.', processing: 'CVE vulnerability databases cross-referencing.', localOnly: true },
  { id: 'startup_programs', name: 'Startup Programs', category: 'System', icon: '⚡', explanation: 'Analyzes boot registry keys to flag hidden malware persistence hooks.', dataCollected: 'Startup application titles and target commands.', processing: 'Integrity check scans.', localOnly: true },
  { id: 'event_logs', name: 'Windows Event Logs', category: 'System', icon: '📝', explanation: 'Inspects Windows Security events for login failures or scheduled task creations.', dataCollected: 'Event IDs, times generated, SourceNames.', processing: 'Privilege escalation audit parsing.', localOnly: true },
  { id: 'usb', name: 'USB Monitoring', category: 'System', icon: '🔌', explanation: 'Monitors physical USB insertions to prevent HID keyboard or mass-storage injection attacks.', dataCollected: 'WMI PNP device descriptors and IDs.', processing: 'Live insertion logs audits.', localOnly: true },
  { id: 'location_tracking', name: 'Current Location', category: 'Network', icon: '📍', explanation: 'Verifies geographic coordinates to map login events and impossible travel anomalies.', dataCollected: 'HTML5 browser coordinates (latitude, longitude).', processing: 'Haversine distance mapping.', localOnly: true },
  { id: 'extensions', name: 'Browser Extensions', category: 'Browser', icon: '🧩', explanation: 'Audits installed browser extensions to alert on suspicious permission overrides.', dataCollected: 'Extension names, IDs, manifest permissions.', processing: 'Malicious extension heuristics.', localOnly: true },
  { id: 'threat_intel_apis', name: 'Threat Intelligence APIs', category: 'Security', icon: '🤖', explanation: 'Queries global threat intelligence APIs (VirusTotal, AbuseIPDB) for IP/hash checks.', dataCollected: 'Selected files SHA256 hashes, unknown IP addresses.', processing: 'External REST queries.', localOnly: false },
  { id: 'notifications', name: 'Notifications Permission', category: 'Security', icon: '🔔', explanation: 'Allows SENTINEL to display real-time push alerts when high-risk events are detected.', dataCollected: 'System alert headers.', processing: 'Direct system alert delivery.', localOnly: true },
];

export function OnboardingWizard({ user, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Set all permissions to false (denied by default)
  const [sources, setSources] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ALL_PERMISSIONS.forEach(p => {
      initial[p.id] = false;
    });
    return initial;
  });

  const grantPermission = (id: string) => {
    setSources(prev => ({ ...prev, [id]: true }));
  };

  const denyPermission = (id: string) => {
    setSources(prev => ({ ...prev, [id]: false }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleFinish = async () => {
    try {
      await updateConnectedSources(sources);
      await completeOnboarding();
      
      const updatedUser: User = {
        ...user,
        hasCompletedOnboarding: true,
        connectedSources: sources,
      };
      onComplete(updatedUser);
    } catch (e) {
      console.error("Failed to complete onboarding wizard setup:", e);
    }
  };

  if (user.hasCompletedOnboarding) return null;

  const activeCount = Object.values(sources).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-md flex flex-col max-h-[85vh]">
        
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        {/* Progress bar */}
        <div className="flex h-1 bg-slate-800">
          <div 
            className="bg-blue-500 transition-all duration-300 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col justify-between">
          {/* Step 1: Introduction */}
          {step === 1 && (
            <div className="space-y-6 my-auto">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mx-auto">
                <span className="text-3xl">🛡️</span>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-wide">SENTINEL Shield Setup Wizard</h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                  Configure your privacy-first personal cybersecurity companion. All components operate under a zero-trust model.
                </p>
              </div>
              
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 space-y-3">
                <div className="flex gap-3">
                  <span className="text-xl">🔒</span>
                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm">Strict Permission Manager</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      "Nothing is accessed without your explicit consent." No settings are pre-authorized. Selectively grant permissions to activate local host telemetry monitoring agents.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 text-sm"
                >
                  View Consent Dashboard →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Individual Permission Configuration Dashboard */}
          {step === 2 && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>⚙️</span> Consent Dashboard ({activeCount} / 16 Granted)
                </h3>
                <p className="text-slate-400 text-xs">
                  Review and authorize individual telemetry feeds. Data is processed locally and never leaves your computer unless labeled.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[45vh] pr-2 space-y-2 border border-slate-800 bg-slate-950/30 rounded-xl p-3 mt-2">
                {ALL_PERMISSIONS.map(p => {
                  const isGranted = sources[p.id];
                  const isExpanded = expandedId === p.id;
                  return (
                    <div key={p.id} className="border border-slate-850 rounded-lg bg-slate-900/40 overflow-hidden transition-all">
                      <div 
                        className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-850/30"
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">{p.icon}</span>
                          <div>
                            <span className="text-xs font-bold text-slate-200">{p.name}</span>
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-2 font-mono uppercase">{p.category}</span>
                            {p.localOnly && <span className="text-[9px] bg-blue-900/20 text-blue-400 px-1.5 py-0.5 rounded ml-1 font-mono uppercase">LOCAL-ONLY</span>}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => grantPermission(p.id)}
                            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                              isGranted 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                            }`}
                          >
                            Grant
                          </button>
                          <button
                            onClick={() => denyPermission(p.id)}
                            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                              !isGranted 
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                            }`}
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-slate-850/50 bg-slate-950/20 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                          <p><strong>Why Required:</strong> {p.explanation}</p>
                          <p><strong>Data Collected:</strong> {p.dataCollected}</p>
                          <p><strong>How Processed:</strong> {p.processing}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800/80 mt-4">
                <button onClick={handleBack} className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                  ← Back
                </button>
                <button onClick={handleNext} className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                  Continue Setup →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation Summary */}
          {step === 3 && (
            <div className="space-y-6 text-center my-auto">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto">
                <span className="text-3xl">🚀</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Shield Permissions Saved!</h3>
                <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
                  Your granular consent preferences have been updated. Telemetry components with Denied status will remain fully locked. You can adjust these settings at any time in the Connection Center.
                </p>
              </div>

              <div className="max-w-xs mx-auto p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-left space-y-2 max-h-[25vh] overflow-y-auto">
                <h5 className="text-[10px] font-bold text-slate-400 tracking-wider">SUMMARY OF GRANTED TELEMETRY:</h5>
                <ul className="text-[11px] text-slate-300 space-y-1.5 list-none">
                  {ALL_PERMISSIONS.map(p => (
                    <li key={p.id} className="flex justify-between items-center">
                      <span>{p.icon} {p.name}</span>
                      <span className={sources[p.id] ? "text-emerald-400 font-bold" : "text-slate-600 font-medium"}>
                        {sources[p.id] ? "GRANTED" : "DENIED"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-800/80">
                <button onClick={handleBack} className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                  ← Back
                </button>
                <button 
                  onClick={handleFinish}
                  className="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 text-xs"
                >
                  Activate AI Cybersecurity Assistant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
