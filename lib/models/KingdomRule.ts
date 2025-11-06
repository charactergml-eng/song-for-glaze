import mongoose, { Schema, Model } from 'mongoose';

export interface IKingdomRule {
  rules: string;
  createdAt: Date;
}

const KingdomRuleSchema = new Schema<IKingdomRule>({
  rules: {
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

// Create index for efficient querying by creation date
KingdomRuleSchema.index({ createdAt: -1 });

// Prevent model recompilation in development
const KingdomRuleModel: Model<IKingdomRule> =
  mongoose.models.KingdomRule ||
  mongoose.model<IKingdomRule>('KingdomRule', KingdomRuleSchema);

export default KingdomRuleModel;
