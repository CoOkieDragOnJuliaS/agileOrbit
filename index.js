import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import config from './config.js';
import { readFile } from 'fs/promises';
const serviceAccount = JSON.parse(await readFile(new URL('./serviceAccountKey.json', import.meta.url)));
// Routes
import authRoutes from './Routes/authRoutes.js';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebaseConfig.databaseURL
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
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

// Use API routes
app.use('/api/auth', authRoutes);

// Import auth middleware
import auth from './middleware/auth.js';

// Protected route example
app.get('/api/protected', auth, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(config.port, () =>
    console.log(`Server is live @ ${config.hostUrl}`),
);