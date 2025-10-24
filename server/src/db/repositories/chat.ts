import { prisma } from '../client';
import { DatabaseError, NotFoundError } from '../error';
import { Prisma } from '../../../generated/prisma';

export class ChatRepository {
  async findById(id: number) {
    try {
      const chat = await prisma.chat.findUnique({
        where: { id },
        include: {
          user: true,
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });
      if (!chat) {
        throw new NotFoundError('Chat', id);
      }
      return chat;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to find chat by id', error);
    }
  }

  async findAll(limit?: number, offset?: number) {
    try {
      return await prisma.chat.findMany({
        take: limit,
        skip: offset,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: true,
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find all chats', error);
    }
  }

  async create(data: Prisma.ChatCreateInput) {
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

  async update(id: number, data: Prisma.ChatUpdateInput) {
    try {
      return await prisma.chat.update({
        where: { id },
        data,
        include: {
          user: true,
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to update chat', error);
    }
  }

  async delete(id: number) {
    try {
      return await prisma.chat.delete({ where: { id } });
    } catch (error) {
      throw new DatabaseError('Failed to delete chat', error);
    }
  }

  async findByUserId(userId: number) {
    try {
      return await prisma.chat.findUnique({
        where: { userId },
        include: {
          user: true,
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to find chat by user id', error);
    }
  }

  async addMessage(chatId: number, messageData: Omit<Prisma.ChatMessageCreateInput, 'chat'>) {
    try {
      return await prisma.chatMessage.create({
        data: {
          ...messageData,
          chat: { connect: { id: chatId } },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to add message to chat', error);
    }
  }

  async getMessages(chatId: number, limit?: number, offset?: number) {
    try {
      return await prisma.chatMessage.findMany({
        where: { chatId },
        take: limit,
        skip: offset,
        orderBy: { timestamp: 'asc' },
      });
    } catch (error) {
      throw new DatabaseError('Failed to get chat messages', error);
    }
  }

  async markAsReadByUser(chatId: number) {
    try {
      return await prisma.chat.update({
        where: { id: chatId },
        data: {
          lastReadByUser: new Date(),
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to mark chat as read by user', error);
    }
  }

  async markAsReadByAdmin(chatId: number) {
    try {
      return await prisma.chat.update({
        where: { id: chatId },
        data: {
          lastReadByAdmin: new Date(),
          unreadAdminCount: 0,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to mark chat as read by admin', error);
    }
  }

  async incrementUnreadAdminCount(chatId: number) {
    try {
      return await prisma.chat.update({
        where: { id: chatId },
        data: {
          unreadAdminCount: { increment: 1 },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to increment unread admin count', error);
    }
  }

  async getUnreadChatsCount() {
    try {
      return await prisma.chat.count({
        where: {
          unreadAdminCount: { gt: 0 },
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to get unread chats count', error);
    }
  }

  async findOrCreate(userId: number) {
    try {
      let chat = await prisma.chat.findUnique({
        where: { userId },
        include: {
          user: true,
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            user: { connect: { id: userId } },
          },
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
