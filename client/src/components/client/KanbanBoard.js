import React, { useState } from 'react';
import './KanbanBoard.css';
function KanbanBoard() {
    const [tasks, setTasks] = useState({
        todo: [],
        inProgress: [],
        test: [],
        done: []
    });

    const renderEmptyState = () => (
        <div className="empty-state">
            <p>No tasks yet. Click + to add a new task.</p>
        </div>
    );

    const renderKanbanColumn = (column, title) => (
        <div
            className="kanban-column"
            key={column}>
            <div className="kanban-column-header">
                <div className="column-title">
                    <h3>{title}</h3>
                    <span className="task-count">({tasks[column]?.length || 0})</span>
                </div>
                <button 
                    className="add-card-btn" 
                    onClick={() => {
                        const newTask = {
                            id: Date.now(),
                            title: 'New Task',
                            description: 'Click to edit',
                            date: new Date().toLocaleDateString()
                        };
                        setTasks(prev => ({
                            ...prev,
                            [column]: [...prev[column], newTask]
                        }));
                    }}>
                    +
                </button>
            </div>


            <div className="kanban-cards">
                {tasks[column] && tasks[column].length > 0 ? (
                    tasks[column].map(task => (
                        <div key={task.id} className="kanban-card">
                            <h4>{task.title}</h4>
                            <p>{task.description}</p>
                            <div className="card-footer">
                                <span className="date">{task.date}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    renderEmptyState()
                )}
            </div>
        </div>
    );

    return (
        <div className="kanban-board">
            {renderKanbanColumn('todo', 'To Do')}
            {renderKanbanColumn('inProgress', 'In Progress')}
            {renderKanbanColumn('test', 'In Test')}
            {renderKanbanColumn('done', 'Done')}
        </div>
    );
}

export default KanbanBoard;