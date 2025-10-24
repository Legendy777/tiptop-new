// MONGO BACKUP: import { getMaxPaymentId } from '../helpers/index';
// MONGO BACKUP: import mongoose, { Schema } from 'mongoose';
// MONGO BACKUP: 
// MONGO BACKUP: export interface IPayment {
// MONGO BACKUP:   _id: number;
// MONGO BACKUP:   externalId: string;
// MONGO BACKUP:   userId: number;
// MONGO BACKUP:   orderId: number | null;
// MONGO BACKUP:   offerId: number;
// MONGO BACKUP:   amountToPay: number;
// MONGO BACKUP:   currency: 'USDT' | 'RUB';
// MONGO BACKUP:   status: 'pending' | 'completed' | 'failed' | 'canceled';
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: const PaymentSchema = new Schema<IPayment>(
// MONGO BACKUP:   {
// MONGO BACKUP:     _id: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: false,
// MONGO BACKUP:     },
// MONGO BACKUP:     externalId: { type: String, required: true },
// MONGO BACKUP:     userId: { type: Number, required: true },
// MONGO BACKUP:     orderId: { type: Number, required: false },
// MONGO BACKUP:     offerId: { type: Number, required: true },
// MONGO BACKUP:     amountToPay: { type: Number, required: true },
// MONGO BACKUP:     currency: { type: String, enum: ['USDT', 'RUB'], required: true },
// MONGO BACKUP:     status: { type: String, enum: ['pending', 'completed', 'failed', 'canceled'], required: true },
// MONGO BACKUP:   },
// MONGO BACKUP:   {
// MONGO BACKUP:     timestamps: true,
// MONGO BACKUP:   }
// MONGO BACKUP: );
// MONGO BACKUP: 
// MONGO BACKUP: // Pre-save hook to set _id automatically
// MONGO BACKUP: PaymentSchema.pre('save', async function (next) {
// MONGO BACKUP:   if (this.isNew) { // Only execute for new documents
// MONGO BACKUP:     this._id = (await getMaxPaymentId()) + 1; // Automatically set _id
// MONGO BACKUP:   }
// MONGO BACKUP:   next();
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: PaymentSchema.index({ _id: 1, externalId: 1 }, { unique: true });
// MONGO BACKUP: // PaymentSchema.index({ orderId: 1 }, { unique: true, sparse: true });
// MONGO BACKUP: PaymentSchema.index({ status: 1 });
// MONGO BACKUP: 
// MONGO BACKUP: export default mongoose.model<IPayment>('Payment', PaymentSchema);
