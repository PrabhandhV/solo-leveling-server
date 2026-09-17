import mongoose from 'mongoose'

const playerSchema = new mongoose.Schema({
  level: { type: Number, default: 12 },
  xp: { type: Number, default: 790 },
  xpTotal: { type: Number, default: 1500 },
  xpEarned: { type: Number, default: 2790 },
  credits: { type: Number, default: 5350 },
  streak: { type: Number, default: 0 },
  lastLoginDate: { type: String, default: null },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

playerSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});

export default mongoose.model('Player', playerSchema);