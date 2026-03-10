import prisma from '../config/prisma.js';

// Get all users (for finding people to chat with)
export const getAllUsers = async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        
        const users = await prisma.user.findMany({
            where: {
                id: { not: currentUserId } // Exclude current user
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
            },
            orderBy: {
                username: 'asc'
            }
        });

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Search users by username
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user.userId;

        if (!query || query.trim().length === 0) {
            return res.json({ users: [] });
        }

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: currentUserId } },
                    {
                        OR: [
                            { username: { contains: query, mode: 'insensitive' } },
                            { email: { contains: query, mode: 'insensitive' } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
            },
            take: 20
        });

        res.json({ users });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
