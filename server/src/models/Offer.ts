// MONGO BACKUP: import { getMaxOfferId } from '../helpers';
// MONGO BACKUP: import mongoose, { Schema } from 'mongoose';
// MONGO BACKUP: 
// MONGO BACKUP: export interface IOffer {
// MONGO BACKUP:   _id: number;
// MONGO BACKUP:   gameId: number;
// MONGO BACKUP:   title: string;
// MONGO BACKUP:   imageUrl: string;
// MONGO BACKUP:   priceRUB: number;
// MONGO BACKUP:   priceUSDT: number;
// MONGO BACKUP:   isEnabled: boolean;
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: const OfferSchema: Schema = new Schema<IOffer>(
// MONGO BACKUP:   {
// MONGO BACKUP:     _id: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: false,
// MONGO BACKUP:     },
// MONGO BACKUP:     gameId: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:       ref: 'Game',
// MONGO BACKUP:       index: true,
// MONGO BACKUP:     },
// MONGO BACKUP:     title: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:     },
// MONGO BACKUP:     imageUrl: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:     },
// MONGO BACKUP:     priceRUB: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:       min: 0,
// MONGO BACKUP:     },
// MONGO BACKUP:     priceUSDT: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:       min: 0,
// MONGO BACKUP:     },
// MONGO BACKUP:     isEnabled: {
// MONGO BACKUP:       type: Boolean,
// MONGO BACKUP:       required: false,
// MONGO BACKUP:       default: true,
// MONGO BACKUP:     },
// MONGO BACKUP:   },
// MONGO BACKUP:   {
// MONGO BACKUP:     timestamps: true, // Automatically adds createdAt and updatedAt fields
// MONGO BACKUP:   }
// MONGO BACKUP: );
// MONGO BACKUP: 
// MONGO BACKUP: OfferSchema.pre('save', async function (next) {
// MONGO BACKUP:   if (this.isNew) { // Only execute for new documents
// MONGO BACKUP:     this._id = (await getMaxOfferId()) + 1; // Automatically set _id
// MONGO BACKUP:   }
// MONGO BACKUP:   next();
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: // Indexes for efficient querying
// MONGO BACKUP: OfferSchema.index({ game_id: 1, is_enabled: 1 });
// MONGO BACKUP: OfferSchema.index({ title: 1, is_enabled: 1 });
// MONGO BACKUP: 
// MONGO BACKUP: export default mongoose.model<IOffer>('Offer', OfferSchema);
