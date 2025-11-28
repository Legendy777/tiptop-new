import { getMaxOfferId } from '../helpers';
import mongoose, { Schema } from 'mongoose';

export interface IOffer {
  _id: number;
  gameId: number;
  title: string;
  imageUrl: string;
  priceRUB: number;
  priceUSDT: number;
  isEnabled: boolean;
}

const OfferSchema: Schema = new Schema<IOffer>(
  {
    _id: {
      type: Number,
      required: false,
    },
    gameId: {
      type: Number,
      required: true,
      ref: 'Game',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    priceRUB: {
      type: Number,
      required: true,
      min: 0,
    },
    priceUSDT: {
      type: Number,
      required: true,
      min: 0,
    },
    isEnabled: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

OfferSchema.pre('save', async function (next) {
  if (this.isNew) { // Only execute for new documents
    this._id = (await getMaxOfferId()) + 1; // Automatically set _id
  }
  next();
});

// Indexes for efficient querying
OfferSchema.index({ game_id: 1, is_enabled: 1 });
OfferSchema.index({ title: 1, is_enabled: 1 });

export default mongoose.model<IOffer>('Offer', OfferSchema);
