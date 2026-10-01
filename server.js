import dns from 'node:dns'
dns.setServers(['1.1.1.1', '8.8.8.8'])
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import Player from './models/Player.js'
import { Quest, Reward, TaskLog, Habit } from './models/index.js'
import authRoutes from './routes/auth.js'
import { requireAuth } from './middleware/auth.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '6mb' }));
app.use('/auth', authRoutes);

// --- Player (single document) ---
app.get('/player', requireAuth, async (req, res) => {
  try {
    let player = await Player.findOne({ owner: req.userId });
    if (!player) player = await Player.create({ owner: req.userId });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Solo Leveling API running', endpoints: ['/player', '/quests', '/rewards', '/taskLog', '/habits'] });
});

app.put('/player', requireAuth, async (req, res) => {
  try {
    const player = await Player.findOneAndUpdate(
      { owner: req.userId },
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Generic CRUD builder ---
function crudRoutes(path, Model) {
  app.get(path, requireAuth, async (req, res) => {
    try {
      res.json(await Model.find({ owner: req.userId }));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post(path, requireAuth, async (req, res) => {
    try {
      const created = await Model.create({ ...req.body, owner: req.userId });
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put(`${path}/:id`, requireAuth, async (req, res) => {
    try {
      const updated = await Model.findOneAndUpdate(
        { _id: req.params.id, owner: req.userId },
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Not found' });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete(`${path}/:id`, requireAuth, async (req, res) => {
    try {
      const deleted = await Model.findOneAndDelete({ _id: req.params.id, owner: req.userId });
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

crudRoutes('/quests', Quest);
crudRoutes('/rewards', Reward);
crudRoutes('/taskLog', TaskLog);
crudRoutes('/habits', Habit);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }); 