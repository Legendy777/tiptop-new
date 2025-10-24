// import { Request, Response } from 'express';
// import { Chat, IMessage } from '../models/Chat';
// import { logger } from '../config/logger';
// import mongoose from 'mongoose';

// export const createChat = async (req: Request, res: Response) => {
//   try {
//     const { clientId } = req.body;
//     logger.info('Attempting to create a new chat', { context: { clientId } });

//     const existingChat = await Chat.findOne({ client: clientId });
//     if (existingChat) {
//       logger.warn('Chat already exists for this client', { context: { clientId } });
//       return res.status(400).json({ message: 'Chat already exists for this client' });
//     }

//     const chat = new Chat({ client: clientId });
//     await chat.save();

//     logger.info('Chat created successfully', { context: { clientId, chatId: chat._id } });
//     res.status(201).json(chat);
//   } catch (error) {
//     logger.error('Error creating chat', { context: { error } });
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const getChat = async (req: Request, res: Response) => {
//   try {
//     const { clientId } = req.params;
//     logger.info('Fetching chat for client', { context: { clientId } });

//     const chat = await Chat.findOne({ client: clientId }).populate('messages.sender', 'username');
//     if (!chat) {
//       logger.warn('Chat not found for client', { context: { clientId } });
//       return res.status(404).json({ message: 'Chat not found' });
//     }

//     logger.info('Chat fetched successfully', { context: { clientId, chatId: chat._id } });
//     res.json(chat);
//   } catch (error) {
//     logger.error('Error fetching chat', { context: { error } });
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const getAllChats = async (req: Request, res: Response) => {
//   try {
//     logger.info('Fetching all chats');
//     const chats = await Chat.find().populate('client', 'username').populate('messages.sender', 'username');

//     logger.info('All chats fetched successfully', { context: { chatCount: chats.length } });
//     res.json(chats);
//   } catch (error) {
//     logger.error('Error fetching all chats', { context: { error } });
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const sendMessage = async (req: Request, res: Response) => {
//   try {
//     const { clientId } = req.params;
//     const { content, senderId, isSystemMessage = false } = req.body;

//     logger.info('Attempting to send a message', { context: { clientId, senderId, isSystemMessage } });

//     const chat = await Chat.findOne({ client: clientId });
//     if (!chat) {
//       logger.warn('Chat not found for client', { context: { clientId } });
//       return res.status(404).json({ message: 'Chat not found' });
//     }

//     const messageInput: IMessage = {
//       sender: new mongoose.Types.ObjectId(senderId.toString()),
//       content,
//       timestamp: new Date(),
//       isSystemMessage,
//     };

//     chat.messages.push(messageInput as any);
//     await chat.save();

//     logger.info('Message sent successfully', { context: { clientId, senderId, messageId: messageInput.sender } });
//     res.status(201).json(messageInput);
//   } catch (error) {
//     logger.error('Error sending message', { context: { error } });
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const sendSystemMessage = async (clientId: string, content: string) => {
//   try {
//     logger.info('Attempting to send a system message', { context: { clientId, content } });

//     const chat = await Chat.findOne({ client: clientId });
//     if (!chat) {
//       logger.warn('Chat not found for client', { context: { clientId } });
//       throw new Error('Chat not found');
//     }

//     const messageInput: IMessage = {
//       sender: new mongoose.Types.ObjectId((process.env.SYSTEM_USER_ID || '000000000000000000000000').toString()),
//       content,
//       timestamp: new Date(),
//       isSystemMessage: true,
//     };

//     chat.messages.push(messageInput as any);
//     await chat.save();

//     logger.info('System message sent successfully', { context: { clientId, messageId: messageInput.sender } });
//     return messageInput;
//   } catch (error) {
//     logger.error('Error sending system message', { context: { error } });
//     throw error;
//   }
// };