import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { authService } from '../services/authService.js';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Create Redis clients for Socket.IO adapter
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        // Set up Redis adapter for multi-instance support
        io.adapter(createAdapter(pubClient, subClient));
        console.log('Socket.IO Redis adapter connected');
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const user = await authService.verifyToken(token);
            
            if (!user) {
                return next(new Error('Invalid token'));
            }

            socket.userId = user.userId;
            socket.username = user.username;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
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
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};
