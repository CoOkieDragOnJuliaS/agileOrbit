/**
 * @file Authentication Routes
 * @module authRoutes
 * @description Express router for handling authentication-related endpoints including admin and user authentication.
 * @requires express
 * @requires firebase-admin
 * @requires ../middleware/rateLimiter
 */

import express from 'express';
import admin from 'firebase-admin';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Middleware to verify if the request is made by an admin user.
 * Checks for a valid Bearer token in the Authorization header and verifies admin status.
 * 
 * @async
 * @function verifyAdmin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void|Object} Calls next() if verified, or sends an error response
 * 
 * @example
 * // Usage in route
 * router.post('/admin/route', verifyAdmin, (req, res) => { ... });
 */
const verifyAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    /*
    Header Check: The code verifies if the Authorization header exists and starts with "Bearer ".
    Token Extraction: It extracts the actual token by removing the "Bearer " prefix.
    Why Use Bearer Tokens?
        Security: The token is not stored in the URL or request body, reducing exposure.
        Stateless: The server doesn't need to store session information.
        Flexible: Works well with JWT (JSON Web Tokens) used by Firebase
    */
    
    const idToken = authHeader.split('Bearer ')[1];

    try {
        // Verify the ID token and check if the user is an admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        
        // Check if the user has admin privileges
        if (!userRecord.customClaims?.admin) {
            return res.status(403).json({ error: 'Admin privileges required' });
        }
        
        // Attach user info to the request
        req.user = {
            uid: userRecord.uid,
            email: userRecord.email,
            isAdmin: true
        };
        
        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * @route POST /auth/create-user
 * @description Create a new user (admin only)
 * @access Private (Admin)
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {string} [req.body.displayName] - User's display name
 * @returns {Object} Response object with user ID or error
 * @example
 * // Request body
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123",
 *   "displayName": "John Doe"
 * }
 */
router.post('/create-user', verifyAdmin, async (req, res) => {
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

        // custom claims
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

/**
 * @route GET /auth/me
 * @description Get current authenticated user's information
 * @access Private
 * @param {Object} req - Express request object
 * @param {string} [req.headers.authorization] - Bearer token
 * @returns {Object} User information
 * @example
 * // Response
 * {
 *   "uid": "user123",
 *   "email": "user@example.com",
 *   "displayName": "John Doe"
 * }
 */
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


/**
 * @route POST /auth/admin/signin
 * @description Authenticate an admin user and return a custom token
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - Admin's email address
 * @param {string} req.body.password - Admin's password
 * @returns {Object} Response with custom token and user info or error
 * @example
 * // Request body
 * {
 *   "email": "admin@example.com",
 *   "password": "adminPassword123"
 * }
 * 
 * // Success response
 * {
 *   "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpX...",
 *   "uid": "admin123",
 *   "email": "admin@example.com",
 *   "isAdmin": true
 * }
 */
router.post('/admin/signin', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        try {
            // Get user by email using Admin SDK
            const userRecord = await admin.auth().getUserByEmail(email);
            
            // Check if user is an admin
            if (!userRecord.customClaims?.admin) {
                return res.status(403).json({ error: 'Admin access denied' });
            }

            // Create a custom token for the admin user
            const customToken = await admin.auth().createCustomToken(userRecord.uid);
            
            res.json({
                token: customToken,
                uid: userRecord.uid,
                email: userRecord.email,
                isAdmin: true
            });

        } catch (error) {
            console.error('Admin sign-in error:', error);
            res.status(401).json({ 
                error: 'Authentication failed. Please check your credentials.'
            });
        }
    } catch (error) {
        console.error('Server error during admin sign-in:', error);
        res.status(500).json({ 
            error: 'An error occurred during authentication' 
        });
    }
});

/**
 * @description Export the router for use in the main application
 * @type {express.Router}
 */
export default router;
