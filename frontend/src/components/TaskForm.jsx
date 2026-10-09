import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, AlertCircle } from 'lucide-react';
import './TaskForm.css';

export default function TaskForm({
  initialTask = null,
  defaultDate = '',
  isOpen,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: defaultDate || new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    category: 'Personal',
    priority: 'Medium',
    estimated_duration: '',
    recurrence: 'None',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        date: initialTask.date || defaultDate,
        start_time: initialTask.start_time || '',
        end_time: initialTask.end_time || '',
        category: initialTask.category || 'Personal',
        priority: initialTask.priority || 'Medium',
        estimated_duration: initialTask.estimated_duration ? String(initialTask.estimated_duration) : '',
        recurrence: initialTask.recurrence || 'None',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: defaultDate || new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        category: 'Personal',
        priority: 'Medium',
        estimated_duration: '',
        recurrence: 'None',
      });
    }
    setError('');
  }, [initialTask, defaultDate, isOpen]);

  // Auto calculate duration when start and end times change
  const handleTimeChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    if (updated.start_time && updated.end_time) {
      const [sH, sM] = updated.start_time.split(':').map(Number);
      const [eH, eM] = updated.end_time.split(':').map(Number);
      const startMin = sH * 60 + sM;
      const endMin = eH * 60 + eM;

      if (endMin > startMin) {
        updated.estimated_duration = String(endMin - startMin);
      }
    }
    setFormData(updated);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please give your task a title.');
      return;
    }

    if (!formData.date) {
      setError('Please select a date.');
      return;
    }

    if (formData.start_time && formData.end_time) {
      if (formData.end_time <= formData.start_time) {
        setError('End time must be later than start time for today.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        estimated_duration: formData.estimated_duration ? Number(formData.estimated_duration) : null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save task. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['Study', 'College', 'Project', 'Personal', 'Health', 'Other'];
  const priorities = ['High', 'Medium', 'Low'];
  const recurrences = ['None', 'Daily', 'Weekdays'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {initialTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="form-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="task-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="task-title">Task Title *</label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g., Read chapter 4 & summarize"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="task-desc">Notes / Description (Optional)</label>
            <textarea
              id="task-desc"
              rows={2}
              placeholder="Add useful details, links, or thoughts..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Date & Recurrence Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-date">Date *</label>
              <input
                id="task-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-recurrence">Recurrence</label>
              <select
                id="task-recurrence"
                value={formData.recurrence}
                onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
              >
                {recurrences.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time & Duration Row */}
          <div className="form-row-3">
            <div className="form-group">
              <label htmlFor="task-start">Start Time</label>
              <input
                id="task-start"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleTimeChange('start_time', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-end">End Time</label>
              <input
                id="task-end"
                type="time"
                value={formData.end_time}
                onChange={(e) => handleTimeChange('end_time', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-duration">Duration (mins)</label>
              <input
                id="task-duration"
                type="number"
                min="0"
                step="5"
                placeholder="45"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
              />
            </div>
          </div>

          {/* Category & Priority Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-category">Category</label>
              <select
                id="task-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
