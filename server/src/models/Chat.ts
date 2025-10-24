// MONGO BACKUP: import { Schema, model, Document } from 'mongoose';
// MONGO BACKUP: 
// MONGO BACKUP: export interface IMessage {
// MONGO BACKUP:   sender: number;
// MONGO BACKUP:   content: string;
// MONGO BACKUP:   timestamp: Date;
// MONGO BACKUP:   isSystemMessage?: boolean;
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: interface IChat extends Document {
// MONGO BACKUP:   userId: number;
// MONGO BACKUP:   messages: IMessage[];
// MONGO BACKUP:   lastReadByUser?: Date;
// MONGO BACKUP:   lastReadByAdmin?: Date;
// MONGO BACKUP:   unreadAdminCount: number;
// MONGO BACKUP: }
// MONGO BACKUP: 
// MONGO BACKUP: const messageSchema = new Schema<IMessage>({
// MONGO BACKUP:   sender: Number,
// MONGO BACKUP:   content: String,
// MONGO BACKUP:   timestamp: { type: Date, default: Date.now },
// MONGO BACKUP:   isSystemMessage: Boolean,
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: const chatSchema = new Schema<IChat>({
// MONGO BACKUP:   userId: { type: Number, required: true, unique: true },
// MONGO BACKUP:   messages: [messageSchema],
// MONGO BACKUP:   lastReadByUser: Date,
// MONGO BACKUP:   lastReadByAdmin: Date,
// MONGO BACKUP:   unreadAdminCount: { type: Number, default: 0 },
// MONGO BACKUP: });
// MONGO BACKUP: 
// MONGO BACKUP: export const Chat = model<IChat>('Chat', chatSchema);
