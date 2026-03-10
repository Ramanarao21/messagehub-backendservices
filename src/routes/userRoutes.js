import express from 'express';
import { getAllUsers, searchUsers, getUserById } from '../controllers/userController.js';
import { authenticate} from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/', authenticate, getAllUsers);

// Search users
router.get('/search', authenticate, searchUsers);

// Get user by ID
router.get('/:userId', authenticate, getUserById);

export default router;
