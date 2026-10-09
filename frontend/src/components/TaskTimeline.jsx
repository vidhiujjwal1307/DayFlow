import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import TaskCard from './TaskCard';
import './TaskTimeline.css';

export default function TaskTimeline({
  tasks = [],
  conflicts = [],
  onToggle,
  onEdit,
  onDelete,
  onReschedule,
}) {
  // Split tasks into Scheduled (has start_time) and Any-time (unscheduled)
  const scheduledTasks = tasks.filter((t) => t.start_time).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const unscheduledTasks = tasks.filter((t) => !t.start_time);

  // Group scheduled tasks by approximate hour slots
  return (
    <div className="timeline-container">
      {/* Overlap / Conflict Alert Banner */}
      {conflicts.length > 0 && (
        <div className="conflicts-banner">
          <AlertTriangle size={18} className="conflict-icon" />
          <div className="conflict-messages">
            <strong>Time Overlap Detected:</strong>
            {conflicts.map((c, i) => (
              <span key={i} className="conflict-text">
                {c.message}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Time Track */}
      {scheduledTasks.length > 0 && (
        <div className="timeline-section">
          <h3 className="section-title">
            <Clock size={16} /> Scheduled Timeline
          </h3>

          <div className="timeline-track">
            {scheduledTasks.map((task) => (
              <div key={task.id} className="timeline-entry">
                <div className="timeline-time-col">
                  <span className="time-badge">{task.start_time}</span>
                  {task.end_time && (
                    <span className="time-badge-end">{task.end_time}</span>
                  )}
                  <div className="timeline-line-connector" />
                </div>
                <div className="timeline-card-col">
                  <TaskCard
                    task={task}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReschedule={onReschedule}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unscheduled / Anytime Tasks */}
      {unscheduledTasks.length > 0 && (
        <div className="timeline-section anytime-section">
          <h3 className="section-title">
            Flexible / Any Time Today ({unscheduledTasks.length})
          </h3>
          <div className="anytime-list">
            {unscheduledTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onReschedule={onReschedule}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
