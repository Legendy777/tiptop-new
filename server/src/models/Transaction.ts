// MONGO BACKUP: import { Schema, model } from 'mongoose';
// MONGO BACKUP: import { getMaxTransactionId } from '../helpers/index';
// MONGO BACKUP: 
// MONGO BACKUP: export interface ITransaction {
// MONGO BACKUP:   _id?: number;
// MONGO BACKUP:   userId: number;
// MONGO BACKUP:   referId?: number;
// MONGO BACKUP:   amount: number;
// MONGO BACKUP:   currency: 'RUB' | 'USDT';
// MONGO BACKUP:   earned?: number;
// MONGO BACKUP:   type: string;
// MONGO BACKUP:   createdAt?: Date;
// MONGO BACKUP:   updatedAt?: Date;
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: const TransactionSchema = new Schema<ITransaction>(
// MONGO BACKUP:   {
// MONGO BACKUP:     _id: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: false,
// MONGO BACKUP:     },
// MONGO BACKUP:     userId: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:       ref: 'User'
// MONGO BACKUP:     },
// MONGO BACKUP:     referId: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: false,
// MONGO BACKUP:       ref: 'User'
// MONGO BACKUP:     },
// MONGO BACKUP:     amount: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: true  
// MONGO BACKUP:     },
// MONGO BACKUP:     currency: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:       enum: ['RUB', 'USDT']
// MONGO BACKUP:     },
// MONGO BACKUP:     earned: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: false
// MONGO BACKUP:     },
// MONGO BACKUP:     type: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:       enum: ['order', 'refund']
// MONGO BACKUP:     }
// MONGO BACKUP:   },
// MONGO BACKUP:   {
// MONGO BACKUP:     timestamps: true
// MONGO BACKUP:   }
// MONGO BACKUP: );
// MONGO BACKUP: 
// MONGO BACKUP: TransactionSchema.pre('save', async function (next) {
// MONGO BACKUP:   if (this.isNew) { // Only execute for new documents
// MONGO BACKUP:     this._id = (await getMaxTransactionId()) + 1; // Automatically set _id
// MONGO BACKUP:   }
// MONGO BACKUP:   next();
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: export default model<ITransaction>('Transaction', TransactionSchema); 
