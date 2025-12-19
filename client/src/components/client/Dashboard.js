/**
 * @file Client Dashboard Component
 * @module ClientDashboard
 * @description Main dashboard component for regular users, providing access to the Kanban board and personal tasks.
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Client Dashboard component that serves as the main interface for regular users.
 * Provides access to the Kanban board and personal task management features.
 * 
 * @component
 * @returns {JSX.Element} The rendered client dashboard component.
 * 
 * @example
 * // Basic usage in a route
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <ClientDashboard />
 *   </ProtectedRoute>
 * } />
 */
export default function ClientDashboard() {
  /** @type {{currentUser: Object, signOut: Function}} Authentication context */
  const { currentUser, signOut } = useAuth();
  
  /** @type {Function} Hook to programmatically navigate */
  const navigate = useNavigate();

  /**
   * Handles the sign out process for the client user.
   * Signs out the user and redirects to the home page.
   * @async
   * @function handleSignOut
   * @returns {Promise<void>}
   * @throws {Error} If sign out fails
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">My Kanban Board</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {currentUser?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Kanban Board!</h2>
                <p className="text-gray-600">
                  This is your personal workspace. Start organizing your tasks here.
                </p>
                {/* Add your Kanban board components here */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
