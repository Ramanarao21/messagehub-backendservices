import prisma from '../config/prisma.js';
import { getIO } from '../socket/index.js';

export const dmService = {
    // STEP 1: Find or create a conversation between two users
    // This ensures we have a "chat room" for these two people
    async findOrCreateConversation(userId1, userId2) {
        const [smallerId, largerId] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

        // Try to find existing conversation
        let conversation = await prisma.conversation.findUnique({
            where: {
                user1Id_user2Id: {
                    user1Id: smallerId,
                    user2Id: largerId
                }
            }
        });

        // If no conversation exists, create one
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    user1Id: smallerId,
                    user2Id: largerId
                }
            });
        }

        return conversation;
    },

    // STEP 2: Save a message to the database
    // This stores the message permanently and links it to the conversation
    async saveMessage(senderId, recipientId, content, messageType = 'text') {
        // First, get or create the conversation
        const conversation = await this.findOrCreateConversation(senderId, recipientId);

        // Save the message
        const message = await prisma.message.create({
            data: {
                userId: senderId,
                recipientId: recipientId,
                conversationId: conversation.id,
                content: content,
                messageType: messageType
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                recipient: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        // Update the conversation's last message time
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() }
        });

        return message;
    },

    // STEP 3: Get all messages in a conversation
    // This loads chat history between two users
    async getConversation(userId1, userId2, limit = 50) {
        const conversation = await this.findOrCreateConversation(userId1, userId2);

        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversation.id
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc' // Oldest first
            },
            take: limit
        });

        return messages;
    },

    // STEP 4: Get all conversations for a user
    // Shows list of all people this user has chatted with
    async getUserConversations(userId) {
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            },
            include: {
                user1: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                user2: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1 // Get last message only
                }
            },
            orderBy: {
                lastMessageAt: 'desc'
            }
        });

        // Format the response to show the "other person" in each conversation
        return conversations.map(conv => {
            const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
            return {
                conversationId: conv.id,
                otherUser: otherUser,
                lastMessage: conv.messages[0] || null,
                lastMessageAt: conv.lastMessageAt,
                createdAt: conv.createdAt
            };
        });
    },

    // STEP 5: Mark messages as read
    async markMessagesAsRead(conversationId, userId) {
        await prisma.message.updateMany({
            where: {
                conversationId: conversationId,
                recipientId: userId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
    },

    // Emit message to specific user (works across servers via Redis)
    emitToUser(userId, event, data) {
        const io = getIO();
        io.to(`user:${userId}`).emit(event, data);
    }
};
