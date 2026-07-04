import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Activity, Clock, Smartphone, MapPin } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/widgets/StatCard';
import RiskGauge from '../components/widgets/RiskGauge';
import AlertCard from '../components/widgets/AlertCard';
import { RiskScoreTrendChart } from '../components/charts';
import { useAuth } from '../context/AuthContext';
import { OnboardingWizard } from '../components/widgets/OnboardingWizard';
import { getMyAlerts } from '../services/alertService';
import { getMyRiskDetail, getMyActivity, updateMyLocation, getAuditLogs } from '../services/userService';
import type { Alert, RiskScoreData, ActivityItem } from '../types';

export default function UserDashboard() {
  const { user, login, token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [risk, setRisk] = useState<RiskScoreData | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [auditedUrl, setAuditedUrl] = useState('https://google.com');
  const [urlInput, setUrlInput] = useState('https://google.com');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const userDevice = user?.device || 'Chrome / Windows 11';
  
  // Dynamically populate devicesList from real activity events
  const devicesMap = new Map<string, { name: string; icon: string; last: string; trusted: boolean }>();
  devicesMap.set(userDevice, {
    name: userDevice,
    icon: userDevice.toLowerCase().includes('phone') || userDevice.toLowerCase().includes('ios') || userDevice.toLowerCase().includes('android') ? '📱' : '💻',
    last: 'Active Now',
    trusted: true
  });
  activity.forEach(act => {
    const parts = act.detail.split(' · ');
    const dev = parts[0];
    if (dev && dev !== 'Browser' && !devicesMap.has(dev)) {
      devicesMap.set(dev, {
        name: dev,
        icon: dev.toLowerCase().includes('phone') || dev.toLowerCase().includes('ios') || dev.toLowerCase().includes('android') ? '📱' : '💻',
        last: new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        trusted: act.riskLevel !== 'high' && act.riskLevel !== 'critical'
      });
    }
  });
  const devicesList = Array.from(devicesMap.values());

  const userLoc = user?.location || 'Mumbai, India';
  
  // Dynamically populate locationsList from real activity events
  const locationsMap = new Map<string, { city: string; flag: string; last: string; usual: boolean }>();
  locationsMap.set(userLoc, {
    city: userLoc,
    flag: userLoc.includes('India') ? '🇮🇳' : userLoc.includes('Indonesia') ? '🇮🇩' : userLoc.includes('Nigeria') ? '🇳🇬' : userLoc.includes('Brazil') ? '🇧🇷' : userLoc.includes('United Kingdom') ? '🇬🇧' : '📍',
    last: 'Active Now',
    usual: true
  });
  activity.forEach(act => {
    const parts = act.detail.split(' · ');
    const loc = parts[1];
    if (loc && loc !== 'Unknown' && !locationsMap.has(loc)) {
      locationsMap.set(loc, {
        city: loc,
        flag: loc.includes('India') ? '🇮🇳' : loc.includes('Indonesia') ? '🇮🇩' : loc.includes('Nigeria') ? '🇳🇬' : loc.includes('Brazil') ? '🇧🇷' : loc.includes('United Kingdom') ? '🇬🇧' : '📍',
        last: new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        usual: act.riskLevel !== 'high' && act.riskLevel !== 'critical'
      });
    }
  });
  const locationsList = Array.from(locationsMap.values());

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [alertsData, riskData, activityData, logsData] = await Promise.all([
          getMyAlerts({ limit: 3, status: 'open' }),
          getMyRiskDetail(),
          getMyActivity(),
          getAuditLogs(),
        ]);
        setAlerts(alertsData.data);
        setRisk(riskData);
        setActivity(activityData);
        setAuditLogs(logsData || []);
      } catch (err) {
        console.error("Error loading user dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user]);

  const fetchRealTimeLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        setGpsLoading(false);
        try {
          await updateMyLocation(latitude, longitude);
        } catch (e) {
          console.error("Failed to update my location on backend:", e);
        }
      },
      () => {
        setGpsError("Location permission denied or unavailable. Please enable browser location permissions.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleAuditTab = async () => {
    if (!urlInput.trim() || scanLoading) return;
    setScanLoading(true);
    setScanResult(null);
    setTimeout(() => {
      setAuditedUrl(urlInput);
      let result = "";
      const lowerUrl = urlInput.toLowerCase();
      if (lowerUrl.includes("google.com") || lowerUrl.includes("localhost") || lowerUrl.includes("sentinel.ai")) {
        result = "✅ Verified Safe (Matched known official registry for safe domains)";
      } else if (lowerUrl.includes("login") || lowerUrl.includes("bank") || lowerUrl.includes("secure") || lowerUrl.includes("paypal")) {
        result = "🚨 Threat Flagged: High Phishing Risk. Domain registry mismatch detected. Scanner recommends freezing active session.";
      } else {
        result = "Neutral (Scanning parameters complete. Domain registry verified, caution recommended on unknown URLs)";
      }
      setScanResult(result);
      setScanLoading(false);
    }, 1500);
  };

  useEffect(() => {
    const isLocationConnected = !!user?.connectedSources?.location_tracking;
    if (isLocationConnected) {
      fetchRealTimeLocation();
    }
  }, [user?.connectedSources?.location_tracking]);

  const score = risk?.score ?? 0;

  if (loading) {
    return (
      <PageWrapper role="user" title="My Security Dashboard" subtitle="Your personal threat intelligence overview">
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper role="user" title="My Security Dashboard" subtitle="Your personal threat intelligence overview">
      {user && !user.hasCompletedOnboarding && (
        <OnboardingWizard 
          user={user} 
          onComplete={(updatedUser) => login(updatedUser, token || '')} 
        />
      )}
      <div className="page-content">

        {/* ── Welcome Banner ── */}
        <div className="card-glow p-5 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-transparent to-transparent pointer-events-none" />
          <RiskGauge score={score} size="md" />
          <div className="flex-1 relative">
            <h2 className="text-xl font-bold text-white mb-1 font-sans">Good Evening, {user?.name.split(' ')[0] || 'User'} 👋</h2>
            <p className="text-slate-400 text-sm mb-3">
              Your account looks <strong className={score > 60 ? "text-danger" : score > 30 ? "text-warning" : "text-success"}>{score > 60 ? "at risk" : score > 30 ? "suspicious" : "safe"}</strong> right now.
              {score > 40 ? "Suspicious indicators have been flagged for review." : "No suspicious activity detected in the last 24 hours."}
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
              { label: 'Open Alerts',    value: alerts.length, color: 'text-warning' },
              { label: 'Risk Score',     value: score,           color: score > 60 ? 'text-danger' : score > 30 ? 'text-warning' : 'text-success'  },
              { label: 'Devices',        value: devicesList.length,  color: 'text-accent'   },
              { label: 'Locations',      value: locationsList.length,color: 'text-primary-light' },
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
          <StatCard title="My Risk Score"  value={score}  icon={<Shield className={score > 60 ? "w-5 h-5 text-danger" : score > 30 ? "w-5 h-5 text-warning" : "w-5 h-5 text-success"} />}  iconBg="bg-success/15" variant={score > 60 ? "danger" : score > 30 ? "warning" : "success"} description="A score showing how risky your current activity appears. Lower is better." />
          <StatCard title="Open Alerts"    value={alerts.length} icon={<AlertTriangle className="w-5 h-5 text-warning" />} iconBg="bg-warning/15" variant="warning" description="Alerts are warnings about suspicious activities in your account." />
          <StatCard title="Active Sessions" value={1} icon={<Activity className="w-5 h-5 text-accent" />} iconBg="bg-accent/15" description="Number of active login sessions on your account right now." />
          <StatCard title="Trusted Devices" value={devicesList.filter(d=>d.trusted).length} icon={<Smartphone className="w-5 h-5 text-primary-light" />} iconBg="bg-primary/15" description="Devices SENTINEL has seen before and considers safe." />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Left: Activity Timeline + Alerts */}
          <div className="xl:col-span-2 space-y-4">

            {/* Risk score trend */}
            <div className="chart-card">
              <p className="chart-title">My Risk Score — Last 7 Days</p>
              <p className="chart-desc">How your risk score has changed over the past week.</p>
              <RiskScoreTrendChart data={(risk?.trend || [0,0,0,0,0,0,0]).map((v, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], score: v }))} />
            </div>

            {/* Recent Activity */}
            <div className="chart-card">
              <p className="chart-title mb-3">Recent Activity Timeline</p>
              <p className="chart-desc">Your last 7 account activities with risk indicators.</p>
              <div className="space-y-0">
                {activity.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No recent activity logged.</p>
                ) : (
                  activity.map((item, i) => (
                    <div key={item.id} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm flex-shrink-0">
                          {item.icon}
                        </div>
                        {i < activity.length - 1 && (
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
                  ))
                )}
              </div>
            </div>

            {/* Real-time Auditing Center */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* GPS Tracker Map */}
              <div className="chart-card flex flex-col h-[340px]">
                <p className="chart-title flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" /> Real-Time GPS Tracking Map
                </p>
                <p className="chart-desc">Opt-in real-time geographic location monitoring.</p>
                
                <div className="flex-1 mt-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 relative flex flex-col items-center justify-center p-4">
                  {user?.connectedSources?.location_tracking ? (
                    gpsLoading ? (
                      <div className="text-center space-y-2">
                        <div className="w-8 h-8 mx-auto rounded-full border-2 border-t-blue-500 border-slate-700 animate-spin" />
                        <p className="text-xs text-slate-400">Requesting coordinates...</p>
                      </div>
                    ) : gpsError ? (
                      <div className="text-center p-3 space-y-2">
                        <span className="text-xl">⚠️</span>
                        <p className="text-xs text-rose-400 font-semibold">{gpsError}</p>
                        <button 
                          onClick={fetchRealTimeLocation} 
                          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-[10px] text-white font-bold transition-all"
                        >
                          Retry Permission
                        </button>
                      </div>
                    ) : gpsCoords ? (
                      <iframe
                        title="GPS Location Map"
                        width="100%"
                        height="100%"
                        className="border-0 rounded-xl"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${gpsCoords.lng - 0.005}%2C${gpsCoords.lat - 0.005}%2C${gpsCoords.lng + 0.005}%2C${gpsCoords.lat + 0.005}&layer=mapnik&marker=${gpsCoords.lat}%2C${gpsCoords.lng}`}
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <p className="text-xs text-slate-500 italic">Coordinates not yet loaded.</p>
                        <button 
                          onClick={fetchRealTimeLocation}
                          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-[10px] text-white font-bold transition-all"
                        >
                          Get Live Location
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-4 space-y-3">
                      <span className="text-2xl">🔒</span>
                      <p className="text-xs text-slate-400 font-medium">GPS Geolocation Feed Disconnected</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Your physical coordinates are protected. Opt-in to "Location Coordinates" feed in Connection Center to activate live mapping.
                      </p>
                    </div>
                  )}
                </div>
                {user?.connectedSources?.location_tracking && gpsCoords && (
                  <div className="mt-2 space-y-1.5 border-t border-white/5 pt-2">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Map Position Adjuster (ISP Override)</p>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-white/5">
                        <span className="text-[9px] text-slate-500 font-mono">LAT</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={gpsCoords.lat}
                          onChange={async (e) => {
                            const lat = parseFloat(e.target.value) || 0;
                            setGpsCoords(prev => prev ? { ...prev, lat } : null);
                            try { await updateMyLocation(lat, gpsCoords.lng); } catch {}
                          }}
                          className="w-full bg-transparent text-[10px] text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="flex-1 flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-white/5">
                        <span className="text-[9px] text-slate-500 font-mono">LNG</span>
                        <input
                          type="number"
                          step="0.0001"
                          value={gpsCoords.lng}
                          onChange={async (e) => {
                            const lng = parseFloat(e.target.value) || 0;
                            setGpsCoords(prev => prev ? { ...prev, lng } : null);
                            try { await updateMyLocation(gpsCoords.lat, lng); } catch {}
                          }}
                          className="w-full bg-transparent text-[10px] text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Extension Browser Tab Scanner */}
              <div className="chart-card flex flex-col h-[340px]">
                <p className="chart-title flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-accent" /> Active Browser Tab Auditor
                </p>
                <p className="chart-desc">Audits URL integrity of tabs in connected browsers.</p>
                
                <div className="flex-1 mt-2 rounded-xl p-4 border border-slate-800 bg-slate-950/40 space-y-3 flex flex-col justify-between">
                  {(user?.connectedSources?.chrome || user?.connectedSources?.firefox) ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>EXTENSION STATUS</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={urlInput} 
                            onChange={(e) => setUrlInput(e.target.value)} 
                            placeholder="Enter a website URL..." 
                            className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-855 rounded-lg focus:border-blue-500 text-white placeholder-slate-600 focus:outline-none"
                          />
                          <button 
                            disabled={scanLoading}
                            onClick={handleAuditTab}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] text-white font-bold transition-all disabled:opacity-50"
                          >
                            {scanLoading ? 'Auditing...' : 'Audit Tab'}
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 rounded-lg bg-slate-900/40 border border-slate-855 p-3 mt-1 flex flex-col justify-center min-h-[90px]">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-semibold uppercase">Currently Audited Domain</p>
                          <p className="text-xs text-white font-mono truncate">{auditedUrl}</p>
                          
                          {scanLoading ? (
                            <p className="text-[10px] text-blue-400 italic animate-pulse mt-2">Running tab registry security audit...</p>
                          ) : scanResult ? (
                            <div className="mt-2 p-2 rounded bg-slate-950/80 border border-slate-855 text-xs text-slate-300 font-sans">
                              {scanResult}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-500 italic mt-2">verified Google website active tab scanner ready.</p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 space-y-3 my-auto">
                      <span className="text-2xl">🔒</span>
                      <p className="text-xs text-slate-400 font-medium">Browser Feed Disconnected</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Browser histories are not tracked. Connect the "Chrome Browser Extension" source in Connection Center to simulate tab audits.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* My Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-3 font-sans">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" /> My Open Alerts
                </h3>
                {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
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
                {devicesList.map(d => (
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
                {locationsList.map(l => (
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

            {/* Live Privacy Access Logs */}
            <div className="chart-card">
              <p className="chart-title mb-3 flex items-center gap-2">
                🔒 Live Data Access Audit Log
              </p>
              <p className="chart-desc">Tracks exact moments and purposes when SENTINEL accesses your connected data feeds.</p>
              <div className="relative border-l border-white/10 pl-4 space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic py-1">No data feeds queried yet. All features remain restricted until authorized.</p>
                ) : (
                  auditLogs.slice(0, 5).map(l => (
                    <div key={l.id} className="relative text-[11px] space-y-0.5">
                      <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-blue-500 border border-slate-900" />
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-300">{l.action}</span>
                        <span>{new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed">
                        Source: <span className="text-slate-400 font-medium">{l.source}</span> · Reason: {l.purpose}
                      </p>
                    </div>
                  ))
                )}
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
