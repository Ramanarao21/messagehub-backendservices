import express from 'express';
import { dmService, messageService } from '../services/messageService.js';
import { authenticate} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ROUTE 1: Get all chats (both DMs and groups combined)
router.get('/all', async (req, res) => {
    try {
        const allChats = await messageService.getAllChats(req.user.userId);
        res.json(allChats);
    } catch (error) {
        console.error('Error fetching all chats:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});

// ROUTE 2: Get all DM conversations only
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await dmService.getUserConversations(req.user.userId);
        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// ROUTE 3: Get chat history with a specific user
router.get('/conversations/:otherUserId/messages', async (req, res) => {
    try {
        const otherUserId = parseInt(req.params.otherUserId);
        const limit = parseInt(req.query.limit) || 50;

        const messages = await dmService.getConversation(
            req.user.userId,
            otherUserId,
            limit
        );

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// ROUTE 4: Mark DM messages as read
router.post('/conversations/:conversationId/read', async (req, res) => {
    try {
        const conversationId = parseInt(req.params.conversationId);
        await dmService.markMessagesAsRead(conversationId, req.user.userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

export default router;
