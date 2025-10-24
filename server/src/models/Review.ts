import { getMaxReviewId } from '../helpers/index';
import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  _id: number;
  userId: number;
  orderId: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema<IReview>({
  _id: {
    type: Number,
    required: false,
  },
  userId: {
    type: Number,
    required: true,
    ref: 'User'
  },
  orderId: {
    type: Number,
    required: true,
    ref: 'Order',
    index: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    ref: 'User',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
}, {
  timestamps: true // Automatically manage created_at and updated_at fields
});

// Pre-save hook to set _id automatically
ReviewSchema.pre('save', async function (next) {
  if (this.isNew) { // Only execute for new documents
    this._id = (await getMaxReviewId()) + 1; // Automatically set _id
  }
  next();
});

export default mongoose.model<IReview>('Review', ReviewSchema); 