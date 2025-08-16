"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateToken = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }
    try {
        const jwtSecret = process.env.JWT_SECRET || 'quantum-flow-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};
exports.authMiddleware = authMiddleware;
const generateToken = (payload) => {
    const jwtSecret = process.env.JWT_SECRET || 'quantum-flow-secret-key';
    return jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '24h' });
};
exports.generateToken = generateToken;
const generateRefreshToken = (payload) => {
    const jwtSecret = process.env.JWT_REFRESH_SECRET || 'quantum-flow-refresh-secret-key';
    return jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '7d' });
};
exports.generateRefreshToken = generateRefreshToken;
//# sourceMappingURL=auth.js.map