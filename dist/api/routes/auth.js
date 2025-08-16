"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
exports.authRoutes = router;
const users = new Map();
// Register endpoint
router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw (0, errorHandler_1.createError)('Email and password are required', 400, 'MISSING_CREDENTIALS');
        }
        if (password.length < 6) {
            throw (0, errorHandler_1.createError)('Password must be at least 6 characters long', 400, 'WEAK_PASSWORD');
        }
        // Check if user already exists
        const existingUser = Array.from(users.values()).find(user => user.email === email);
        if (existingUser) {
            throw (0, errorHandler_1.createError)('User already exists', 409, 'USER_EXISTS');
        }
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        // Create user
        const user = {
            id: (0, uuid_1.v4)(),
            email,
            passwordHash,
            createdAt: new Date()
        };
        users.set(user.id, user);
        // Generate tokens
        const token = (0, auth_1.generateToken)({ id: user.id, email: user.email });
        const refreshToken = (0, auth_1.generateRefreshToken)({ id: user.id, email: user.email });
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
    }
    catch (error) {
        next(error);
    }
});
// Login endpoint
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw (0, errorHandler_1.createError)('Email and password are required', 400, 'MISSING_CREDENTIALS');
        }
        // Find user
        const user = Array.from(users.values()).find(user => user.email === email);
        if (!user) {
            throw (0, errorHandler_1.createError)('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw (0, errorHandler_1.createError)('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        // Generate tokens
        const token = (0, auth_1.generateToken)({ id: user.id, email: user.email });
        const refreshToken = (0, auth_1.generateRefreshToken)({ id: user.id, email: user.email });
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
    }
    catch (error) {
        next(error);
    }
});
// Refresh token endpoint
router.post('/refresh', (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw (0, errorHandler_1.createError)('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
        }
        // In a real implementation, verify the refresh token and generate new tokens
        // For now, just return an error indicating this needs to be implemented
        throw (0, errorHandler_1.createError)('Refresh token functionality not yet implemented', 501, 'NOT_IMPLEMENTED');
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=auth.js.map