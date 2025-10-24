// MONGO BACKUP: import mongoose, { Schema } from 'mongoose';
// MONGO BACKUP: 
// MONGO BACKUP: export interface IUser {
// MONGO BACKUP:   _id: number;
// MONGO BACKUP:   username: string;
// MONGO BACKUP:   language: string;
// MONGO BACKUP:   isBanned: boolean;
// MONGO BACKUP:   isSubscribed: boolean;
// MONGO BACKUP:   avatarUrl?: string;
// MONGO BACKUP:   balanceRUB: number;
// MONGO BACKUP:   balanceUSDT: number;
// MONGO BACKUP:   ordersCount: number;
// MONGO BACKUP:   referralPercent: number;
// MONGO BACKUP:   acceptedPrivacyConsent: boolean;
// MONGO BACKUP:   createdAt?: Date;
// MONGO BACKUP:   updatedAt?: Date;
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: const UserSchema: Schema = new Schema({
// MONGO BACKUP:   _id: { type: Number, required: true },
// MONGO BACKUP:   username: { type: String, required: true },
// MONGO BACKUP:   language: { type: String, default: 'ru' },
// MONGO BACKUP:   isBanned: { type: Boolean, default: false },
// MONGO BACKUP:   isSubscribed: { type: Boolean, default: false },
// MONGO BACKUP:   avatarUrl: { type: String, default: '' },
// MONGO BACKUP:   balanceRUB: { type: Number, default: 0 },
// MONGO BACKUP:   balanceUSDT: { type: Number, default: 0 },
// MONGO BACKUP:   ordersCount: { type: Number, default: 0 },
// MONGO BACKUP:   referralPercent: { type: Number, default: 1 },
// MONGO BACKUP:   acceptedPrivacyConsent: { type: Boolean, default: false },
// MONGO BACKUP: }, {
// MONGO BACKUP:   timestamps: true
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: export default mongoose.model<IUser>('User', UserSchema);
