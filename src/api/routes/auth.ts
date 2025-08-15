import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

// In-memory user store (in production, use a proper database)
interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const users: Map<string, User> = new Map();

// Register endpoint
router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400, 'MISSING_CREDENTIALS');
    }

    if (password.length < 6) {
      throw createError('Password must be at least 6 characters long', 400, 'WEAK_PASSWORD');
    }

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(user => user.email === email);
    if (existingUser) {
      throw createError('User already exists', 409, 'USER_EXISTS');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user: User = {
      id: uuidv4(),
      email,
      passwordHash,
      createdAt: new Date()
    };

    users.set(user.id, user);

    // Generate tokens
    const token = generateToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      },
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400, 'MISSING_CREDENTIALS');
    }

    // Find user
    const user = Array.from(users.values()).find(user => user.email === email);
    if (!user) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const token = generateToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      },
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token endpoint
router.post('/refresh', (req: Request, res: Response, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
    }

    // In a real implementation, verify the refresh token and generate new tokens
    // For now, just return an error indicating this needs to be implemented
    throw createError('Refresh token functionality not yet implemented', 501, 'NOT_IMPLEMENTED');
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };