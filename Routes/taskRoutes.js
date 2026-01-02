import express from "express";
import admin from "firebase-admin";

/**
 * Task Routes
 * 
 * This module defines the API endpoints for task management, including:
 * - GET /api/task/board: Fetch all tasks grouped by status
 * - POST /api/task: Create a new task
 * - PUT /api/task/:id: Update an existing task
 * - DELETE /api/task/:id: Delete a task
 * 
 * All routes are protected and require authentication
 */

const router = express.Router();

/**
 * Helper function to get a reference to the Firestore 'tasks' collection
 * This provides a single point of access to the tasks collection
 * @returns {FirebaseFirestore.CollectionReference} Reference to the tasks collection
 */
const getTasksCollection = () => {
    return admin.firestore().collection('tasks');
};

/**
 * @route GET /api/task/board
 * @description Retrieves all tasks from the database and groups them by status
 * @returns {Object} An object with task arrays keyed by status (todo, inProgress, test, done)
 * @access Public
 */
router.get("/board", async (req, res) => {
  try {
    const snapshot = await getTasksCollection()
      .orderBy("updatedAt", "desc")
      .get();

    // Group tasks by status
    const tasks = {
      todo: [],
      inProgress: [],
      test: [],
      done: []
    };

    snapshot.forEach(doc => {
      const task = {
        id: doc.id,
        ...doc.data()
      };
      
      // Map status to our Kanban columns
      const status = task.status || 'todo';
      if (tasks[status]) {
        tasks[status].push(task);
      } else {
        tasks.todo.push(task); // Default to todo if status is unknown
      }
    });

    res.status(200).json(tasks);
  } catch (err) {
    console.error('Error fetching board tasks:', err);
    res.status(500).json({ error: "Failed to fetch board tasks" });
  }
});

/**
 * @route POST /api/task
 * @description Creates a new task
 * @param {string} title - Task title (required)
 * @param {string} [content=''] - Task content/description
 * @param {string} [status=''] - Initial task status
 * @param {string} boardID - ID of the board this task belongs to (required)
 * @param {string} [epicId=''] - Optional epic ID this task is associated with
 * @returns {Object} The created task with its ID
 * @access Public
 */
router.post("/", async (req, res) => {
  try {
    const { title, content = '', status = '', boardID, epicId = '' } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!boardID) {
      return res.status(400).json({ error: "boardID is required" });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const taskData = {
      title,
      content,
      status,
      boardID,
      epicId,
      createdAt: now,
      updatedAt: now
    };

    const taskRef = await getTasksCollection().add(taskData);
    
    res.status(201).json({ 
      id: taskRef.id,
      ...taskData
    });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

/**
 * @route PUT /api/task/:id
 * @description Updates an existing task
 * @param {string} id - The ID of the task to update
 * @param {string} [title] - New task title
 * @param {string} [description] - New task description
 * @param {string} [status] - New task status
 * @returns {Object} The updated task
 * @access Public
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    const taskRef = getTasksCollection().doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updateData = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await taskRef.update(updateData);
    
    res.status(200).json({
      id,
      ...(await taskRef.get()).data()
    });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

/**
 * @route DELETE /api/task/:id
 * @description Deletes a task by ID
 * @param {string} id - The ID of the task to delete
 * @returns {Object} Success message and deleted task ID
 * @access Public
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const taskRef = getTasksCollection().doc(id);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    await taskRef.delete();
    res.status(200).json({ id, message: "Task deleted successfully" });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

/**
 * @route POST /api/task/saveTask
 * @description Legacy endpoint for creating or updating a task
 * @param {string} [id] - Task ID (for updates)
 * @param {string} content - Task content/description
 * @param {string} title - Task title
 * @param {string} [status=todo] - Task status
 * @returns {Object} The created/updated task ID
 * @access Public
 */
router.post("/saveTask", async (req, res) => {
  try {
    const { id, content, title } = req.body;
    const status = req.body.status || 'todo';

    if (!content) {
      return res.status(400).json({ error: "Content required" });
    }

    const collection = admin.firestore().collection("tasks");

    // UPDATE
    if (id) {
      const taskRef = collection.doc(id);
      const tasksnap = await taskRef.get();

      if (!tasksnap.exists) {
        return res.status(404).json({ error: "task not found" });
      }

      await taskRef.update({
        boardID: borardId,  // Map boardId from request to boardID in database
        content,
        title,
        epicId: "1",
        status: "",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(200).json({ id });
    }

    // CREATE
    const taskRef = await collection.add({
      boardID: borardId,  // Map boardId from request to boardID in database
      content,
      title,
      epicId: "1",
      status: "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ id: taskRef.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save task" });
  }
});

/**
 * @route GET /api/task/fileTree
 * @description Retrieves a flat list of all tasks, ordered by last update time
 * @returns {Array} Array of task objects
 * @access Public
 */
router.get("/fileTree", async (req, res) => {
  try {
    const snapshot = await getTasksCollection()
      .orderBy("updatedAt", "desc")
      .get();

      const tasks = snapshot.docs.map(task => ({
        id: task.id,
        title: task.title,
        ...task.data()
    }));

    res.json(tasks);
  } catch (err) {
    console.error('Error in fileTree:', err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

  /*Test Get endpoint: curl -G http://localhost:5000/api/task/TyiLQvmKiemi0hLOl6KQ*/
/**
 * @route GET /api/task/:id
 * @description Retrieves a single task by its ID
 * @param {string} id - The task ID to retrieve
 * @returns {Object} The requested task object
 * @access Public
 */
router.get("/:id", async (req, res) => {
  try {
    const doc = await getTasksCollection().doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (err) {
    console.error('Error getting task:', err);
    res.status(500).json({ error: "Failed to load task" });
  }
});

export default router;
