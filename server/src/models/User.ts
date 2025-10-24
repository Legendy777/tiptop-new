import mongoose, { Schema } from 'mongoose';

export interface IUser {
  _id: number;
  username: string;
  language: string;
  isBanned: boolean;
  isSubscribed: boolean;
  avatarUrl?: string;
  balanceRUB: number;
  balanceUSDT: number;
  ordersCount: number;
  referralPercent: number;
  acceptedPrivacyConsent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema({
  _id: { type: Number, required: true },
  username: { type: String, required: true },
  language: { type: String, default: 'ru' },
  isBanned: { type: Boolean, default: false },
  isSubscribed: { type: Boolean, default: false },
  avatarUrl: { type: String, default: '' },
  balanceRUB: { type: Number, default: 0 },
  balanceUSDT: { type: Number, default: 0 },
  ordersCount: { type: Number, default: 0 },
  referralPercent: { type: Number, default: 1 },
  acceptedPrivacyConsent: { type: Boolean, default: false },
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);