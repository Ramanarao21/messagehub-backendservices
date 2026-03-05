export const registerSocketHandlers = (io, socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Broadcast user online status
    io.emit('user:online', {
        userId: socket.userId,
        username: socket.username
    });

    // Handle private messages
    socket.on('message:send', async (data) => {
        const { recipientId, content } = data;

        const message = {
            senderId: socket.userId,
            senderUsername: socket.username,
            recipientId,
            content,
            timestamp: new Date()
        };

        // Send to recipient (works across multiple instances via Redis)
        io.to(`user:${recipientId}`).emit('message:receive', message);

        // Send confirmation to sender
        socket.emit('message:sent', message);
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
        io.to(`user:${data.recipientId}`).emit('typing:user', {
            userId: socket.userId,
            username: socket.username
        });
    });

    socket.on('typing:stop', (data) => {
        io.to(`user:${data.recipientId}`).emit('typing:stop', {
            userId: socket.userId
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
