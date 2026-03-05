import { authService } from '../services/authService.js';

export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = await authService.verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};


export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const user = await authService.verifyToken(token);
        
        if (!user) {
            return next(new Error('Authentication error: Invalid token'));
        }

        socket.userId = user.userId;
        socket.username = user.username;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
};

