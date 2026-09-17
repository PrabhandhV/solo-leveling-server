import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Player from './models/Player.js'
import { Quest, Reward, TaskLog, Habit } from './models/index.js'

dotenv.config();

const quests = [
  { name: "Study Programming", difficulty: "Normal", from: "09:45", to: "10:45", credits: 50, xp: 25, status: "Pending" },
  { name: "Workout", difficulty: "Easy", from: "11:15", to: "12:45", credits: 38, xp: 19, status: "Pending" },
  { name: "Learn JavaScript", difficulty: "Normal", from: "13:00", to: "15:00", credits: 100, xp: 50, status: "Pending" },
  { name: "Read Atomic Habits", difficulty: "Easy", from: "15:00", to: "16:00", credits: 25, xp: 13, status: "Pending" },
];

const rewards = [
  { name: "1 Hour Free Time", cost: 150, status: "Not Claimed" },
  { name: "Game for 30 mins", cost: 50, status: "Not Claimed" },
  { name: "Game for 1 hour", cost: 100, status: "Not Claimed" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      Player.deleteMany({}),
      Quest.deleteMany({}),
      Reward.deleteMany({}),
      TaskLog.deleteMany({}),
      Habit.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    await Player.create({});
    await Quest.insertMany(quests);
    await Reward.insertMany(rewards);

    console.log(`Seeded: 1 player, ${quests.length} quests, ${rewards.length} rewards`);
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seed();