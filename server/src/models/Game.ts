// MONGO BACKUP: import { getMaxGameId } from '../helpers';
// MONGO BACKUP: import { Schema, model } from 'mongoose';
// MONGO BACKUP: 
// MONGO BACKUP: export interface IGame {
// MONGO BACKUP:   _id: number;
// MONGO BACKUP:   title: string;
// MONGO BACKUP:   imageUrl: string;
// MONGO BACKUP:   gifUrl: string;
// MONGO BACKUP:   hasDiscount: boolean;
// MONGO BACKUP:   isActual: boolean;
// MONGO BACKUP:   isEnabled: boolean;
// MONGO BACKUP:   appleStoreUrl: string;
// MONGO BACKUP:   googlePlayUrl: string;
// MONGO BACKUP:   trailerUrl: string;
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: const GameSchema = new Schema<IGame>(
// MONGO BACKUP:   {
// MONGO BACKUP:     _id: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: false,
// MONGO BACKUP:     },
// MONGO BACKUP:     title: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:     },
// MONGO BACKUP:     imageUrl: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:     },
// MONGO BACKUP:     gifUrl: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:     },
// MONGO BACKUP:     hasDiscount: {
// MONGO BACKUP:       type: Boolean,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:       default: false,
// MONGO BACKUP:     },
// MONGO BACKUP:     isActual: {
// MONGO BACKUP:       type: Boolean,
// MONGO BACKUP:       required: false,
// MONGO BACKUP:       default: true,
// MONGO BACKUP:     },
// MONGO BACKUP:     isEnabled: {
// MONGO BACKUP:       type: Boolean,
// MONGO BACKUP:       required: false,
// MONGO BACKUP:       default: true,
// MONGO BACKUP:     },
// MONGO BACKUP:     appleStoreUrl: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:     },
// MONGO BACKUP:     googlePlayUrl: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:     },
// MONGO BACKUP:     trailerUrl: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:     },
// MONGO BACKUP:   },
// MONGO BACKUP:   {
// MONGO BACKUP:     timestamps: true,
// MONGO BACKUP:   }
// MONGO BACKUP: );
// MONGO BACKUP: 
// MONGO BACKUP: GameSchema.pre('save', async function (next) {
// MONGO BACKUP:   if (this.isNew) {
// MONGO BACKUP:     this._id = (await getMaxGameId()) + 1;
// MONGO BACKUP:   }
// MONGO BACKUP:   next();
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: export default model<IGame>('Game', GameSchema);
