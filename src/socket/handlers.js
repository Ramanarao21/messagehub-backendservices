import { dmService } from '../services/dmService.js';
import { groupService } from '../services/groupService.js';

export const registerSocketHandlers = (io, socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join all user's group rooms
    loadUserGroups(socket);

    // Broadcast user online status
    io.emit('user:online', {
        userId: socket.userId,
        username: socket.username
    });

    // Handle DM (Direct Message)
    socket.on('dm:send', async (data) => {
        try {
            const { recipientId, content, messageType = 'text' } = data;

            // Save to database
            const savedMessage = await dmService.saveMessage(
                socket.userId,
                recipientId,
                content,
                messageType
            );

            const messageData = {
                id: savedMessage.id,
                senderId: socket.userId,
                senderUsername: socket.username,
                recipientId,
                content,
                messageType,
                createdAt: savedMessage.createdAt
            };

            // Send to recipient (works across multiple instances via Redis)
            io.to(`user:${recipientId}`).emit('dm:receive', messageData);

            // Send confirmation to sender
            socket.emit('dm:sent', messageData);
        } catch (error) {
            socket.emit('error', { message: 'Failed to send message', error: error.message });
        }
    });

    // Handle Group Message
    socket.on('group:send', async (data) => {
        try {
            const { groupId, content, messageType = 'text' } = data;

            // Save to database
            const savedMessage = await groupService.saveGroupMessage(
                socket.userId,
                groupId,
                content,
                messageType
            );

            const messageData = {
                id: savedMessage.id,
                senderId: socket.userId,
                senderUsername: socket.username,
                groupId,
                content,
                messageType,
                createdAt: savedMessage.createdAt
            };

            // Send to all group members (works across multiple instances via Redis)
            io.to(`group:${groupId}`).emit('group:receive', messageData);
        } catch (error) {
            socket.emit('error', { message: 'Failed to send group message', error: error.message });
        }
    });

    // Handle joining a group room
    socket.on('group:join', async (data) => {
        const { groupId } = data;
        socket.join(`group:${groupId}`);
        console.log(`User ${socket.username} joined group ${groupId}`);
    });

    // Handle leaving a group room
    socket.on('group:leave', (data) => {
        const { groupId } = data;
        socket.leave(`group:${groupId}`);
        console.log(`User ${socket.username} left group ${groupId}`);
    });

    // Handle typing indicator for DM
    socket.on('dm:typing:start', (data) => {
        io.to(`user:${data.recipientId}`).emit('dm:typing:user', {
            userId: socket.userId,
            username: socket.username
        });
    });

    socket.on('dm:typing:stop', (data) => {
        io.to(`user:${data.recipientId}`).emit('dm:typing:stop', {
            userId: socket.userId
        });
    });

    // Handle typing indicator for groups
    socket.on('group:typing:start', (data) => {
        io.to(`group:${data.groupId}`).emit('group:typing:user', {
            userId: socket.userId,
            username: socket.username,
            groupId: data.groupId
        });
    });

    socket.on('group:typing:stop', (data) => {
        io.to(`group:${data.groupId}`).emit('group:typing:stop', {
            userId: socket.userId,
            groupId: data.groupId
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.username}`);
        
        io.emit('user:offline', {
            userId: socket.userId,
            username: socket.username
        });
    });
};

// Helper function to join user's group rooms on connect
async function loadUserGroups(socket) {
    try {
        const groups = await groupService.getUserGroups(socket.userId);
        groups.forEach(group => {
            socket.join(`group:${group.id}`);
        });
        console.log(`User ${socket.username} joined ${groups.length} group rooms`);
    } catch (error) {
        console.error('Error loading user groups:', error);
    }
}
