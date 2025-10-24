// MONGO BACKUP: import { getMaxOrderDetailsId } from "../helpers/index";
// MONGO BACKUP: import mongoose, {Schema} from "mongoose";
// MONGO BACKUP: 
// MONGO BACKUP: export interface IOrderDetails {
// MONGO BACKUP:   _id: number;
// MONGO BACKUP:   orderId: number;
// MONGO BACKUP:   entry: string | null;
// MONGO BACKUP:   login: string | null;
// MONGO BACKUP:   password: string | null;
// MONGO BACKUP:   code: string | null;
// MONGO BACKUP:   server: string;
// MONGO BACKUP:   nickname: string;
// MONGO BACKUP:   userInGameId: number | null;
// MONGO BACKUP:   createdAt?: Date;
// MONGO BACKUP:   updatedAt?: Date;
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: const OrderDetailsSchema: Schema = new Schema<IOrderDetails>(
// MONGO BACKUP:   {
// MONGO BACKUP:     _id: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: false,
// MONGO BACKUP:     },
// MONGO BACKUP:     orderId: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       required: true,
// MONGO BACKUP:       ref: "Order",
// MONGO BACKUP:     },
// MONGO BACKUP:     entry: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       default: null,
// MONGO BACKUP:     },
// MONGO BACKUP:     login: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       default: null,
// MONGO BACKUP:     },
// MONGO BACKUP:     password: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       default: null,
// MONGO BACKUP:     },
// MONGO BACKUP:     code: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       default: null,
// MONGO BACKUP:     },
// MONGO BACKUP:     server: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       default: null,
// MONGO BACKUP:     },
// MONGO BACKUP:     nickname: {
// MONGO BACKUP:       type: String,
// MONGO BACKUP:       default: null,
// MONGO BACKUP:     },
// MONGO BACKUP:     userInGameId: {
// MONGO BACKUP:       type: Number,
// MONGO BACKUP:       default: null,
// MONGO BACKUP:     },
// MONGO BACKUP:   },
// MONGO BACKUP:   {
// MONGO BACKUP:     timestamps: true,
// MONGO BACKUP:   }
// MONGO BACKUP: );
// MONGO BACKUP: 
// MONGO BACKUP: // Pre-save hook to set _id automatically
// MONGO BACKUP: OrderDetailsSchema.pre('save', async function (next) {
// MONGO BACKUP:   if (this.isNew) { // Only execute for new documents
// MONGO BACKUP:     this._id = (await getMaxOrderDetailsId()) + 1; // Automatically set _id
// MONGO BACKUP:   }
// MONGO BACKUP:   next();
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: // Add index for efficient querying
// MONGO BACKUP: OrderDetailsSchema.index({ orderId: 1 });
// MONGO BACKUP: 
// MONGO BACKUP: export default mongoose.model<IOrderDetails>("OrderDetails", OrderDetailsSchema);
