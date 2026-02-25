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
