import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import redisClient from '../config/redis.js';

const SALT_ROUNDS = 10;
const SESSION_PREFIX = 'session:';
const USER_STATUS_PREFIX = 'user:status:';

export const authService = {
    // Register new user
    async register(username, email, password) {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
            }
        });
        
        return user;
    },

    // Login user
    async login(email, password) {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!user) {
            throw new Error('Invalid credentials');
        }
        
        const isValid = await bcrypt.compare(password, user.passwordHash);
        
        if (!isValid) {
            throw new Error('Invalid credentials');
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        // Store session in Redis (7 days)
        await redisClient.setEx(
            `${SESSION_PREFIX}${token}`,
            7 * 24 * 60 * 60,
            JSON.stringify({ userId: user.id, username: user.username })
        );
        
        // Set user as online
        await redisClient.set(`${USER_STATUS_PREFIX}${user.id}`, 'online');
        
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    },

    // Verify token
    async verifyToken(token) {
        try {
            // Check Redis first (faster)
            const session = await redisClient.get(`${SESSION_PREFIX}${token}`);
            
            if (!session) {
                return null;
            }
            
            // Verify JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            return null;
        }
    },

    // Logout
    async logout(token, userId) {
        // Remove session from Redis
        await redisClient.del(`${SESSION_PREFIX}${token}`);
        
        // Set user as offline
        await redisClient.set(`${USER_STATUS_PREFIX}${userId}`, 'offline');
    },

    // Check if user is online
    async isUserOnline(userId) {
        const status = await redisClient.get(`${USER_STATUS_PREFIX}${userId}`);
        return status === 'online';
    }
};
