const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stocks');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normalize duplicate slashes in URL (e.g. //api/auth -> /api/auth)
app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, '/');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);

app.get('/', (req, res) => {
  res.send('Stock Analysis API is running...');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/stock_analysis_db";

if (!process.env.MONGO_URI) {
  console.warn("⚠️ [WARNING]: MONGO_URI environment variable is not defined! Using fallback: " + MONGO_URI);
}
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ [WARNING]: JWT_SECRET environment variable is not defined in process.env!");
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });
