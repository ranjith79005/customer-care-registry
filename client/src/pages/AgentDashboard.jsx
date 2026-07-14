import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['open', 'assigned', 'in-progress', 'resolved', 'closed'];
const STATUS_META = {
  open:          { label: 'Open',        color: '#3457D5', bg: '#E8ECFB' },
  assigned:      { label: 'Assigned',    color: '#F2704B', bg: '#FBEFE6' },
  'in-progress': { label: 'In Progress', color: '#A87B00', bg: '#FFF4D6' },
  resolved:      { label: 'Resolved',    color: '#5C7A5E', bg: '#E4EFE4' },
  closed:        { label: 'Closed',      color: '#6b7280', bg: '#f3f4f6' },
};
const PRIORITY_META = {
  low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

// ── Resolution note modal ──────────────────────────────────────────────────
function ResolveModal({ complaint, onClose, onSaved }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleResolve = async () => {
    setSaving(true);
    setErr('');
    try {
      await api.patch(`/complaints/${complaint._id}/status`, { status: 'resolved' });
      onSaved();
    } catch {
      setErr('Could not mark as resolved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Mark as Resolved</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-sub">Complaint: <strong>{complaint.title}</strong></p>
        {err && <div className="login-error" style={{ marginBottom: 12 }}>{err}</div>}
        <label className="rc-label" htmlFor="resolve-note">
          Resolution note <span className="rc-optional">(optional – for your records)</span>
        </label>
        <textarea
          id="resolve-note"
          className="rc-textarea"
          rows={4}
          placeholder="Summarize what was done to resolve this issue…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="rc-ghost-btn" onClick={onClose}>Cancel</button>
          <button
            className="rc-submit-btn"
            style={{ '--btn-color': '#22c55e' }}
            disabled={saving}
            onClick={handleResolve}
          >
            {saving ? <><span className="spinner" /> Saving…</> : '✔ Mark Resolved'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inline status changer ──────────────────────────────────────────────────
function StatusQuickChange({ complaint, onUpdated }) {
  const [saving, setSaving] = useState(false);

  const handleChange = async (e) => {
    const status = e.target.value;
    setSaving(true);
    try {
      await api.patch(`/complaints/${complaint._id}/status`, { status });
      onUpdated();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      className={`agt-status-select ${saving ? 'agt-status-select--saving' : ''}`}
      value={complaint.status}
      onChange={handleChange}
      disabled={saving}
      style={{ borderColor: STATUS_META[complaint.status]?.color }}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
      ))}
    </select>
  );
}

// ── Complaint row card ─────────────────────────────────────────────────────
function AgentComplaintRow({ complaint, onReload, onResolve }) {
  const sm = STATUS_META[complaint.status] || STATUS_META.open;
  const pm = PRIORITY_META[complaint.priority] || PRIORITY_META.medium;

  return (
    <div className="agt-row">
      <div className="agt-row__main">
        <div className="agt-row__top">
          <Link to={`/complaints/${complaint._id}`} className="agt-row__title">
            {complaint.title}
          </Link>
          <span className="agt-row__ref">#{complaint._id?.slice(-6).toUpperCase()}</span>
        </div>

        <p className="agt-row__desc">{complaint.description?.slice(0, 140)}{complaint.description?.length > 140 ? '…' : ''}</p>

        <div className="agt-row__meta">
          {complaint.category && (
            <span className="agt-tag">{complaint.category}</span>
          )}
          {complaint.customer?.name && (
            <span className="agt-meta-item">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                <circle cx="8" cy="5" r="3"/>
                <path d="M2 14a6 6 0 0112 0" strokeLinecap="round"/>
              </svg>
              {complaint.customer.name}
            </span>
          )}
          <span
            className="agt-priority-pip"
            style={{ background: pm.bg, color: pm.color }}
          >
            {complaint.priority}
          </span>
          <span className="agt-meta-item">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
              <rect x="1" y="3" width="14" height="11" rx="2"/>
              <path d="M5 1v4M11 1v4M1 7h14" strokeLinecap="round"/>
            </svg>
            {new Date(complaint.createdAt).toLocaleDateString()}
          </span>
          {complaint.urgencyNote && (
            <span className="agt-urgency">⚡ {complaint.urgencyNote}</span>
          )}
        </div>
      </div>

      <div className="agt-row__actions">
        <StatusQuickChange complaint={complaint} onUpdated={onReload} />

        {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
          <button
            className="agt-resolve-btn"
            onClick={() => onResolve(complaint)}
            title="Mark as resolved"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Resolve
          </button>
        )}

        <Link to={`/complaints/${complaint._id}`} className="agt-view-btn" title="View full details">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Details
        </Link>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function AgentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [resolveTarget, setResolveTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/complaints/agent');
      setComplaints(data.complaints);
    } catch {
      setError('Could not load your assigned complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = complaints.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) &&
        !c.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const urgent = complaints.filter((c) => c.priority === 'high' && !['resolved', 'closed'].includes(c.status)).length;

  return (
    <div className="page agt-page">
      {/* Header */}
      <div className="agt-header">
        <div>
          <span className="eyebrow">Agent workspace</span>
          <h1>My Assigned Cases</h1>
          {user?.name && <p className="agt-welcome">Welcome back, <strong>{user.name}</strong></p>}
        </div>
      </div>

      {/* Stats bar */}
      <div className="agt-stats">
        <div className="agt-stat">
          <strong>{complaints.length}</strong>
          <span>Total</span>
        </div>
        <div className="agt-stat agt-stat--orange">
          <strong>{(counts['in-progress'] || 0) + (counts['assigned'] || 0)}</strong>
          <span>Active</span>
        </div>
        <div className="agt-stat agt-stat--red">
          <strong>{urgent}</strong>
          <span>Urgent</span>
        </div>
        <div className="agt-stat agt-stat--green">
          <strong>{counts.resolved || 0}</strong>
          <span>Resolved</span>
        </div>
        <div className="agt-stat">
          <strong>{counts.closed || 0}</strong>
          <span>Closed</span>
        </div>
      </div>

      {/* Filters */}
      <div className="agt-filters">
        <div className="agt-search-wrap">
          <svg className="agt-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
            <circle cx="9" cy="9" r="6"/>
            <path d="M14 14l4 4" strokeLinecap="round"/>
          </svg>
          <input
            className="agt-search"
            type="search"
            placeholder="Search complaints…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="agt-filter-chips">
          <span className="agt-filter-label">Status:</span>
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              className={`agt-chip ${filterStatus === s ? 'agt-chip--active' : ''}`}
              onClick={() => setFilterStatus(s)}
              style={filterStatus === s && s !== 'all' ? {
                borderColor: STATUS_META[s]?.color,
                color: STATUS_META[s]?.color,
                background: STATUS_META[s]?.bg,
              } : {}}
            >
              {s === 'all' ? 'All' : STATUS_META[s]?.label}
            </button>
          ))}
        </div>

        <div className="agt-filter-chips">
          <span className="agt-filter-label">Priority:</span>
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              className={`agt-chip ${filterPriority === p ? 'agt-chip--active' : ''}`}
              onClick={() => setFilterPriority(p)}
              style={filterPriority === p && p !== 'all' ? {
                borderColor: PRIORITY_META[p]?.color,
                color: PRIORITY_META[p]?.color,
                background: PRIORITY_META[p]?.bg,
              } : {}}
            >
              {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="cd-loading"><span className="spinner" style={{ borderTopColor: '#3457D5', borderColor: 'rgba(52,87,213,0.2)', width: 24, height: 24 }} /><p>Loading…</p></div>
      )}
      {error && <div className="login-error">{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="agt-empty">
          <svg viewBox="0 0 64 64" fill="none" width="64" height="64">
            <circle cx="32" cy="32" r="32" fill="#f3f4f6"/>
            <path d="M20 44V28a4 4 0 014-4h16a4 4 0 014 4v16" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M26 24v-4a6 6 0 0112 0v4" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <p>{search || filterStatus !== 'all' || filterPriority !== 'all' ? 'No complaints match your filters.' : 'Nothing assigned to you yet.'}</p>
          {(search || filterStatus !== 'all' || filterPriority !== 'all') && (
            <button className="rc-ghost-btn" onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPriority('all'); }}>
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="agt-list">
        {filtered.map((c) => (
          <AgentComplaintRow
            key={c._id}
            complaint={c}
            onReload={load}
            onResolve={setResolveTarget}
          />
        ))}
      </div>

      {/* Resolve modal */}
      {resolveTarget && (
        <ResolveModal
          complaint={resolveTarget}
          onClose={() => setResolveTarget(null)}
          onSaved={() => { setResolveTarget(null); load(); }}
        />
      )}
    </div>
  );
}
