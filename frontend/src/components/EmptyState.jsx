import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({ onAddTask, message, subtitle }) {
  return (
    <div className="card empty-state-card">
      <div className="empty-state-art">
        <div className="art-circle">
          <Sparkles size={36} className="art-icon" />
        </div>
      </div>

      <h3 className="empty-state-title">
        {message || 'Your day is full of possibilities.'}
      </h3>
      <p className="empty-state-subtitle">
        {subtitle || 'Add your first task and give your day a little direction.'}
      </p>

      {onAddTask && (
        <button className="btn-primary empty-state-btn" onClick={onAddTask}>
          <Plus size={18} />
          <span>Add Your First Task</span>
        </button>
      )}
    </div>
  );
}
