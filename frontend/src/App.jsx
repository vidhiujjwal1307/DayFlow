import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MyDay from './pages/MyDay';
import Notes from './pages/Notes';
import AllTasks from './pages/AllTasks';
import WeeklyOverview from './pages/WeeklyOverview';
import DailyReflection from './pages/DailyReflection';
import Settings from './pages/Settings';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import './index.css';

export default function App() {
  const [toasts, setToasts] = useState([]);
  const [userName, setUserName] = useState('');

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<MyDay onToast={showToast} userName={userName} setUserName={setUserName} />} />
            <Route path="/notes" element={<Notes onToast={showToast} />} />
            <Route path="/all-tasks" element={<AllTasks onToast={showToast} />} />
            <Route path="/weekly" element={<WeeklyOverview onToast={showToast} />} />
            <Route path="/reflections" element={<DailyReflection onToast={showToast} />} />
            <Route path="/settings" element={<Settings onToast={showToast} onNameChange={setUserName} />} />
          </Routes>
        </main>

        {/* Global Toast Notifications Stack */}
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.type === 'error' ? 'toast-error' : ''}`}>
              {t.type === 'error' ? (
                <AlertCircle size={18} color="var(--danger)" />
              ) : (
                <CheckCircle2 size={18} color="var(--primary-teal)" />
              )}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserRouter>
  );
}
