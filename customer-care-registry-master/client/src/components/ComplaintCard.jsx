import { Link } from 'react-router-dom';

const STATUS_LABEL = {
  open: 'Open',
  assigned: 'Assigned',
  'in-progress': 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export default function ComplaintCard({ complaint, viewerRole }) {
  return (
    <Link to={`/complaints/${complaint._id}`} className="complaint-card">
      <div className="complaint-card__top">
        <h3>{complaint.title}</h3>
        <span className={`status-pill status-pill--${complaint.status}`}>
          {STATUS_LABEL[complaint.status] || complaint.status}
        </span>
      </div>
      <p className="complaint-card__desc">{complaint.description}</p>
      <div className="complaint-card__meta">
        {viewerRole !== 'customer' && complaint.customer && (
          <span>Customer: {complaint.customer.name}</span>
        )}
        {viewerRole !== 'agent' && complaint.assignedAgent && (
          <span>Agent: {complaint.assignedAgent.name}</span>
        )}
        <span>Priority: {complaint.priority}</span>
        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
