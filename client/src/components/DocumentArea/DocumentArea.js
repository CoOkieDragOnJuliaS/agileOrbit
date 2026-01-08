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
import './DocumentArea.css';


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
        <div className="document-container">
            <div className="document-content">
                <div className="document-sidebar">
                    <DocumentTree
                        reloadKey={reloadKey}
                        activeDocumentId={activeDocumentId}
                        onSelectDocument={(id) => {
                            setActiveDocumentId(id);
                            setShowEditor(true);
                        }}
                    />
                </div>
                <div className="document-editor-container">
                    <header className="document-header">
                        <h1>Document Editor</h1>
                        <div className="header-actions">
                            <button
                                onClick={handleSignOut}
                                className="sign-out-btn"
                            >
                                Sign Out
                            </button>
                            <button
                                onClick={() => {
                                    setShowEditor(prev => !prev)
                                    setActiveDocumentId(null)
                                }}
                                className="new-document-btn"
                            >
                                {showEditor ? "Editor schließen" : "Neues Dokument"}
                            </button>
                        </div>
                    </header>
                    {showEditor ? (<DocumentEditor
                            documentId={activeDocumentId}
                            onSaved={(savedDocumentId) => {
                                triggerReload();
                                // Update the active document ID to the newly saved document
                                setActiveDocumentId(savedDocumentId);
                                if (taskId) {
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
