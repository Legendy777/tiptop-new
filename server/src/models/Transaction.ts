import { Schema, model } from 'mongoose';
import { getMaxTransactionId } from '../helpers/index';

export interface ITransaction {
  _id?: number;
  userId: number;
  referId?: number;
  amount: number;
  currency: 'RUB' | 'USDT';
  earned?: number;
  type: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    _id: {
      type: Number,
      required: false,
    },
    userId: {
      type: Number,
      required: true,
      ref: 'User'
    },
    referId: {
      type: Number,
      required: false,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true  
    },
    currency: {
      type: String,
      required: true,
      enum: ['RUB', 'USDT']
    },
    earned: {
      type: Number,
      required: false
    },
    type: {
      type: String,
      required: true,
      enum: ['order', 'refund']
    }
  },
  {
    timestamps: true
  }
);

TransactionSchema.pre('save', async function (next) {
  if (this.isNew) { // Only execute for new documents
    this._id = (await getMaxTransactionId()) + 1; // Automatically set _id
  }
  next();
});

export default model<ITransaction>('Transaction', TransactionSchema); 