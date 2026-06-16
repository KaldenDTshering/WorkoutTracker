// ── Import packages ──────────────────────────────────
const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
require('dotenv').config();

// ── Create the app ───────────────────────────────────
const app = express();
app.use(cors({
  origin: 'https://kaldendtshering.github.io',
  methods: ['GET', 'POST', 'DELETE']
}));
app.use(express.json());
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// ── Connect to MySQL ─────────────────────────────────
const db = mysql.createConnection({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || 3306
});

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

// GET /workouts — fetch all workouts joined with session data
app.get('/workouts', (req, res) => {
  const sql = `
    SELECT workouts.*, sessions.date, sessions.session_number
    FROM workouts
    INNER JOIN sessions ON workouts.session_id = sessions.id
    ORDER BY sessions.date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST /workouts — create a session then save a new workout
app.post('/workouts', (req, res) => {
  const { date, session_number, name, cat, sets, reps, weight, dur, dist, pace, notes } = req.body;

  const sessionSql = 'INSERT INTO sessions (date, session_number, notes) VALUES (?, ?, ?)';
  const sessionValues = [date, session_number, notes];

  db.query(sessionSql, sessionValues, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const session_id = results.insertId;

    const workoutSql = `
      INSERT INTO workouts (session_id, name, cat, sets, reps, weight, dur, dist, pace, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const workoutValues = [session_id, name, cat, sets, reps, weight, dur, dist, pace, notes];

    db.query(workoutSql, workoutValues, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ok: true, session_id });
    });
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
