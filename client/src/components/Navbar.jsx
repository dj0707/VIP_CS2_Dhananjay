import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, language, t, toggleTheme, setLanguage } = usePreferences();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar navbar-expand-lg app-nav">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <Link className="brand-lockup" to="/">
          <span className="brand-mark">RX</span>
          <div>
            <strong>{t.brand}</strong>
            <p className="brand-tagline">{t.tagline}</p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button className="icon-toggle" type="button" onClick={toggleTheme} title={t.theme}>
            {theme === 'light' ? t.dark : t.light}
          </button>
          <select className="compact-select" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={t.language}>
            <option value="en">EN</option>
            <option value="hi">HI</option>
          </select>
          {user ? (
            <>
              <NavLink className="nav-link" to="/dashboard">
                {t.dashboard}
              </NavLink>
              <span className="status-pill">{user.role}</span>
              <button className="btn btn-sm btn-outline-primary" onClick={handleLogout}>
                {t.logout}
              </button>
            </>
          ) : (
            <>
              <NavLink className="nav-link" to="/login/user">
                {t.login}
              </NavLink>
              <Link className="btn btn-sm btn-primary" to="/register">
                {t.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
