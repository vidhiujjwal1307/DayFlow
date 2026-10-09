import React from 'react';
import { 
  Check, 
  Clock, 
  Calendar, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Repeat,
  ArrowRight
} from 'lucide-react';
import './TaskCard.css';

export default function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onReschedule,
  isOverdue = false,
}) {
  const {
    id,
    title,
    description,
    date,
    start_time,
    end_time,
    category,
    priority,
    estimated_duration,
    recurrence,
    completed,
  } = task;

  return (
    <div className={`task-card ${completed ? 'is-completed' : ''} ${isOverdue ? 'is-overdue' : ''}`}>
      {/* Checkbox */}
      <button
        className={`task-checkbox ${completed ? 'checked' : ''}`}
        onClick={() => onToggle(id)}
        aria-label={completed ? 'Mark task incomplete' : 'Mark task complete'}
      >
        {completed && <Check size={14} className="check-icon" strokeWidth={3} />}
      </button>

      {/* Task Information */}
      <div className="task-content">
        <div className="task-header-line">
          <h3 className="task-title">{title}</h3>
          
          <div className="task-badges">
            {category && (
              <span className={`category-badge category-${category}`}>
                {category}
              </span>
            )}
            {priority && (
              <span className={`priority-badge priority-${priority}`}>
                {priority}
              </span>
            )}
            {recurrence && recurrence !== 'None' && (
              <span className="recurrence-badge" title={`Repeats: ${recurrence}`}>
                <Repeat size={12} /> {recurrence}
              </span>
            )}
          </div>
        </div>

        {description && <p className="task-description">{description}</p>}

        <div className="task-meta-row">
          {start_time && end_time ? (
            <div className="meta-item time-item">
              <Clock size={13} />
              <span>{start_time} - {end_time}</span>
              {estimated_duration && (
                <span className="duration-tag">({estimated_duration}m)</span>
              )}
            </div>
          ) : estimated_duration ? (
            <div className="meta-item time-item">
              <Clock size={13} />
              <span>{estimated_duration} mins</span>
            </div>
          ) : null}

          {date && (
            <div className="meta-item date-item">
              <Calendar size={13} />
              <span>{date}</span>
            </div>
          )}

          {isOverdue && !completed && (
            <div className="meta-item overdue-alert">
              <AlertCircle size={13} />
              <span>Overdue</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="task-actions">
        {onReschedule && !completed && (
          <button
            className="btn-icon task-action-btn"
            onClick={() => onReschedule(task)}
            title="Move to another date"
          >
            <ArrowRight size={16} />
          </button>
        )}
        <button
          className="btn-icon task-action-btn"
          onClick={() => onEdit(task)}
          title="Edit task"
        >
          <Edit3 size={16} />
        </button>
        <button
          className="btn-icon task-action-btn delete-btn"
          onClick={() => onDelete(task)}
          title="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
