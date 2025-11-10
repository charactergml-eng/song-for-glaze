import mongoose, { Schema, Model } from 'mongoose';

export interface IAffirmation {
  sender: 'player1' | 'player2';
  recipient: 'player1' | 'player2';
  message: string;
  createdAt: Date;
}

const AffirmationSchema = new Schema<IAffirmation>({
  sender: {
    type: String,
    required: true,
    enum: ['player1', 'player2']
  },
  recipient: {
    type: String,
    required: true,
    enum: ['player1', 'player2']
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true,
});

// Create indexes for efficient querying
AffirmationSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
AffirmationSchema.index({ createdAt: -1 });

// Prevent model recompilation in development
const AffirmationModel: Model<IAffirmation> =
  mongoose.models.Affirmation ||
  mongoose.model<IAffirmation>('Affirmation', AffirmationSchema);

export default AffirmationModel;
