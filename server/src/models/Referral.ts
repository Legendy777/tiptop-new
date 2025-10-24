import { Schema, model } from 'mongoose';
import { getMaxReferralId } from '../helpers';

export interface IReferral {
  _id?: number;
  userId: number;
  referId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    _id: {
      type: Number,
      required: false,
    },
    userId: {
      type: Number,
      required: true
    },
    referId: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

ReferralSchema.pre('save', async function (next) {
  if (this.isNew) { // Only execute for new documents
    this._id = (await getMaxReferralId()) + 1; // Automatically set _id
  }
  next();
});

export default model<IReferral>('Referral', ReferralSchema); 