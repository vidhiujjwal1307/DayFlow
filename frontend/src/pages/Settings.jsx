import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, User, Clock, Calendar, Bell } from 'lucide-react';
import { SettingsAPI } from '../services/api';
import './Settings.css';

export default function Settings({ onToast, onNameChange }) {
  const [formData, setFormData] = useState({
    preferred_name: 'Friend',
    theme: 'light',
    default_start_time: '09:00',
    default_end_time: '18:00',
    week_start: 'Monday',
    reminders_enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    SettingsAPI.get()
      .then((data) => {
        if (data) {
          setFormData({
            preferred_name: data.preferred_name || 'Friend',
            theme: data.theme || 'light',
            default_start_time: data.default_start_time || '09:00',
            default_end_time: data.default_end_time || '18:00',
            week_start: data.week_start || 'Monday',
            reminders_enabled: data.reminders_enabled ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await SettingsAPI.update(formData);
      if (onNameChange && updated.preferred_name) {
        onNameChange(updated.preferred_name);
      }
      if (onToast) onToast('Preferences saved successfully.');
    } catch (err) {
      if (onToast) onToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Settings</h1>
          <p className="page-subtitle">Customize DayFlow to harmonize with your lifestyle.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner-teal" />
          <p>Loading your preferences...</p>
        </div>
      ) : (
        <div className="card settings-card">
          <form onSubmit={handleSubmit} className="settings-form">
            {/* Preferred Name */}
            <div className="form-group">
              <label htmlFor="pref-name">
                <User size={16} className="settings-field-icon" /> Preferred Name / Greeting
              </label>
              <input
                id="pref-name"
                type="text"
                placeholder="How should DayFlow greet you?"
                value={formData.preferred_name}
                onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
                required
              />
              <span className="field-hint">Appears in your morning and evening dashboard greetings.</span>
            </div>

            {/* Daily Working Hours Range */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pref-start">
                  <Clock size={16} className="settings-field-icon" /> Default Day Start
                </label>
                <input
                  id="pref-start"
                  type="time"
                  value={formData.default_start_time}
                  onChange={(e) => setFormData({ ...formData, default_start_time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pref-end">
                  <Clock size={16} className="settings-field-icon" /> Default Day Wind-Down
                </label>
                <input
                  id="pref-end"
                  type="time"
                  value={formData.default_end_time}
                  onChange={(e) => setFormData({ ...formData, default_end_time: e.target.value })}
                />
              </div>
            </div>

            {/* Week Start */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pref-week">
                  <Calendar size={16} className="settings-field-icon" /> Week Starts On
                </label>
                <select
                  id="pref-week"
                  value={formData.week_start}
                  onChange={(e) => setFormData({ ...formData, week_start: e.target.value })}
                >
                  <option value="Monday">Monday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="pref-theme">Theme</label>
                <select
                  id="pref-theme"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                >
                  <option value="light">Fresh Morning Light (#F8FAF7)</option>
                </select>
              </div>
            </div>

            {/* Reminders Toggle */}
            <div className="settings-toggle-group">
              <div className="toggle-info">
                <span className="toggle-title">Gentle Notifications & Mindful Nudges</span>
                <span className="toggle-subtitle">Display encouraging reminders and task alerts</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={formData.reminders_enabled}
                  onChange={(e) => setFormData({ ...formData, reminders_enabled: e.target.checked })}
                />
                <span className="slider round" />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
