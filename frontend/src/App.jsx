import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MyDay from './pages/MyDay';
import Notes from './pages/Notes';
import AllTasks from './pages/AllTasks';
import WeeklyOverview from './pages/WeeklyOverview';
import DailyReflection from './pages/DailyReflection';
import Settings from './pages/Settings';
import AuthPage from './pages/AuthPage';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import './index.css';

export default function App() {
  const [toasts, setToasts] = useState([]);
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('dayflow_access_token');
    const user = localStorage.getItem('dayflow_user');
    if (!token || !user) return null;
    try { return { access_token: token, user: JSON.parse(user) }; }
    catch { return null; }
  });
  const [userName, setUserName] = useState(() => session?.user?.name || '');

  const handleAuthenticated = (result) => {
    localStorage.setItem('dayflow_access_token', result.access_token);
    localStorage.setItem('dayflow_user', JSON.stringify(result.user));
    setSession(result);
    setUserName(result.user.name);
  };

  const handleLogout = () => {
    localStorage.removeItem('dayflow_access_token');
    localStorage.removeItem('dayflow_user');
    setSession(null);
    setUserName('');
  };

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  if (!session) return <AuthPage onAuthenticated={handleAuthenticated} />;

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar user={session.user} onLogout={handleLogout} />
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
