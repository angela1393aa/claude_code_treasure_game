import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/scores', requireAuth, (req, res) => {
  const { score, result } = req.body;
  if (score === undefined || !result) {
    return res.status(400).json({ error: 'score and result are required' });
  }
  if (!['win', 'loss', 'tie'].includes(result)) {
    return res.status(400).json({ error: 'result must be win, loss, or tie' });
  }

  const insert = db.prepare(
    'INSERT INTO scores (user_id, score, result) VALUES (?, ?, ?)'
  ).run(req.user.userId, score, result);

  const saved = db.prepare('SELECT * FROM scores WHERE id = ?').get(insert.lastInsertRowid);
  res.status(201).json(saved);
});

router.get('/scores', requireAuth, (req, res) => {
  const rows = db.prepare(
    'SELECT id, score, result, played_at FROM scores WHERE user_id = ? ORDER BY played_at DESC'
  ).all(req.user.userId);
  res.json(rows);
});

router.get('/scores/leaderboard', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT u.username, MAX(s.score) as best_score, COUNT(*) as games_played
    FROM scores s JOIN users u ON s.user_id = u.id
    GROUP BY s.user_id
    ORDER BY best_score DESC
    LIMIT 10
  `).all();
  res.json(rows);
});

export default router;
