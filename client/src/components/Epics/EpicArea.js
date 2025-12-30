/**
 * @file Client DocumentArea Component
 * @module EpicArea
 * @description Main DocumentArea component for regular users, providing access to the Documentview.
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EpicEditor from './EpicEditor';
import EpicTree from './EpicTree';


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
export default function EpicArea() {
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


  const [reloadKey, setReloadKey] = useState(0);
  const [activeEpicId, setActiveEpicId] = useState(null);

  const triggerReload = () => {
    setReloadKey(prev => prev + 1);
  };

  const [showEditor, setShowEditor] = useState(false);
  

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">My Epicarea</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
              <EpicTree 
                  reloadKey={reloadKey}
                  onSelectEpic={(id) => {
                    setActiveEpicId(id);
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
              <div id ="main" className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Kanban Board!</h2>
                <p className="text-gray-600">
                  This is your personal workspace. Start organizing your tasks here.
                </p>
                <div id="main" className="p-4">
                  <button
                    onClick={() => {
                      setShowEditor(prev => !prev)
                      setActiveEpicId(null)
                    }
                    }
                    className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    {showEditor ? "Editor schließen" : "Neues Dokument"}
                  </button>

      {showEditor && <EpicEditor 
      epicId={activeEpicId}
      onSaved={triggerReload}
      onDeleted={() => {
      triggerReload();
      setActiveEpicId(null);
      setShowEditor(false);
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
