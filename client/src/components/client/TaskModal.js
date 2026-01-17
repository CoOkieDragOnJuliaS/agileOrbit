import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TaskModal.css';

/**
 * TaskModal Component
 * A modal dialog for viewing and editing task details, tags, and subtasks.
 */

const API_BASE_URL = '/api/subtasks';
const MAX_TAGS = 5;

const TaskModal = ({ task, onClose, onSave, onDelete }) => {
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---

    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'todo',
        tags: task?.tags || [] 
    });

    const [tagInput, setTagInput] = useState('');

    const [subtasks, setSubtasks] = useState([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [editingSubtaskId, setEditingSubtaskId] = useState(null);
    const [editingDescription, setEditingDescription] = useState('');
    const [documents, setDocuments] = useState([]);

    // --- EFFECTS ---

    useEffect(() => {
        const handleOverlayClick = (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                onClose();
            }
        };
        document.addEventListener('click', handleOverlayClick);
        return () => {
            document.removeEventListener('click', handleOverlayClick);
        };
    }, [onClose]);

    useEffect(() => {
        setFormData({
            title: task?.title || '',
            description: task?.description || '',
            status: task?.status || 'todo',
            tags: task?.tags || [] 
        });

        const fetchSubtasks = async () => {
            if (!task?.id) return;
            try {
                const response = await fetch(`${API_BASE_URL}/${task.id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (response.status === 404) {
                    setSubtasks([]);
                    return;
                }
                if (!response.ok) throw new Error('Failed to fetch subtasks');

                const subtasksData = await response.json();
                setSubtasks(subtasksData);
            } catch (error) {
                console.error('Error fetching subtasks:', error);
                setSubtasks([]);
            }
        };

        const fetchDocuments = async () => {
            if (!task?.id) return;
            try {
                const response = await fetch(`/api/documents/fileTree/${task.id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (response.status === 404) {
                    setDocuments([]);
                    return;
                }
                if (!response.ok) throw new Error('Failed to fetch documents');

                const DocumentData = await response.json();
                setDocuments(DocumentData);
            } catch (error) {
                console.error('Error fetching documents:', error);
                setDocuments([]);
            }
        };

        fetchSubtasks();
        fetchDocuments();
    }, [task]);

    // --- HANDLERS ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // --- TAG HANDLERS (UPDATED) ---

    /**
     * unified function to add a tag
     */
    const handleAddTag = (e) => {
        if (e) e.preventDefault();
        
        const newTag = tagInput.trim();
        
        // Validation: Must have text, not be duplicate, and under limit
        if (!newTag) return;
        if (formData.tags.includes(newTag)) return;
        if (formData.tags.length >= MAX_TAGS) return;

        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, newTag]
        }));
        setTagInput('');
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // --- SUBTASK HANDLERS ---

    const handleAddSubtask = async (e) => {
        e.preventDefault();
        if (!newSubtask.trim() || !task?.id) return;

        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: task.id,
                    title: newSubtask.trim(),
                    description: ''
                }),
            });

            if (!response.ok) throw new Error('Failed to add subtask');
            const responseData = await response.json();
            setSubtasks(prev => [...prev, responseData]);
            setNewSubtask('');
        } catch (error) {
            console.error('Error adding subtask:', error);
        }
    };

    const handleUpdateSubtask = async (subtaskId, updates) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${subtaskId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error('Failed to update subtask');
            const updatedSubtask = await response.json();
            
            setSubtasks(prev => prev.map(st =>
                st.id === subtaskId ? { ...st, ...updatedSubtask } : st
            ));
            return updatedSubtask;
        } catch (error) {
            console.error('Error updating subtask:', error);
            throw error;
        }
    };

    const handleSubtaskClick = (subtask) => {
        if (editingSubtaskId === subtask.id) {
            setEditingSubtaskId(null);
            setEditingDescription('');
        } else {
            setEditingSubtaskId(subtask.id);
            setEditingDescription(subtask.description || '');
        }
    };

    const handleDescriptionSave = async (e, subtaskId) => {
        e.stopPropagation();
        try {
            await handleUpdateSubtask(subtaskId, { description: editingDescription });
            setEditingSubtaskId(null);
        } catch (error) {
            console.error('Error saving description:', error);
        }
    };

    const handleDeleteSubtask = async (subtaskId) => {
        if (!window.confirm('Are you sure you want to delete this subtask?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/${subtaskId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to delete subtask');
            setSubtasks(subtasks.filter(st => st.id !== subtaskId));
        } catch (error) {
            console.error('Error deleting subtask:', error);
        }
    };

    const toggleSubtaskStatus = (subtask) => {
        const newStatus = subtask.status === 'completed' ? 'todo' : 'completed';
        handleUpdateSubtask(subtask.id, { status: newStatus });
    };

    const handleNavigateDocument = (docId) => {
        navigate(`/documents/edit/${docId}`, { state: { taskId: task.id } });
    };

    if (!task) return null;

    const isTagLimitReached = formData.tags.length >= MAX_TAGS;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <div className="modal-header">
                    <h2>Edit Task</h2>
                    <button
                        className="createDocument-btn"
                        onClick={() => navigate('/documents/new', { state: { taskId: task.id } })}
                        title="Create Document"
                    >
                        📄
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>

                    {/* --- UPDATED TAGS SECTION --- */}
                    <div className="form-group">
                        <label>
                            Tags <span style={{fontSize: '0.85em', color: '#666', fontWeight: 'normal'}}>
                                ({formData.tags.length}/{MAX_TAGS})
                            </span>
                        </label>
                        <div className="tags-container">
                            <div className="tags-list">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="tag-chip">
                                        {tag}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveTag(tag)}
                                            className="tag-remove-btn"
                                            title="Remove tag"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            
                            {/* Input and Plus Button Container */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder={isTagLimitReached ? "Limit reached" : "Type tag..."}
                                    className="tag-input"
                                    disabled={isTagLimitReached}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="btn btn-primary btn-sm"
                                    disabled={!tagInput.trim() || isTagLimitReached}
                                    title="Add Tag"
                                    style={{ padding: '2px 10px', fontSize: '1.2rem', lineHeight: '1' }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="todo">To Do</option>
                            <option value="inProgress">In Progress</option>
                            <option value="test">In Test</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Documents</label>
                        <div className="documents-list">
                            <ul>
                                {documents.map((doc) => (
                                    <li key={doc.id} className="document-item">
                                        <button
                                            type="button"
                                            className="document-title-btn"
                                            onClick={() => handleNavigateDocument(doc.id)}
                                        >
                                            {doc.title || "Untitled Document"}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Subtasks</label>
                        <div className="subtasks-list">
                            <ul>
                                {subtasks.map((subtask) => (
                                    <li key={subtask.id} className="subtask-item">
                                        <div className="subtask-header" onClick={() => handleSubtaskClick(subtask)}>
                                            <input
                                                type="checkbox"
                                                checked={subtask.status === 'completed'}
                                                onChange={() => toggleSubtaskStatus(subtask)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className={`subtask-title ${subtask.status === 'completed' ? 'completed' : ''}`}>
                                                {subtask.title}
                                            </span>
                                            <button
                                                type="button"
                                                className="delete-subtask-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSubtask(subtask.id);
                                                }}
                                                title="Delete subtask"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        {editingSubtaskId === subtask.id && (
                                            <div className="subtask-description">
                                                <textarea
                                                    value={editingDescription}
                                                    onChange={(e) => setEditingDescription(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    placeholder="Add a description..."
                                                />
                                                <div className="subtask-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm"
                                                        onClick={(e) => handleDescriptionSave(e, subtask.id)}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingSubtaskId(null);
                                                            setEditingDescription('');
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <div className="add-subtask-form">
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSubtask(e);
                                        }
                                    }}
                                    placeholder="Add a subtask..."
                                    className="subtask-input"
                                />
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleAddSubtask}
                                    disabled={!newSubtask.trim()}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            Delete Task
                        </button>
                        <div className="right-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;