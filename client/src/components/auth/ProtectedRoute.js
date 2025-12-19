/**
 * @file Protected Route Component
 * @module ProtectedRoute
 * @description A higher-order component that protects routes based on authentication and admin status.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * A protected route component that handles authentication and authorization.
 * 
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} [props.requiredAdmin=false] - If true, only allows access to admin users.
 * @returns {JSX.Element} The protected route component that either renders the child routes or redirects.
 * 
 * @example
 * // Basic usage for any authenticated user
 * <Route element={<ProtectedRoute />}>
 *   <Route path="dashboard" element={<Dashboard />} />
 * </Route>
 * 
 * @example
 * // Usage for admin-only routes
 * <Route element={<ProtectedRoute requiredAdmin={true} />}>
 *   <Route path="admin/dashboard" element={<AdminDashboard />} />
 * </Route>
 */
export default function ProtectedRoute({ requiredAdmin = false }) {
  const { currentUser, isAdmin } = useAuth();

  // Redirect to login if user is not authenticated
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // Redirect to unauthorized page if admin access is required but user is not an admin
  if (requiredAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the child routes
  return <Outlet />;
}
