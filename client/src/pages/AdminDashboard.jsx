import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

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
const TABS = ['Overview', 'All Complaints', 'Agents', 'Create Staff'];

// ── Create Staff modal ─────────────────────────────────────────────────────
function CreateStaffModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    setSuccess('');
    try {
      const { data } = await api.post('/users/staff', form);
      setSuccess(`✅ ${data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)} "${data.user.name}" created!`);
      setForm({ name: '', email: '', password: '', role: 'agent' });
      onCreated?.();
    } catch (e) {
      setErr(e.response?.data?.message || 'Could not create account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3>Create Staff Account</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {err && <div className="login-error" style={{ marginBottom: 12 }}>{err}</div>}
        {success && <div className="adm-success-toast">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="rc-field">
            <label className="rc-label" htmlFor="staff-name">Full name</label>
            <input id="staff-name" className="rc-input" required placeholder="Jane Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="rc-field">
            <label className="rc-label" htmlFor="staff-email">Email address</label>
            <input id="staff-email" className="rc-input" type="email" required placeholder="jane@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="rc-field">
            <label className="rc-label" htmlFor="staff-pass">Password</label>
            <input id="staff-pass" className="rc-input" type="password" required minLength={6} placeholder="min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="rc-field">
            <label className="rc-label">Role</label>
            <div className="adm-role-row">
              {['agent', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`adm-role-btn ${form.role === r ? 'adm-role-btn--active' : ''}`}
                  onClick={() => setForm({ ...form, role: r })}
                >
                  {r === 'agent' ? '🎧' : '⚙️'} {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="rc-ghost-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="rc-submit-btn" style={{ '--btn-color': '#3457D5' }} disabled={saving}>
              {saving ? <><span className="spinner" /> Creating…</> : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Assign / reassign control ──────────────────────────────────────────────
function AssignControl({ complaint, agents, onReload }) {
  const [selectedAgent, setSelectedAgent] = useState(complaint.assignedAgent?._id || '');
  const [saving, setSaving] = useState(false);

  const handleAssign = async () => {
    if (!selectedAgent) return;
    setSaving(true);
    try {
      await api.patch(`/complaints/${complaint._id}/assign`, { agentId: selectedAgent });
      onReload();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-assign-row">
      <select
        className="adm-agent-select"
        value={selectedAgent}
        onChange={(e) => setSelectedAgent(e.target.value)}
      >
        <option value="">— Select agent —</option>
        {agents.map((a) => (
          <option key={a._id} value={a._id}>{a.name}</option>
        ))}
      </select>
      <button
        className="adm-assign-btn"
        disabled={!selectedAgent || saving}
        onClick={handleAssign}
      >
        {saving ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} /> : null}
        {complaint.assignedAgent ? 'Reassign' : 'Assign'}
      </button>
    </div>
  );
}

// ── Status quick-change inline ─────────────────────────────────────────────
function AdminStatusChange({ complaint, onReload }) {
  const [saving, setSaving] = useState(false);

  const handleChange = async (e) => {
    const status = e.target.value;
    setSaving(true);
    try {
      await api.patch(`/complaints/${complaint._id}/status`, { status });
      onReload();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      className="agt-status-select"
      value={complaint.status}
      onChange={handleChange}
      disabled={saving}
      style={{ borderColor: STATUS_META[complaint.status]?.color, minWidth: 130 }}
    >
      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
    </select>
  );
}

// ── Admin complaint row ────────────────────────────────────────────────────
function AdminComplaintRow({ complaint, agents, onReload }) {
  const sm = STATUS_META[complaint.status] || STATUS_META.open;
  const pm = PRIORITY_META[complaint.priority] || PRIORITY_META.medium;

  return (
    <div className="adm-row">
      <div className="adm-row__top">
        <div className="adm-row__title-group">
          <Link to={`/complaints/${complaint._id}`} className="adm-row__title">{complaint.title}</Link>
          <span className="adm-row__ref">#{complaint._id?.slice(-6).toUpperCase()}</span>
          {complaint.category && <span className="agt-tag">{complaint.category}</span>}
          <span className="agt-priority-pip" style={{ background: pm.bg, color: pm.color }}>{complaint.priority}</span>
        </div>
        <span className="adm-status-badge" style={{ color: sm.color, background: sm.bg }}>{sm.label}</span>
      </div>

      <p className="adm-row__desc">{complaint.description?.slice(0, 110)}{complaint.description?.length > 110 ? '…' : ''}</p>

      <div className="adm-row__meta">
        <span className="agt-meta-item">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11">
            <circle cx="8" cy="5" r="3"/><path d="M2 14a6 6 0 0112 0" strokeLinecap="round"/>
          </svg>
          Customer: {complaint.customer?.name || '—'}
        </span>
        <span className="agt-meta-item">
          {complaint.assignedAgent
            ? <>🎧 {complaint.assignedAgent.name}</>
            : <span style={{ color: '#9ca3af' }}>Unassigned</span>}
        </span>
        <span className="agt-meta-item">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11">
            <rect x="1" y="3" width="14" height="11" rx="2"/><path d="M5 1v4M11 1v4M1 7h14" strokeLinecap="round"/>
          </svg>
          {new Date(complaint.createdAt).toLocaleDateString()}
        </span>
        {complaint.urgencyNote && <span className="agt-urgency">⚡ {complaint.urgencyNote}</span>}
        {complaint.feedback?.rating && (
          <span style={{ color: '#f59e0b', fontSize: 12 }}>{'★'.repeat(complaint.feedback.rating)} ({complaint.feedback.rating}/5)</span>
        )}
      </div>

      <div className="adm-row__controls">
        <AdminStatusChange complaint={complaint} onReload={onReload} />
        <AssignControl complaint={complaint} agents={agents} onReload={onReload} />
        <Link to={`/complaints/${complaint._id}`} className="agt-view-btn">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Details
        </Link>
      </div>
    </div>
  );
}

// ── Overview stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, color, bg, icon }) {
  return (
    <div className="adm-stat-card" style={{ '--sc-color': color, '--sc-bg': bg }}>
      <span className="adm-stat-card__icon">{icon}</span>
      <strong className="adm-stat-card__value">{value}</strong>
      <span className="adm-stat-card__label">{label}</span>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const loadAll = useCallback(async () => {
    try {
      const [cr, ar] = await Promise.all([api.get('/complaints'), api.get('/users/agents')]);
      setComplaints(cr.data.complaints);
      setAgents(ar.data.agents);
    } catch {
      setError('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // counts
  const counts = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    acc[`pri_${c.priority}`] = (acc[`pri_${c.priority}`] || 0) + 1;
    return acc;
  }, {});
  const unassigned = complaints.filter((c) => !c.assignedAgent).length;
  const avgRating = (() => {
    const rated = complaints.filter((c) => c.feedback?.rating);
    if (!rated.length) return null;
    return (rated.reduce((s, c) => s + c.feedback.rating, 0) / rated.length).toFixed(1);
  })();

  // filter + sort
  const filtered = complaints
    .filter((c) => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
      if (filterAgent === 'unassigned' && c.assignedAgent) return false;
      if (filterAgent !== 'all' && filterAgent !== 'unassigned' && c.assignedAgent?._id !== filterAgent) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q) &&
            !c.customer?.name?.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'priority') {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
      }
      return 0;
    });

  return (
    <div className="page adm-page">
      {/* Header */}
      <div className="adm-header">
        <div>
          <span className="eyebrow">Admin control centre</span>
          <h1>Dashboard</h1>
        </div>
        <button
          className="rc-submit-btn"
          style={{ '--btn-color': '#3457D5' }}
          onClick={() => setShowCreateStaff(true)}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M10 3v14M3 10h14" strokeLinecap="round"/>
          </svg>
          Add staff
        </button>
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`adm-tab ${tab === t ? 'adm-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'All Complaints' && complaints.length > 0 && (
              <span className="adm-tab__badge">{complaints.length}</span>
            )}
            {t === 'Agents' && agents.length > 0 && (
              <span className="adm-tab__badge">{agents.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading && <div className="cd-loading"><span className="spinner" style={{ borderTopColor: '#3457D5', borderColor: 'rgba(52,87,213,0.2)', width: 24, height: 24 }} /><p>Loading…</p></div>}
      {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* ── TAB: Overview ── */}
      {tab === 'Overview' && !loading && (
        <div className="adm-overview">
          <div className="adm-stat-grid">
            <StatCard label="Total" value={complaints.length} color="#3457D5" bg="#E8ECFB" icon="📋" />
            <StatCard label="Open" value={counts.open || 0} color="#3457D5" bg="#E8ECFB" icon="🔵" />
            <StatCard label="In Progress" value={counts['in-progress'] || 0} color="#A87B00" bg="#FFF4D6" icon="🟡" />
            <StatCard label="Resolved" value={counts.resolved || 0} color="#5C7A5E" bg="#E4EFE4" icon="🟢" />
            <StatCard label="Closed" value={counts.closed || 0} color="#6b7280" bg="#f3f4f6" icon="⚫" />
            <StatCard label="Unassigned" value={unassigned} color="#ef4444" bg="rgba(239,68,68,0.08)" icon="❗" />
            <StatCard label="High Priority" value={counts.pri_high || 0} color="#ef4444" bg="rgba(239,68,68,0.08)" icon="🔴" />
            {avgRating && <StatCard label="Avg Rating" value={`${avgRating}★`} color="#f59e0b" bg="rgba(245,158,11,0.1)" icon="⭐" />}
          </div>

          <h3 className="adm-section-title">Quick Actions</h3>
          <div className="adm-quick-actions">
            <button className="adm-qa-btn" onClick={() => { setTab('All Complaints'); setFilterStatus('open'); }}>
              <span>🔵</span>
              <strong>{counts.open || 0}</strong>
              <span>Open complaints</span>
            </button>
            <button className="adm-qa-btn adm-qa-btn--urgent" onClick={() => { setTab('All Complaints'); setFilterPriority('high'); }}>
              <span>🔴</span>
              <strong>{counts.pri_high || 0}</strong>
              <span>High priority</span>
            </button>
            <button className="adm-qa-btn" onClick={() => { setTab('All Complaints'); setFilterAgent('unassigned'); }}>
              <span>❗</span>
              <strong>{unassigned}</strong>
              <span>Unassigned</span>
            </button>
            <button className="adm-qa-btn" onClick={() => setTab('Agents')}>
              <span>🎧</span>
              <strong>{agents.length}</strong>
              <span>Active agents</span>
            </button>
          </div>

          <h3 className="adm-section-title">Recent Complaints</h3>
          <div className="adm-list">
            {complaints.slice(0, 5).map((c) => (
              <AdminComplaintRow key={c._id} complaint={c} agents={agents} onReload={loadAll} />
            ))}
          </div>
          {complaints.length > 5 && (
            <button className="rc-ghost-btn" style={{ marginTop: 12 }} onClick={() => setTab('All Complaints')}>
              View all {complaints.length} complaints →
            </button>
          )}
        </div>
      )}

      {/* ── TAB: All Complaints ── */}
      {tab === 'All Complaints' && !loading && (
        <div>
          {/* Filters bar */}
          <div className="adm-filters-bar">
            <div className="agt-search-wrap" style={{ flex: 1, minWidth: 200 }}>
              <svg className="agt-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
                <circle cx="9" cy="9" r="6"/><path d="M14 14l4 4" strokeLinecap="round"/>
              </svg>
              <input className="agt-search" type="search" placeholder="Search title, description, customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <select className="adm-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_META[s]?.label}</option>)}
            </select>

            <select className="adm-filter-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select className="adm-filter-select" value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)}>
              <option value="all">All Agents</option>
              <option value="unassigned">Unassigned</option>
              {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>

            <select className="adm-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">By priority</option>
            </select>
          </div>

          <div className="adm-results-count">
            Showing <strong>{filtered.length}</strong> of {complaints.length} complaints
          </div>

          {filtered.length === 0 && (
            <div className="agt-empty">
              <p>No complaints match your filters.</p>
              <button className="rc-ghost-btn" onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPriority('all'); setFilterAgent('all'); }}>Clear all filters</button>
            </div>
          )}

          <div className="adm-list">
            {filtered.map((c) => (
              <AdminComplaintRow key={c._id} complaint={c} agents={agents} onReload={loadAll} />
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Agents ── */}
      {tab === 'Agents' && !loading && (
        <div>
          <div className="adm-agents-header">
            <h2 style={{ margin: 0 }}>Agent Roster ({agents.length})</h2>
            <button className="rc-submit-btn" style={{ '--btn-color': '#3457D5' }} onClick={() => setShowCreateStaff(true)}>
              + Add agent
            </button>
          </div>
          {agents.length === 0 && <p className="empty-state">No agents yet. Create one using the button above.</p>}
          <div className="adm-agent-grid">
            {agents.map((a) => {
              const assigned = complaints.filter((c) => c.assignedAgent?._id === a._id);
              const active = assigned.filter((c) => !['resolved', 'closed'].includes(c.status));
              const resolved = assigned.filter((c) => c.status === 'resolved' || c.status === 'closed');
              return (
                <div key={a._id} className="adm-agent-card">
                  <div className="adm-agent-card__avatar">
                    {a.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="adm-agent-card__info">
                    <strong className="adm-agent-card__name">{a.name}</strong>
                    <span className="adm-agent-card__email">{a.email}</span>
                  </div>
                  <div className="adm-agent-card__stats">
                    <div className="adm-agent-stat">
                      <strong>{active.length}</strong>
                      <span>Active</span>
                    </div>
                    <div className="adm-agent-stat">
                      <strong>{resolved.length}</strong>
                      <span>Done</span>
                    </div>
                    <div className="adm-agent-stat">
                      <strong>{assigned.length}</strong>
                      <span>Total</span>
                    </div>
                  </div>
                  {active.length > 0 && (
                    <button
                      className="adm-agent-card__link"
                      onClick={() => { setTab('All Complaints'); setFilterAgent(a._id); }}
                    >
                      View active cases →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: Create Staff ── */}
      {tab === 'Create Staff' && !loading && (
        <div className="adm-create-staff-page">
          <div className="rc-card" style={{ maxWidth: 480 }}>
            <h2 style={{ marginBottom: 4 }}>Create Staff Account</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Add a new agent or admin to the system.</p>
            <CreateStaffInline onCreated={loadAll} />
          </div>
        </div>
      )}

      {/* Create Staff modal */}
      {showCreateStaff && (
        <CreateStaffModal
          onClose={() => setShowCreateStaff(false)}
          onCreated={() => { setShowCreateStaff(false); loadAll(); }}
        />
      )}
    </div>
  );
}

// Inline version for the tab page
function CreateStaffInline({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    setSuccess('');
    try {
      const { data } = await api.post('/users/staff', form);
      setSuccess(`✅ ${data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)} "${data.user.name}" created successfully!`);
      setForm({ name: '', email: '', password: '', role: 'agent' });
      onCreated?.();
    } catch (e) {
      setErr(e.response?.data?.message || 'Could not create account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {err && <div className="login-error" style={{ marginBottom: 12 }}>{err}</div>}
      {success && <div className="adm-success-toast">{success}</div>}
      <div className="rc-field">
        <label className="rc-label" htmlFor="si-name">Full name</label>
        <input id="si-name" className="rc-input" required placeholder="Jane Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="rc-field">
        <label className="rc-label" htmlFor="si-email">Email address</label>
        <input id="si-email" className="rc-input" type="email" required placeholder="jane@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="rc-field">
        <label className="rc-label" htmlFor="si-pass">Password</label>
        <input id="si-pass" className="rc-input" type="password" required minLength={6} placeholder="min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </div>
      <div className="rc-field">
        <label className="rc-label">Role</label>
        <div className="adm-role-row">
          {['agent', 'admin'].map((r) => (
            <button key={r} type="button" className={`adm-role-btn ${form.role === r ? 'adm-role-btn--active' : ''}`} onClick={() => setForm({ ...form, role: r })}>
              {r === 'agent' ? '🎧' : '⚙️'} {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <button type="submit" className="rc-submit-btn" style={{ '--btn-color': '#3457D5', width: '100%', marginTop: 4, justifyContent: 'center' }} disabled={saving}>
        {saving ? <><span className="spinner" /> Creating…</> : 'Create account'}
      </button>
    </form>
  );
}
