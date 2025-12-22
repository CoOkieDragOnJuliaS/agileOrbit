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
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content required" });
    }

    const docRef = await admin.firestore().collection("documents").add({
      content,
      ownerId: "test",//currentUser.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save document" });
  }
});

router.get("/fileTree", async (req, res) => {
    try {
      const snapshot = await admin
        .firestore()
        .collection("documents")
        //.where("ownerId", "==", req.user.uid)
        .orderBy("updatedAt", "desc")
        .get();
  
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      res.json(documents);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });
  

export default router;
