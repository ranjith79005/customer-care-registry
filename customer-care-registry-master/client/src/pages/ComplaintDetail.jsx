import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['open', 'assigned', 'in-progress', 'resolved', 'closed'];

const STATUS_META = {
  open:        { label: 'Open',        color: '#3457D5', bg: '#E8ECFB', icon: '🔵' },
  assigned:    { label: 'Assigned',    color: '#F2704B', bg: '#FBEFE6', icon: '🟠' },
  'in-progress':{ label: 'In Progress', color: '#A87B00', bg: '#FFF4D6', icon: '🟡' },
  resolved:    { label: 'Resolved',    color: '#5C7A5E', bg: '#E4EFE4', icon: '🟢' },
  closed:      { label: 'Closed',      color: '#6b7280', bg: '#f3f4f6', icon: '⚫' },
};

const PRIORITY_META = {
  low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Low' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Medium' },
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'High' },
};

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="cd-stars" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`cd-star ${n <= (hovered || value) ? 'cd-star--on' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      <span className="cd-stars__label">{value}/5</span>
    </div>
  );
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  async function load() {
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data.complaint);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load this complaint');
    }
  }

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setStatusSaving(true);
    try {
      const { data } = await api.patch(`/complaints/${id}/status`, { status });
      setComplaint(data.complaint);
    } catch {
      setError('Could not update status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    try {
      await api.patch(`/complaints/${id}/feedback`, feedback);
      setFeedbackSaved(true);
    } catch {
      setFeedbackError('Could not submit feedback. Please try again.');
    }
  };

  if (error) return (
    <div className="page">
      <div className="login-error" style={{ marginTop: 32 }}>
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
        {error}
      </div>
    </div>
  );

  if (!complaint) return (
    <div className="page">
      <div className="cd-loading">
        <span className="spinner" style={{ borderTopColor: '#3457D5', borderColor: 'rgba(52,87,213,0.2)', width: 28, height: 28 }} />
        <p>Loading complaint…</p>
      </div>
    </div>
  );

  const isOwner = user && complaint.customer && user.id === complaint.customer._id;
  const canUpdateStatus = user && (user.role === 'admin' || user.role === 'agent');
  const canLeaveFeedback = isOwner && ['resolved', 'closed'].includes(complaint.status) && !complaint.feedback?.rating;
  const statusInfo = STATUS_META[complaint.status] || STATUS_META.open;
  const priorityInfo = PRIORITY_META[complaint.priority] || PRIORITY_META.medium;

  const goBack = () => {
    if (user?.role === 'agent') navigate('/agent');
    else if (user?.role === 'admin') navigate('/admin');
    else navigate('/my-complaints');
  };

  return (
    <div className="page cd-page">
      {/* Breadcrumb / Back */}
      <div className="cd-topbar">
        <button className="cd-back-btn" onClick={goBack}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M12 5l-7 5 7 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to dashboard
        </button>
        <span className="cd-ref">Ref #{complaint._id?.slice(-8).toUpperCase()}</span>
      </div>

      {/* Title row */}
      <div className="cd-title-row">
        <div>
          <span className="eyebrow">Complaint detail</span>
          <h1 className="cd-title">{complaint.title}</h1>
        </div>
        <div
          className="cd-status-badge"
          style={{ color: statusInfo.color, background: statusInfo.bg }}
        >
          {statusInfo.icon} {statusInfo.label}
        </div>
      </div>

      <div className="cd-grid">
        {/* ── Left: main info ── */}
        <div className="cd-main">

          {/* Description card */}
          <div className="cd-card">
            <h3 className="cd-card__title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                <path d="M4 6h12M4 10h8M4 14h6" strokeLinecap="round"/>
              </svg>
              Description
            </h3>
            <p className="cd-description">{complaint.description}</p>
            {complaint.urgencyNote && (
              <div className="cd-urgency-note">
                <span>⚡</span> <strong>Urgency note:</strong> {complaint.urgencyNote}
              </div>
            )}
          </div>

          {/* Metadata grid */}
          <div className="cd-card">
            <h3 className="cd-card__title">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                <path d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h0a2 2 0 002-2" strokeLinecap="round"/>
              </svg>
              Details
            </h3>
            <div className="cd-meta-grid">
              <div className="cd-meta-item">
                <span className="cd-meta-key">Priority</span>
                <span
                  className="cd-meta-val cd-priority-badge"
                  style={{ color: priorityInfo.color, background: priorityInfo.bg }}
                >
                  {priorityInfo.label}
                </span>
              </div>
              {complaint.category && (
                <div className="cd-meta-item">
                  <span className="cd-meta-key">Category</span>
                  <span className="cd-meta-val">{complaint.category}</span>
                </div>
              )}
              {complaint.subcategory && (
                <div className="cd-meta-item">
                  <span className="cd-meta-key">Subcategory</span>
                  <span className="cd-meta-val">{complaint.subcategory}</span>
                </div>
              )}
              {complaint.channel && (
                <div className="cd-meta-item">
                  <span className="cd-meta-key">Channel</span>
                  <span className="cd-meta-val">{complaint.channel}</span>
                </div>
              )}
              {complaint.contactPreference && (
                <div className="cd-meta-item">
                  <span className="cd-meta-key">Contact pref.</span>
                  <span className="cd-meta-val">{complaint.contactPreference}</span>
                </div>
              )}
              {complaint.productOrderRef && (
                <div className="cd-meta-item">
                  <span className="cd-meta-key">Order / Ref</span>
                  <span className="cd-meta-val cd-meta-val--mono">{complaint.productOrderRef}</span>
                </div>
              )}
              <div className="cd-meta-item">
                <span className="cd-meta-key">Customer</span>
                <span className="cd-meta-val">{complaint.customer?.name}</span>
              </div>
              <div className="cd-meta-item">
                <span className="cd-meta-key">Agent</span>
                <span className="cd-meta-val">{complaint.assignedAgent?.name || <em style={{ color: '#9ca3af' }}>Not yet assigned</em>}</span>
              </div>
              <div className="cd-meta-item">
                <span className="cd-meta-key">Filed</span>
                <span className="cd-meta-val">{new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
              {complaint.updatedAt && (
                <div className="cd-meta-item">
                  <span className="cd-meta-key">Last updated</span>
                  <span className="cd-meta-val">{new Date(complaint.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: actions ── */}
        <div className="cd-sidebar">

          {/* Status updater for agent/admin */}
          {canUpdateStatus && (
            <div className="cd-card">
              <h3 className="cd-card__title">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                  <path d="M4 4v5h5M16 16v-5h-5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 3.51 3.51M3.51 15A9 9 0 0 0 20.49 15" strokeLinecap="round"/>
                </svg>
                Update Status
              </h3>
              <select
                id="status-select"
                className="cd-status-select"
                value={complaint.status}
                onChange={handleStatusChange}
                disabled={statusSaving}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
                ))}
              </select>
              {statusSaving && <p className="cd-saving">Saving…</p>}
            </div>
          )}

          {/* Feedback already given */}
          {complaint.feedback?.rating && (
            <div className="cd-card cd-card--feedback">
              <h3 className="cd-card__title">⭐ Customer Rating</h3>
              <div className="cd-feedback-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`cd-star-display ${i < complaint.feedback.rating ? 'cd-star-display--on' : ''}`}>★</span>
                ))}
                <span className="cd-stars__label">{complaint.feedback.rating}/5</span>
              </div>
              {complaint.feedback.comment && (
                <blockquote className="cd-feedback-quote">"{complaint.feedback.comment}"</blockquote>
              )}
            </div>
          )}

          {/* Leave feedback */}
          {canLeaveFeedback && !feedbackSaved && (
            <div className="cd-card">
              <h3 className="cd-card__title">⭐ Leave Feedback</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>How did we do?</p>
              <form onSubmit={handleFeedbackSubmit}>
                {feedbackError && (
                  <div className="login-error" style={{ marginBottom: 12 }}>
                    {feedbackError}
                  </div>
                )}
                <StarRating value={feedback.rating} onChange={(n) => setFeedback({ ...feedback, rating: n })} />
                <label className="cd-field-label" htmlFor="feedback-comment" style={{ marginTop: 14 }}>
                  Comment <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  id="feedback-comment"
                  className="cd-textarea"
                  rows={3}
                  placeholder="Tell us how we can improve…"
                  value={feedback.comment}
                  onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                />
                <button type="submit" className="cd-submit-btn" style={{ marginTop: 12 }}>
                  Submit feedback
                </button>
              </form>
            </div>
          )}
          {feedbackSaved && (
            <div className="cd-card cd-card--success">
              <p style={{ margin: 0, fontWeight: 600 }}>✅ Thanks for your feedback!</p>
            </div>
          )}

          {/* Navigation shortcuts */}
          <div className="cd-card cd-card--nav">
            <h3 className="cd-card__title">Navigate to</h3>
            <div className="cd-nav-links">
              {user?.role === 'customer' && (
                <Link to="/my-complaints" className="cd-nav-link">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
                    <path d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round"/>
                  </svg>
                  All my complaints
                </Link>
              )}
              {user?.role === 'customer' && (
                <Link to="/raise-complaint" className="cd-nav-link">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
                    <path d="M10 3v14M3 10h14" strokeLinecap="round"/>
                  </svg>
                  Raise new complaint
                </Link>
              )}
              {user?.role === 'agent' && (
                <Link to="/agent" className="cd-nav-link">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v6a1 1 0 001 1h3m5 0h3a1 1 0 001-1v-6" strokeLinecap="round"/>
                  </svg>
                  Agent dashboard
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="cd-nav-link">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v6a1 1 0 001 1h3m5 0h3a1 1 0 001-1v-6" strokeLinecap="round"/>
                  </svg>
                  Admin dashboard
                </Link>
              )}
              <Link to="/" className="cd-nav-link">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
                  <path d="M10 2L2 8v10h5v-5h6v5h5V8L10 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
