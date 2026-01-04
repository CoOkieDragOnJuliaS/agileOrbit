import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Auth & Protection
import SignIn from './components/auth/SignIn';
import AdminSignIn from './components/auth/AdminSignIn';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout & Pages
import AgileOrbitSidebar from './layout/Sidebar';
import AdminDashboard from './components/admin/Dashboard';
import ClientDashboard from './components/client/Dashboard';
import DocumentArea from './components/DocumentArea/DocumentArea';
import Whiteboard from './components/Whiteboard/Whiteboard';
import EpicArea from './components/Epics/EpicArea';

import './App.css'; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App"> 
          <Routes>
            {/* Öffentliche Routen */}
            <Route path="/login" element={<SignIn />} />
            <Route path="/admin/login" element={<AdminSignIn />} />
            <Route path="/" element={<Navigate to="/login" />} />
            
            {/* Geschützte Client Routen mit Sidebar */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AgileOrbitSidebar />}> 
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/epicArea" element={<EpicArea />} />
                <Route path="/whiteboard" element={<Whiteboard />} />
                <Route path="/documentArea" element={<DocumentArea />} />
                <Route path="/settings" element={<div style={{padding: '20px'}}><h2>Settings</h2></div>} />
              </Route>
            </Route>
            
            {/* Admin Bereich */}
            <Route element={<ProtectedRoute requiredAdmin={true} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;