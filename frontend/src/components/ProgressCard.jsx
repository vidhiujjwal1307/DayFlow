import React from 'react';
import { CheckCircle2, Clock, Award, Smile } from 'lucide-react';
import './ProgressCard.css';

export default function ProgressCard({
  completedCount = 0,
  totalCount = 0,
  completionRate = 0,
  totalDurationMinutes = 0,
}) {
  // Mindful encouragement based on progress
  const getEncouragement = () => {
    if (totalCount === 0) {
      return {
        message: 'A fresh blank slate. What would bring you peace or accomplishment today?',
        icon: Smile,
      };
    }
    if (completedCount === totalCount && totalCount > 0) {
      return {
        message: 'Wonderful work! You showed up for yourself today and achieved all your goals.',
        icon: Award,
      };
    }
    if (completionRate >= 75) {
      return {
        message: 'Almost there! You are closing out today with grace and determination.',
        icon: Award,
      };
    }
    if (completionRate >= 50) {
      return {
        message: 'Halfway through! Look at you making steady, beautiful progress.',
        icon: CheckCircle2,
      };
    }
    if (completionRate > 0) {
      return {
        message: 'Off to a lovely start! One small, mindful step at a time.',
        icon: Smile,
      };
    }
    return {
      message: 'Take a deep breath. Focus on just your next single task.',
      icon: Smile,
    };
  };

  const encouragement = getEncouragement();
  const EncouragementIcon = encouragement.icon;

  const hours = Math.floor(totalDurationMinutes / 60);
  const mins = totalDurationMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;

  return (
    <div className="card progress-card">
      <div className="progress-content">
        <div className="progress-left">
          <div className="progress-header-row">
            <h2 className="progress-title">Today's Flow</h2>
            <span className="progress-fraction">
              <strong>{completedCount}</strong> of <strong>{totalCount}</strong> done
            </span>
          </div>

          <p className="encouragement-text">
            <EncouragementIcon size={16} className="encouragement-icon" />
            {encouragement.message}
          </p>

          {/* Animated Progress Bar */}
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
            />
          </div>

          <div className="progress-footer-stats">
            <div className="stat-pill">
              <CheckCircle2 size={14} className="stat-icon" />
              <span>{Math.round(completionRate)}% completed</span>
            </div>
            {totalDurationMinutes > 0 && (
              <div className="stat-pill">
                <Clock size={14} className="stat-icon" />
                <span>{timeFormatted} scheduled</span>
              </div>
            )}
          </div>
        </div>

        {/* Circular Progress Indicator for Visual Depth */}
        <div className="progress-circle-wrap">
          <svg className="progress-circle-svg" viewBox="0 0 100 100">
            <circle
              className="circle-bg"
              cx="50"
              cy="50"
              r="40"
              strokeWidth="9"
            />
            <circle
              className="circle-fill"
              cx="50"
              cy="50"
              r="40"
              strokeWidth="9"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - (totalCount > 0 ? completionRate / 100 : 0))}
            />
          </svg>
          <div className="circle-inner-text">
            <span className="circle-percent">{Math.round(completionRate)}%</span>
            <span className="circle-sub">Focus</span>
          </div>
        </div>
      </div>
    </div>
  );
}
