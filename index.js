/**
 * @file Main Application Entry Point
 * @module index
 * @description Main server file for the AgileOrbit application.
 * Sets up Express server, middleware, routes, and error handling.
 * @requires express
 * @requires cors
 * @requires firebase-admin
 * @requires ./config
 * @requires fs/promises
 * @requires ./Routes/authRoutes
 * @requires ./Routes/documnentRoutes
 * @requires ./middleware/auth
 */

import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import config from './config.js';
import { readFile } from 'fs/promises';

// Load Firebase service account credentials
const serviceAccount = JSON.parse(await readFile(new URL('./serviceAccountKey.json', import.meta.url)));

// Import route handlers
import authRoutes from './Routes/authRoutes.js';
import documentRoutes from './Routes/documentRoutes.js'

/**
 * Firebase Admin SDK initialization
 * @type {admin.app.App}
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebaseConfig.databaseURL
});

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();

// Apply global middleware
app.use(cors({
  origin: config.frontendUrl, // Allow frontend to make requests
  credentials: true // Allow cookies/sessions
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

/**
 * @route GET /
 * @description Root endpoint that serves API documentation
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; text-align: center;">
      <h1>Welcome to AgileOrbit API</h1>
      <p>The server is up and running!</p>
      <p>Available endpoints:</p>
      <ul style="list-style: none; padding: 0;">
        <li><strong>GET /api/auth/me</strong> - Get current user info</li>
        <li><strong>POST /api/auth/create-user</strong> - Create a new user (admin only)</li>
        <li><strong>GET /api/protected</strong> - Example protected route</li>
      </ul>
      <p>Frontend should be running at <a href="http://localhost:3000">http://localhost:3000</a></p>
    </div>
  `);
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Import auth middleware after routes to avoid circular dependencies

// Import auth middleware
import auth from './middleware/auth.js';

/**
 * @route GET /api/protected
 * @description Example protected route that requires authentication
 * @access Private
 * @param {Object} req - Express request object with user information
 * @param {Object} res - Express response object
 * @returns {Object} User information if authenticated
 */
app.get('/api/protected', auth, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
app.use((err, req, res, next) => {
  console.error('Error:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

/**
 * Start the Express server
 * @type {import('http').Server}
 */
const server = app.listen(config.port, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Server is live @ ${config.hostUrl}`);
  console.log(`API Documentation available @ ${config.hostUrl}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default app;