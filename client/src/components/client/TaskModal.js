import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TaskModal.css';

/**
 * TaskModal Component - Jira Style
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

    // --- TAG HANDLERS ---

    const handleAddTag = (e) => {
        if (e) e.preventDefault();
        const newTag = tagInput.trim();
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

    // Calculate progress for fun
    const completedCount = subtasks.filter(st => st.status === 'completed').length;
    const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

    if (!task) return null;

    const isTagLimitReached = formData.tags.length >= MAX_TAGS;

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Form acts as container */}
            <form className="modal-content jira-layout" onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
                
                {/* --- HEADER --- */}
                <div className="modal-header">
                    <div className="breadcrumbs">
                        <span>TASK-{task.id || 'NEW'}</span>
                    </div>
                    {/* Simplified Close Button */}
                    <div className="header-actions">
                        <button type="button" className="close-cross-btn" onClick={onClose} title="Close">
                            <svg width="24" height="24" viewBox="0 0 24 24" role="presentation">
                                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="currentColor"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* --- SCROLLABLE BODY --- */}
                <div className="modal-body-scroll">
                    <div className="jira-body-grid">
                        
                        {/* LEFT COLUMN */}
                        <div className="jira-main-col">
                            {/* Title */}
                            <div className="field-group title-group">
                                <input
                                    type="text"
                                    name="title"
                                    className="jira-title-input"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Task Title"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="field-group">
                                <label className="jira-label">Description</label>
                                <textarea
                                    name="description"
                                    className="jira-textarea"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Add a description..."
                                />
                            </div>

                            {/* Subtasks */}
                            <div className="field-group">
                                <div className="section-header">
                                    <label className="jira-label">Subtasks</label>
                                    {subtasks.length > 0 && (
                                        <span className="progress-pill">{progress}% done</span>
                                    )}
                                </div>
                                
                                {subtasks.length > 0 && (
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{width: `${progress}%`}}></div>
                                    </div>
                                )}

                                <div className="subtasks-list">
                                    <ul>
                                        {subtasks.map((subtask) => (
                                            <li key={subtask.id} className="subtask-item">
                                                <div className="subtask-row" onClick={() => handleSubtaskClick(subtask)}>
                                                    <input
                                                        type="checkbox"
                                                        checked={subtask.status === 'completed'}
                                                        onChange={() => toggleSubtaskStatus(subtask)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="jira-checkbox"
                                                    />
                                                    <span className={`subtask-title ${subtask.status === 'completed' ? 'completed' : ''}`}>
                                                        {subtask.title}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="icon-btn delete-subtask-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSubtask(subtask.id);
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                                
                                                {editingSubtaskId === subtask.id && (
                                                    <div className="subtask-edit-area">
                                                        <textarea
                                                            value={editingDescription}
                                                            onChange={(e) => setEditingDescription(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            placeholder="Add notes..."
                                                            autoFocus
                                                        />
                                                        <div className="subtask-actions">
                                                            <button type="button" className="btn btn-primary btn-xs" onClick={(e) => handleDescriptionSave(e, subtask.id)}>Save</button>
                                                            <button type="button" className="btn btn-ghost btn-xs" onClick={(e) => { e.stopPropagation(); setEditingSubtaskId(null); }}>Cancel</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="add-subtask-row">
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
                                            placeholder="+ Create subtask"
                                            className="jira-ghost-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="field-group">
                                <div className="section-header">
                                    <label className="jira-label">Linked Documents</label>
                                    <button
                                        type="button"
                                        className="icon-btn add-doc-btn"
                                        onClick={() => navigate('/documents/new', { state: { taskId: task.id } })}
                                        title="Create Document"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="documents-list">
                                    {documents.length === 0 ? (
                                        <div className="empty-state">No documents linked</div>
                                    ) : (
                                        <ul>
                                            {documents.map((doc) => (
                                                <li key={doc.id} className="document-item">
                                                    <span className="doc-icon">📄</span>
                                                    <button
                                                        type="button"
                                                        className="document-link"
                                                        onClick={() => handleNavigateDocument(doc.id)}
                                                    >
                                                        {doc.title || "Untitled Document"}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (SIDEBAR) */}
                        <div className="jira-sidebar">
                            <div className="sidebar-group">
                                <label className="jira-label-uppercase">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className={`jira-select status-${formData.status}`}
                                >
                                    <option value="todo">To Do</option>
                                    <option value="inProgress">In Progress</option>
                                    <option value="test">In Test</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            <div className="sidebar-group">
                                <label className="jira-label-uppercase">Tags</label>
                                <div className="tags-container">
                                    {formData.tags.map((tag, index) => (
                                        <span key={index} className="tag-pill">
                                            {tag}
                                            <button type="button" onClick={() => handleRemoveTag(tag)} className="tag-remove">×</button>
                                        </span>
                                    ))}
                                    {!isTagLimitReached && (
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            placeholder="Add tag..."
                                            className="tag-input-ghost"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="sidebar-group read-only-meta">
                                <div className="meta-item">
                                    <span className="meta-label">Reporter</span>
                                    <span className="meta-value">Me</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Created</span>
                                    <span className="meta-value">Just now</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER (ALWAYS VISIBLE) --- */}
                <div className="modal-footer">
                     <button
                        type="button"
                        className="btn btn-danger"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        Delete
                    </button>
                     <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>

            </form>
        </div>
    );
};

export default TaskModal;