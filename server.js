import express from 'express';
import pg from 'pg';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS budget_data (
      id SERIAL PRIMARY KEY,
      data TEXT NOT NULL,
      last_updated TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM budget_data');
  if (parseInt(rows[0].count) === 0) {
    const initialData = JSON.stringify({ entries: [], periodType: 'semimonthly', version: '1.0' });
    await pool.query('INSERT INTO budget_data (data) VALUES ($1)', [initialData]);
  }
}

initDb().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

app.get('/api/budget', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT data, last_updated FROM budget_data ORDER BY id DESC LIMIT 1');
    if (!rows.length) {
      return res.json({ entries: [], periodType: 'semimonthly', version: '1.0', lastUpdated: new Date().toISOString() });
    }
    const data = JSON.parse(rows[0].data);
    data.lastUpdated = rows[0].last_updated;
    res.json(data);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/budget', async (req, res) => {
  const { entries, periodType } = req.body;
  if (!entries || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'Invalid entries data' });
  }
  const dataToSave = JSON.stringify({ entries, periodType: periodType || 'semimonthly', version: '1.0' });
  try {
    await pool.query('INSERT INTO budget_data (data) VALUES ($1)', [dataToSave]);
    res.json({ success: true, message: 'Data saved successfully', lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Budget Tracker API running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
