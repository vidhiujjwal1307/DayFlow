import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  CalendarDays,
  NotebookTabs,
  CheckSquare,
  BarChart2,
  BookOpen, 
  Settings as SettingsIcon,
  Sparkles,
  LogOut,
  Library,
  FolderKanban
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ user, onLogout }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/all-tasks', label: 'Study Plan', icon: CalendarDays },
    { to: '/weekly', label: 'Subjects', icon: Library },
    { to: '/all-tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/weekly', label: 'Calendar', icon: CalendarDays },
    { to: '/notes', label: 'Notes', icon: NotebookTabs },
    { to: '/notes', label: 'Resources', icon: FolderKanban },
    { to: '/weekly', label: 'Analytics', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="sidebar">
      {/* App Branding */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <CalendarDays className="brand-icon" size={23} />
        </div>
        <div className="brand-text">
          <span className="brand-name">Scheduly</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Motivational Footer Note */}
      <div className="sidebar-footer">
        <div className="sidebar-account">
          <div className="account-avatar">{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</div>
          <div className="account-details">
            <strong>{user?.name || 'Your account'}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="account-logout" onClick={onLogout} title="Sign out" aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
        <div className="motivational-card">
          <Sparkles size={16} className="quote-icon" />
          <p className="quote-text">“Small steps make beautiful progress.”</p>
        </div>
      </div>
    </aside>
  );
}
