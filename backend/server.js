 // server.js - Backend Server for AI Life Companion


const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Optional: For storing MongoDB URI securely

// Import Routes
const expenseRoutes = require('./routes/expenses');
const healthRoutes = require('./routes/health');
const recipeRoutes = require('./routes/recipes');
const musicRoutes = require('./routes/music');
const assistantRoutes = require('./routes/assistant');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
const path = require('path');

// Serve frontend static files from project root so frontend and API share same origin
const FRONTEND_DIR = path.join(__dirname, '..');
app.use(express.static(FRONTEND_DIR));


// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://aiuser:981836@cluster0.nn4smtc.mongodb.net/aiLifeCompanion?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, { /* useNewUrlParser and useUnifiedTopology are defaults in newer mongoose */ })
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Failed:', err));


// API Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/auth', authRoutes);
// chat proxy removed

// Basic Health Check
app.get('/', (req, res) => {
        res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Fallback: serve index.html for other GET routes (helps with client-side routing)
// Fallback for non-API GET requests: serve index.html
app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
