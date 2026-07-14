import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ComplaintCard from '../components/ComplaintCard';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/complaints/mine');
        setComplaints(data.complaints);
      } catch (err) {
        setError('Could not load your complaints');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <span className="eyebrow">Your history</span>
        <h1>My complaints</h1>
        <Link to="/raise-complaint" className="btn btn--primary">Raise a new complaint</Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && complaints.length === 0 && (
        <p className="empty-state">You haven&rsquo;t raised any complaints yet.</p>
      )}

      <div className="complaint-list">
        {complaints.map((c) => (
          <ComplaintCard key={c._id} complaint={c} viewerRole="customer" />
        ))}
      </div>
    </div>
  );
}
