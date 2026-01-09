// Routes/whiteboardRoutes.js
import express from "express";
import admin from "firebase-admin";

const router = express.Router();

/**
 * POST /api/whiteboards/save
 * Save or Update Whiteboard
 */
router.post("/save", async (req, res) => {
  try {
    const { id, content, title } = req.body;

    // Use admin.firestore() inside the function to avoid "No App" crash
    const collection = admin.firestore().collection("whiteboards");

    if (!id) {
       return res.status(400).json({ error: "Whiteboard ID is required" });
    }

    const docRef = collection.doc(id);
    const docSnap = await docRef.get();

    // IF DOCUMENT EXISTS -> UPDATE
    if (docSnap.exists) {
      await docRef.update({
        content,
        title: title || docSnap.data().title, // Keep old title if none sent
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return res.status(200).json({ message: "Updated successfully", id });
    }

    // IF DOCUMENT DOES NOT EXIST -> CREATE
    // Note: We use .set() with the specific ID you provided in the screenshot
    await docRef.set({
      content,
      title: title || "Untitled Whiteboard",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ message: "Created successfully", id });

  } catch (err) {
    console.error("Error saving whiteboard:", err);
    res.status(500).json({ error: "Failed to save whiteboard" });
  }
});

/**
 * GET /api/whiteboards/:id
 * Load single whiteboard
 */
router.get("/:id", async (req, res) => {
  try {
    const doc = await admin
      .firestore()
      .collection("whiteboards")
      .doc(req.params.id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Whiteboard not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (err) {
    console.error("Error loading whiteboard:", err);
    res.status(500).json({ error: "Failed to load whiteboard" });
  }
});

export default router;