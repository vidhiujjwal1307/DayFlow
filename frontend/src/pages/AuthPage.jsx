import React, { useState } from 'react';
import { Sun, Sparkles } from 'lucide-react';
import { AuthAPI } from '../services/api';
import './AuthPage.css';

export default function AuthPage({ onAuthenticated }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = isRegistering
        ? await AuthAPI.register({ name: name.trim(), email: email.trim(), password })
        : await AuthAPI.login({ email: email.trim(), password });
      onAuthenticated(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand-mark"><Sun size={26} /></div>
        <p className="auth-eyebrow"><Sparkles size={14} /> YOUR PERSONAL SPACE</p>
        <h1>{isRegistering ? 'Make DayFlow yours' : 'Welcome back'}</h1>
        <p className="auth-intro">Sign in to keep your tasks private and in sync across your devices.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <label>
              Your name
              <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
            </label>
          )}
          <label>
            Email
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={isRegistering ? 4 : undefined} />
            {isRegistering && <span className="auth-hint">Use at least 4 characters.</span>}
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : isRegistering ? 'Create my account' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          {isRegistering ? 'Already have an account?' : 'New to DayFlow?'}{' '}
          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
            {isRegistering ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </section>
    </main>
  );
}
