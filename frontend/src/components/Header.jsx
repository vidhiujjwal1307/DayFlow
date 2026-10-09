import React from 'react';
import { Plus, Sparkles, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import './Header.css';

export default function Header({
  userName = 'Friend',
  selectedDate,
  onDateChange,
  onOpenTaskModal,
  onOpenAIModal,
}) {
  // Compute greeting based on current system hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good morning', icon: '☀️' };
    if (hour >= 12 && hour < 17) return { text: 'Good afternoon', icon: '🌤️' };
    if (hour >= 17 && hour < 22) return { text: 'Good evening', icon: '✨' };
    return { text: 'Peaceful night', icon: '🌙' };
  };

  const greeting = getGreeting();

  // Format date display (e.g., Friday, October 9, 2026)
  const formatDisplayDate = (dateStr) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleStepDay = (step) => {
    const [year, month, day] = selectedDate.split('-');
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + step);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const isToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}` === selectedDate;
  };

  return (
    <header className="header-container">
      <div className="header-titles">
        <h1 className="header-greeting">
          {greeting.text}, {userName} <span className="greeting-emoji">{greeting.icon}</span>
        </h1>
        <p className="header-subtitle">
          {isToday() ? "Here's your space to make today count." : `Viewing schedule for ${formatDisplayDate(selectedDate)}`}
        </p>
      </div>

      <div className="header-actions">
        {/* Date Selector Navigation */}
        <div className="date-picker-wrap">
          <button
            className="btn-icon date-step-btn"
            onClick={() => handleStepDay(-1)}
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>

          <label className="date-display-label">
            <CalendarIcon size={16} className="date-cal-icon" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="hidden-date-input"
            />
            <span className="date-text">
              {isToday() ? 'Today' : formatDisplayDate(selectedDate)}
            </span>
          </label>

          <button
            className="btn-icon date-step-btn"
            onClick={() => handleStepDay(1)}
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* AI Plan Button */}
        {onOpenAIModal && (
          <button
            className="btn-secondary ai-plan-btn"
            onClick={onOpenAIModal}
            title="Let AI suggest a calm, balanced schedule"
          >
            <Sparkles size={17} className="ai-btn-icon" />
            <span>Plan My Day</span>
          </button>
        )}

        {/* Add Task Primary Action */}
        <button className="btn-primary add-task-btn" onClick={onOpenTaskModal}>
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>
    </header>
  );
}
