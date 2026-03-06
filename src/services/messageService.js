// UNIFIED MESSAGE SERVICE
// Routes to either DM or Group service based on message type

import { dmService } from './dmService.js';
import { groupService } from './groupService.js';

export const messageService = {
    // Direct Message methods (1-on-1 chat)
    dm: dmService,
    
    // Group chat methods
    group: groupService,

    // UNIFIED: Send message (auto-detects type)
    async sendMessage(senderId, { recipientId, groupId, content, messageType = 'text' }) {
        if (groupId) {
            // Group message
            return await groupService.sendGroupMessage(senderId, groupId, content, messageType);
        } else if (recipientId) {
            // Direct message
            return await dmService.saveMessage(senderId, recipientId, content, messageType);
        } else {
            throw new Error('Either recipientId or groupId must be provided');
        }
    },

    // UNIFIED: Get all chats (both DMs and groups)
    async getAllChats(userId) {
        const [conversations, groups] = await Promise.all([
            dmService.getUserConversations(userId),
            groupService.getUserGroups(userId)
        ]);

        // Combine and sort by last message time
        const allChats = [
            ...conversations.map(c => ({ ...c, type: 'dm' })),
            ...groups.map(g => ({ ...g, type: 'group' }))
        ].sort((a, b) => {
            const timeA = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0);
            const timeB = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0);
            return timeB - timeA;
        });

        return allChats;
    }
};

// Export individual services for direct access
export { dmService } from './dmService.js';
export { groupService } from './groupService.js';
