import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);
router.get('/status/:userId', authenticate, authController.checkUserStatus);

export default router;
