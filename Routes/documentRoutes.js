import express from "express";
import admin from "firebase-admin";


const router = express.Router();

/**
 * Middleware: verify authenticated user
 */


/**
 * POST /documents
 * Save document
 */
router.post("/saveDocument", async (req, res) => {
    try {
        const {id, content, title, taskId} = req.body;

        if (!content) {
            return res.status(400).json({error: "Content required"});
        }

        const collection = admin.firestore().collection("documents");

        // UPDATE
        if (id) {
            const docRef = collection.doc(id);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return res.status(404).json({error: "Document not found"});
            }

            const updateData = {
                content,
                title,
                projectId: "1",
                ownerId: "test",
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            // Only add taskId if it's provided
            if (taskId) {
                updateData.taskId = taskId;
            }
            await docRef.update(updateData);

            return res.status(200).json({id});
        }

        // CREATE
        // For the create operation (around line 48):
        const docData = {
            content,
            title,
            projectId: "1",
            ownerId: "test",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Only add taskId if it's provided, because undefined gives problems in FireStore Database
        if (taskId) {
            docData.taskId = taskId;
        }
        const docRef = await collection.add(docData);


        res.status(201).json({id: docRef.id});

    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to save document"});
    }
});


router.delete("/deleteDocument", async (req, res) => {
    const collection = admin.firestore().collection("documents");
    const id = req.body.id;

    try {
        await collection.doc(id).delete();
    } catch (err) {
        res.status(500).json({error: "Failed to delete document"})
    }
    res.status(201).json({id: id});
});

router.get("/fileTree", async (req, res) => {
    try {
        // Fetch all necessary data in parallel
        const [docsSnapshot, tasksSnapshot, epicsSnapshot] = await Promise.all([
            admin.firestore().collection("documents")
                // .where("ownerId", "==", req.user.uid)  // Uncomment when auth is implemented
                .orderBy("updatedAt", "desc")
                .get(),
            admin.firestore().collection("tasks").get(),
            admin.firestore().collection("epics").get()
        ]);
        // Process documents
        const documents = docsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Process tasks
        const tasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Process epics
        const epics = epicsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Organize tasks by epic
        const tasksByEpic = {};
        tasks.forEach(task => {
            const epicId = task.epicId || 'no-epic';
            if (!tasksByEpic[epicId]) {
                tasksByEpic[epicId] = [];
            }
            tasksByEpic[epicId].push(task);
        });
        // Organize documents by task
        const documentsByTask = {};
        documents.forEach(doc => {
            const taskId = doc.taskId || 'no-task';
            if (!documentsByTask[taskId]) {
                documentsByTask[taskId] = [];
            }
            documentsByTask[taskId].push(doc);
        });
        // Build the hierarchical structure
        const result = {
            epics: [],
            tasksWithoutEpic: tasksByEpic['no-epic']?.map(task => ({
                ...task,
                documents: documentsByTask[task.id] || []
            })) || [],
            standaloneDocuments: documentsByTask['no-task'] || []
        };
        // Add epics with their tasks and documents
        epics.forEach(epic => {
            const epicTasks = (tasksByEpic[epic.id] || []).map(task => ({
                ...task,
                documents: documentsByTask[task.id] || []
            }));

            result.epics.push({
                ...epic,
                tasks: epicTasks
            });
        });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to fetch file tree"});
    }
});

router.get("/fileTree/:id", async (req, res) => {
    try {
        const taskId = String(req.params.id);
        const snapshot = await admin
            .firestore()
            .collection("documents")
            .where("taskId", "==", taskId)
            .get();

        const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.title,
            ...doc.data()
        }));

        res.json(documents);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to fetch documents"});
    }
});

router.get("/:id", async (req, res) => {
    try {
        const doc = await admin
            .firestore()
            .collection("documents")
            .doc(req.params.id)
            .get();

        if (!doc.exists) {
            return res.status(404).json({error: "Document not found"});
        }

        res.json({
            id: doc.id,
            ...doc.data()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to load document"});
    }
});

export default router;
