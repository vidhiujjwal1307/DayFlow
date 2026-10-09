import React, { useState } from 'react';
import { Calendar, ArrowRight, X } from 'lucide-react';

export default function RescheduleModal({
  task,
  isOpen,
  onClose,
  onReschedule,
}) {
  const [newDate, setNewDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  if (!isOpen || !task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newDate) {
      onReschedule(task.id, newDate);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Reschedule Task</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Move <strong>"{task.title}"</strong> to a fresh date:
          </p>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>New Target Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <ArrowRight size={16} /> Move Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
