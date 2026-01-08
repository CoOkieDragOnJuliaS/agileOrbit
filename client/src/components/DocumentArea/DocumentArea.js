/**
 * @file Client DocumentArea Component
 * @module DocumentArea
 * @description Main DocumentArea component for regular users, providing access to the Documentview.
 */

import React, {useEffect, useState} from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {useLocation, useNavigate} from 'react-router-dom';
import DocumentEditor from './DocumentEditor';
import DocumentTree from './DocumentTree';


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
export default function DocumentArea() {
    /** @type {{ signOut: Function}} Authentication context, does not need currentUser, because authStateListener acts independently */
    const {signOut} = useAuth();

    /** @type {Function} Hook to programmatically navigate */
    const navigate = useNavigate();

    const location = useLocation();
    // Check if we have a taskId from the TaskModal
    const taskId = location.state?.taskId;

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

    const [reloadKey, setReloadKey] = useState(0);
    const [activeDocumentId, setActiveDocumentId] = useState(null);

    const triggerReload = () => {
        setReloadKey(prev => prev + 1);
    };

    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        if (taskId) {
            setShowEditor(true);
        }
    }, [taskId]);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-gray-900">My Documentarea</h1>
                            </div>
                        </div>
                        <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
              <DocumentTree
                  reloadKey={reloadKey}
                  onSelectDocument={(id) => {
                      setActiveDocumentId(id);
                      setShowEditor(true);
                  }}
              />
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
                            <div id="main" className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Kanban Board!</h2>
                                <p className="text-gray-600">
                                    This is your personal workspace. Start organizing your tasks here.
                                </p>
                                <div id="main" className="p-4">
                                    <button
                                        onClick={() => {
                                            setShowEditor(prev => !prev)
                                            setActiveDocumentId(null)
                                        }}
                                        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded"
                                    >
                                        {showEditor ? "Editor schließen" : "Neues Dokument"}
                                    </button>

                                    {showEditor && <DocumentEditor documentId={activeDocumentId}
                                                                   onSaved={() => {
                                                                       triggerReload();
                                                                       if (taskId) {
                                                                           // If we came from TaskModal, go back after saving
                                                                           navigate(-1);
                                                                       }
                                                                   }}
                                                                   onDeleted={() => {
                                                                       triggerReload();
                                                                       setActiveDocumentId(null);
                                                                       if (!taskId) {
                                                                           setShowEditor(false);
                                                                       } else {
                                                                           navigate(-1);
                                                                       }
                                                                   }}/>}
                                </div>


                                {/* Add your Kanban board components here */}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
