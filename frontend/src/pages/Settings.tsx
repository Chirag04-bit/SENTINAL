import { useState } from 'react';
import { Shield, Bell, Palette, Lock, Eye, Save } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import toast from 'react-hot-toast';

interface SettingsProps { role: 'user' | 'admin'; }
type Tab = 'profile' | 'security' | 'notifications' | 'appearance' | 'privacy';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',       label: 'Profile',       icon: <Shield className="w-4 h-4" /> },
  { id: 'security',      label: 'Security',       icon: <Lock className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications',  icon: <Bell className="w-4 h-4" /> },
  { id: 'appearance',    label: 'Appearance',     icon: <Palette className="w-4 h-4" /> },
  { id: 'privacy',       label: 'Privacy',        icon: <Eye className="w-4 h-4" /> },
];

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative w-10 h-5 rounded-full transition-all duration-200 ${checked ? 'bg-primary' : 'bg-white/10'}`}
  >
    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${checked ? 'left-5' : 'left-0.5'}`} />
  </button>
);

// ─── Isolated toggle rows (hooks safe) ───────────────────────────────────────
const SecurityToggleRow = ({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <Toggle checked={on} onChange={() => setOn(!on)} />
    </div>
  );
};

const PrivacyToggleRow = ({ label, desc }: { label: string; desc: string }) => {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <Toggle checked={on} onChange={() => setOn(!on)} />
    </div>
  );
};

export default function Settings({ role }: SettingsProps) {
  const { user, token, login: updateAuthUser } = useAuth();
  const [tab, setTab]         = useState<Tab>('profile');
  const [name, setName]       = useState(user?.name || '');
  const [email, setEmail]     = useState(user?.email || '');
  const [notifs, setNotifs]   = useState({ email: true, inApp: true, critical: true, weekly: false });
  const [darkMode, setDark]   = useState(true);

  const save = async () => {
    try {
      const updatedUser = await updateProfile({ name });
      if (token) updateAuthUser(updatedUser, token);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save changes.');
      console.error(err);
    }
  };

  return (
    <PageWrapper role={role} title="Settings" subtitle="Manage your account, security, and preferences">
      <div className="page-content">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar tabs */}
          <div className="w-full md:w-48 flex-shrink-0">
            <div className="card p-2 space-y-0.5">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`nav-link w-full ${tab === t.id ? 'active' : ''}`}>
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content panel */}
          <div className="flex-1 card p-6 animate-fade-in">

            {/* ── PROFILE ── */}
            {tab === 'profile' && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-white mb-4">Profile Information</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                    AS
                  </div>
                  <div>
                    <p className="text-white font-semibold">{name}</p>
                    <p className="text-slate-500 text-sm">{email}</p>
                    <button className="text-xs text-accent hover:underline mt-1">Change Avatar</button>
                  </div>
                </div>
                <div>
                  <label className="section-label">Full Name</label>
                  <input className="input" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="section-label">Email</label>
                  <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="section-label">Role</label>
                  <div className="input flex items-center gap-2 cursor-not-allowed opacity-60">
                    <Shield className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs capitalize">{role}</span>
                  </div>
                </div>
                <button onClick={save} className="btn-primary gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            )}

            {/* ── SECURITY ── */}
            {tab === 'security' && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-white mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="section-label">Current Password</label>
                    <input type="password" className="input" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="section-label">New Password</label>
                    <input type="password" className="input" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="section-label">Confirm New Password</label>
                    <input type="password" className="input" placeholder="Confirm new password" />
                  </div>
                  <button onClick={() => toast.success('Password updated!')} className="btn-primary">Update Password</button>
                </div>
                <div className="divider" />
                <div className="space-y-3">
                  <SecurityToggleRow label="Two-Factor Authentication" desc="Add an extra layer of security to your account" defaultOn={false} />
                  <SecurityToggleRow label="Login Alerts" desc="Get notified when your account is accessed from a new device" defaultOn={true} />
                  <SecurityToggleRow label="Suspicious Activity Lock" desc="Automatically lock account when critical risk is detected" defaultOn={true} />
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {tab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white mb-4">Notification Preferences</h3>
                {([ 
                  { key: 'email',    label: 'Email Notifications',    desc: 'Receive alerts via email' },
                  { key: 'inApp',    label: 'In-App Notifications',   desc: 'Show notifications inside the dashboard' },
                  { key: 'critical', label: 'Critical Alert Emails',  desc: 'Always email for critical severity alerts' },
                  { key: 'weekly',   label: 'Weekly Report Email',    desc: 'Receive automated weekly security summary report' },
                ] as const).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <Toggle
                      checked={notifs[key]}
                      onChange={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                    />
                  </div>
                ))}
                <button onClick={save} className="btn-primary gap-2 mt-2">
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {tab === 'appearance' && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-white mb-4">Appearance</h3>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">Dark Mode</p>
                    <p className="text-xs text-slate-500">SENTINEL is optimized for dark mode</p>
                  </div>
                  <Toggle checked={darkMode} onChange={() => { setDark(!darkMode); toast('Dark mode always recommended for SOC dashboards 😎'); }} />
                </div>
                <div>
                  <label className="section-label">Language</label>
                  <select className="input text-sm">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="section-label">Alert Threshold (Risk Score)</label>
                  <p className="text-xs text-slate-500 mb-2">Only generate alerts above this score</p>
                  <input type="range" min="0" max="100" defaultValue="40" className="w-full accent-primary" />
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>0 — All events</span>
                    <span>100 — Critical only</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── PRIVACY ── */}
            {tab === 'privacy' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white mb-4">Privacy Settings</h3>
                <PrivacyToggleRow label="Activity Logging"        desc="Allow SENTINEL to log your dashboard activity for audit purposes" />
                <PrivacyToggleRow label="Analytics Sharing"       desc="Share anonymized usage data to improve the AI model" />
                <PrivacyToggleRow label="Third-party Integrations" desc="Allow integration with external security tools" />
                <div className="divider" />
                <div className="p-4 rounded-lg bg-danger/5 border border-danger/15">
                  <p className="text-sm font-semibold text-danger mb-1">Danger Zone</p>
                  <p className="text-xs text-slate-400 mb-3">These actions cannot be undone.</p>
                  <button
                    onClick={() => toast.error('Account deletion requires admin approval.')}
                    className="btn-danger btn-sm"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
