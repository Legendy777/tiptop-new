import { prisma } from '../client';
import { Prisma, Chat as PrismaChat, ChatMessage } from '../../../generated/prisma';
import { DatabaseError, NotFoundError } from '../error';

type ChatWithRelations = Prisma.ChatGetPayload<{
  include: {
    user: true;
    messages: true;
  };
}>;

export class ChatRepository {
  async findById(id: number | string): Promise<ChatWithRelations> {
    try {
      const chat = await prisma.chat.findUnique({
        where: { id: Number(id) },
        include: {
          user: true,
          messages: { orderBy: { timestamp: 'asc' } },
        },
      });
      if (!chat) {
        throw new NotFoundError('Chat', String(id));
      }
      return chat;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find chat by id', error);
    }
  }

  async findAll(limit?: number, offset?: number): Promise<ChatWithRelations[]> {
    try {
      return await prisma.chat.findMany({
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: true,
          messages: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all chats', error);
    }
  }

  async create(data: Prisma.ChatCreateInput): Promise<ChatWithRelations> {
    try {
      return await prisma.chat.create({
        data,
        include: {
          user: true,
          messages: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to create chat', error);
    }
  }

  async update(id: number | string, data: Prisma.ChatUpdateInput): Promise<ChatWithRelations> {
    try {
      return await prisma.chat.update({
        where: { id: Number(id) },
        data,
        include: {
          user: true,
          messages: { orderBy: { timestamp: 'asc' } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update chat', error);
    }
  }

  async delete(id: number | string): Promise<PrismaChat> {
    try {
      return await prisma.chat.delete({ where: { id: Number(id) } });
    } catch (error) {
      throw new DatabaseError('Failed to delete chat', error);
    }
  }

  async findByUserId(userId: number | string): Promise<ChatWithRelations | null> {
    try {
      return await prisma.chat.findUnique({
        where: { userId: Number(userId) },
        include: {
          user: true,
          messages: { orderBy: { timestamp: 'asc' } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find chat by user id', error);
    }
  }

  async addMessage(chatId: number, messageData: Omit<Prisma.ChatMessageCreateInput, 'chat'>) {
    try {
      const chat = await prisma.chat.findUnique({ where: { id: Number(chatId) } });
      if (!chat) throw new NotFoundError('Chat', String(chatId));
      return await prisma.chatMessage.create({
        data: { ...messageData, chat: { connect: { id: Number(chatId) } } },
      });
    } catch (error) {
      throw new DatabaseError('Failed to add message to chat', error);
    }
  }

  async getMessages(chatId: number | string, limit?: number, offset?: number): Promise<ChatMessage[]> {
    try {
      return await prisma.chatMessage.findMany({
        where: { chatId: Number(chatId) },
        orderBy: { timestamp: 'asc' },
        skip: offset,
        take: limit,
      });
    } catch (error) {
      throw new DatabaseError('Failed to get chat messages', error);
    }
  }

  async markAsReadByUser(chatId: number | string): Promise<PrismaChat> {
    try {
      return await prisma.chat.update({
        where: { id: Number(chatId) },
        data: { lastReadByUser: new Date() },
      });
    } catch (error) {
      throw new DatabaseError('Failed to mark chat as read by user', error);
    }
  }

  async markAsReadByAdmin(chatId: number | string): Promise<PrismaChat> {
    try {
      return await prisma.chat.update({
        where: { id: Number(chatId) },
        data: { lastReadByAdmin: new Date(), unreadAdminCount: 0 },
      });
    } catch (error) {
      throw new DatabaseError('Failed to mark chat as read by admin', error);
    }
  }

  async incrementUnreadAdminCount(chatId: number | string): Promise<PrismaChat> {
    try {
      return await prisma.chat.update({
        where: { id: Number(chatId) },
        data: { unreadAdminCount: { increment: 1 } },
      });
    } catch (error) {
      throw new DatabaseError('Failed to increment unread admin count', error);
    }
  }

  async getUnreadChatsCount(): Promise<number> {
    try {
      return await prisma.chat.count({
        where: { unreadAdminCount: { gt: 0 } },
      });
    } catch (error) {
      throw new DatabaseError('Failed to get unread chats count', error);
    }
  }

  async findOrCreate(userId: number | string): Promise<ChatWithRelations> {
    try {
      let chat = await prisma.chat.findUnique({
        where: { userId: Number(userId) },
        include: {
          user: true,
          messages: { orderBy: { timestamp: 'asc' } },
        },
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: { user: { connect: { id: Number(userId) } } },
          include: {
            user: true,
            messages: true,
          },
        });
      }

      return chat;
    } catch (error) {
      throw new DatabaseError('Failed to find or create chat', error);
    }
  }
}

export const chatRepository = new ChatRepository();
