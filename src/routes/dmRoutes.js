import express from 'express';
import { dmService } from '../services/dmService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for logged-in user
router.get('/conversations', authenticate, async (req, res) => {
    try {
        const conversations = await dmService.getUserConversations(req.user.userId);
        res.json({ conversations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get messages in a conversation with another user
router.get('/conversation/:otherUserId', authenticate, async (req, res) => {
    try {
        const otherUserId = parseInt(req.params.otherUserId);
        const limit = parseInt(req.query.limit) || 50;
        
        const messages = await dmService.getConversation(req.user.userId, otherUserId, limit);
        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark messages as read
router.post('/conversation/:conversationId/read', authenticate, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.conversationId);
        await dmService.markMessagesAsRead(conversationId, req.user.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
