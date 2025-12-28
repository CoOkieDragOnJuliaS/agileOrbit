import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

/**
 * AgileOrbitSidebar Component
 * Separate component to avoid merge conflicts in Dashboard.js
 */
const AgileOrbitSidebar = () => {
  return (
    <aside className="sidebar-container">
      {/* Branding */}
      <div className="sidebar-brand">
        <div className="brand-icon">A</div>
        <span className="brand-name">AgileOrbit</span>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <span>📋</span> Board
        </NavLink>
        
        <NavLink to="/whiteboard" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <span>✏️</span> Whiteboard
        </NavLink>
        
        <NavLink to="/documents" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <span>📄</span> Documents
        </NavLink>
      </nav>

      {/* Footer / Settings */}
      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => isActive ? "sidebar-link settings-link active" : "sidebar-link settings-link"}>
          <span>⚙️</span> Settings
        </NavLink>
      </div>
    </aside>
  );
};

export default AgileOrbitSidebar;