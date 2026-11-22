import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  List, 
  Clock, 
  Filter, 
  CheckCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Flame,
  BarChart3,
  Sparkles,
  BookOpen,
  SquarePen,
  Bell,
  CalendarPlus
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

  const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const calendarDate = new Date(`${selectedDate}T12:00:00`);
  const monthLabel = monthFormatter.format(calendarDate);
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
  const calendarCells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const subjectProgress = [
    { name: 'NLP', value: 72, color: '#9b79d1' },
    { name: 'DBMS', value: 65, color: '#b68dde' },
    { name: 'DSA', value: 80, color: '#a887d5' },
    { name: 'Agile', value: 55, color: '#7cc5b5' },
  ];
  const weekBars = [48, 68, 56, 82, 75, 92, 45];

  const changeCalendarMonth = (step) => {
    const next = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + step, 1);
    const yyyy = next.getFullYear();
    const mm = String(next.getMonth() + 1).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-01`);
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

      <section className="study-hero">
        <div className="study-hero-copy">
          <p className="hero-kicker">SEM {5} <span>•</span> 6 Subjects <span>•</span> 12 Weeks</p>
          <h2>Your Study Plan</h2>
          <div className="hero-progress-row">
            <div className="hero-progress-track">
              <div style={{ width: `${Math.round(daySummary.completion_rate)}%` }} />
            </div>
            <strong>{Math.round(daySummary.completion_rate)}%</strong>
          </div>
          <button className="hero-button" onClick={() => setIsAIModalOpen(true)}>
            View plan <ChevronRight size={15} />
          </button>
        </div>
        <div className="study-illustration" aria-hidden="true">
          <div className="desk-leaf">🌿</div>
          <div className="desk-lamp"><span /></div>
          <div className="desk-stack"><b>DSA</b><b>DBMS</b><b>Agile</b></div>
          <div className="desk-notebook" />
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="schedule-header">
            <div className="schedule-titles">
              <h2 className="schedule-title">Today's Study Schedule</h2>
              <span className="schedule-count">
                {daySummary.total_tasks} {daySummary.total_tasks === 1 ? 'session' : 'sessions'}
              </span>
            </div>
            <div className="view-switch-group">
              <button className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`} onClick={() => setViewMode('timeline')}>
                <Clock size={15} /><span>Timeline</span>
              </button>
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                <List size={15} /><span>List</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state"><div className="spinner-teal" /><p>Preparing your study flow...</p></div>
          ) : daySummary.tasks.length === 0 ? (
            <EmptyState onAddTask={openAddTask} message="Your study day is open." subtitle="Add a session and give your focus a clear direction." />
          ) : viewMode === 'timeline' ? (
            <TaskTimeline tasks={daySummary.tasks} conflicts={daySummary.conflicts} onToggle={handleToggleTask} onEdit={openEditTask} onDelete={setDeletingTask} onReschedule={setReschedulingTask} />
          ) : (
            <div className="tasks-list-view">
              {daySummary.tasks.map((task) => (
                <TaskCard key={task.id} task={task} onToggle={handleToggleTask} onEdit={openEditTask} onDelete={setDeletingTask} onReschedule={setReschedulingTask} />
              ))}
            </div>
          )}
        </div>

        <aside className="dashboard-rail">
          <section className="rail-card calendar-card">
            <div className="rail-card-header">
              <h3>{monthLabel}</h3>
              <div>
                <button onClick={() => changeCalendarMonth(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
                <button onClick={() => changeCalendarMonth(1)} aria-label="Next month"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="calendar-weekdays">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d}>{d}</span>)}</div>
            <div className="calendar-grid">
              {calendarCells.map((day, index) => (
                <button
                  key={`${day}-${index}`}
                  className={day === calendarDate.getDate() ? 'calendar-day active' : 'calendar-day'}
                  disabled={!day}
                  onClick={() => {
                    if (!day) return;
                    const mm = String(calendarDate.getMonth() + 1).padStart(2, '0');
                    setSelectedDate(`${calendarDate.getFullYear()}-${mm}-${String(day).padStart(2, '0')}`);
                  }}
                >
                  {day || ''}
                </button>
              ))}
            </div>
          </section>

          <section className="rail-card progress-card-rail">
            <div className="rail-card-header">
              <h3>Subject Progress</h3>
              <button className="text-link">View All <ChevronRight size={13} /></button>
            </div>
            <div className="subject-list">
              {subjectProgress.map(subject => (
                <div className="subject-row" key={subject.name}>
                  <span>{subject.name}</span>
                  <div className="subject-track"><div style={{ width: `${subject.value}%`, background: subject.color }} /></div>
                  <strong>{subject.value}%</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="rail-card streak-card">
            <div className="streak-icon"><Flame size={19} /></div>
            <div><span>Study streak</span><strong>12 Days</strong></div>
            <p>Keep it up! 🔥</p>
          </section>

          <section className="rail-card week-card">
            <div className="rail-card-header"><h3>This Week</h3><strong>24.5 hrs</strong></div>
            <div className="week-bars">
              {weekBars.map((height, index) => (
                <div className="week-bar-wrap" key={index}>
                  <span style={{ height: `${height}%` }} />
                  <small>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][index]}</small>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

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
