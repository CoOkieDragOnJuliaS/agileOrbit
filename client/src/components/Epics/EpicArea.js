/**
 * @file Client DocumentArea Component
 * @module EpicArea
 * @description Main DocumentArea component for regular users, providing access to the Documentview.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EpicEditor from './EpicEditor';
import EpicTree from './EpicTree';
import './EpicArea.css';
import Header from "../../layout/Header";

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
    <div className="document-container">
    <Header title="">
        <button
            onClick={() => {
                setShowEditor(prev => !prev)
                setActiveEpicId(null)
            }}
        >
            {showEditor ? "Editor schließen" : "Neues Dokument"}
        </button>
    </Header>
    <div className="document-content">
        <div className="document-sidebar">
            <EpicTree
                reloadKey={reloadKey}
                activeEpicId={activeEpicId}
                onSelectEpic={(id) => {
                    setActiveEpicId(id);
                    setShowEditor(true);
                }}
            />
        </div>
        <div className="document-editor-container">
            <header className="document-header">
                <h1>Epic Editor</h1>
            </header>
            {showEditor ? (<EpicEditor
                    epicId={activeEpicId}
                    onSaved={(savedEpicId) => {
                        triggerReload();
                        // Update the active document ID to the newly saved document
                        setActiveEpicId(savedEpicId);
                    
                    }}
                    onDeleted={() => {
                        triggerReload();
                        setActiveEpicId(null);
                        setShowEditor(false);
                    }}/>) :
                (<div className="document-placeholder">
                        <p>Select a document or create a new one to get started</p>
                    </div>
                )}
        </div>
    </div>
</div>
  );
}
