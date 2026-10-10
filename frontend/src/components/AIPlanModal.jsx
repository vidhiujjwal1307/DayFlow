import React, { useState } from 'react';
import { Sparkles, X, Check, Clock, Plus, Loader2 } from 'lucide-react';
import { AIAPI } from '../services/api';
import './AIPlanModal.css';

export default function AIPlanModal({
  isOpen,
  onClose,
  targetDate,
  onImportTasks,
}) {
  const [tasksInput, setTasksInput] = useState('');
  const [availableStart, setAvailableStart] = useState('09:00');
  const [availableEnd, setAvailableEnd] = useState('18:00');
  const [fixedCommitments, setFixedCommitments] = useState('Lunch & break 13:00 - 14:00');
  const [priorities, setPriorities] = useState('Balance focused work with short breaks');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    const rawTasks = tasksInput
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (rawTasks.length === 0) {
      setError('Please list at least 1 or 2 tasks you would like to accomplish.');
      return;
    }
    if (!availableStart || !availableEnd || availableStart >= availableEnd) {
      setError('Choose an end time later than your start time.');
      return;
    }

    try {
      setLoading(true);
      const res = await AIAPI.planDay({
        date: targetDate,
        available_hours: `${availableStart} - ${availableEnd}`,
        important_tasks: rawTasks,
        priorities: priorities,
        fixed_commitments: fixedCommitments,
      });

      setGeneratedPlan(res);
      // Pre-select all suggested tasks
      setSelectedTasks(res.suggested_tasks.map((_, idx) => idx));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectTask = (index) => {
    if (selectedTasks.includes(index)) {
      setSelectedTasks(selectedTasks.filter((i) => i !== index));
    } else {
      setSelectedTasks([...selectedTasks, index]);
    }
  };

  const handleImport = async () => {
    if (!generatedPlan || selectedTasks.length === 0) return;
    const tasksToCreate = selectedTasks.map((idx) => {
      const item = generatedPlan.suggested_tasks[idx];
      return {
        title: item.title,
        description: item.description,
        date: targetDate,
        start_time: item.start_time,
        end_time: item.end_time,
        category: item.category,
        priority: item.priority,
        estimated_duration: item.estimated_duration,
        recurrence: 'None',
      };
    });

    await onImportTasks(tasksToCreate);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card ai-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="ai-modal-title-wrap">
            <Sparkles className="ai-sparkle-icon" size={22} />
            <h2 className="modal-title">Plan My Day with AI</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        {!generatedPlan ? (
          <form onSubmit={handleGenerate} className="ai-form">
            <p className="ai-intro-text">
              Share what you’d love to accomplish, and we’ll organize a balanced, low-stress daily rhythm for <strong>{targetDate}</strong>.
            </p>

            <div className="form-group">
              <label>What tasks are on your mind? (1 per line) *</label>
              <textarea
                rows={4}
                placeholder="Finish CS lecture notes&#10;Work on DayFlow UI&#10;30-minute cardio workout&#10;Email professor about project"
                value={tasksInput}
                onChange={(e) => setTasksInput(e.target.value)}
                required
              />
            </div>

            <div className="ai-time-range">
              <div className="form-group">
                <label>Available From</label>
                <input
                  type="time"
                  value={availableStart}
                  onChange={(e) => setAvailableStart(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Available Until</label>
                <input
                  type="time"
                  value={availableEnd}
                  onChange={(e) => setAvailableEnd(e.target.value)}
                />
              </div>

            </div>

            <div className="form-group">
              <label>Fixed Commitments / Breaks</label>
              <input
                type="text"
                placeholder="Lunch 13:00 - 14:00"
                value={fixedCommitments}
                onChange={(e) => setFixedCommitments(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Pacing & Priorities</label>
              <input
                type="text"
                placeholder="Deep work first, then lighter tasks"
                value={priorities}
                onChange={(e) => setPriorities(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinner" /> Generating flow...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate Schedule
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="ai-plan-review">
            <div className="ai-summary-card">
              <p className="ai-summary-text">{generatedPlan.summary}</p>
            </div>

            <h4 className="review-subheading">
              Review and select schedule items to add ({selectedTasks.length} selected):
            </h4>

            <div className="ai-tasks-list">
              {generatedPlan.suggested_tasks.map((task, idx) => {
                const isSelected = selectedTasks.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`ai-task-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSelectTask(idx)}
                  >
                    <div className={`ai-task-check ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div className="ai-task-info">
                      <div className="ai-task-row">
                        <span className="ai-task-title">{task.title}</span>
                        <span className="ai-task-time">
                          <Clock size={12} /> {task.start_time} - {task.end_time}
                        </span>
                      </div>
                      <div className="ai-task-meta">
                        <span className={`category-badge category-${task.category}`}>
                          {task.category}
                        </span>
                        <span className="ai-task-desc">{task.description}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setGeneratedPlan(null)}
              >
                Back / Edit
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleImport}
                disabled={selectedTasks.length === 0}
              >
                <Plus size={16} /> Add {selectedTasks.length} Tasks to My Day
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
