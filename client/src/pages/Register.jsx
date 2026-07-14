import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    key: 'customer',
    label: 'Customer',
    desc: 'Raise and track complaints',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    accent: '#3B82F6',
    accentBg: 'rgba(59,130,246,0.08)',
    priority: true,
  },
  {
    key: 'agent',
    label: 'Agent',
    desc: 'Manage and resolve cases',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    accent: '#8B5CF6',
    accentBg: 'rgba(139,92,246,0.08)',
  },
  {
    key: 'admin',
    label: 'Admin',
    desc: 'System-wide control & oversight',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 15.54a5 5 0 0 1 0-7.07"/>
      </svg>
    ),
    accent: '#EF4444',
    accentBg: 'rgba(239,68,68,0.08)',
  },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      if (user.role === 'agent') navigate('/agent');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/my-complaints');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const active = ROLES.find((r) => r.key === form.role);

  return (
    <div className="login-page">
      <div className="login-card login-card--register">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#1e1e2e"/>
              <path d="M8 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="13" r="3" fill="#3B82F6"/>
            </svg>
          </div>
          <div>
            <h1 className="login-title">Create account</h1>
            <p className="login-subtitle">Join the Customer Care Registry</p>
          </div>
        </div>

        {/* Role selector */}
        <div className="reg-role-grid" role="group" aria-label="Choose your role">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              id={`role-${r.key}`}
              className={`reg-role-card ${form.role === r.key ? 'reg-role-card--active' : ''}`}
              onClick={() => setForm({ ...form, role: r.key })}
              aria-pressed={form.role === r.key}
              style={form.role === r.key ? { '--accent': r.accent, '--accent-bg': r.accentBg } : {}}
            >
              <span
                className="reg-role-card__icon"
                style={form.role === r.key ? { color: r.accent, background: r.accentBg } : {}}
              >
                {r.icon}
              </span>
              <span className="reg-role-card__label">{r.label}</span>
              <span className="reg-role-card__desc">{r.desc}</span>
              {r.priority && <span className="portal-priority-badge">Default</span>}
              {form.role === r.key && (
                <span className="reg-role-card__check" style={{ color: r.accent }}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login-error" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <div className="field">
            <label htmlFor="reg-name" className="field__label">Full name</label>
            <div className="field__input-wrap">
              <span className="field__icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Jane Smith"
                value={form.name}
                onChange={handleChange}
                className="field__input"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="reg-email" className="field__label">Email address</label>
            <div className="field__input-wrap">
              <span className="field__icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                  <path d="M2.5 6.5l7.5 5 7.5-5" strokeLinecap="round"/>
                  <rect x="1" y="4" width="18" height="12" rx="2"/>
                </svg>
              </span>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="field__input"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="reg-password" className="field__label">
              Password
              <span className="field__hint">min. 6 characters</span>
            </label>
            <div className="field__input-wrap">
              <span className="field__icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                  <rect x="3" y="9" width="14" height="9" rx="2"/>
                  <path d="M7 9V6a3 3 0 016 0v3" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="field__input"
              />
              <button
                type="button"
                className="field__eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/>
                    <circle cx="10" cy="10" r="2"/>
                    <path d="M3 3l14 14" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/>
                    <circle cx="10" cy="10" r="2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="register-submit"
            className="login-submit-btn"
            disabled={submitting}
            style={{ '--accent': active.accent }}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                Creating account…
              </>
            ) : (
              <>Create {active.label} account</>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer">
          Already have an account?{' '}
          <Link to="/login" id="register-login-link">Sign in</Link>
        </p>
      </div>

      {/* Background decoration */}
      <div className="login-bg-decoration" aria-hidden="true">
        <div className="login-bg-blob login-bg-blob--1" style={{ background: active.accent }} />
        <div className="login-bg-blob login-bg-blob--2" style={{ background: active.accent }} />
      </div>
    </div>
  );
}
