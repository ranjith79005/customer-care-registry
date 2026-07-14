import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">Customer Care Registry</Link>
      <nav className="navbar__links">
        {!user && (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="navbar__cta">Register</Link>
          </>
        )}

        {user && user.role === 'customer' && (
          <>
            <Link to="/raise-complaint">Raise a complaint</Link>
            <Link to="/my-complaints">My complaints</Link>
          </>
        )}

        {user && user.role === 'agent' && (
          <Link to="/agent">Agent dashboard</Link>
        )}

        {user && user.role === 'admin' && (
          <Link to="/admin">Admin dashboard</Link>
        )}

        {user && (
          <>
            <span className="navbar__user">{user.name} &middot; {user.role}</span>
            <button type="button" className="navbar__logout" onClick={handleLogout}>
              Log out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
