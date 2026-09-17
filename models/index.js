import mongoose from 'mongoose'

const cleanJson = {
  virtuals: true,
  flattenMaps: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
};

const questSchema = new mongoose.Schema({
  name: { type: String, required: true },
  difficulty: { type: String, default: 'Normal' },
  from: String,
  to: String,
  credits: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  deadline: String,
  dueDate: String,
  status: { type: String, default: 'Pending' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
questSchema.set('toJSON', cleanJson);

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  status: { type: String, default: 'Not Claimed' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
rewardSchema.set('toJSON', cleanJson);

const taskLogSchema = new mongoose.Schema({
  name: String,
  xp: Number,
  credits: Number,
  date: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
taskLogSchema.set('toJSON', cleanJson);

const habitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  days: { type: Number, required: true },
  winXp: { type: Number, default: 0 },
  loseXp: { type: Number, default: 0 },
  color: String,
  startDate: String,
  record: { type: Map, of: String, default: () => ({}) },
  inHeatmap: { type: Boolean, default: false },
  status: { type: String, default: 'active' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
habitSchema.set('toJSON', cleanJson);

export const Quest = mongoose.model('Quest', questSchema);
export const Reward = mongoose.model('Reward', rewardSchema);
export const TaskLog = mongoose.model('TaskLog', taskLogSchema);
export const Habit = mongoose.model('Habit', habitSchema);