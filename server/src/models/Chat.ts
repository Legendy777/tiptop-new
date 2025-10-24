import { Schema, model, Document } from 'mongoose';

export interface IMessage {
  sender: number;
  content: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}

interface IChat extends Document {
  userId: number;
  messages: IMessage[];
  lastReadByUser?: Date;
  lastReadByAdmin?: Date;
  unreadAdminCount: number;
}

const messageSchema = new Schema<IMessage>({
  sender: Number,
  content: String,
  timestamp: { type: Date, default: Date.now },
  isSystemMessage: Boolean,
});

const chatSchema = new Schema<IChat>({
  userId: { type: Number, required: true, unique: true },
  messages: [messageSchema],
  lastReadByUser: Date,
  lastReadByAdmin: Date,
  unreadAdminCount: { type: Number, default: 0 },
});

export const Chat = model<IChat>('Chat', chatSchema);
