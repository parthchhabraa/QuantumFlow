import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'quantum-flow-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const generateToken = (payload: { id: string; email: string }): string => {
  const jwtSecret = process.env.JWT_SECRET || 'quantum-flow-secret-key';
  return jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
};

export const generateRefreshToken = (payload: { id: string; email: string }): string => {
  const jwtSecret = process.env.JWT_REFRESH_SECRET || 'quantum-flow-refresh-secret-key';
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
};