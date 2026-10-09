import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sun, 
  StickyNote, 
  CheckSquare, 
  BarChart2, 
  BookOpen, 
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'My Day', icon: Sun },
    { to: '/notes', label: 'Notes', icon: StickyNote },
    { to: '/all-tasks', label: 'All Tasks', icon: CheckSquare },
    { to: '/weekly', label: 'Weekly Overview', icon: BarChart2 },
    { to: '/reflections', label: 'Daily Reflection', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="sidebar">
      {/* App Branding */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Sun className="brand-icon" size={24} />
          <div className="brand-glow" />
        </div>
        <div className="brand-text">
          <span className="brand-name">DayFlow</span>
          <span className="brand-tagline">Make Today Count</span>
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
        <div className="motivational-card">
          <Sparkles size={16} className="quote-icon" />
          <p className="quote-text">“Small steps make beautiful progress.”</p>
        </div>
      </div>
    </aside>
  );
}
