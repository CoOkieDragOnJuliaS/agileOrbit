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
      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Kanban Board!</h2>
                <header>
                  <div className="user-profile">
                    <div className="user-avatar">{currentUser?.email?.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                      <span className="user-name">{currentUser?.email}</span>
                      <button onClick={handleSignOut} className="sign-out">Sign Out</button>
                    </div>
                  </div>
                </header>
                <div class="dashboard-container">
                  {/* Left Sidebar for Navigation*/}
                  <aside class="sidebarLeft">
                    <nav>
                      <ul>
                      </ul>
                    </nav>
                  </aside>

                  <main class="main-content">
                    <header><h1>Welcome back, {currentUser?.email?.split('@')[0] || 'User'}!</h1></header>

                    <div class="kanban-container">
                      <KanbanBoard />
                    </div>
                  </main>

                  <footer class="footer"><p>&copy; 2025 AgileOrbit</p></footer>

                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
