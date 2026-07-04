import { useState } from 'react';
import { completeOnboarding, updateConnectedSources } from '../../services/userService';
import type { User } from '../../types';

interface OnboardingWizardProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

export function OnboardingWizard({ user, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [sources, setSources] = useState<Record<string, boolean>>({
    chrome: false,
    firefox: false,
    gmail: false,
    google_account: false,
    windows_logs: false,
    local_files: false,
    wifi: false,
    location_tracking: false,
  });

  const toggleSource = (key: string) => {
    setSources(prev => ({ ...prev, [key]: !prev[key] }));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-md">
        
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        {/* Progress bar */}
        <div className="flex h-1 bg-slate-800">
          <div 
            className="bg-blue-500 transition-all duration-300 ease-out" 
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        <div className="p-6 md:p-8">
          {/* Step 1: Introduction */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mx-auto">
                <span className="text-3xl">🛡️</span>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-wide">Welcome to SENTINEL</h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                  Your AI-powered personal cybersecurity assistant. Let's configure your active shields while ensuring your privacy is fully protected.
                </p>
              </div>
              
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 space-y-3">
                <div className="flex gap-3">
                  <span className="text-xl">🔒</span>
                  <div>
                    <h4 className="font-semibold text-slate-200 text-sm">Privacy-First Policy</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      "Nothing is accessed without your explicit permission." We never read your files, browser histories, locations, or account logs unless you opt in.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 text-sm"
                >
                  Configure My Shields →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Browser Data */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🌐</span> Browser Security
                </h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  Protects your active browsing sessions from online traps.
                </p>
              </div>

              <div className="space-y-4 py-2">
                <div className="flex items-start justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                  <div className="space-y-1 pr-4">
                    <h4 className="font-semibold text-slate-200 text-sm">Chrome Web Companion</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>Explanation:</strong> Monitors active tabs, visited domains, extensions, and bookmarks.<br/>
                      <strong>Benefits:</strong> Detects phishing sites, banking clones, typo-squats, and malicious extensions.<br/>
                      <strong className="text-yellow-500/90">Risks:</strong> Accesses browsing metadata to verify safety against the ML database.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSource('chrome')}
                    className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sources.chrome 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {sources.chrome ? 'Granted (Revoke)' : 'Grant Permission'}
                  </button>
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                  <div className="space-y-1 pr-4">
                    <h4 className="font-semibold text-slate-200 text-sm">Firefox Shield Add-on</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>Explanation:</strong> Monitors visited hosts and active browser download links.<br/>
                      <strong>Benefits:</strong> Detects drive-by downloads, crypto miners, and browser hijackers.<br/>
                      <strong className="text-yellow-500/90">Risks:</strong> Transmits file names and download domains to evaluate threat risk.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSource('firefox')}
                    className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sources.firefox 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {sources.firefox ? 'Granted (Revoke)' : 'Grant Permission'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800/80">
                <button onClick={handleBack} className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                  ← Back
                </button>
                <button onClick={handleNext} className="px-5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                  Next Step: Email Protection
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Communication / Email */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>✉️</span> Email & Account Security
                </h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  Scans communication feeds to block social engineering attempts.
                </p>
              </div>

              <div className="space-y-4 py-2">
                <div className="flex items-start justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                  <div className="space-y-1 pr-4">
                    <h4 className="font-semibold text-slate-200 text-sm">Gmail Security Analyzer</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>Explanation:</strong> Evaluates sender reputation, hyperlinks, and document attachment signatures.<br/>
                      <strong>Benefits:</strong> Detects business email compromise, fake invoice templates, and spoofed senders.<br/>
                      <strong className="text-yellow-500/90">Risks:</strong> Accesses raw mail bodies and sender records for suspicious pattern matching.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSource('gmail')}
                    className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sources.gmail 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {sources.gmail ? 'Granted (Revoke)' : 'Grant Permission'}
                  </button>
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                  <div className="space-y-1 pr-4">
                    <h4 className="font-semibold text-slate-200 text-sm">Google Cloud Account logs</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>Explanation:</strong> Monitors authentication sessions, location logs, and active devices.<br/>
                      <strong>Benefits:</strong> Detects credentials leaks, suspicious logins, and credential stuffing vectors.<br/>
                      <strong className="text-yellow-500/90">Risks:</strong> Requires OAuth access token to query active connection histories.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSource('google_account')}
                    className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sources.google_account 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {sources.google_account ? 'Granted (Revoke)' : 'Grant Permission'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800/80">
                <button onClick={handleBack} className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                  ← Back
                </button>
                <button onClick={handleNext} className="px-5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                  Next Step: Device Security
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Device & Folders */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>💻</span> Device & Host Protection
                </h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  Evaluates the security and integrity of your local system environment.
                </p>
              </div>

              <div className="space-y-4 py-2">
                <div className="flex items-start justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                  <div className="space-y-1 pr-4">
                    <h4 className="font-semibold text-slate-200 text-sm">Windows Security Logs Ingest</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>Explanation:</strong> Scans startup directories, process velocities, defender alerts, and USB registers.<br/>
                      <strong>Benefits:</strong> Flags unknown active processes, cryptojacking, disabled firewalls, and malicious USBs.<br/>
                      <strong className="text-yellow-500/90">Risks:</strong> Requires administrator levels to ingest system security logs.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSource('windows_logs')}
                    className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sources.windows_logs 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {sources.windows_logs ? 'Granted (Revoke)' : 'Grant Permission'}
                  </button>
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                  <div className="space-y-1 pr-4">
                    <h4 className="font-semibold text-slate-200 text-sm">Local Downloads & Desktop Scanner</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>Explanation:</strong> Audits files inside downloads/desktop directories for signature validation.<br/>
                      <strong>Benefits:</strong> Warns against malicious installers, fake PDF scripts, and keyloggers.<br/>
                      <strong className="text-yellow-500/90">Risks:</strong> Accesses directory indices and reads executable hashes.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSource('local_files')}
                    className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sources.local_files 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {sources.local_files ? 'Granted (Revoke)' : 'Grant Permission'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800/80">
                <button onClick={handleBack} className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                  ← Back
                </button>
                <button onClick={handleNext} className="px-5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                  Next Step: Network Security
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Network & Location */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📶</span> Network & Geolocation
                </h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  Evaluates wireless networks and maps impossible travel logins.
                </p>
              </div>

              <div className="space-y-4 py-2">
                <div className="flex items-start justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                  <div className="space-y-1 pr-4">
                    <h4 className="font-semibold text-slate-200 text-sm">WiFi Encryption Monitor</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>Explanation:</strong> Evaluates SSID security parameters, encryption levels, and DNS settings.<br/>
                      <strong>Benefits:</strong> Warns against public networks, DNS poisoning, and MitM session interceptions.<br/>
                      <strong className="text-yellow-500/90">Risks:</strong> Queries the wireless interface and active routing directories.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSource('wifi')}
                    className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sources.wifi 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {sources.wifi ? 'Granted (Revoke)' : 'Grant Permission'}
                  </button>
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                  <div className="space-y-1 pr-4">
                    <h4 className="font-semibold text-slate-200 text-sm">Travel Anomaly Tracker</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>Explanation:</strong> Maps your login geographic coordinate distances in real time.<br/>
                      <strong>Benefits:</strong> Triggers immediate alerts if a transaction occurs 1000km away from your position.<br/>
                      <strong className="text-yellow-500/90">Risks:</strong> Queries browser location coordinates on authentication.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSource('location_tracking')}
                    className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sources.location_tracking 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {sources.location_tracking ? 'Granted (Revoke)' : 'Grant Permission'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800/80">
                <button onClick={handleBack} className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                  ← Back
                </button>
                <button onClick={handleNext} className="px-5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                  Next Step: Complete Setup
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Confirmation */}
          {step === 6 && (
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto">
                <span className="text-3xl">🚀</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Shields Configured Successfully!</h3>
                <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
                  Your opt-in settings have been saved. You can revoke any permission, connect additional sources, or purge your data at any time from the Connection Center.
                </p>
              </div>

              <div className="max-w-xs mx-auto p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-left space-y-2">
                <h5 className="text-xs font-bold text-slate-300">SUMMARY OF ACTIVE SHIELDS:</h5>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  <li>Chrome Ingestion: <span className={sources.chrome ? "text-emerald-400 font-semibold" : "text-slate-500"}>{sources.chrome ? "ACTIVE" : "INACTIVE"}</span></li>
                  <li>Firefox Ingestion: <span className={sources.firefox ? "text-emerald-400 font-semibold" : "text-slate-500"}>{sources.firefox ? "ACTIVE" : "INACTIVE"}</span></li>
                  <li>Gmail Core Scanning: <span className={sources.gmail ? "text-emerald-400 font-semibold" : "text-slate-500"}>{sources.gmail ? "ACTIVE" : "INACTIVE"}</span></li>
                  <li>Device Log Monitoring: <span className={sources.windows_logs ? "text-emerald-400 font-semibold" : "text-slate-500"}>{sources.windows_logs ? "ACTIVE" : "INACTIVE"}</span></li>
                  <li>Network Scan Monitor: <span className={sources.wifi ? "text-emerald-400 font-semibold" : "text-slate-500"}>{sources.wifi ? "ACTIVE" : "INACTIVE"}</span></li>
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
                  Activate My Assistant & Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
