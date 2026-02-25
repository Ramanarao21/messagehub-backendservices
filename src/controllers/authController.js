import { authService } from '../services/authService.js';

export const authController = {
    // Register new user
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            
            // Validation
            if (!username || !email || !password) {
                return res.status(400).json({ 
                    error: 'All fields are required',
                    details: {
                        username: !username ? 'Username is required' : null,
                        email: !email ? 'Email is required' : null,
                        password: !password ? 'Password is required' : null
                    }
                });
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }

            // Password strength validation
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long' });
            }
            
            const user = await authService.register(username, email, password);
            
            // Auto-login after registration - generate token
            const loginResult = await authService.login(email, password);
            
            res.status(201).json({ 
                message: 'User registered successfully', 
                token: loginResult.token,
                user: loginResult.user
            });
        } catch (error) {
            console.error('Registration error:', error);
            
            // Handle Prisma unique constraint violation
            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0] || 'field';
                return res.status(400).json({ 
                    error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
                });
            }
            
            res.status(500).json({ error: 'Registration failed. Please try again.' });
        }
    },

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Validation
            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Email and password are required' 
                });
            }
            
            const result = await authService.login(email, password);
            
            res.json({
                message: 'Login successful',
                ...result
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(401).json({ error: error.message || 'Invalid credentials' });
        }
    },

    // Logout user
    async logout(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(400).json({ error: 'No token provided' });
            }
            
            await authService.logout(token, req.user.userId);
            
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Logout failed. Please try again.' });
        }
    },

    // Get current user profile
    async getCurrentUser(req, res) {
        try {
            res.json({ 
                user: req.user 
            });
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({ error: 'Failed to fetch user data' });
        }
    },

    // Check user online status
    async checkUserStatus(req, res) {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            
            const isOnline = await authService.isUserOnline(userId);
            
            res.json({ 
                userId, 
                status: isOnline ? 'online' : 'offline' 
            });
        } catch (error) {
            console.error('Check user status error:', error);
            res.status(500).json({ error: 'Failed to check user status' });
        }
    }
};
