import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import scoresRoutes from './routes/scores.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/api/ping', (_req, res) => res.json({ ok: true }));
app.use('/api', authRoutes);
app.use('/api', scoresRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
