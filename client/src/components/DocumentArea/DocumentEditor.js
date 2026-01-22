import React, {useCallback, useEffect, useState} from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './DocumentArea.css';

//import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
//import { db } from '../../firebase';
import { useNavigate } from "react-router-dom";



export default function DocumentEditor({documentId, onSaved, onDeleted}) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState('');
    const [title, setTitle] = useState('');
    const [taskId, setTaskId] = useState('');
    
    //let taskId = location.state?.taskId;
    
    //const taskId = useLocation();
    const navigate = useNavigate();

    const navigateTask = (taskId) => {
        navigate("/dashboard", {
            state: { taskId }
          });
    
    }



  

    const saveDocument = useCallback(async (content, docId, title) => {
        //console.log("content:", content);
        try {
            
            const response = await fetch("/api/documents/saveDocument", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: docId,
                    content,
                    title: title,
                    taskId: taskId || undefined // Only include taskId if it exists
                }),

            });
            return await response.json();
        }catch (error) {
            console.error('Error saving document:', error);
            throw error;
        }
    }, [taskId]);

    const loadDocument = async (docId) => {
        const res = await fetch(`/api/documents/${docId}`);
        if (!res.ok) {
            throw new Error("Failed to load document");
        }
        return res.json();
    };

    const handleSave = useCallback(async (content) => {
        try {
            const savedDocument = await saveDocument(content, documentId, title);
            onSaved?.(savedDocument?.id);
        } catch (error) {
            console.error("Error saving document:", error);
        }
    }, [saveDocument,documentId, title, onSaved]);

    const handleDelete = async (documentId) => {
        await deleteDocument(documentId);
        onDeleted?.();
    };

    useEffect(() => {
        const fetchDocument = async () => {

            if (!documentId) {
                setContent('');
                setTitle('Untitled Document');
                return;
            }

            try {
                setLoading(true);
                const data = await loadDocument(documentId);
                setTitle(data.title || "");
                setContent(data.content || "");
                setTaskId(data.taskId || "");
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDocument();
    }, [documentId]);


    const deleteDocument = async (docId) => {
        //console.log("content:", content);
        await fetch("/api/documents/deleteDocument", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: docId
            }),

        });
    };


    if (loading) return <div>Lade Dokument…</div>;

    return (

        <div className="editor-container">
            <div className="editor-header">
                <div className="title">Title: </div>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document title"
                    className="title-input"
                />
            </div>

            <div className="editor-actions">
                <button onClick={() => handleSave(content)} type="button" className="btn btn-primary">
                    Save
                </button>
                {documentId && (
                    <button
                        onClick={() => handleDelete(documentId)}
                        type="button"
                        className="btn btn-danger"
                    >
                        Delete
                    </button>
                )}
                {taskId && (
                    <button
                    onClick={() => navigateTask(taskId)}
                    type="button"
                    className="btn btn-secondary"
                >
                    Go to Task
                </button>
                )}
            </div>

            <div className="editor-content">
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={(content) => {
                        setContent(content);
                        
                    }}
                    placeholder="Start writing your document..."
                />
            </div>
        </div>

    );
}
