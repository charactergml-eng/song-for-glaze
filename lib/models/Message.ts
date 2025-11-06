import mongoose, { Schema, Model } from 'mongoose';

export interface IMessage {
  id: string;
  player: 'Goddess' | 'slave' | 'Lexi';
  content: string;
  timestamp: number;
  type: 'message' | 'action' | 'rank-change' | 'ai';
  rankChange?: {
    oldRank: string;
    newRank: string;
  };
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true, unique: true },
  player: { type: String, required: true, enum: ['Goddess', 'slave', 'Lexi'] },
  content: { type: String, required: true },
  timestamp: { type: Number, required: true },
  type: { type: String, required: true, enum: ['message', 'action', 'rank-change', 'ai'] },
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

// Prevent model recompilation in development
const MessageModel: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default MessageModel;
