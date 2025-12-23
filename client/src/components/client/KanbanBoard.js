import React, { useState } from 'react';
function KanbanBoard() {
    const [tasks, setTasks] = useState({
        todo: [],
        inProgress: [],
        test: [],
        done: []
    });

    

    // Add task handlers, drag-and-drop logic, etc.

    return (
        <div className="kanban-board">
            <div class="kanban-board">
                <div id="kanban_column_toDo" class="kanban-column">
                    <div class="kanban-column-header">
                        <h3>To do</h3><button class="addingCard">+</button>
                    </div>

                    <div class="kanban-card" draggable="true">
                        image.jpg
                        <h4>Update Website Homepage</h4>
                        <p>Revise the content and layout...</p>
                        <div class="card-footer">
                            <span class="date">2/15/24</span>
                            <div class="avatars">
                                avatar1.jpg
                                <img src="avatar2.jpg" alt=""/>
                            </div>
                        </div>
                    </div>
                    <!-- More cards -->
                </div>

                <div id="kanban_column_inProgress" class="kanban-column">
                    <div class="kanban-column-header">
                        <h3>In Progress</h3><button class="addingCard">+</button>
                    </div>
                    <div class="kanban-card" draggable="true">
                        image.jpg
                        <h4>Update Website Homepage</h4>
                        <p>Revise the content and layout...</p>
                        <div class="card-footer">
                            <span class="date">2/15/24</span>
                            <div class="avatars">
                                avatar1.jpg
                                <img src="avatar2.jpg" alt=""/>
                            </div>
                        </div>
                    </div>
                    <!-- More cards -->
                </div>

                <div id="kanban_column_test" class="kanban-column">
                    <div class="kanban-column-header">
                        <h3>Test</h3><button class="addingCard">+</button>
                    </div>
                    <div class="kanban-card" draggable="true">
                        image.jpg
                        <h4>Update Website Homepage</h4>
                        <p>Revise the content and layout...</p>
                        <div class="card-footer">
                            <span class="date">2/15/24</span>
                            <div class="avatars">
                                avatar1.jpg
                                <img src="avatar2.jpg" alt=""/>
                            </div>
                        </div>
                    </div>
                    <!-- More cards -->
                </div>

                <div id="kanban_column_done" class="kanban-column">
                    <div class="kanban-column-header">
                        <h3>Done</h3><button class="addingCard">+</button>
                    </div>
                    <div class="kanban-card" draggable="true">
                        image.jpg
                        <h4>Update Website Homepage</h4>
                        <p>Revise the content and layout...</p>
                        <div class="card-footer">
                            <span class="date">2/15/24</span>
                            <div class="avatars">
                                avatar1.jpg
                                <img src="avatar2.jpg" alt=""/>
                            </div>
                        </div>
                    </div>
                    <!-- More cards -->
                </div>
            </div>
        </div>
    );
}


export default KanbanBoard;