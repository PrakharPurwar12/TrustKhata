import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ menuOpen, onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.username?.slice(0, 2) || 'TK';
  const showMenuButton = user && location.pathname !== '/login';

  return (
    <header className="topbar">
      <Link className="topbar__brand" to={user ? '/dashboard' : '/login'}>
        <span className="topbar__logo">TK</span>
        <span className="topbar__meta">
          <span className="topbar__title">TrustKhata</span>
          <span className="topbar__subtitle">Udhar ko trust ke saath manage karo</span>
        </span>
      </Link>

      <div className="topbar__actions">
        {showMenuButton ? (
          <button
            className="button button--secondary topbar__menu"
            type="button"
            onClick={onMenuToggle}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        ) : null}

        {user ? (
          <>
            <div className="topbar__user">
              <span className="topbar__user-text">
                <span className="topbar__user-name">{user.username}</span>
                <span className="topbar__user-role">Owner workspace</span>
              </span>
              <span className="topbar__avatar">{initials}</span>
            </div>
            <button className="button button--ghost" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link className="button button--primary" to="/login">
            Open workspace
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
