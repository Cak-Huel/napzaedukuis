require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const questionRoutes = require('./routes/questions');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/questions', questionRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Napza Edu Card API Server' });
});

// Database schema initializer for verification columns
const pool = require('./config/db');
async function initDatabaseSchema() {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM orang');
    const columnNames = columns.map(col => col.Field);

    if (!columnNames.includes('is_verified')) {
      await pool.query('ALTER TABLE orang ADD COLUMN is_verified TINYINT(1) DEFAULT 0');
      console.log('✅ Added column is_verified to table orang');
    }
    if (!columnNames.includes('verification_token')) {
      await pool.query('ALTER TABLE orang ADD COLUMN verification_token VARCHAR(255) DEFAULT NULL');
      console.log('✅ Added column verification_token to table orang');
    }
    if (!columnNames.includes('verification_expires')) {
      await pool.query('ALTER TABLE orang ADD COLUMN verification_expires DATETIME DEFAULT NULL');
      console.log('✅ Added column verification_expires to table orang');
    }
    console.log('✅ Database schema check passed.');
  } catch (error) {
    console.error('❌ Database schema init error:', error);
  }
}

// Start server
const PORT = process.env.PORT || 5000;
initDatabaseSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Backend API berjalan di http://localhost:${PORT}`);
  });
});