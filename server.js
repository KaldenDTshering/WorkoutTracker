// ── Import packages ──────────────────────────────────
const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
require('dotenv').config();

// ── Create the app ───────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── Connect to MySQL ─────────────────────────────────
let dbConfig;

if (process.env.MYSQL_URL) {
  const url = new URL(process.env.MYSQL_URL);
  dbConfig = {
    host:     url.hostname,
    user:     url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    port:     url.port || 3306
  };
} else {
  dbConfig = {
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     process.env.DB_PORT || 3306
  };
}

const db = mysql.createConnection(dbConfig);

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database');
});

// ══════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════

// GET /workouts — fetch all workouts
app.get('/workouts', (req, res) => {
  const sql = 'SELECT * FROM workouts ORDER BY date DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST /workouts — save a new workout
app.post('/workouts', (req, res) => {
  const { id, date, name, cat, sets, reps, weight, dur, dist, pace, notes } = req.body;
  const sql = `
    INSERT INTO workouts (id, date, name, cat, sets, reps, weight, dur, dist, pace, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [id, date, name, cat, sets, reps, weight, dur, dist, pace, notes];
  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// DELETE /workouts/:id — delete a workout
app.delete('/workouts/:id', (req, res) => {
  const sql = 'DELETE FROM workouts WHERE id = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// ── Start the server ──────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});