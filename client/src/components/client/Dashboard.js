/**
 * @file Client Dashboard Component
 * @module ClientDashboard
 * @description Main dashboard component for regular users, providing access to the Kanban board and personal tasks.
 */

import React from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {useNavigate} from 'react-router-dom';
import KanbanBoard from "./KanbanBoard";

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
    const {currentUser, signOut} = useAuth();

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
        <div className="dashboard-layout">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>AgileOrbit</h1>
                    <div className="user-profile">
                        <div className="user-avatar">
                            {currentUser?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <span className="user-email">{currentUser?.email}</span>
                            <button onClick={handleSignOut} className="sign-out-btn">
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <div className="dashboard-container">
                <aside className="sidebar">
                  <nav>
                    <ul>
                     {/*Here comes the Navigation sidebar*/}
                    </ul>
                  </nav>
                </aside>
                <main className="main-content">
                    <div className="content-header">
                        <h2>Welcome back, {currentUser?.email?.split('@')[0] || 'User'}!</h2>
                    </div>
                    <div className="kanban-container">
                        <KanbanBoard />
                    </div>
                </main>
            </div>
            <footer className="dashboard-footer">
                <p>&copy; {new Date().getFullYear()} AgileOrbit. All rights reserved.</p>
            </footer>
        </div>
    );
}
