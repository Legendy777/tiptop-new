import { getMaxOrderDetailsId } from "../helpers/index";
import mongoose, {Schema} from "mongoose";

export interface IOrderDetails {
  _id: number;
  orderId: number;
  entry: string | null;
  login: string | null;
  password: string | null;
  code: string | null;
  server: string;
  nickname: string;
  userInGameId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderDetailsSchema: Schema = new Schema<IOrderDetails>(
  {
    _id: {
      type: Number,
      required: false,
    },
    orderId: {
      type: Number,
      required: true,
      ref: "Order",
    },
    entry: {
      type: String,
      default: null,
    },
    login: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    code: {
      type: String,
      default: null,
    },
    server: {
      type: String,
      default: null,
    },
    nickname: {
      type: String,
      default: null,
    },
    userInGameId: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to set _id automatically
OrderDetailsSchema.pre('save', async function (next) {
  if (this.isNew) { // Only execute for new documents
    this._id = (await getMaxOrderDetailsId()) + 1; // Automatically set _id
  }
  next();
});

// Add index for efficient querying
OrderDetailsSchema.index({ orderId: 1 });

export default mongoose.model<IOrderDetails>("OrderDetails", OrderDetailsSchema);