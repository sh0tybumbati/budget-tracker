import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Initialize SQLite database
const dbPath = './budget.db';
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS budget_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Initialize with empty data if no records exist
  db.get("SELECT COUNT(*) as count FROM budget_data", (err, row) => {
    if (row.count === 0) {
      const initialData = JSON.stringify({
        entries: [],
        periodType: 'semimonthly',
        version: '1.0'
      });
      db.run("INSERT INTO budget_data (data) VALUES (?)", [initialData]);
    }
  });
});

// API Routes

// Get current budget data
app.get('/api/budget', (req, res) => {
  db.get("SELECT data, last_updated FROM budget_data ORDER BY id DESC LIMIT 1", (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.json({
        entries: [],
        periodType: 'semimonthly',
        version: '1.0',
        lastUpdated: new Date().toISOString()
      });
    }
    
    try {
      const data = JSON.parse(row.data);
      data.lastUpdated = row.last_updated;
      res.json(data);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      res.status(500).json({ error: 'Data parse error' });
    }
  });
});

// Save budget data
app.post('/api/budget', (req, res) => {
  const { entries, periodType } = req.body;
  
  if (!entries || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'Invalid entries data' });
  }
  
  const dataToSave = {
    entries,
    periodType: periodType || 'semimonthly',
    version: '1.0'
  };
  
  const dataString = JSON.stringify(dataToSave);
  
  db.run("INSERT INTO budget_data (data) VALUES (?)", [dataString], function(err) {
    if (err) {
      console.error('Save error:', err);
      return res.status(500).json({ error: 'Failed to save data' });
    }
    
    res.json({ 
      success: true, 
      message: 'Data saved successfully',
      lastUpdated: new Date().toISOString()
    });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve index.html for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Budget Tracker API running on http://0.0.0.0:${PORT}`);
  console.log(`Network access: http://192.168.18.11:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});