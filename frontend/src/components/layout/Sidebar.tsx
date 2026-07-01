import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bell, BarChart3, FileText, Settings,
  LogOut, Shield, Users, Search, Radio, ChevronLeft, ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  role: 'user' | 'admin';
}

const USER_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
  { to: '/alerts',    icon: AlertTriangle,   label: 'My Alerts'    },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics'    },
  { to: '/reports',   icon: FileText,        label: 'Reports'      },
  { to: '/settings',  icon: Settings,        label: 'Settings'     },
];

const ADMIN_LINKS = [
  { to: '/admin',           icon: Radio,          label: 'Live Monitor'  },
  { to: '/admin/alerts',    icon: AlertTriangle,  label: 'All Alerts'   },
  { to: '/admin/analytics', icon: BarChart3,      label: 'Analytics'    },
  { to: '/admin/reports',   icon: FileText,       label: 'Reports'      },
  { to: '/admin/settings',  icon: Settings,       label: 'Settings'     },
];

export default function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const links = role === 'admin' ? ADMIN_LINKS : USER_LINKS;

  return (
    <aside
      className={`relative flex flex-col h-screen border-r border-white/5 transition-all duration-300 ease-in-out
                  ${collapsed ? 'w-16' : 'w-56'}`}
      style={{ background: 'rgba(8,12,28,0.95)', backdropFilter: 'blur(12px)' }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0 shadow-glow-cyan">
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-bold text-sm tracking-wide">SENTINEL</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="live-dot w-1.5 h-1.5" />
              <span className="text-xs text-success font-medium">Live</span>
            </div>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-2">
          <span className={`badge text-[10px] ${role === 'admin' ? 'badge-critical' : 'badge-info'}`}>
            {role === 'admin' ? '⚡ Admin' : '👤 User'}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-2 py-2 space-y-0.5">
        {!collapsed && <p className="section-label px-2">Navigation</p>}
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/dashboard'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {role === 'admin' && !collapsed && (
          <>
            <div className="divider" />
            <p className="section-label px-2">Management</p>
            <button className="nav-link w-full">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>
            <button className="nav-link w-full">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </>
        )}
      </nav>

      {/* Switch role shortcut */}
      {!collapsed && (
        <div className="px-3 py-2 border-t border-white/5">
          <button
            onClick={() => navigate(role === 'admin' ? '/dashboard' : '/admin')}
            className="nav-link w-full text-xs text-slate-500 hover:text-accent"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Switch to {role === 'admin' ? 'User View' : 'Admin View'}</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="nav-link w-full text-xs text-slate-500 hover:text-danger"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-navy-800 border border-white/10
                   flex items-center justify-center text-slate-400 hover:text-white hover:border-accent/30
                   transition-all duration-150 z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
