import { getMaxOrderId } from '../helpers/index';
import mongoose, { Schema } from 'mongoose';

export interface IOrder {
  _id: number;
  paymentId: number;
  userId: number;
  offerId: number;
  orderDetailsId: number | null;
  status: 'pending' | 'process' | 'completed' | 'canceled' | 'invalid';
  currency: 'USDT' | 'RUB';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  _id: {
    type: Number,
    required: false,
  },
  paymentId: {
    type: Number,
    required: true
  },
  userId: {
    type: Number,
    required: true,
    ref: 'User'
  },
  offerId: {
    type: Number,
    required: true,
    ref: 'Offer'
  },
  orderDetailsId: {
    type: Number,
    required: false,
    ref: 'OrderDetails'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'process', 'completed', 'canceled', 'invalid'],
    default: 'pending'
  },
  currency: {
    type: String,
    required: true,
    enum: ['USDT', 'RUB']
  }
}, {
  timestamps: true,
});

// Pre-save hook to set _id automatically
OrderSchema.pre('save', async function (next) {
  if (this.isNew) { // Only execute for new documents
    this._id = (await getMaxOrderId()) + 1; // Automatically set _id
  }
  next();
});

// Indexes
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
