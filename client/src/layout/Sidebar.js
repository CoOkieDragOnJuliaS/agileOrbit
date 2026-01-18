import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Sidebar.css';

const AgileOrbitSidebar = () => {
  const getPreferredTheme = () => {
    const saved = window.localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;

    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  };

  const [theme, setTheme] = React.useState(() => getPreferredTheme());

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      <aside className="sidebar-container" style={{ flexShrink: 0 }}>
        <div className="sidebar-brand">
          <div className="brand-icon">A</div>
          <span className="brand-name">AgileOrbit</span>
        </div>

        <button
          type="button"
          className="sidebar-theme-toggle"
          onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <span>📋</span> Board
          </NavLink>

          <NavLink to="/epicArea" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <span>🏔️</span> Epics
          </NavLink>
          
          <NavLink to="/whiteboard" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <span>✏️</span> Whiteboard
          </NavLink>
          
          <NavLink to="/documentArea" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <span>📄</span> Documents
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/settings" className={({ isActive }) => isActive ? "sidebar-link settings-link active" : "sidebar-link settings-link"}>
            <span>⚙️</span> Settings
          </NavLink>
        </div>
      </aside>

      <main className="content-shell" style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: 'var(--bg-app)' }}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default AgileOrbitSidebar;