import express from "express";
import admin from "firebase-admin";

/**
 * Subtask Routes
 * 
 * This module defines the API endpoints for subtask management, including:
 * - GET /api/subtasks/:taskId - Get all subtasks for a task
 * - POST /api/subtasks - Create a new subtask
 * - PUT /api/subtasks/:id - Update a subtask
 * - DELETE /api/subtasks/:id - Delete a subtask
 */

const router = express.Router();

/**
 * Helper function to get a reference to the Firestore 'subtasks' collection
 * @returns {FirebaseFirestore.CollectionReference} Reference to the subtasks collection
 */
const getSubtasksCollection = () => {
    return admin.firestore().collection('subTasks');
};

/**
 * @route GET /api/subtasks/:taskId
 * @description Get all subtasks for a specific task
 * @param {string} taskId - The ID of the parent task
 * @returns {Array} Array of subtask objects
 * @access Private
 */
router.get('/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const subtasksRef = getSubtasksCollection();
        const snapshot = await subtasksRef
            .where('taskId', '==', taskId)
            .get();

        const subtasks = [];
        snapshot.forEach(doc => {
            subtasks.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort in memory by updatedAt descending TODO: create index in Firestore Database?
        subtasks.sort((a, b) => (b.updatedAt?.toDate() || 0) - (a.updatedAt?.toDate() || 0));
        //res.status(200).json(subtasks);
        //Always return array because of empty subtasks
        res.json(subtasks);
    } catch (error) {
        console.error('Error fetching subtasks:', error);
        res.status(500).json({ message: 'Failed to fetch subtasks', error: error.message });
    }
});

/**
 * @route POST /api/subtasks
 * @description Create a new subtask
 * @param {Object} req.body - The subtask data
 * @param {string} req.body.taskId - The ID of the parent task
 * @param {string} req.body.title - The title of the subtask
 * @param {string} [req.body.description] - Optional description
 * @returns {Object} The created subtask with ID
 * @access Private
 */
router.post('/', async (req, res) => {
    try {
        const { taskId, title, description = '' } = req.body;
        
        if (!taskId || !title) {
            return res.status(400).json({ message: 'Task ID and title are required' });
        }

        // Verify parent task exists
        const taskDoc = await admin.firestore().collection('tasks').doc(taskId).get();
        if (!taskDoc.exists) {
            return res.status(404).json({ message: 'Parent task not found' });
        }

        const subtaskData = {
            taskId,
            title,
            description,
            content: '',
            status: 'todo',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await getSubtasksCollection().add(subtaskData);
        
        // Update parent task's updatedAt
        await admin.firestore().collection('tasks').doc(taskId).update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({
            id: docRef.id,
            ...subtaskData
        });
    } catch (error) {
        console.error('Error creating subtask:', error);
        res.status(500).json({ message: 'Failed to create subtask', error: error.message });
    }
});

/**
 * @route PUT /api/subtasks/:id
 * @description Update a subtask
 * @param {string} id - The ID of the subtask to update
 * @param {Object} req.body - The fields to update
 * @returns {Object} The updated subtask
 * @access Private
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        
        const subtaskRef = getSubtasksCollection().doc(id);
        const subtaskDoc = await subtaskRef.get();
        
        if (!subtaskDoc.exists) {
            return res.status(404).json({ message: 'Subtask not found' });
        }

        const updates = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;

        await subtaskRef.update(updates);
        
        // Update parent task's updatedAt
        const subtaskData = subtaskDoc.data();
        await admin.firestore().collection('tasks').doc(subtaskData.taskId).update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({
            id,
            ...subtaskData,
            ...updates
        });
    } catch (error) {
        console.error('Error updating subtask:', error);
        res.status(500).json({ message: 'Failed to update subtask', error: error.message });
    }
});

/**
 * @route DELETE /api/subtasks/:id
 * @description Delete a subtask
 * @param {string} id - The ID of the subtask to delete
 * @returns {Object} Success message
 * @access Private
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const subtaskRef = getSubtasksCollection().doc(id);
        const subtaskDoc = await subtaskRef.get();
        
        if (!subtaskDoc.exists) {
            return res.status(404).json({ message: 'Subtask not found' });
        }

        const subtaskData = subtaskDoc.data();
        
        // Delete the subtask
        await subtaskRef.delete();
        
        // Update parent task's updatedAt
        await admin.firestore().collection('tasks').doc(subtaskData.taskId).update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: 'Subtask deleted successfully' });
    } catch (error) {
        console.error('Error deleting subtask:', error);
        res.status(500).json({ message: 'Failed to delete subtask', error: error.message });
    }
});

export default router;
