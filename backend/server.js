// server.js
// Entry point for the ARVEO Feedback backend API.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Global middleware ----------
app.use(cors()); // Allow the frontend (served from a different origin) to call this API
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ---------- Health check ----------
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ARVEO Feedback API is running.',
  });
});

// ---------- Routes ----------
app.use('/api/feedback', feedbackRoutes);

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ---------- Global error handler ----------
// Catches errors from anywhere in the middleware/route chain, including
// malformed JSON bodies from express.json().
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: 'Something went wrong on the server. Please try again.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ARVEO Feedback API listening on http://localhost:${PORT}`);
});
