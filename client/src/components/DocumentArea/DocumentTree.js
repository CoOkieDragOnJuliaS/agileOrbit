import React, {useEffect, useState, useMemo, useCallback} from "react";
import "./DocumentArea.css";

// Helper function to format date
const formatDate = (timestamp) => {
    try {
        if (!timestamp) return '';

        // Debug log to see what we're working with
        console.log('Formatting timestamp:', timestamp, 'Type:', typeof timestamp);

        // Handle Firestore Timestamp with _seconds and _nanoseconds
        if (timestamp._seconds) {
            const date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
            return date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        // Handle Firestore Timestamp objects with toDate() method
        if (timestamp.toDate) {
            const date = timestamp.toDate();
            return date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        // Handle string timestamps
        if (typeof timestamp === 'string') {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
        }

        // Handle Firestore Timestamp in seconds/nanoseconds format (without underscore)
        if (timestamp.seconds) {
            const date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
            return date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        return ''; // Return empty if we can't parse the date
    } catch (error) {
        console.error('Error formatting date:', error, timestamp);
        return '';
    }
};


export default function DocumentTree({reloadKey, onSelectDocument, activeDocumentId}) {
    const [fileTree, setFileTree] = useState({
        epics: [],
        tasksWithoutEpic: [],
        standaloneDocuments: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memorize the document click handler
    const handleDocumentClick = useCallback((docId, e) => {
        e.stopPropagation(); // Prevent event bubbling
        console.log("Document clicked:", docId); // Debug log
        if (onSelectDocument) {
            onSelectDocument(docId);
        }
    }, [onSelectDocument]);

    // Process the file tree to add isActive to all documents
    const processedFileTree = useMemo(() => {
        if (!fileTree) return null;
        const processDocuments = (docs) =>
            (docs || []).map(doc => ({
                ...doc,
                isActive: String(activeDocumentId) === String(doc.id)
            }));
        return {
            epics: (fileTree.epics || []).map(epic => ({
                ...epic,
                tasks: (epic.tasks || []).map(task => ({
                    ...task,
                    documents: processDocuments(task.documents)
                }))
            })),
            tasksWithoutEpic: (fileTree.tasksWithoutEpic || []).map(task => ({
                ...task,
                documents: processDocuments(task.documents)
            })),
            standaloneDocuments: processDocuments(fileTree.standaloneDocuments)
        };
    }, [fileTree, activeDocumentId]);

    useEffect(() => {
        let isMounted = true;
        const fetchFileTree = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("/api/documents/fileTree"); // Backend Endpoint
                if (!res.ok) throw new Error("Fehler beim Laden der Dokumente");

                const data = await res.json();
                if (isMounted) {
                    console.log("Fetched file tree:", data); // Debug log
                    setFileTree({
                        epics: data.epics || [],
                        tasksWithoutEpic: data.tasksWithoutEpic || [],
                        standaloneDocuments: data.standaloneDocuments || []
                    });
                }
            } catch (err) {
                console.error("Error fetching file tree:", err);
                if (isMounted) {
                    setError("Failed to load documents. Please try again later.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchFileTree();
        return () => {
            isMounted = false; // Cleanup function to prevent state updates after unmount
        };
    }, [reloadKey]);

    // Debug log - only log when important changes happen
    useEffect(() => {
        if (!loading && !error) {
            console.log('Current state:', {
                hasEpics: processedFileTree.epics.length > 0,
                hasTasks: processedFileTree.tasksWithoutEpic.length > 0,
                hasStandalone: processedFileTree.standaloneDocuments.length > 0,
                activeDocumentId
            });
        }
    }, [loading, error, processedFileTree, activeDocumentId]);
    if (loading) return <div className="loading-message">Loading documents…</div>;
    if (error) return <div className="error-message">{error}</div>;


    // Check if there's any data to display
    const hasData = processedFileTree && (
        processedFileTree.epics.length > 0 ||
        processedFileTree.tasksWithoutEpic.length > 0 ||
        processedFileTree.standaloneDocuments.length > 0
    );
    if (!hasData) {
        return <div className="no-documents-message">No documents found.</div>;
    }

    return (
        <div className="document-tree">
            {/* Epics section */}
            {processedFileTree.epics.length > 0 && (
                <div className="epic-section">
                    <h3>Epics</h3>
                    {processedFileTree.epics.filter(epic =>
                        epic.tasks.some(task =>
                            task.documents && task.documents.length > 0
                        )
                    ).map(epic => (
                        <div key={`epic-${epic.id}`} className="epic-item">
                            <h4>{epic.title}</h4>
                            <ul className="task-list">
                                {epic.tasks.filter(task => task.documents && task.documents.length > 0)
                                    .map(task => (
                                    <li key={`task-${task.id}`} className="task-item">
                                        <div className="task-title">{task.title}</div>
                                        <ul className="document-list-documentTree">
                                            {task.documents && task.documents.map(doc => (
                                                <li
                                                    key={`doc-${doc.id}`}
                                                    className={`document-item-documentTree ${doc.isActive ? 'active' : ''}`}
                                                    onClick={(e) => handleDocumentClick(doc.id, e)}
                                                    title={doc.title}
                                                >
                                                    <span className="document-item-content">{doc.title}</span>
                                                    {doc.updatedAt && (
                                                        <span className="document-item-date">
                                                            {formatDate(doc.updatedAt)}
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            {/* Tasks without epics */}

            <div className="tasks-section">
                <h3>Tasks</h3>
                {processedFileTree.tasksWithoutEpic.length > 0 && (
                    processedFileTree.tasksWithoutEpic
                        .filter(task => task.documents && task.documents.length > 0)
                        .map(task => (
                        <div key={`task-${task.id}`} className="task-item">
                            <h4 className="task-title">{task.title}</h4>
                            <ul className="document-list-documentTree">
                                {task.documents && task.documents.map(doc => (
                                    <li
                                        key={`doc-${doc.id}`}
                                        className={`document-item-documentTree ${doc.isActive ? 'active' : ''}`}
                                        onClick={(e) => handleDocumentClick(doc.id, e)}
                                        title={doc.title}
                                    >
                                        <span className="document-item-content">{doc.title}</span>
                                        {doc.updatedAt && (
                                            <span className="document-item-date">
                                                {formatDate(doc.updatedAt)}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>
            {/* Standalone documents */}
            {processedFileTree.standaloneDocuments.length > 0 && (
                <div className="documents-section">
                    <h3>Uncategorized Documents</h3>
                    <ul className="document-list-documentTree">
                        {processedFileTree.standaloneDocuments.map(doc => (
                            <li
                                key={`doc-${doc.id}`}
                                className={`document-item-documentTree ${doc.isActive ? 'active' : ''}`}
                                onClick={(e) => handleDocumentClick(doc.id, e)}
                                title={doc.title}
                            >
                                <span className="document-item-content">{doc.title}</span>
                                {doc.updatedAt && (
                                    <span className="document-item-date">
                                        {formatDate(doc.updatedAt)}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
        ;
}
