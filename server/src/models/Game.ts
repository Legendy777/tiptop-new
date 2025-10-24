import { getMaxGameId } from '../helpers';
import { Schema, model } from 'mongoose';

export interface IGame {
  _id: number;
  title: string;
  imageUrl: string;
  gifUrl: string;
  hasDiscount: boolean;
  isActual: boolean;
  isEnabled: boolean;
  appleStoreUrl: string;
  googlePlayUrl: string;
  trailerUrl: string;
}

const GameSchema = new Schema<IGame>(
  {
    _id: {
      type: Number,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    gifUrl: {
      type: String,
      required: true,
    },
    hasDiscount: {
      type: Boolean,
      required: true,
      default: false,
    },
    isActual: {
      type: Boolean,
      required: false,
      default: true,
    },
    isEnabled: {
      type: Boolean,
      required: false,
      default: true,
    },
    appleStoreUrl: {
      type: String,
      required: true,
    },
    googlePlayUrl: {
      type: String,
      required: true,
    },
    trailerUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

GameSchema.pre('save', async function (next) {
  if (this.isNew) {
    this._id = (await getMaxGameId()) + 1;
  }
  next();
});

export default model<IGame>('Game', GameSchema);