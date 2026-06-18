import { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, School, Smartphone, Megaphone, CreditCard,
  ScrollText, Users, Settings, ShieldCheck, Menu, Bell, Search,
  LogOut, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useData } from '../data/store.jsx';
import { Avatar } from './ui.jsx';

const NAV = [
  { section: 'Overview' },
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/schools', label: 'Schools', icon: School, badgeKey: 'schools' },
  { section: 'Platform Control' },
  { to: '/mobile-app', label: 'Mobile App Control', icon: Smartphone },
  { to: '/broadcasts', label: 'Broadcasts', icon: Megaphone },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { section: 'Administration' },
  { to: '/activity', label: 'Activity Log', icon: ScrollText },
  { to: '/team', label: 'Team & Access', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { schools } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const counts = { schools: schools.length };
  const title = pageTitle(location.pathname);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo"><ShieldCheck size={22} /></div>
          <div>
            <h1>ParentFocus</h1>
            <span>Owner Console</span>
          </div>
        </div>

        <nav className="nav-scroll">
          {NAV.map((item, i) =>
            item.section ? (
              <div key={i} className="nav-section-label">{item.section}</div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.badgeKey && <span className="nav-badge">{counts[item.badgeKey]}</span>}
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <Avatar name={user?.name} />
            <div className="sidebar-user-info flex-1">
              <b>{user?.name}</b>
              <span>{user?.role}</span>
            </div>
            <button className="icon-btn" style={{ color: 'rgba(255,255,255,0.6)' }} title="Sign out"
              onClick={() => { logout(); navigate('/login'); }}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="sidebar-backdrop show" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-toggle" onClick={() => setOpen((v) => !v)}><Menu size={20} /></button>
          <div className="flex-1">
            <h2>{title}</h2>
          </div>
          <div className="topbar-search">
            <Search size={16} className="text-muted" />
            <input
              placeholder="Search schools…"
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/schools?q=' + encodeURIComponent(e.target.value)); }}
            />
          </div>
          <button className="icon-btn" title="Notifications"><Bell size={19} /><span className="dot" /></button>
          <div className="flex items-center gap-sm" style={{ paddingLeft: 4 }}>
            <Avatar name={user?.name} size={34} />
            <ChevronDown size={15} className="text-muted" style={{ display: 'none' }} />
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}

function pageTitle(path) {
  if (path === '/') return 'Dashboard';
  if (path.startsWith('/schools')) return 'Schools';
  if (path.startsWith('/mobile-app')) return 'Mobile App Control';
  if (path.startsWith('/broadcasts')) return 'Broadcasts';
  if (path.startsWith('/subscriptions')) return 'Subscriptions';
  if (path.startsWith('/activity')) return 'Activity Log';
  if (path.startsWith('/team')) return 'Team & Access';
  if (path.startsWith('/settings')) return 'Settings';
  return 'ParentFocus';
}
