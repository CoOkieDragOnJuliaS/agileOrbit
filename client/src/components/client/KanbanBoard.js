import React, { useState, useEffect, useRef, useCallback } from 'react';
/**
 * In KanbanBoard.js, useCallback ensures fetchTasks and fetchSubtasks to maintain stable references,
 * preventing infinite loops in useEffect and unnecessary re-renders.
 * Dependency-Driven Updates:
 * The function is recreated only when a value in the dependency array ([deps]) changes.
 * Empty array [] means the function is created once and never changes. So it stays in memory otherwise!
 */
import './KanbanBoard.css';
import TaskModal from './TaskModal';

// Base URL for the task API endpoints - using relative URL to work with proxy
const API_BASE_URL = '/api/task';

/**
 * KanbanBoard Component
 * A drag-and-drop task management board with four columns:
 * - To Do
 * - In Progress
 * - In Test
 * - Done
 * 
 * Features:
 * - View tasks in their respective status columns
 * - Add new tasks to any column
 * - Edit task titles and descriptions in Modal window
 * - Edit status in Modal window (without Drag & Drop)
 * - Delete tasks in Modal window
 * - Real-time updates when changes are made (refreshing overlay)
 */
function KanbanBoard() {
    /**
     * State Management:
     * - tasks: Object containing arrays of tasks grouped by their status
     *   - todo: Tasks that haven't been started
     *   - inProgress: Tasks currently being worked on
     *   - test: Tasks in testing/QA phase
     *   - done: Completed tasks
     * - isLoading: Tracks loading state for API operations
     * - error: Stores any error messages from API calls
     * - selectedTask: Currently selected task for viewing/editing in the modal
     */
    const [tasks, setTasks] = useState({
        todo: [],        // Tasks that haven't been started
        inProgress: [],  // Tasks currently being worked on
        test: [],        // Tasks in testing/QA phase
        done: []         // Completed tasks
    });
    
    const [isLoading, setIsLoading] = useState(true);  // Loading state for API calls
    const [error, setError] = useState(null);          // Error state for API errors
    const [subtasks, setSubtasks] = useState({});
    const [selectedTask, setSelectedTask] = useState(null); // Currently selected task for editing
    const draggedTask = useRef(null); // Task being dragged for Drag&Drop

    //Fetching subtasks for the task count
    const fetchSubtasks = useCallback(async (taskIds) => {
        const subtaskPromises = taskIds.map(async (taskId) => {
            try {
                const response = await fetch(`/api/subtasks/${taskId}`, {
                    credentials: 'include'
                });
                if (!response.ok) {
                    console.error(`Failed to fetch subtasks for task ${taskId}:`, response.status);
                    return { taskId, subtasks: [] };
                }
                const subtasks = await response.json();
                return { taskId, subtasks };
            } catch (error) {
                console.error(`Error fetching subtasks for task ${taskId}:`, error);
                return { taskId, subtasks: [] };
            }
        });
        const subtasksResults = await Promise.all(subtaskPromises);
        const subtasksByTask = {};
        
        subtasksResults.forEach(({ taskId, subtasks }) => {
            if (subtasks && subtasks.length > 0) {
                subtasksByTask[taskId] = subtasks;
            }
        });
        
        setSubtasks(subtasksByTask);
    }, []);
    
    /**
     * Fetches all tasks from the server and updates the component state
     * Is the autmatic refresh tactic after changes are made
     * Handles loading states and errors
     */
    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('Fetching tasks from:', `${API_BASE_URL}/board`);
            
            // Make API request to fetch tasks
            const response = await fetch(`${API_BASE_URL}/board`, {
                credentials: 'include'  // Important for including authentication cookies
            });
            
            // Handle non-2xx responses
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to fetch tasks:', response.status, errorText);
                throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`);
            }
            
            // Parse and update tasks state with the response
            const data = await response.json();
            console.log('Received tasks data:', data);
            setTasks(data);


            const taskIds = Object.values(data).flat().map(task => task.id);
            if (taskIds.length > 0) {
                await fetchSubtasks(taskIds);
            }
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [fetchSubtasks]);


    const refreshTaskSubtasks = useCallback(async (taskId) => {
        const taskSubtasks = await fetch(`/api/subtasks/${taskId}`, {
            credentials: 'include'
        }).then(res => res.ok ? res.json() : []);
        
        setSubtasks(prev => ({
            ...prev,
            [taskId]: taskSubtasks
        }));
    }, []);

    /**
     * Creates a new task with the specified status
     * @param {string} status - The status/column where the task should be created
     * Automatically refreshes the task list after creation
     */
    const createTask = async (status) => {
        try {
            const newTask = {
                title: 'New Task',
                description: 'Click to edit',
                status,
                boardID: 'default-board' // TODO: Replace with actual board ID from props or context
            };

            console.log('Creating task with data:', newTask);

            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newTask),
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            // Refresh the task list
            await fetchTasks();
        } catch (err) {
            console.error('Error creating task:', err);
            setError('Failed to create task. Please try again.');
        }
    };

    /**
     * Updates an existing task with new data
     * @param {string} taskId - ID of the task to update
     * @param {object} updates - Object containing fields to update (e.g., { title: 'New Title' })
     * Automatically refreshes the task list after update
     */
    const updateTask = async (taskId, updates) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

        } catch (err) {
            console.error('Error updating task:', err);
            setError('Failed to update task. Please try again.');
        }
    };

    /**
     * Deletes a task by ID
     * @param {string} taskId - ID of the task to delete
     * Shows a confirmation dialog before deletion
     * Automatically refreshes the task list after deletion
     */
    const deleteTask = async (taskId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${taskId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            // Refresh the task list
            await fetchTasks();
        } catch (err) {
            console.error('Error deleting task:', err);
            setError('Failed to delete task. Please try again.');
        }
    };

    /**
     * Handles task field updates (title, description, etc.)
     * @param {string} taskId - ID of the task being edited
     * @param {object} updates - Object containing the updated fields
     * Debounced to prevent too many API calls during rapid typing
     */
    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    const handleSaveTask = async (updatedData) => {
        if (!selectedTask) return;
        
        try {
            await updateTask(selectedTask.id, updatedData);
            await fetchTasks();  // Refresh the task list
            await refreshTaskSubtasks(selectedTask.id);
            setSelectedTask(null);
        } catch (err) {
            console.error('Error saving task:', err);
            setError('Failed to save task. Please try again.');
        }
    };

    const handleDeleteTask = async () => {
        if (!selectedTask) return;
        
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(selectedTask.id);
                setSelectedTask(null);
            } catch (err) {
                console.error('Error deleting task:', err);
                setError('Failed to delete task. Please try again.');
            }
        }
    };

    /**
     * Effect hook to fetch tasks when the component mounts
     * The empty dependency array ensures this only runs once on mount
     */
    // Add this new effect specifically for handling truncation
    useEffect(() => {
        const checkTruncation = () => {
            document.querySelectorAll('.kanban-card .description').forEach(p => {
                const isTruncated = p.scrollHeight > p.clientHeight;
                p.classList.toggle('truncated', isTruncated);
            });
        };
        // Initial check after a small delay to ensure DOM is rendered
        const timer = setTimeout(checkTruncation, 100);
        
        // Check when window is resized
        window.addEventListener('resize', checkTruncation);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkTruncation);
        };
    }, [tasks]); // Re-run when tasks change


    // Keeping the existing fetch effect separate
    useEffect(() => {
        console.log('Component mounted, fetching tasks...');
        const loadTasks = async () => {
        try {
            await fetchTasks();
        } catch (err) {
            console.error('Error in fetchTasks:', err);
            setError('Failed to load tasks. Please refresh the page.');
        }
        };
        loadTasks();
    }, [fetchTasks]); // This should only run once on mount

    /**
     * Renders an empty state message for columns with no tasks
     * @returns {JSX.Element} Empty state UI component
     */
    const renderEmptyState = () => (
        <div className="empty-state">
            <p>No tasks yet. Click + to add a new task.</p>
        </div>
    );

    const formatDate = (timestamp) => {
        try {
            // Handle Firestore timestamp object with _seconds
            if (timestamp && typeof timestamp === 'object' && '_seconds' in timestamp) {
                return new Date(timestamp._seconds * 1000).toLocaleDateString();
            }
            // Handle Firestore timestamp with toDate method
            if (timestamp && typeof timestamp.toDate === 'function') {
                return timestamp.toDate().toLocaleDateString();
            }
            // Handle Date object or date string
            const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString();
            }
            return 'Just now';
        } catch (e) {
            console.error('Error formatting date:', e, 'Timestamp:', timestamp);
            return 'Just now';
        }
    };

    /**
     * Renders a single task card
     * @param {object} task - The task object to render
     * @returns {JSX.Element} Task card component with edit and delete functionality
     */
    const renderTaskCard = (task) => {
        const taskSubtasks = subtasks[task.id] || [];
        const completedCount = taskSubtasks.filter(st => st.status === 'completed').length;
        const totalCount = taskSubtasks.length;
   
        return (
            <div 
                key={task.id} 
                className="kanban-card"
                onClick={() => handleTaskClick(task)}
                draggable
                onDragStart={() => {
                    draggedTask.current = task;
                }}
            >
                <h4>{task.title}</h4>
                <p className="description">{task.description || 'No description'}</p>
                <div className="card-footer">
                    <span className="date">
                        {task.createdAt ? formatDate(task.createdAt) : 'Just now'}
                    </span>
                    {totalCount > 0 && (
                    <span className="subtask-badge">
                        {completedCount}/{totalCount} Subtasks
                    </span>
                )}
                </div>
            </div>
        );
    };

    /**
     * Renders a single Kanban column with its tasks
     * @param {string} column - The column key (e.g., 'todo', 'inProgress')
     * @param {string} title - The display title for the column
     * @returns {JSX.Element} Column component with header and task cards
     */
    const renderKanbanColumn = (column, title) => (
        <div className="kanban-column" key={column}>
            <div className="kanban-column-header">
                <div className="column-title">
                    <h3>{title}</h3>
                    <span className="task-count">({tasks[column]?.length || 0})</span>
                </div>
                <button 
                    className="add-card-btn" 
                    onClick={() => createTask(column)}
                    disabled={isLoading}
                >
                    {isLoading ? '...' : '+'}
                </button>
            </div>

            <div
                className="kanban-cards"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const task = draggedTask.current;
                    if (!task || task.status === column) return;

                    // Update UI Instantly
                    setTasks(prev => ({
                        ...prev,
                        [task.status]: prev[task.status].filter(t => t.id !== task.id),
                        [column]: [{ ...task, status: column }, ...prev[column]]
                    }));

                    // Save changes in background
                    updateTask(task.id, { status: column });

                    draggedTask.current = null;
                }}
            >
                {isLoading ? (
                    <div className="loading-state">Loading tasks...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : tasks[column] && tasks[column].length > 0 ? (
                    tasks[column].map(renderTaskCard)
                ) : (
                    renderEmptyState()
                )}
            </div>
        </div>
    );

    return (
        <>
            <div className="kanban-board">
                {renderKanbanColumn('todo', 'To Do')}
                {renderKanbanColumn('inProgress', 'In Progress')}
                {renderKanbanColumn('test', 'In Test')}
                {renderKanbanColumn('done', 'Done')}
            </div>
            
            {selectedTask && (
                <TaskModal 
                    task={selectedTask}
                    onClose={handleCloseModal}
                    onSave={handleSaveTask}
                    onDelete={handleDeleteTask}
                />
            )}
        </>
    );
}

export default KanbanBoard;