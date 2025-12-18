import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// Admin SDK is already initialized in index.js

// Create a new user (admin only)
router.post('/create-user', async (req, res) => {
    try {
        const { email, password, displayName } = req.body;
        
        // Create the user
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName,
            emailVerified: false,
            disabled: false
        });

        // You can add custom claims here if needed
        // await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'user' });

        res.status(201).json({ 
            message: 'User created successfully',
            uid: userRecord.uid 
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        
        res.json({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            // Add other user properties you want to expose
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

export default router;
