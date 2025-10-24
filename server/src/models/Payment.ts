import { getMaxPaymentId } from '../helpers/index';
import mongoose, { Schema } from 'mongoose';

export interface IPayment {
  _id: number;
  externalId: string;
  userId: number;
  orderId: number | null;
  offerId: number;
  amountToPay: number;
  currency: 'USDT' | 'RUB';
  status: 'pending' | 'completed' | 'failed' | 'canceled';
}

const PaymentSchema = new Schema<IPayment>(
  {
    _id: {
      type: Number,
      required: false,
    },
    externalId: { type: String, required: true },
    userId: { type: Number, required: true },
    orderId: { type: Number, required: false },
    offerId: { type: Number, required: true },
    amountToPay: { type: Number, required: true },
    currency: { type: String, enum: ['USDT', 'RUB'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'canceled'], required: true },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to set _id automatically
PaymentSchema.pre('save', async function (next) {
  if (this.isNew) { // Only execute for new documents
    this._id = (await getMaxPaymentId()) + 1; // Automatically set _id
  }
  next();
});

PaymentSchema.index({ _id: 1, externalId: 1 }, { unique: true });
// PaymentSchema.index({ orderId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ status: 1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);