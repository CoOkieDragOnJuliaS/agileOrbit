import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SignIn from './components/auth/SignIn';
import AdminSignIn from './components/auth/AdminSignIn';
import AdminDashboard from './components/admin/Dashboard';
import ClientDashboard from './components/client/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

import DocumentArea from './components/DocumentArea/DocumentArea';
import EpicArea from './components/Epics/EpicArea';
import './App.css'; 

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Die Klasse "App" kann als globaler Wrapper dienen */}
        <div className="App"> 
          <Routes>
            {/* Public Routes (ohne Sidebar) */}
            <Route path="/login" element={<SignIn />} />
            <Route path="/admin/login" element={<AdminSignIn />} />
            
            {/* Client Routes (mit Projekt-Layout) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/documentArea" element={<DocumentArea />} />
              <Route path="/epicArea" element={<EpicArea />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute requiredAdmin={true} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            
            <Route path="/" element={<SignIn />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
