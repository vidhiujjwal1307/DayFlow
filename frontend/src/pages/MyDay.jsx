import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  List, 
  Clock, 
  Filter, 
  CheckCircle,
  Plus
} from 'lucide-react';
import Header from '../components/Header';
import ProgressCard from '../components/ProgressCard';
import TaskCard from '../components/TaskCard';
import TaskTimeline from '../components/TaskTimeline';
import TaskForm from '../components/TaskForm';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import AIPlanModal from '../components/AIPlanModal';
import RescheduleModal from '../components/RescheduleModal';
import { TaskAPI, SettingsAPI } from '../services/api';
import './MyDay.css';

export default function MyDay({ onToast, userName = '', setUserName }) {
  // Get today's local date as YYYY-MM-DD
  const getTodayStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [displayName, setDisplayName] = useState(userName || 'Friend');
  const [daySummary, setDaySummary] = useState({
    date: selectedDate,
    total_tasks: 0,
    completed_tasks: 0,
    completion_rate: 0,
    total_duration_minutes: 0,
    tasks: [],
    conflicts: [],
  });

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'list'
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [reschedulingTask, setReschedulingTask] = useState(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Load user settings
  useEffect(() => {
    SettingsAPI.get()
      .then((settings) => {
        if (settings?.preferred_name) {
          setDisplayName(settings.preferred_name);
          if (setUserName) setUserName(settings.preferred_name);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (userName) setDisplayName(userName);
  }, [userName]);

  // Fetch tasks for the selected date
  const loadDayTasks = async (date) => {
    try {
      setLoading(true);
      const data = await TaskAPI.getDaySummary(date);
      setDaySummary(data);
    } catch (err) {
      if (onToast) onToast('Failed to load tasks for this day', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDayTasks(selectedDate);
  }, [selectedDate]);

  // Handle toggle completion
  const handleToggleTask = async (taskId) => {
    try {
      const updated = await TaskAPI.toggle(taskId);
      
      // Update local state smoothly
      setDaySummary((prev) => {
        const nextTasks = prev.tasks.map((t) => (t.id === taskId ? updated : t));
        const total = nextTasks.length;
        const completed = nextTasks.filter((t) => t.completed).length;
        const rate = total > 0 ? (completed / total) * 100 : 0;
        return {
          ...prev,
          tasks: nextTasks,
          completed_tasks: completed,
          completion_rate: rate,
        };
      });

      // Joyful celebratory confetti if newly completed
      if (updated.completed) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#0F9D8A', '#DDEDE3', '#FFF3CD'],
        });
      }
    } catch (err) {
      if (onToast) onToast('Could not update task status', 'error');
    }
  };

  // Handle task creation or update
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await TaskAPI.update(editingTask.id, taskData);
        if (onToast) onToast('Task updated gracefully.');
      } else {
        await TaskAPI.create(taskData);
        if (onToast) onToast('Task added to your day.');
      }
      loadDayTasks(selectedDate);
    } catch (err) {
      throw err;
    }
  };

  // Handle task delete
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      await TaskAPI.delete(deletingTask.id);
      if (onToast) onToast('Task removed.');
      setDeletingTask(null);
      loadDayTasks(selectedDate);
    } catch (err) {
      if (onToast) onToast('Failed to delete task', 'error');
    }
  };

  // Handle reschedule
  const handleReschedule = async (taskId, newDate) => {
    try {
      await TaskAPI.reschedule(taskId, newDate);
      if (onToast) onToast(`Task moved to ${newDate}.`);
      loadDayTasks(selectedDate);
    } catch (err) {
      if (onToast) onToast('Failed to move task', 'error');
    }
  };

  // Handle AI schedule import
  const handleImportAITasks = async (tasksToCreate) => {
    try {
      for (const t of tasksToCreate) {
        await TaskAPI.create(t);
      }
      if (onToast) onToast(`Added ${tasksToCreate.length} tasks from AI planner.`);
      loadDayTasks(selectedDate);
    } catch (err) {
      if (onToast) onToast('Could not import some tasks', 'error');
    }
  };

  const openAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="myday-page">
      {/* Top Header */}
      <Header
        userName={displayName}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenTaskModal={openAddTask}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      {/* Daily Progress Dashboard Card */}
      <ProgressCard
        completedCount={daySummary.completed_tasks}
        totalCount={daySummary.total_tasks}
        completionRate={daySummary.completion_rate}
        totalDurationMinutes={daySummary.total_duration_minutes}
      />

      {/* Main Task List Header & View Switcher */}
      <div className="schedule-header">
        <div className="schedule-titles">
          <h2 className="schedule-title">Today's Schedule</h2>
          <span className="schedule-count">
            {daySummary.total_tasks} {daySummary.total_tasks === 1 ? 'activity' : 'activities'}
          </span>
        </div>

        <div className="view-switch-group">
          <button
            className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
            title="Timeline chronological view"
          >
            <Clock size={16} />
            <span>Timeline</span>
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Standard list view"
          >
            <List size={16} />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Tasks Content or Warm Empty State */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner-teal" />
          <p>Gathering your calm flow...</p>
        </div>
      ) : daySummary.tasks.length === 0 ? (
        <EmptyState
          onAddTask={openAddTask}
          message="Your day is full of possibilities."
          subtitle="Add your first task and give your day a little direction."
        />
      ) : viewMode === 'timeline' ? (
        <TaskTimeline
          tasks={daySummary.tasks}
          conflicts={daySummary.conflicts}
          onToggle={handleToggleTask}
          onEdit={openEditTask}
          onDelete={setDeletingTask}
          onReschedule={setReschedulingTask}
        />
      ) : (
        <div className="tasks-list-view">
          {daySummary.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onEdit={openEditTask}
              onDelete={setDeletingTask}
              onReschedule={setReschedulingTask}
            />
          ))}
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <TaskForm
        isOpen={isTaskModalOpen}
        initialTask={editingTask}
        defaultDate={selectedDate}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleSaveTask}
      />

      {/* AI Schedule Suggester Modal */}
      <AIPlanModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        targetDate={selectedDate}
        onImportTasks={handleImportAITasks}
      />

      {/* Reschedule Date Modal */}
      <RescheduleModal
        isOpen={Boolean(reschedulingTask)}
        task={reschedulingTask}
        onClose={() => setReschedulingTask(null)}
        onReschedule={handleReschedule}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        title="Remove this task?"
        message={`Are you sure you want to delete "${deletingTask?.title}" from your schedule?`}
        confirmText="Delete Task"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
}
