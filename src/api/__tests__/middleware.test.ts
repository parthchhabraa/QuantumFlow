import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, generateToken, generateRefreshToken, AuthenticatedRequest } from '../middleware/auth';
import { errorHandler, createError } from '../middleware/errorHandler';
import { requestLogger } from '../middleware/requestLogger';

describe('Authentication Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      header: jest.fn()
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('authMiddleware', () => {
    it('should authenticate valid token', () => {
      const payload = { id: 'user123', email: 'test@example.com' };
      const token = generateToken(payload);
      
      (mockReq.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

      authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual(payload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without token', () => {
      (mockReq.header as jest.Mock).mockReturnValue(undefined);

      authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      (mockReq.header as jest.Mock).mockReturnValue('Bearer invalid-token');

      authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header', () => {
      (mockReq.header as jest.Mock).mockReturnValue('InvalidFormat');

      authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token.' });
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const payload = { id: 'user123', email: 'test@example.com' };
      const token = generateToken(payload);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts

      // Verify token can be decoded
      const jwtSecret = process.env.JWT_SECRET || 'quantum-flow-secret-key';
      const decoded = jwt.verify(token, jwtSecret) as any;
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate valid refresh token', () => {
      const payload = { id: 'user123', email: 'test@example.com' };
      const refreshToken = generateRefreshToken(payload);

      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.')).toHaveLength(3);

      // Verify refresh token can be decoded
      const jwtSecret = process.env.JWT_REFRESH_SECRET || 'quantum-flow-refresh-secret-key';
      const decoded = jwt.verify(refreshToken, jwtSecret) as any;
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });
  });
});

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      path: '/test-path'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();

    // Mock console.error to avoid test output pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle API errors with custom status code', () => {
      const error = createError('Test error', 400, 'TEST_ERROR');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: 'Test error',
          code: 'TEST_ERROR',
          timestamp: expect.any(String),
          path: '/test-path'
        }
      });
    });

    it('should handle generic errors with default status code', () => {
      const error = new Error('Generic error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: 'Generic error',
          code: 'INTERNAL_ERROR',
          timestamp: expect.any(String),
          path: '/test-path'
        }
      });
    });

    it('should log errors to console', () => {
      const error = createError('Test error', 400);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('API Error:', error);
    });
  });

  describe('createError', () => {
    it('should create error with custom properties', () => {
      const error = createError('Test message', 404, 'NOT_FOUND');

      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create error with default status code', () => {
      const error = createError('Test message');

      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
    });
  });
});

describe('Request Logger Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      url: '/test',
      get: jest.fn(),
      ip: '127.0.0.1'
    };
    mockRes = {
      statusCode: 200,
      on: jest.fn()
    };
    mockNext = jest.fn();

    // Mock console.log to avoid test output pollution
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('requestLogger', () => {
    it('should log request details on response finish', () => {
      (mockReq.get as jest.Mock).mockReturnValue('Test User Agent');
      
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));

      // Simulate response finish
      const finishCallback = (mockRes.on as jest.Mock).mock.calls[0][1];
      finishCallback();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] GET \/test - 200 \(\d+ms\)/)
      );
    });

    it('should handle missing user agent', () => {
      (mockReq.get as jest.Mock).mockReturnValue(undefined);
      
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      const finishCallback = (mockRes.on as jest.Mock).mock.calls[0][1];
      finishCallback();

      expect(console.log).toHaveBeenCalled();
    });
  });
});