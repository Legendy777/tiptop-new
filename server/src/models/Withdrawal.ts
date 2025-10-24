import { getMaxWithdrawalId } from '../helpers/index';
import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawal extends Document {
  _id: number;
  userId: number;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  currency: 'RUB' | 'USDT';
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema: Schema = new Schema<IWithdrawal>({
  _id: { type: Number, required: false },
  userId: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], required: false, default: "pending" },
  currency: { type: String, enum: ['RUB', 'USDT'], required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
}, {
  timestamps: true
});

// Pre-save hook to set _id automatically
WithdrawalSchema.pre('save', async function (next) {
  if (this.isNew) { // Only execute for new documents
    this._id = (await getMaxWithdrawalId()) + 1; // Automatically set _id
  }
  next();
});

// Index for efficient querying
WithdrawalSchema.index({ userId: 1, status: 1 });
WithdrawalSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema); 