import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navigation.css';

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="navigation">
      <ul>
        <li><Link to="/">Events</Link></li>
        {user ? (
          <>
            {user.role === 'organizer' && (
              <>
                <li><Link to="/create-event">Create Event</Link></li>
                <li><Link to="/moderate">Moderate</Link></li>
              </>
            )}
            <li><button onClick={logout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;