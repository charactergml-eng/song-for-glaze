import mongoose, { Schema, Model } from 'mongoose';

export type MoodType = 'happy' | 'sad' | 'depressed' | 'miserable';

export interface ISlaveStats {
  userId: string; // 'slave' - only one instance for now
  hunger: number; // 0-100, higher is better (100 = full, 0 = starving)
  mood: MoodType;
  water: number; // 0-100, higher is better (100 = hydrated, 0 = thirsty)
  health: number; // 0-100, never reaches 0, affects mood
  lastUpdated: number;
}

const SlaveStatsSchema = new Schema<ISlaveStats>({
  userId: { type: String, required: true, unique: true, default: 'slave' },
  hunger: { type: Number, required: true, default: 50, min: 0, max: 100 },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'depressed', 'miserable'],
    default: 'sad'
  },
  water: { type: Number, required: true, default: 50, min: 0, max: 100 },
  health: { type: Number, required: true, default: 70, min: 1, max: 100 }, // min: 1 ensures it never reaches 0
  lastUpdated: { type: Number, required: true, default: () => Date.now() },
}, {
  timestamps: true,
});

// Create index on userId for efficient querying
SlaveStatsSchema.index({ userId: 1 });

// Method to calculate mood based on health and other stats
SlaveStatsSchema.methods.calculateMood = function(): MoodType {
  const avgStats = (this.hunger + this.water + this.health) / 3;

  if (avgStats >= 70) return 'happy';
  if (avgStats >= 50) return 'sad';
  if (avgStats >= 30) return 'depressed';
  return 'miserable';
};

// Pre-save hook to auto-calculate mood
SlaveStatsSchema.pre('save', function(next) {
  // Ensure health never goes below 1
  if (this.health < 1) {
    this.health = 1;
  }

  // Auto-calculate mood based on stats
  this.mood = this.calculateMood();
  this.lastUpdated = Date.now();

  next();
});

// Prevent model recompilation in development
const SlaveStatsModel: Model<ISlaveStats> =
  mongoose.models.SlaveStats || mongoose.model<ISlaveStats>('SlaveStats', SlaveStatsSchema);

export default SlaveStatsModel;
