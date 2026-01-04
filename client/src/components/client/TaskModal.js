import React, { useState, useEffect } from 'react';
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

/**
 * Main TaskModal component
 * @param {Object} props - Component props
 * @param {Object} props.task - The task object to display/edit
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onSave - Callback when task is saved
 * @param {Function} props.onDelete - Callback when task is deleted
 */
const TaskModal = ({ task, onClose, onSave, onDelete }) => {
    /**
     * State Management:
     * - formData: Tracks the current state of the form fields
     * - isEditing: Tracks whether the form is in edit mode
     * - isSaving: Tracks if a save operation is in progress
     */
    /**
     * Effect hook to handle clicks outside the modal content
     * Closes the modal when clicking on the overlay
     */
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
            status: task?.status || 'todo'
        });
        
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
    }, [task]);

    // Form state for task details
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'todo' // Default status is 'todo'
    });
    
    // State for managing subtasks
    const [subtasks, setSubtasks] = useState([]); // List of subtasks for the current task
    const [newSubtask, setNewSubtask] = useState(''); // Input field for new subtask title
    const [editingSubtaskId, setEditingSubtaskId] = useState(null); // ID of subtask being edited
    const [editingDescription, setEditingDescription] = useState(''); // Current description being edited

    /**
     * Handles changes to form inputs
     * Updates the formData state with new values
     * @param {Object} e - The change event from the input field
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
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
    
    /**
     * Adds a new subtask to the current task
     * @param {Object} e - The click or keydown event
     */
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

            console.log('Response status:', response.status);
            const responseData = await response.json();
            console.log('Response data:', responseData);


            if (!response.ok) {
                throw new Error('Failed to add subtask');
            }
            
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
                st.id === subtaskId ? { ...st, ...updatedSubtask } : st
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
            await handleUpdateSubtask(subtaskId, { description: editingDescription });
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
    
    /**
     * Toggles the completion status of a subtask
     * @param {Object} subtask - The subtask to update
     */
    const toggleSubtaskStatus = (subtask) => {
        const newStatus = subtask.status === 'completed' ? 'todo' : 'completed';
        handleUpdateSubtask(subtask.id, { status: newStatus });
    };

    if (!task) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>Edit Task</h2>
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
                                                className="btn btn-sm btn-link text-danger ms-auto p-0"
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
                                                    className="form-control"
                                                    value={editingDescription}
                                                    onChange={(e) => setEditingDescription(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    placeholder="Add a description..."
                                                />
                                                <div className="mt-2">
                                                    <button 
                                                        className="btn btn-sm btn-primary me-2"
                                                        onClick={(e) => handleDescriptionSave(e, subtask.id)}
                                                    >
                                                        Save
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-secondary"
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
                                            handleAddSubtask(e).catch(error => {
                                                console.error('Error adding subtask:', error);
                                            });
                                        }
                                    }}
                                    placeholder="Add a subtask..."
                                    className="subtask-input"
                                />
                                <button 
                                    type="submit" 
                                    className="btn btn-primary btn-sm"
                                     onClick={(e) => {
                                        e.preventDefault();
                                        handleAddSubtask(e);
                                    }}
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
                        <div>
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
