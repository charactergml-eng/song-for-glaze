const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  // Check for MONGODB_URI at connection time, not at module load time
  const MONGODB_URI = process.env.MONGODB_URI || '';

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

// Message Schema
const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  player: { type: String, required: true, enum: ['Goddess', 'slave', 'Lexi', 'System'] },
  content: { type: String, required: true },
  timestamp: { type: Number, required: true },
  type: { type: String, required: true, enum: ['message', 'action', 'rank-change', 'ai', 'stats'] },
  rankChange: {
    type: {
      oldRank: String,
      newRank: String,
    },
    required: false,
  },
}, {
  timestamps: true,
});

// Create index on timestamp for efficient querying
MessageSchema.index({ timestamp: 1 });

// Prevent model recompilation
const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);

module.exports = {
  connectToDatabase,
  MessageModel,
};
