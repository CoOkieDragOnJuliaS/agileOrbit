import express from "express";
import admin from "firebase-admin";


const router = express.Router();

/**
 * Middleware: verify authenticated user
 */




/**
 * POST /tasks
 * Save task
 */

router.post("/saveTask", async (req, res) => {
  try {
    const { id, content, title } = req.body;

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
        boardId,
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
      boardId,
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


router.delete("/deleteTask", async (req, res) =>{
  const collection = admin.firestore().collection("tasks");
  const id = req.body.id;
  try {
        await collection.doc(id).delete();
        res.status(201).json({ id: id });
      }
  catch(err)
  {res.status(500).json({error: "Failed to delete task"})}
  
});

router.get("/fileTree", async (req, res) => {
    try {
      const snapshot = await admin
        .firestore()
        .collection("tasks")
        //.where("ownerId", "==", req.user.uid)
        .orderBy("updatedAt", "desc")
        .get();
  
      const tasks = snapshot.docs.map(task => ({
        id: task.id,
        title: task.title,
        ...task.data()
      }));
  
      res.json(tasks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });
  
  /*Test Get endpoint: curl -G http://localhost:5000/api/task/TyiLQvmKiemi0hLOl6KQ*/
  router.get("/:id", async (req, res) => {
  try {
    const doc = await admin
      .firestore()
      .collection("tasks")
      .doc(req.params.id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: "task not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load task" });
  }
});

export default router;
