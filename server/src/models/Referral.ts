// MONGO BACKUP: import { Schema, model } from 'mongoose';
// MONGO BACKUP: import { getMaxReferralId } from '../helpers';
// MONGO BACKUP: 
// MONGO BACKUP: export interface IReferral {
// MONGO BACKUP:   _id?: number;
// MONGO BACKUP:   userId: number;
// MONGO BACKUP:   referId: number;
// MONGO BACKUP:   createdAt?: Date;
// MONGO BACKUP:   updatedAt?: Date;
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: const ReferralSchema = new Schema<IReferral>(
// MONGO BACKUP:   {
// MONGO BACKUP:     _id: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: false,
// MONGO BACKUP:     },
// MONGO BACKUP:     userId: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: true
// MONGO BACKUP:     },
// MONGO BACKUP:     referId: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: true
// MONGO BACKUP:     }
// MONGO BACKUP:   },
// MONGO BACKUP:   {
// MONGO BACKUP:     timestamps: true,
// MONGO BACKUP:   }
// MONGO BACKUP: );
// MONGO BACKUP: 
// MONGO BACKUP: ReferralSchema.pre('save', async function (next) {
// MONGO BACKUP:   if (this.isNew) { // Only execute for new documents
// MONGO BACKUP:     this._id = (await getMaxReferralId()) + 1; // Automatically set _id
// MONGO BACKUP:   }
// MONGO BACKUP:   next();
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: export default model<IReferral>('Referral', ReferralSchema); 
