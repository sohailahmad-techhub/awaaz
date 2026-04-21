require('dotenv').config();

// ─── Force Google DNS to bypass ISP SRV block ────────────────────────────────
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Allow Next.js frontend (port 3000) and any localhost during dev
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Allow large base64 image payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/awaaz';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// Routes
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const projectRoutes = require('./routes/projects');
const paymentRoutes = require('./routes/payments');

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/projects', projectRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AWAAZ API is running 🚀',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Catch-all for 404 (must be after all routes)
app.use((req, res) => {
  res.status(404).json({ message: `Path ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AWAAZ Server running on http://localhost:${PORT}`);
});
