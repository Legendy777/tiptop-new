// MONGO BACKUP: import { getMaxReviewId } from '../helpers/index';
// MONGO BACKUP: import mongoose, { Schema, Document } from 'mongoose';
// MONGO BACKUP: 
// MONGO BACKUP: export interface IReview extends Document {
// MONGO BACKUP:   _id: number;
// MONGO BACKUP:   userId: number;
// MONGO BACKUP:   orderId: number;
// MONGO BACKUP:   username: string;
// MONGO BACKUP:   rating: number;
// MONGO BACKUP:   comment: string;
// MONGO BACKUP:   createdAt: Date;
// MONGO BACKUP:   updatedAt: Date;
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: const ReviewSchema: Schema = new Schema<IReview>({
// MONGO BACKUP:   _id: {
// MONGO BACKUP:     type: Number,
// MONGO BACKUP:     required: false,
// MONGO BACKUP:   },
// MONGO BACKUP:   userId: {
// MONGO BACKUP:     type: Number,
// MONGO BACKUP:     required: true,
// MONGO BACKUP:     ref: 'User'
// MONGO BACKUP:   },
// MONGO BACKUP:   orderId: {
// MONGO BACKUP:     type: Number,
// MONGO BACKUP:     required: true,
// MONGO BACKUP:     ref: 'Order',
// MONGO BACKUP:     index: true,
// MONGO BACKUP:     unique: true
// MONGO BACKUP:   },
// MONGO BACKUP:   username: {
// MONGO BACKUP:     type: String,
// MONGO BACKUP:     required: true,
// MONGO BACKUP:     ref: 'User',
// MONGO BACKUP:   },
// MONGO BACKUP:   rating: {
// MONGO BACKUP:     type: Number,
// MONGO BACKUP:     required: true,
// MONGO BACKUP:     min: 1,
// MONGO BACKUP:     max: 5
// MONGO BACKUP:   },
// MONGO BACKUP:   comment: {
// MONGO BACKUP:     type: String,
// MONGO BACKUP:     required: true,
// MONGO BACKUP:     trim: true,
// MONGO BACKUP:     maxlength: 1000
// MONGO BACKUP:   },
// MONGO BACKUP: }, {
// MONGO BACKUP:   timestamps: true // Automatically manage created_at and updated_at fields
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: // Pre-save hook to set _id automatically
// MONGO BACKUP: ReviewSchema.pre('save', async function (next) {
// MONGO BACKUP:   if (this.isNew) { // Only execute for new documents
// MONGO BACKUP:     this._id = (await getMaxReviewId()) + 1; // Automatically set _id
// MONGO BACKUP:   }
// MONGO BACKUP:   next();
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: export default mongoose.model<IReview>('Review', ReviewSchema); 
