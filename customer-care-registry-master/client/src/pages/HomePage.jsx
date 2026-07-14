import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page home">
      <section className="hero">
        <span className="eyebrow">Customer Care Registry</span>
        <h1>Every customer conversation, tracked in one place.</h1>
        <p className="hero__lede">
          A Customer Care Registry is a centralized system that records and manages
          customer interactions, issues, and feedback. It enables businesses to
          streamline support processes, track inquiries, and analyze trends to
          enhance service quality.
        </p>
        <p className="hero__lede">
          By maintaining a comprehensive history of customer interactions, the
          registry ensures consistency in responses, identifies recurring pain
          points, and aids in proactive issue resolution. With data-driven
          insights, businesses can refine training programs, optimize service
          protocols, and offer personalized support &mdash; ultimately improving
          customer satisfaction and loyalty.
        </p>

        {!user && (
          <div className="hero__actions">
            <Link to="/register" className="btn btn--primary">Create an account</Link>
            <Link to="/login" className="btn btn--ghost">Log in</Link>
          </div>
        )}
        {user && user.role === 'customer' && (
          <div className="hero__actions">
            <Link to="/raise-complaint" className="btn btn--primary">Raise a complaint</Link>
            <Link to="/my-complaints" className="btn btn--ghost">View my complaints</Link>
          </div>
        )}
        {user && user.role === 'agent' && (
          <div className="hero__actions">
            <Link to="/agent" className="btn btn--primary">Go to my dashboard</Link>
          </div>
        )}
        {user && user.role === 'admin' && (
          <div className="hero__actions">
            <Link to="/admin" className="btn btn--primary">Go to admin dashboard</Link>
          </div>
        )}
      </section>

      <section className="roles">
        <Link to="/login" className="role-card role-card--link">
          <h3>Customers</h3>
          <p>Register, raise complaints, track their status, and chat directly with the assigned agent.</p>
        </Link>
        <Link to="/login" className="role-card role-card--link">
          <h3>Agents</h3>
          <p>Work through assigned complaints, message customers, and update status as issues progress.</p>
        </Link>
        <Link to="/login" className="role-card role-card--link">
          <h3>Admins</h3>
          <p>See every complaint across the business, assign them to agents, and monitor resolution.</p>
        </Link>
      </section>
    </div>
  );
}
