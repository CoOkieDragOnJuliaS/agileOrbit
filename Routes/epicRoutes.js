import express from "express";
import admin from "firebase-admin";


const router = express.Router();

/**
 * Middleware: verify authenticated user
 */




/**
 * POST /epics
 * Save epic
 */

router.post("/saveEpic", async (req, res) => {
  try {
    const { id, content, title } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content required" });
    }

    const collection = admin.firestore().collection("epics");

    // UPDATE
    if (id) {
      const epicRef = collection.doc(id);
      const epicSnap = await epicRef.get();

      if (!epicSnap.exists) {
        return res.status(404).json({ error: "Epic not found" });
      }

      await epicRef.update({
        content,
        title,
        projectId: "1",
        ownerId: "test",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(200).json({ id });
    }

    // CREATE
    const epicRef = await collection.add({
      content,
      title,
      projectId: "1",
      ownerId: "test",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ id: epicRef.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save epic" });
  }
});


router.delete("/deleteEpic", async (req, res) =>{
  const collection = admin.firestore().collection("epics");
  const id = req.body.id;
  try {
        await collection.doc(id).delete();
        res.status(201).json({ id: id });
      }
  catch(err)
  {res.status(500).json({error: "Failed to delete epic"})}
  
});

router.get("/fileTree", async (req, res) => {
    try {
      const snapshot = await admin
        .firestore()
        .collection("epics")
        //.where("ownerId", "==", req.user.uid)
        .orderBy("updatedAt", "desc")
        .get();
  
      const epics = snapshot.docs.map(epic => ({
        id: epic.id,
        title: epic.title,
        ...epic.data()
      }));
  
      res.json(epics);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch epics" });
    }
  });
  
  router.get("/:id", async (req, res) => {
  try {
    const doc = await admin
      .firestore()
      .collection("epics")
      .doc(req.params.id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: "epic not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load epic" });
  }
});

export default router;
