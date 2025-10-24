// MONGO BACKUP: import { getMaxWithdrawalId } from '../helpers/index';
// MONGO BACKUP: import mongoose, { Schema, Document } from 'mongoose';
// MONGO BACKUP: 
// MONGO BACKUP: export interface IWithdrawal extends Document {
// MONGO BACKUP:   _id: number;
// MONGO BACKUP:   userId: number;
// MONGO BACKUP:   amount: number;
// MONGO BACKUP:   status: 'pending' | 'completed' | 'rejected';
// MONGO BACKUP:   currency: 'RUB' | 'USDT';
// MONGO BACKUP:   createdAt: Date;
// MONGO BACKUP:   updatedAt: Date;
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: const WithdrawalSchema: Schema = new Schema<IWithdrawal>({
// MONGO BACKUP:   _id: { type: Number, required: false },
// MONGO BACKUP:   userId: { type: Number, required: true },
// MONGO BACKUP:   amount: { type: Number, required: true },
// MONGO BACKUP:   status: { type: String, enum: ['pending', 'completed', 'rejected'], required: false, default: "pending" },
// MONGO BACKUP:   currency: { type: String, enum: ['RUB', 'USDT'], required: true },
// MONGO BACKUP:   createdAt: { type: Date, required: true, default: Date.now },
// MONGO BACKUP:   updatedAt: { type: Date, required: true, default: Date.now },
// MONGO BACKUP: }, {
// MONGO BACKUP:   timestamps: true
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: // Pre-save hook to set _id automatically
// MONGO BACKUP: WithdrawalSchema.pre('save', async function (next) {
// MONGO BACKUP:   if (this.isNew) { // Only execute for new documents
// MONGO BACKUP:     this._id = (await getMaxWithdrawalId()) + 1; // Automatically set _id
// MONGO BACKUP:   }
// MONGO BACKUP:   next();
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: // Index for efficient querying
// MONGO BACKUP: WithdrawalSchema.index({ userId: 1, status: 1 });
// MONGO BACKUP: WithdrawalSchema.index({ status: 1, createdAt: -1 });
// MONGO BACKUP: 
// MONGO BACKUP: export default mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema); 
