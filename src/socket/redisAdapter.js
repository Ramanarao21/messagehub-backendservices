import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export const setupRedisAdapter = async (io) => {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    try {
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        console.log('Socket.IO Redis adapter connected');
    } catch (error) {
        console.error('Redis adapter connection failed:', error);
        throw error;
    }

    return { pubClient, subClient };
};
