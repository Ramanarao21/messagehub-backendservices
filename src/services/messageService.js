import prisma from '../config/prisma.js';
import { getIO } from '../socket/index.js';

export const messageService = {
    // Save message to database
    async saveMessage(senderId, recipientId, content) {
        const message = await prisma.message.create({
            data: {
                userId: senderId,
                content,
                // You can add recipientId field to schema if needed
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        return message;
    },

    // Get conversation between two users
    async getConversation(userId1, userId2, limit = 50) {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { userId: userId1 },
                    { userId: userId2 }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        return messages.reverse();
    },

    // Emit message to specific user (works across pods via Redis)
    emitToUser(userId, event, data) {
        const io = getIO();
        io.to(`user:${userId}`).emit(event, data);
    }
};
