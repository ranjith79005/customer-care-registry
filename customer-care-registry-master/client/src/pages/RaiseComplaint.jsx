import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = {
  billing: {
    label: 'Billing & Payments',
    icon: '💳',
    subs: ['Incorrect charge', 'Refund not received', 'Subscription issue', 'Invoice error', 'Other'],
  },
  delivery: {
    label: 'Delivery & Shipping',
    icon: '📦',
    subs: ['Not delivered', 'Delayed delivery', 'Wrong item', 'Damaged in transit', 'Other'],
  },
  product: {
    label: 'Product / Service',
    icon: '🛒',
    subs: ['Defective product', 'Missing parts', 'Quality issue', 'Compatibility', 'Other'],
  },
  account: {
    label: 'Account & Access',
    icon: '🔐',
    subs: ['Cannot login', 'Account locked', 'Password reset', 'Profile update', 'Other'],
  },
  technical: {
    label: 'Technical Support',
    icon: '⚙️',
    subs: ['App crash', 'Feature not working', 'Performance issue', 'Data loss', 'Other'],
  },
  general: {
    label: 'General Enquiry',
    icon: '💬',
    subs: ['Information request', 'Feedback', 'Suggestion', 'Other'],
  },
};

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', desc: 'Not urgent, can wait a few days', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  { value: 'medium', label: 'Medium', desc: 'Standard response time', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { value: 'high', label: 'High', desc: 'Urgent – needs quick attention', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
];

const CHANNELS = [
  { value: 'web', label: 'Web Portal', icon: '🌐' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'store', label: 'In-store', icon: '🏬' },
];

const CONTACT_PREFS = [
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'phone', label: 'Phone call', icon: '📞' },
  { value: 'sms', label: 'SMS', icon: '💬' },
  { value: 'portal', label: 'Portal only', icon: '🔔' },
];

const STEPS = ['Category', 'Details', 'Review'];

function StepBadge({ step, current }) {
  const done = step < current;
  const active = step === current;
  return (
    <div className={`rc-step-badge ${active ? 'rc-step-badge--active' : ''} ${done ? 'rc-step-badge--done' : ''}`}>
      {done ? (
        <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
          <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
        </svg>
      ) : (
        <span>{step + 1}</span>
      )}
    </div>
  );
}

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(null); // holds the created complaint

  const [form, setForm] = useState({
    category: '',
    subcategory: '',
    title: '',
    description: '',
    priority: 'medium',
    channel: 'web',
    contactPreference: 'email',
    productOrderRef: '',
    urgencyNote: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const catMeta = form.category ? CATEGORIES[form.category] : null;
  const priorityMeta = PRIORITY_OPTIONS.find((p) => p.value === form.priority);

  // Step validation
  const canGoStep1 = !!form.category;
  const canGoStep2 = canGoStep1 && form.title.trim().length >= 5 && form.description.trim().length >= 10;

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/complaints', form);
      setSubmitted(data.complaint);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page rc-page">
        <div className="rc-success">
          <div className="rc-success__icon">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(34,197,94,0.12)"/>
              <path d="M14 24l7 7 13-14" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="rc-success__title">Complaint submitted!</h1>
          <p className="rc-success__sub">
            Your complaint has been filed and our team will review it shortly.
          </p>
          <div className="rc-success__ref">
            Ref: <strong>#{submitted._id?.slice(-8).toUpperCase()}</strong>
          </div>

          <div className="rc-success__detail-box">
            <div className="rc-success__detail-row">
              <span>Category</span>
              <span>{catMeta?.icon} {catMeta?.label}</span>
            </div>
            <div className="rc-success__detail-row">
              <span>Priority</span>
              <span style={{ color: priorityMeta?.color, fontWeight: 700 }}>{submitted.priority?.toUpperCase()}</span>
            </div>
            <div className="rc-success__detail-row">
              <span>Contact via</span>
              <span>{CONTACT_PREFS.find((c) => c.value === submitted.contactPreference)?.label || submitted.contactPreference}</span>
            </div>
          </div>

          <div className="rc-success__actions">
            <button
              className="rc-submit-btn"
              style={{ '--btn-color': '#3457D5' }}
              onClick={() => navigate(`/complaints/${submitted._id}`)}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                <path d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h0a2 2 0 002-2M9 5a2 2 0 012-2h0a2 2 0 012 2"/>
              </svg>
              View complaint details
            </button>
            <Link to="/my-complaints" className="rc-ghost-btn">
              View all my complaints
            </Link>
            <Link to="/" className="rc-ghost-btn">
              Go to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="page rc-page">
      {/* Header */}
      <div className="rc-header">
        <span className="eyebrow">New complaint</span>
        <h1>Tell us what went wrong</h1>
        <p>Fill in the details below and we'll get back to you as quickly as possible.</p>
      </div>

      {/* Stepper */}
      <div className="rc-stepper">
        {STEPS.map((label, i) => (
          <div key={label} className={`rc-stepper__item ${i <= step ? 'rc-stepper__item--reached' : ''}`}>
            <StepBadge step={i} current={step} />
            <span className="rc-stepper__label">{label}</span>
            {i < STEPS.length - 1 && <div className={`rc-stepper__line ${i < step ? 'rc-stepper__line--done' : ''}`} />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="login-error" role="alert" style={{ marginBottom: 16 }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      <div className="rc-card">
        {/* ── STEP 0: Category ── */}
        {step === 0 && (
          <div className="rc-step">
            <h2 className="rc-step__title">What is this about?</h2>
            <p className="rc-step__sub">Choose the category that best matches your issue.</p>

            <div className="rc-category-grid">
              {Object.entries(CATEGORIES).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  className={`rc-cat-btn ${form.category === key ? 'rc-cat-btn--active' : ''}`}
                  onClick={() => set('category', key)}
                >
                  <span className="rc-cat-btn__icon">{meta.icon}</span>
                  <span className="rc-cat-btn__label">{meta.label}</span>
                </button>
              ))}
            </div>

            {catMeta && (
              <div className="rc-field" style={{ marginTop: 20 }}>
                <label className="rc-label">Subcategory <span className="rc-optional">(optional)</span></label>
                <select
                  className="rc-select"
                  value={form.subcategory}
                  onChange={(e) => set('subcategory', e.target.value)}
                >
                  <option value="">— Select a subcategory —</option>
                  {catMeta.subs.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="rc-field" style={{ marginTop: 20 }}>
              <label className="rc-label">How did this happen? <span className="rc-optional">(channel)</span></label>
              <div className="rc-chip-row">
                {CHANNELS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`rc-chip ${form.channel === c.value ? 'rc-chip--active' : ''}`}
                    onClick={() => set('channel', c.value)}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rc-step__nav">
              <button
                className="rc-submit-btn"
                style={{ '--btn-color': '#3457D5' }}
                disabled={!canGoStep1}
                onClick={() => setStep(1)}
              >
                Continue
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <div className="rc-step">
            <h2 className="rc-step__title">Describe the issue</h2>
            <p className="rc-step__sub">The more detail you give, the faster we can help.</p>

            <div className="rc-field">
              <label className="rc-label" htmlFor="rc-title">Issue title <span className="rc-required">*</span></label>
              <input
                id="rc-title"
                className="rc-input"
                type="text"
                required
                placeholder="e.g. 'Order #1234 arrived damaged'"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                maxLength={120}
              />
              <div className="rc-char-count">{form.title.length}/120</div>
            </div>

            <div className="rc-field">
              <label className="rc-label" htmlFor="rc-desc">Detailed description <span className="rc-required">*</span></label>
              <textarea
                id="rc-desc"
                className="rc-textarea"
                required
                rows={5}
                placeholder="What happened? What did you expect? What steps led to this issue?"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                maxLength={2000}
              />
              <div className="rc-char-count">{form.description.length}/2000</div>
            </div>

            <div className="rc-two-col">
              <div className="rc-field">
                <label className="rc-label" htmlFor="rc-ref">
                  Order / Product ref <span className="rc-optional">(optional)</span>
                </label>
                <input
                  id="rc-ref"
                  className="rc-input"
                  type="text"
                  placeholder="e.g. ORD-78234"
                  value={form.productOrderRef}
                  onChange={(e) => set('productOrderRef', e.target.value)}
                />
              </div>
              <div className="rc-field">
                <label className="rc-label" htmlFor="rc-urgency-note">
                  Urgency note <span className="rc-optional">(optional)</span>
                </label>
                <input
                  id="rc-urgency-note"
                  className="rc-input"
                  type="text"
                  placeholder="e.g. 'Event is tomorrow'"
                  value={form.urgencyNote}
                  onChange={(e) => set('urgencyNote', e.target.value)}
                />
              </div>
            </div>

            <div className="rc-field">
              <label className="rc-label">Priority level</label>
              <div className="rc-priority-row">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    className={`rc-priority-btn ${form.priority === p.value ? 'rc-priority-btn--active' : ''}`}
                    style={form.priority === p.value ? { '--p-color': p.color, '--p-bg': p.bg } : {}}
                    onClick={() => set('priority', p.value)}
                  >
                    <span className="rc-priority-btn__label" style={form.priority === p.value ? { color: p.color } : {}}>{p.label}</span>
                    <span className="rc-priority-btn__desc">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rc-field">
              <label className="rc-label">Preferred contact method</label>
              <div className="rc-chip-row">
                {CONTACT_PREFS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`rc-chip ${form.contactPreference === c.value ? 'rc-chip--active' : ''}`}
                    onClick={() => set('contactPreference', c.value)}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rc-step__nav">
              <button className="rc-ghost-btn" onClick={() => setStep(0)}>
                ← Back
              </button>
              <button
                className="rc-submit-btn"
                style={{ '--btn-color': '#3457D5' }}
                disabled={!canGoStep2}
                onClick={() => setStep(2)}
              >
                Review & Submit
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Review ── */}
        {step === 2 && (
          <div className="rc-step">
            <h2 className="rc-step__title">Review your complaint</h2>
            <p className="rc-step__sub">Make sure everything looks correct before submitting.</p>

            <div className="rc-review-grid">
              <div className="rc-review-row">
                <span className="rc-review-key">Category</span>
                <span className="rc-review-val">{catMeta?.icon} {catMeta?.label}{form.subcategory ? ` › ${form.subcategory}` : ''}</span>
              </div>
              <div className="rc-review-row">
                <span className="rc-review-key">Title</span>
                <span className="rc-review-val rc-review-val--strong">{form.title}</span>
              </div>
              <div className="rc-review-row rc-review-row--tall">
                <span className="rc-review-key">Description</span>
                <span className="rc-review-val">{form.description}</span>
              </div>
              <div className="rc-review-row">
                <span className="rc-review-key">Priority</span>
                <span className="rc-review-val" style={{ color: priorityMeta?.color, fontWeight: 700 }}>
                  {form.priority.toUpperCase()}
                </span>
              </div>
              <div className="rc-review-row">
                <span className="rc-review-key">Channel</span>
                <span className="rc-review-val">{CHANNELS.find((c) => c.value === form.channel)?.label}</span>
              </div>
              <div className="rc-review-row">
                <span className="rc-review-key">Contact via</span>
                <span className="rc-review-val">{CONTACT_PREFS.find((c) => c.value === form.contactPreference)?.label}</span>
              </div>
              {form.productOrderRef && (
                <div className="rc-review-row">
                  <span className="rc-review-key">Ref</span>
                  <span className="rc-review-val">{form.productOrderRef}</span>
                </div>
              )}
              {form.urgencyNote && (
                <div className="rc-review-row">
                  <span className="rc-review-key">Urgency note</span>
                  <span className="rc-review-val">{form.urgencyNote}</span>
                </div>
              )}
            </div>

            <div className="rc-step__nav">
              <button className="rc-ghost-btn" onClick={() => setStep(1)}>
                ← Edit details
              </button>
              <button
                className="rc-submit-btn"
                style={{ '--btn-color': priorityMeta?.color || '#3457D5' }}
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <><span className="spinner" /> Submitting…</>
                ) : (
                  <>Submit complaint ✓</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
