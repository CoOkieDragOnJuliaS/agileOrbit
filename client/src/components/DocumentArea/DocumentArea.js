/**
 * @file Client DocumentArea Component
 * @module DocumentArea
 * @description Main DocumentArea component for regular users, providing access to the Documentview.
 */

import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import DocumentEditor from './DocumentEditor';
import DocumentTree from './DocumentTree';
import './DocumentArea.css';
import '../../App.css';
import '../../index.css';
import Header from "../../layout/Header";
import { useParams } from 'react-router-dom';


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
    /** @type {Function} Hook to programmatically navigate */
    const navigate = useNavigate();

    const location = useLocation();
    // Check if we have a taskId from the TaskModal
    const taskId = location.state?.taskId;

    const [reloadKey, setReloadKey] = useState(0);
    const [activeDocumentId, setActiveDocumentId] = useState(null);

    const triggerReload = () => {
        setReloadKey(prev => prev + 1);
    };

    const [showEditor, setShowEditor] = useState(false);


    const { docId } = useParams();

useEffect(() => {
    if (docId) {
        setActiveDocumentId(docId);
        setShowEditor(true);
    }
}, [docId]);

useEffect(() => {
    if (taskId) {
        setShowEditor(true);
    }
}, [taskId]);

    return (
        <div className="document-container">
            <Header title="">
                <button
                    onClick={() => {
                        setShowEditor(prev => !prev)
                        setActiveDocumentId(null)
                    }}
                    className="btn btn-secondary"
                >
                    {showEditor ? "Close Editor" : "New Document"}
                </button>
            </Header>
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
