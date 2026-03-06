import { messageService } from '../services/messageService.js';

export const messageController = {
    // Get all conversations
    async getConversations(req, res) {
        try {
            const conversations = await messageService.getUserConversations(req.user.userId);
            res.json(conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            res.status(500).json({ error: 'Failed to fetch conversations' });
        }
    },

    // Get messages in a conversation
    async getMessages(req, res) {
        try {
            const otherUserId = parseInt(req.params.otherUserId);
            const limit = parseInt(req.query.limit) || 50;

            const messages = await messageService.getConversation(
                req.user.userId,
                otherUserId,
                limit
            );

            res.json(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    },

    // Mark messages as read
    async markAsRead(req, res) {
        try {
            const conversationId = parseInt(req.params.conversationId);
            await messageService.markMessagesAsRead(conversationId, req.user.userId);
            res.json({ success: true });
        } catch (error) {
            console.error('Error marking messages as read:', error);
            res.status(500).json({ error: 'Failed to mark messages as read' });
        }
    }
};
