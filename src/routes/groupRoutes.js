import express from 'express';
import { groupService } from '../services/groupService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create a new group
router.post('/create', authenticate, async (req, res) => {
    try {
        const { name, description, memberIds } = req.body;
        const group = await groupService.createGroup(
            req.user.userId,
            name,
            description,
            memberIds || []
        );
        res.json({ group });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all groups for logged-in user
router.get('/my-groups', authenticate, async (req, res) => {
    try {
        const groups = await groupService.getUserGroups(req.user.userId);
        res.json({ groups });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get messages in a group
router.get('/:groupId/messages', authenticate, async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const limit = parseInt(req.query.limit) || 50;
        
        const messages = await groupService.getGroupMessages(groupId, req.user.userId, limit);
        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add member to group
router.post('/:groupId/members', authenticate, async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const { userId, role } = req.body;
        
        const member = await groupService.addMember(groupId, userId, req.user.userId, role);
        res.json({ member });
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
});

// Remove member from group
router.delete('/:groupId/members/:userId', authenticate, async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const userId = parseInt(req.params.userId);
        
        await groupService.removeMember(groupId, userId, req.user.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
});

export default router;
