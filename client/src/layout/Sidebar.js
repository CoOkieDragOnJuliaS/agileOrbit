import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Sidebar.css';

const AgileOrbitSidebar = () => {
  return (
    <div className="app-layout" style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      <aside className="sidebar-container" style={{ flexShrink: 0 }}>
        <div className="sidebar-brand">
          <div className="brand-icon">A</div>
          <span className="brand-name">AgileOrbit</span>
        </div>

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

      <main className="content-shell" style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default AgileOrbitSidebar;