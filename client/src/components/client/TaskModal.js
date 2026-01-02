import React, { useState, useEffect } from 'react';
import './TaskModal.css';

/**
 * TaskModal Component
 * A modal dialog for viewing and editing task details
 * 
 * Props:
 * - task: The task object to display/edit
 * - onClose: Function to call when the modal should be closed
 * - onSave: Function to call with updated task data
 * - onDelete: Function to call when the task should be deleted
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
     * Effect hook to update form data when the task prop changes
     * This ensures the form reflects the current task data
     */
    useEffect(() => {
        setFormData({
            title: task?.title || '',
            description: task?.description || '',
            status: task?.status || 'todo'
        });
    }, [task]);

    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'todo'
    });

    /**
     * Handles changes to form inputs and updates the formData state
     * @param {Object} e - The change event from the form input
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
     * @param {Object} e - The form submission event
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
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
