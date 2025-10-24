// MONGO BACKUP: import { getMaxOrderId } from '../helpers/index';
// MONGO BACKUP: import mongoose, { Schema } from 'mongoose';
// MONGO BACKUP: 
// MONGO BACKUP: export interface IOrder {
// MONGO BACKUP:   _id: number;
// MONGO BACKUP:   paymentId: number;
// MONGO BACKUP:   userId: number;
// MONGO BACKUP:   offerId: number;
// MONGO BACKUP:   orderDetailsId: number | null;
// MONGO BACKUP:   status: 'pending' | 'process' | 'completed' | 'canceled' | 'invalid';
// MONGO BACKUP:   currency: 'USDT' | 'RUB';
// MONGO BACKUP:   createdAt: Date;
// MONGO BACKUP:   updatedAt: Date;
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: const OrderSchema: Schema = new Schema({
// MONGO BACKUP:   _id: {
// MONGO BACKUP:     type: Number,
// MONGO BACKUP:     required: false,
// MONGO BACKUP:   },
// MONGO BACKUP:   paymentId: {
// MONGO BACKUP:     type: Number,
// MONGO BACKUP:     required: true
// MONGO BACKUP:   },
// MONGO BACKUP:   userId: {
// MONGO BACKUP:     type: Number,
// MONGO BACKUP:     required: true,
// MONGO BACKUP:     ref: 'User'
// MONGO BACKUP:   },
// MONGO BACKUP:   offerId: {
// MONGO BACKUP:     type: Number,
// MONGO BACKUP:     required: true,
// MONGO BACKUP:     ref: 'Offer'
// MONGO BACKUP:   },
// MONGO BACKUP:   orderDetailsId: {
// MONGO BACKUP:     type: Number,
// MONGO BACKUP:     required: false,
// MONGO BACKUP:     ref: 'OrderDetails'
// MONGO BACKUP:   },
// MONGO BACKUP:   status: {
// MONGO BACKUP:     type: String,
// MONGO BACKUP:     required: true,
// MONGO BACKUP:     enum: ['pending', 'process', 'completed', 'canceled', 'invalid'],
// MONGO BACKUP:     default: 'pending'
// MONGO BACKUP:   },
// MONGO BACKUP:   currency: {
// MONGO BACKUP:     type: String,
// MONGO BACKUP:     required: true,
// MONGO BACKUP:     enum: ['USDT', 'RUB']
// MONGO BACKUP:   }
// MONGO BACKUP: }, {
// MONGO BACKUP:   timestamps: true,
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: // Pre-save hook to set _id automatically
// MONGO BACKUP: OrderSchema.pre('save', async function (next) {
// MONGO BACKUP:   if (this.isNew) { // Only execute for new documents
// MONGO BACKUP:     this._id = (await getMaxOrderId()) + 1; // Automatically set _id
// MONGO BACKUP:   }
// MONGO BACKUP:   next();
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: // Indexes
// MONGO BACKUP: OrderSchema.index({ userId: 1 });
// MONGO BACKUP: OrderSchema.index({ status: 1 });
// MONGO BACKUP: 
// MONGO BACKUP: export default mongoose.model<IOrder>('Order', OrderSchema);
