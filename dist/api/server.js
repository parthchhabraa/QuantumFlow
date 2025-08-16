"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumFlowAPIServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const compression_1 = require("./routes/compression");
const auth_1 = require("./routes/auth");
const batch_1 = require("./routes/batch");
const cloud_auth_1 = require("./routes/cloud-auth");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
class QuantumFlowAPIServer {
    constructor(port = 3000) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
            credentials: true
        }));
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);
        // Body parsing
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
        // Request logging
        this.app.use(requestLogger_1.requestLogger);
    }
    setupRoutes() {
        // Serve static frontend files
        const frontendPath = path_1.default.join(__dirname, '../frontend');
        this.app.use(express_1.default.static(frontendPath));
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
        // API routes
        this.app.use('/api/auth', auth_1.authRoutes);
        this.app.use('/api/compression', compression_1.compressionRoutes); // Remove auth middleware for demo
        this.app.use('/api/batch', batch_1.batchRoutes);
        this.app.use('/api/cloud-auth', cloud_auth_1.cloudAuthRoutes);
        // API documentation
        this.app.get('/api', (req, res) => {
            res.json({
                name: 'QuantumFlow API',
                version: '1.0.0',
                endpoints: {
                    auth: {
                        'POST /api/auth/register': 'Register a new user',
                        'POST /api/auth/login': 'Login user',
                        'POST /api/auth/refresh': 'Refresh access token'
                    },
                    compression: {
                        'POST /api/compression/compress': 'Compress a file',
                        'POST /api/compression/decompress': 'Decompress a file',
                        'GET /api/compression/status/:jobId': 'Get compression job status',
                        'GET /api/compression/download/:jobId': 'Download compressed/decompressed file'
                    },
                    batch: {
                        'POST /api/batch/compress': 'Create batch compression job',
                        'POST /api/batch/decompress': 'Create batch decompression job',
                        'POST /api/batch/cloud/:provider': 'Create batch job from cloud storage',
                        'GET /api/batch/status/:jobId': 'Get batch job status',
                        'GET /api/batch/jobs': 'Get user batch jobs',
                        'POST /api/batch/cancel/:jobId': 'Cancel batch job',
                        'GET /api/batch/queue/status': 'Get queue status'
                    },
                    cloudAuth: {
                        'GET /api/cloud-auth/authorize/:provider': 'Get cloud authorization URL',
                        'POST /api/cloud-auth/callback/:provider': 'Handle OAuth callback',
                        'POST /api/cloud-auth/refresh/:provider': 'Refresh access token',
                        'POST /api/cloud-auth/test/:provider': 'Test cloud credentials',
                        'POST /api/cloud-auth/files/:provider': 'List cloud files',
                        'GET /api/cloud-auth/providers': 'Get supported providers'
                    }
                }
            });
        });
        // Serve React app for all non-API routes
        this.app.get('*', (req, res) => {
            if (!req.path.startsWith('/api')) {
                res.sendFile(path_1.default.join(frontendPath, 'index.html'));
            }
        });
    }
    setupErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
    }
    start() {
        return new Promise((resolve) => {
            this.app.listen(this.port, () => {
                console.log(`QuantumFlow API Server running on port ${this.port}`);
                resolve();
            });
        });
    }
    getApp() {
        return this.app;
    }
}
exports.QuantumFlowAPIServer = QuantumFlowAPIServer;
//# sourceMappingURL=server.js.map