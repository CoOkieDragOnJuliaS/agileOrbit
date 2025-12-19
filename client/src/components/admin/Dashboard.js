/**
 * @file Admin Dashboard Component
 * @module AdminDashboard
 * @description Main dashboard component for administrative users, providing an overview and navigation for admin features.
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Admin Dashboard component that serves as the main interface for administrative users.
 * Provides navigation and access to administrative features.
 * 
 * @component
 * @returns {JSX.Element} The rendered admin dashboard component.
 * 
 * @example
 * // Basic usage in a route
 * <Route path="/admin/dashboard" element={
 *   <ProtectedRoute requiredAdmin={true}>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 * } />
 */
export default function AdminDashboard() {
  /** @type {{currentUser: Object, signOut: Function}} Authentication context */
  const { currentUser, signOut } = useAuth();
  
  /** @type {Function} Hook to programmatically navigate */
  const navigate = useNavigate();

  /**
   * Handles the sign out process for the admin user.
   * Signs out the user and redirects to the home page.
   * @async
   * @function handleSignOut
   * @returns {Promise<void>}
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {currentUser?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, Admin!</h2>
                <p className="text-gray-600">
                  This is the admin dashboard where you can manage users, content, and settings.
                </p>
                {/* Add your admin components here */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
