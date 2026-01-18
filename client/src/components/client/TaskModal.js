import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import './TaskModal.css';


/**
 * TaskModal Component
 * A modal dialog for viewing and editing task details and subtasks.
 * Handles task CRUD operations and subtask management.
 *
 * Key Features:
 * - View and edit task details (title, description, status)
 * - Add, edit, delete subtasks
 * - Mark subtasks as complete/incomplete
 * - Add descriptions to subtasks
 * - Responsive design
 */

// API base URL for subtasks endpoint
const API_BASE_URL = '/api/subtasks';
const MAX_TAGS = 13;
const TYPE_TAG_PREFIX = 'type:';
const ISSUE_TYPES = ['Bug', 'Task', 'Story'];

const isTypeTag = (tag) => typeof tag === 'string' && tag.startsWith(TYPE_TAG_PREFIX);

// Reads the issue type from the tags array.
// We store the type as a reserved tag like: "type:Bug" | "type:Task" | "type:Story".
//
// Examples:
// - getIssueTypeFromTags(['frontend', 'type:Bug']) => 'Bug'
// - getIssueTypeFromTags(['frontend']) => ''
//
// If a type tag is present but not in ISSUE_TYPES, we treat it as invalid and return ''.
const getIssueTypeFromTags = (tags) => {
    if (!Array.isArray(tags)) return '';
    const typeTag = tags.find(isTypeTag);
    const raw = typeTag ? typeTag.slice(TYPE_TAG_PREFIX.length) : '';
    return ISSUE_TYPES.includes(raw) ? raw : '';
};

// Returns a new tags array where the issue type is updated.
// Invariant: there should be at most ONE type tag.
//
// Behavior:
// - Removes all existing "type:*" tags
// - If issueType is provided (e.g. 'Bug'), appends "type:Bug"
// - If issueType is empty (""), it removes the type entirely
//
// Examples:
// - setIssueTypeInTags(['a', 'type:Task'], 'Bug') => ['a', 'type:Bug']
// - setIssueTypeInTags(['a', 'type:Bug'], '') => ['a']
const setIssueTypeInTags = (tags, issueType) => {
    const safeTags = Array.isArray(tags) ? tags : [];
    const withoutType = safeTags.filter((t) => !isTypeTag(t));
    if (!issueType) return withoutType;
    return [...withoutType, `${TYPE_TAG_PREFIX}${issueType}`];
};


/**
 * Main TaskModal component
 * @param {Object} props - Component props
 * @param {Object} props.task - The task object to display/edit
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onSave - Callback when task is saved
 * @param {Function} props.onDelete - Callback when task is deleted
 */
const TaskModal = ({task, onClose, onSave, onDelete}) => {

    /**
     * State Management:
     * - formData: Tracks the current state of the form fields
     * - isEditing: Tracks whether the form is in edit mode
     * - isSaving: Tracks if a save operation is in progress
     */

        //Initializing navigation to another component with React
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---

    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'todo',
        tags: task?.tags || [],
        epicId: task?.epicId || [],
        assignee: task?.assignee || [],
        creator: task?.creator || ''
    });

    const [tagInput, setTagInput] = useState('');

    const [subtasks, setSubtasks] = useState([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [editingSubtaskId, setEditingSubtaskId] = useState(null);
    const [editingDescription, setEditingDescription] = useState('');
    const [documents, setDocuments] = useState([]);
    const [epics, setEpics] = useState([]);
    const [assignee, setassignee] = useState([]);
    


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

    /**
     * Fetches subtasks for the current task
     * Runs when the task prop changes
     */
    useEffect(() => {
        setFormData({
            title: task?.title || '',
            description: task?.description || '',
            status: task?.status || 'todo',
            epicId: task?.epicId || '',
            tags: task?.tags || [],
            assignee: task?.assignee || [],
            creator: task?.creator || ''
        }, [task]);

        const fetchSubtasks = async () => {
            if (!task?.id) return;

            try {
                const response = await fetch(`${API_BASE_URL}/${task.id}`, {
                    method: 'GET',
                    credentials: 'include', // Include cookies for authentication
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                //handle if there are no subtasks yet, set empty array
                if (response.status === 404) {
                    //No subtasks found
                    setSubtasks([]);
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch subtasks');
                }

                const subtasksData = await response.json();
                setSubtasks(subtasksData);
            } catch (error) {
                console.error('Error fetching subtasks:', error);
                //Setting empty array to prevent frontend issues
                setSubtasks([]);
            }
        };

        fetchSubtasks();

        const fetchDocuments = async () => {
            if (!task?.id) return;

            try {
                const response = await fetch(`/api/documents/fileTree/${task.id}`, {
                    method: 'GET',
                    credentials: 'include', // Include cookies for authentication
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                //handle if there are no subtasks yet, set empty array
                if (response.status === 404) {
                    //No subtasks found
                    setDocuments([]);
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch documents');
                }

                const DocumentData = await response.json();
                setDocuments(DocumentData);
            } catch (error) {
                console.error('Error fetching subtasks:', error);
                //Setting empty array to prevent frontend issues
                setDocuments([]);
            }
        };

        const fetchEpics = async () => {
            if (!task?.id) return;

            try {
                const response = await fetch(`/api/epics/fileTree/`, {
                    method: 'GET',
                    credentials: 'include', // Include cookies for authentication
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                //handle if there are no subtasks yet, set empty array
                if (response.status === 404) {
                    //No subtasks found
                    setEpics([]);
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch documents');
                }

                const DocumentData = await response.json();
                setEpics(DocumentData);
            } catch (error) {
                console.error('Error fetching subtasks:', error);
                //Setting empty array to prevent frontend issues
                setEpics([]);
            }

        
        };

        const fetchassignee = async () => {
            if (!task?.id) return;

            try {
                const response = await fetch(`/api/auth/assignee/`, {
                    method: 'GET',
                    credentials: 'include', // Include cookies for authentication
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                //handle if there are no subtasks yet, set empty array
                if (response.status === 404) {
                    //No subtasks found
                    setassignee([]);
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch documents');
                }

                const DocumentData = await response.json();
                setassignee(DocumentData);
            } catch (error) {
                console.error('Error fetching subtasks:', error);
                //Setting empty array to prevent frontend issues
                setassignee([]);
            }
        }

        fetchEpics();
        fetchDocuments();
        fetchassignee();

    }, [task]);


    // --- HANDLERS ---

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Handles form submission
     * Calls the onSave prop with the current form data
     * @param {Object} e - The form submission event
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // --- TAG HANDLERS ---

    const handleAddTag = (e) => {
        if (e) e.preventDefault();
        const newTag = tagInput.trim();
        if (!newTag) return;
        if (isTypeTag(newTag)) return;
        if (formData.tags.includes(newTag)) return;
        const visibleTagsCount = (formData.tags || []).filter((t) => !isTypeTag(t)).length;
        if (visibleTagsCount >= MAX_TAGS) return;

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

    const handleIssueTypeChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            tags: setIssueTypeInTags(prev.tags, value)
        }));
    };

    // --- SUBTASK HANDLERS ---

    const handleAddSubtask = async (e) => {
        e.preventDefault();
        console.log('Form submitted'); // Check if this logs

        if (!newSubtask.trim() || !task?.id) return;

        try {
            console.log('Sending request to:', API_BASE_URL);
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    /**
     * Updates an existing subtask
     * @param {string} subtaskId - ID of the subtask to update
     * @param {Object} updates - Object containing fields to update
     * @returns {Promise<Object>} The updated subtask
     */
    const handleUpdateSubtask = async (subtaskId, updates) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${subtaskId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Failed to update subtask');
            }

            const updatedSubtask = await response.json();

            setSubtasks(prev => prev.map(st =>
                st.id === subtaskId ? {...st, ...updatedSubtask} : st
            ));
            return updatedSubtask;
        } catch (error) {
            console.error('Error updating subtask:', error);
            throw error;
        }
    };

    /**
     * Handles clicking on a subtask to expand/collapse its description
     * @param {Object} subtask - The subtask that was clicked
     */
    const handleSubtaskClick = (subtask) => {
        if (editingSubtaskId === subtask.id) {
            setEditingSubtaskId(null);
            setEditingDescription('');
        } else {
            setEditingSubtaskId(subtask.id);
            setEditingDescription(subtask.description || '');
        }
    };

    /**
     * Saves the description of a subtask
     * @param {Object} e - The click event
     * @param {string} subtaskId - ID of the subtask to update
     */
    const handleDescriptionSave = async (e, subtaskId) => {
        e.stopPropagation();
        try {
            await handleUpdateSubtask(subtaskId, {description: editingDescription});
            setEditingSubtaskId(null);
        } catch (error) {
            console.error('Error saving description:', error);
        }
    };

    /**
     * Deletes a subtask
     * @param {string} subtaskId - ID of the subtask to delete
     */
    const handleDeleteSubtask = async (subtaskId) => {
        if (!window.confirm('Are you sure you want to delete this subtask?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${subtaskId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete subtask');
            }

            setSubtasks(subtasks.filter(st => st.id !== subtaskId));
        } catch (error) {
            console.error('Error deleting subtask:', error);
        }
    };

    const toggleSubtaskStatus = (subtask) => {
        const newStatus = subtask.status === 'completed' ? 'todo' : 'completed';
        handleUpdateSubtask(subtask.id, {status: newStatus});
    };

    const handleNavigateDocument = (docId) => {
        navigate(`/documents/edit/${docId}`, {state: {taskId: task.id}});
    };

    // Calculate progress for fun
    const completedCount = subtasks.filter(st => st.status === 'completed').length;
    const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

    if (!task) return null;

    const issueType = getIssueTypeFromTags(formData.tags);
    const visibleTags = (formData.tags || []).filter((t) => !isTypeTag(t));
    const isTagLimitReached = visibleTags.length >= MAX_TAGS;

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
                                <path
                                    d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"
                                    fill="currentColor"></path>
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
                                                <div className="subtask-row"
                                                     onClick={() => handleSubtaskClick(subtask)}>
                                                    <input
                                                        type="checkbox"
                                                        checked={subtask.status === 'completed'}
                                                        onChange={() => toggleSubtaskStatus(subtask)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="jira-checkbox"
                                                    />
                                                    <span
                                                        className={`subtask-title ${subtask.status === 'completed' ? 'completed' : ''}`}>
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
                                                            <button type="button" className="btn btn-primary btn-xs"
                                                                    onClick={(e) => handleDescriptionSave(e, subtask.id)}>Save
                                                            </button>
                                                            <button type="button" className="btn btn-ghost btn-xs"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingSubtaskId(null);
                                                                    }}>Cancel
                                                            </button>
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
                                        onClick={() => navigate('/documents/new', {state: {taskId: task.id}})}
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
                                <label className="jira-label-uppercase">Type</label>
                                <select
                                    value={issueType}
                                    onChange={handleIssueTypeChange}
                                    className="jira-select"
                                >
                                    <option value="">None</option>
                                    <option value="Bug">Bug</option>
                                    <option value="Task">Task</option>
                                    <option value="Story">Story</option>
                                </select>
                            </div>

                            <div className="sidebar-group">
                                <label className="jira-label-uppercase">Tags</label>
                                <div className="tags-container">
                                    {visibleTags.map((tag, index) => (
                                        <span key={index} className="tag-pill">
                                            {tag}
                                            <button type="button" onClick={() => handleRemoveTag(tag)}
                                                    className="tag-remove">×</button>
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
                            <div className="sidebar-group">
                                <div className="form-group">
                                    <label className="jira-label-uppercase">Epic Category</label>

                                    <select
                                        className="jira-select"
                                        name="epicId"
                                        id="epicId"
                                        value={formData.epicId}
                                        onChange={handleChange}
                                    >
                                        <option value="">Bitte Epic auswählen</option>

                                        {epics.map((epic) => (
                                            <option key={epic.id} value={epic.id}>
                                                {epic.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="sidebar-group read-only-meta">
                                <div className="meta-item">
                                    <span className="jira-label-uppercase">creator</span>
                                    <span className="tag-pill">{formData.creator}</span>
                                </div>
                                <div className="sidebar-group">
                                <div className="form-group">
                                    <label className="jira-label-uppercase">assignee</label>

                                    <select
                                        className="jira-select"
                                        name="assignee"
                                        id="assignee"
                                        value={formData.assignee}
                                        onChange={handleChange}
                                    >
                                        <option value="">Bitte Zuständigen auswählen</option>

                                        {assignee.map((assignee) => (
                                            <option key={assignee.uid} value={assignee.uid}>
                                                {assignee.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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