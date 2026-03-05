import { Server } from 'socket.io';
import { setupRedisAdapter } from './redisAdapter.js';
import { socketAuthMiddleware } from '../middleware/auth.js';
import { registerSocketHandlers } from './handlers.js';

let io;

export const initializeSocket = async (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Setup Redis adapter for multi-instance support
    await setupRedisAdapter(io);

    // Apply authentication middleware
    io.use(socketAuthMiddleware);

    // Register connection handler
    io.on('connection', (socket) => {
        registerSocketHandlers(io, socket);
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};
