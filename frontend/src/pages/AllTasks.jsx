import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, ArrowUpDown, AlertCircle } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import ConfirmDialog from '../components/ConfirmDialog';
import RescheduleModal from '../components/RescheduleModal';
import EmptyState from '../components/EmptyState';
import { TaskAPI } from '../services/api';
import './AllTasks.css';

export default function AllTasks({ onToast }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Completed', 'Incomplete', 'Overdue'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'priority', 'title'

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [reschedulingTask, setReschedulingTask] = useState(null);

  const getTodayStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await TaskAPI.getAll({
        search: searchTerm || undefined,
        category: categoryFilter,
        priority: priorityFilter,
      });
      setTasks(data);
    } catch (err) {
      if (onToast) onToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [categoryFilter, priorityFilter]);

  // Handle Search on enter or debounced change
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTasks();
  };

  const handleToggle = async (taskId) => {
    try {
      const updated = await TaskAPI.toggle(taskId);
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      if (onToast) onToast('Could not toggle task', 'error');
    }
  };

  const handleSaveTask = async (data) => {
    if (editingTask) {
      await TaskAPI.update(editingTask.id, data);
      if (onToast) onToast('Task updated.');
    } else {
      await TaskAPI.create(data);
      if (onToast) onToast('Task added.');
    }
    loadTasks();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      await TaskAPI.delete(deletingTask.id);
      if (onToast) onToast('Task deleted.');
      setDeletingTask(null);
      loadTasks();
    } catch (err) {
      if (onToast) onToast('Failed to delete task', 'error');
    }
  };

  const handleReschedule = async (taskId, newDate) => {
    try {
      await TaskAPI.reschedule(taskId, newDate);
      if (onToast) onToast(`Task moved to ${newDate}.`);
      loadTasks();
    } catch (err) {
      if (onToast) onToast('Failed to reschedule task', 'error');
    }
  };

  const todayStr = getTodayStr();

  // Status Filter Check
  const filteredTasks = tasks.filter((task) => {
    const isOverdue = task.date < todayStr && !task.completed;
    if (statusFilter === 'Completed') return task.completed;
    if (statusFilter === 'Incomplete') return !task.completed;
    if (statusFilter === 'Overdue') return isOverdue;
    return true;
  });

  // Sort
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'date') {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      return (a.start_time || '').localeCompare(b.start_time || '');
    }
    if (sortBy === 'priority') {
      const pWeights = { High: 3, Medium: 2, Low: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const categories = ['All', 'Study', 'College', 'Project', 'Personal', 'Health', 'Other'];
  const priorities = ['All', 'High', 'Medium', 'Low'];
  const statuses = ['All', 'Incomplete', 'Completed', 'Overdue'];

  return (
    <div className="all-tasks-page">
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">All Tasks</h1>
          <p className="page-subtitle">A comprehensive sanctuary of all your intentions.</p>
        </div>
        <div className="all-tasks-header-actions">
          <button
            className="btn-primary"
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
          >
            <Plus size={18} /> Add Task
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="search-filter-panel card">
        <form onSubmit={handleSearchSubmit} className="search-form-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="btn-outline clear-btn"
              onClick={() => {
                setSearchTerm('');
                // reload
                setTimeout(loadTasks, 50);
              }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="filters-grid">
          <div className="filter-item">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date & Time</option>
              <option value="priority">Priority (High first)</option>
              <option value="title">Alphabetical (Title)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner-teal" />
          <p>Loading your task collection...</p>
        </div>
      ) : sortedTasks.length === 0 ? (
        <EmptyState
          onAddTask={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          message="No tasks match your filters."
          subtitle="Try adjusting your search criteria or add a fresh task."
        />
      ) : (
        <div className="tasks-list-container">
          <div className="tasks-count-bar">
            <span>Showing <strong>{sortedTasks.length}</strong> tasks</span>
          </div>

          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isOverdue={task.date < todayStr && !task.completed}
              onToggle={handleToggle}
              onEdit={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onDelete={setDeletingTask}
              onReschedule={setReschedulingTask}
            />
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskForm
        isOpen={isTaskModalOpen}
        initialTask={editingTask}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleSaveTask}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={Boolean(reschedulingTask)}
        task={reschedulingTask}
        onClose={() => setReschedulingTask(null)}
        onReschedule={handleReschedule}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        title="Delete task?"
        message={`Delete "${deletingTask?.title}" permanently?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
}
