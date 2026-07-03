import { Bell, Search, Shield, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  title: string;
  subtitle?: string;
  role: 'user' | 'admin';
}

export default function TopBar({ title, subtitle, role }: TopBarProps) {
  const { user } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

  const typeColor = (type: string) => {
    if (type === 'alert')   return 'text-danger';
    if (type === 'warning') return 'text-warning';
    if (type === 'success') return 'text-success';
    return 'text-accent';
  };

  const typeIcon = (type: string) => {
    if (type === 'alert')   return '🚨';
    if (type === 'warning') return '⚠️';
    if (type === 'success') return '✅';
    return 'ℹ️';
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 relative z-30"
      style={{ background: 'rgba(8,12,28,0.8)', backdropFilter: 'blur(12px)' }}
    >
      {/* Left — Title */}
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      {/* Right — Controls */}
      <div className="flex items-center gap-3">

        {/* Search bar */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
          <input
            className="input pl-9 w-52 h-8 text-xs"
            placeholder="Search alerts, users, events..."
          />
        </div>

        {/* Threat level chip */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20">
          <span className="live-dot" />
          <span className="text-xs font-semibold text-danger">ELEVATED THREAT</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center
                       justify-center hover:bg-white/10 transition-all"
          >
            <Bell className="w-4 h-4 text-slate-400" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white
                               text-[9px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-10 w-80 card shadow-card z-50 animate-slide-in-right">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <span className="badge badge-info">{unread} new</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map(n => (
                  <div key={n.id}
                    className={`flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.03]
                                cursor-pointer transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <span className="text-base mt-0.5">{typeIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${typeColor(n.type)}`}>{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{n.message}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.timestamp)}</p>
                    </div>
                    {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center">
                <button className="text-xs text-accent hover:underline">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10
                           hover:bg-white/10 transition-all">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-medium text-white hidden sm:block">
            {user?.name || (role === 'admin' ? 'Admin' : 'User')}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>
      </div>
    </header>
  );
}
