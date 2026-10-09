import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  Smile, 
  Save, 
  Calendar as CalendarIcon, 
  History, 
  ChevronLeft, 
  ChevronRight,
  Sun,
  Flame,
  Coffee
} from 'lucide-react';
import { ReflectionAPI } from '../services/api';
import './DailyReflection.css';

export default function DailyReflection({ onToast }) {
  const getTodayStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [date, setDate] = useState(getTodayStr());
  const [reflection, setReflection] = useState({
    went_well: '',
    accomplished: '',
    improve_tomorrow: '',
    grateful_for: '',
    mood: 'Peaceful',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allReflections, setAllReflections] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const moods = [
    { label: 'Peaceful', icon: '🌿' },
    { label: 'Energized', icon: '⚡' },
    { label: 'Proud', icon: '🌟' },
    { label: 'Grateful', icon: '💛' },
    { label: 'Restful', icon: '☕' },
  ];

  const loadReflection = async (targetDate) => {
    try {
      setLoading(true);
      const data = await ReflectionAPI.getByDate(targetDate);
      if (data) {
        setReflection({
          went_well: data.went_well || '',
          accomplished: data.accomplished || '',
          improve_tomorrow: data.improve_tomorrow || '',
          grateful_for: data.grateful_for || '',
          mood: data.mood || 'Peaceful',
        });
      } else {
        setReflection({
          went_well: '',
          accomplished: '',
          improve_tomorrow: '',
          grateful_for: '',
          mood: 'Peaceful',
        });
      }
    } catch (err) {
      // not found is normal for fresh date
      setReflection({
        went_well: '',
        accomplished: '',
        improve_tomorrow: '',
        grateful_for: '',
        mood: 'Peaceful',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await ReflectionAPI.getAll();
      setAllReflections(data);
    } catch (err) {}
  };

  useEffect(() => {
    loadReflection(date);
    loadHistory();
  }, [date]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await ReflectionAPI.save({
        date,
        ...reflection,
      });
      if (onToast) onToast('Reflection saved with calm intention.');
      loadHistory();
    } catch (err) {
      if (onToast) onToast('Failed to save reflection', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDateStep = (step) => {
    const [y, m, d] = date.split('-');
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + step);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <div className="reflection-page">
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Daily Reflection</h1>
          <p className="page-subtitle">Pause, exhale, and honor your efforts today.</p>
        </div>

        <div className="page-header-actions">
          {/* Date Selector Navigation */}
          <div className="date-picker-wrap">
            <button className="btn-icon date-step-btn" onClick={() => handleDateStep(-1)}>
              <ChevronLeft size={18} />
            </button>
            <label className="date-display-label">
              <CalendarIcon size={16} className="date-cal-icon" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="hidden-date-input"
              />
              <span className="date-text">{date}</span>
            </label>
            <button className="btn-icon date-step-btn" onClick={() => handleDateStep(1)}>
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            className="btn-outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History size={16} />
            <span>{showHistory ? 'Hide Journal' : 'Past Reflections'}</span>
          </button>
        </div>
      </div>

      {showHistory ? (
        <div className="history-section card">
          <h3 className="history-title">Your Reflection Journal</h3>
          {allReflections.length === 0 ? (
            <p className="empty-history-text">No reflections recorded yet. Your journey begins today!</p>
          ) : (
            <div className="history-grid">
              {allReflections.map((item) => (
                <div
                  key={item.id}
                  className="history-entry-card"
                  onClick={() => {
                    setDate(item.date);
                    setShowHistory(false);
                  }}
                >
                  <div className="history-entry-top">
                    <span className="history-entry-date">{item.date}</span>
                    {item.mood && <span className="history-entry-mood">{item.mood}</span>}
                  </div>
                  {item.accomplished && (
                    <p className="history-entry-snippet">
                      <strong>Accomplished:</strong> {item.accomplished}
                    </p>
                  )}
                  {item.grateful_for && (
                    <p className="history-entry-snippet">
                      <strong>Grateful:</strong> {item.grateful_for}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card reflection-card">
          <form onSubmit={handleSave} className="reflection-form">
            {/* Mood selector */}
            <div className="form-group mood-selector-wrap">
              <label>How did today feel overall?</label>
              <div className="mood-options">
                {moods.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    className={`mood-btn ${reflection.mood === m.label ? 'active' : ''}`}
                    onClick={() => setReflection({ ...reflection, mood: m.label })}
                  >
                    <span className="mood-emoji">{m.icon}</span>
                    <span className="mood-name">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt 1 */}
            <div className="form-group">
              <label htmlFor="ref-well">
                <Sun size={16} className="prompt-icon teal" />
                What went well today?
              </label>
              <textarea
                id="ref-well"
                rows={3}
                placeholder="A conversation that brought joy, deep focus on a task, taking a refreshing walk..."
                value={reflection.went_well}
                onChange={(e) => setReflection({ ...reflection, went_well: e.target.value })}
              />
            </div>

            {/* Prompt 2 */}
            <div className="form-group">
              <label htmlFor="ref-accomplished">
                <Sparkles size={16} className="prompt-icon amber" />
                What did I accomplish?
              </label>
              <textarea
                id="ref-accomplished"
                rows={3}
                placeholder="Finished my reading, kept up with my commitments, showed kindness to myself..."
                value={reflection.accomplished}
                onChange={(e) => setReflection({ ...reflection, accomplished: e.target.value })}
              />
            </div>

            {/* Prompt 3 */}
            <div className="form-group">
              <label htmlFor="ref-improve">
                <Coffee size={16} className="prompt-icon blue" />
                What could I gently improve tomorrow?
              </label>
              <textarea
                id="ref-improve"
                rows={3}
                placeholder="Drink more water, start winding down 30 minutes earlier, take pauses between tasks..."
                value={reflection.improve_tomorrow}
                onChange={(e) => setReflection({ ...reflection, improve_tomorrow: e.target.value })}
              />
            </div>

            {/* Prompt 4 */}
            <div className="form-group">
              <label htmlFor="ref-grateful">
                <Heart size={16} className="prompt-icon rose" />
                One thing I'm genuinely grateful for:
              </label>
              <textarea
                id="ref-grateful"
                rows={2}
                placeholder="A warm cup of coffee, a supportive friend, the quiet evening..."
                value={reflection.grateful_for}
                onChange={(e) => setReflection({ ...reflection, grateful_for: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary save-ref-btn" disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Reflection'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
