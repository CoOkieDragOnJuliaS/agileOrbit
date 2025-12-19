import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './components/auth/SignIn';
import AdminSignIn from './components/auth/AdminSignIn';
import AdminDashboard from './components/admin/Dashboard';
import ClientDashboard from './components/client/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<SignIn />} />
            <Route path="/admin/login" element={<AdminSignIn />} />
            
            {/* Client Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<ClientDashboard />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute requiredAdmin={true} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<SignIn />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
