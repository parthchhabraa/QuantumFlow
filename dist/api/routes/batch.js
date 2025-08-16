"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const BatchProcessor_1 = require("../services/BatchProcessor");
const CloudStorageService_1 = require("../services/CloudStorageService");
const CloudAuthService_1 = require("../services/CloudAuthService");
const QuantumConfig_1 = require("../../models/QuantumConfig");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
exports.batchRoutes = router;
// Initialize services
const batchProcessor = new BatchProcessor_1.BatchProcessor();
const cloudStorageService = new CloudStorageService_1.CloudStorageService();
const cloudAuthService = new CloudAuthService_1.CloudAuthService();
// Configure multer for batch file uploads
const batchStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'batch-uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const uniqueName = `${timestamp}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const batchUpload = (0, multer_1.default)({
    storage: batchStorage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB per file
        files: 50, // Maximum 50 files per batch
    },
    fileFilter: (req, file, cb) => {
        // Allow all file types for batch processing
        cb(null, true);
    }
});
// Create batch compression job
router.post('/compress', batchUpload.array('files', 50), async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            throw (0, errorHandler_1.createError)('No files provided', 400, 'NO_FILES');
        }
        const { priority = 0, quantumBitDepth = 8, maxEntanglementLevel = 4, superpositionComplexity = 5, interferenceThreshold = 0.5, cloudProvider, cloudCredentials, cloudConfig } = req.body;
        // Create quantum configuration
        const compressionConfig = new QuantumConfig_1.QuantumConfig(quantumBitDepth, maxEntanglementLevel, superpositionComplexity, interferenceThreshold);
        // Parse cloud configuration if provided
        let cloudStorageConfig;
        if (cloudProvider && cloudCredentials) {
            cloudStorageConfig = {
                provider: cloudProvider,
                credentials: JSON.parse(cloudCredentials),
                ...JSON.parse(cloudConfig || '{}')
            };
            // Validate cloud credentials
            if (!cloudAuthService.validateCredentials(cloudProvider, cloudStorageConfig.credentials)) {
                throw (0, errorHandler_1.createError)('Invalid cloud storage credentials', 400, 'INVALID_CREDENTIALS');
            }
        }
        // Prepare file items
        const files = req.files.map(file => ({
            originalName: file.originalname,
            sourcePath: file.path,
            cloudSourcePath: undefined,
            cloudDestinationPath: cloudStorageConfig
                ? `compressed/${file.originalname}.qf`
                : undefined
        }));
        // Create batch job
        const jobId = batchProcessor.createBatchJob(req.user.id, 'compress', files, compressionConfig, cloudStorageConfig, parseInt(priority));
        res.status(202).json({
            message: 'Batch compression job created',
            jobId,
            filesCount: files.length,
            status: 'pending'
        });
    }
    catch (error) {
        next(error);
    }
});
// Create batch decompression job
router.post('/decompress', batchUpload.array('files', 50), async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            throw (0, errorHandler_1.createError)('No files provided', 400, 'NO_FILES');
        }
        const { priority = 0, quantumBitDepth = 8, maxEntanglementLevel = 4, superpositionComplexity = 5, interferenceThreshold = 0.5, cloudProvider, cloudCredentials, cloudConfig } = req.body;
        // Create quantum configuration
        const compressionConfig = new QuantumConfig_1.QuantumConfig(quantumBitDepth, maxEntanglementLevel, superpositionComplexity, interferenceThreshold);
        // Parse cloud configuration if provided
        let cloudStorageConfig;
        if (cloudProvider && cloudCredentials) {
            cloudStorageConfig = {
                provider: cloudProvider,
                credentials: JSON.parse(cloudCredentials),
                ...JSON.parse(cloudConfig || '{}')
            };
            // Validate cloud credentials
            if (!cloudAuthService.validateCredentials(cloudProvider, cloudStorageConfig.credentials)) {
                throw (0, errorHandler_1.createError)('Invalid cloud storage credentials', 400, 'INVALID_CREDENTIALS');
            }
        }
        // Prepare file items
        const files = req.files.map(file => ({
            originalName: file.originalname,
            sourcePath: file.path,
            cloudSourcePath: undefined,
            cloudDestinationPath: cloudStorageConfig
                ? `decompressed/${path.parse(file.originalname).name}`
                : undefined
        }));
        // Create batch job
        const jobId = batchProcessor.createBatchJob(req.user.id, 'decompress', files, compressionConfig, cloudStorageConfig, parseInt(priority));
        res.status(202).json({
            message: 'Batch decompression job created',
            jobId,
            filesCount: files.length,
            status: 'pending'
        });
    }
    catch (error) {
        next(error);
    }
});
// Create batch job from cloud storage
router.post('/cloud/:provider', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        const { provider } = req.params;
        const { type, // 'compress' or 'decompress'
        filePaths, priority = 0, quantumBitDepth = 8, maxEntanglementLevel = 4, superpositionComplexity = 5, interferenceThreshold = 0.5, credentials, sourceBucket, destinationBucket, sourceFolder, destinationFolder } = req.body;
        if (!type || !filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
            throw (0, errorHandler_1.createError)('Missing required parameters', 400, 'MISSING_PARAMETERS');
        }
        if (!['compress', 'decompress'].includes(type)) {
            throw (0, errorHandler_1.createError)('Invalid job type', 400, 'INVALID_TYPE');
        }
        // Create quantum configuration
        const compressionConfig = new QuantumConfig_1.QuantumConfig(quantumBitDepth, maxEntanglementLevel, superpositionComplexity, interferenceThreshold);
        // Create cloud configuration
        const cloudStorageConfig = {
            provider: provider,
            credentials,
            sourceBucket,
            destinationBucket,
            sourceFolder,
            destinationFolder
        };
        // Validate cloud credentials
        if (!cloudAuthService.validateCredentials(provider, credentials)) {
            throw (0, errorHandler_1.createError)('Invalid cloud storage credentials', 400, 'INVALID_CREDENTIALS');
        }
        // Prepare file items from cloud paths
        const files = filePaths.map((filePath) => ({
            originalName: path.basename(filePath),
            sourcePath: '', // Not used for cloud files
            cloudSourcePath: filePath,
            cloudDestinationPath: type === 'compress'
                ? `${destinationFolder || 'compressed'}/${path.basename(filePath)}.qf`
                : `${destinationFolder || 'decompressed'}/${path.parse(filePath).name}`
        }));
        // Create batch job
        const jobId = batchProcessor.createBatchJob(req.user.id, type, files, compressionConfig, cloudStorageConfig, parseInt(priority));
        res.status(202).json({
            message: `Batch ${type} job created from ${provider}`,
            jobId,
            filesCount: files.length,
            status: 'pending'
        });
    }
    catch (error) {
        next(error);
    }
});
// Get batch job status
router.get('/status/:jobId', (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        const { jobId } = req.params;
        const job = batchProcessor.getJob(jobId);
        if (!job) {
            throw (0, errorHandler_1.createError)('Job not found', 404, 'JOB_NOT_FOUND');
        }
        if (job.userId !== req.user.id) {
            throw (0, errorHandler_1.createError)('Access denied', 403, 'ACCESS_DENIED');
        }
        res.json({
            jobId: job.id,
            type: job.type,
            status: job.status,
            progress: job.progress,
            priority: job.priority,
            filesCount: job.files.length,
            files: job.files.map(file => ({
                id: file.id,
                originalName: file.originalName,
                status: file.status,
                progress: file.progress,
                error: file.error,
                metrics: file.metrics
            })),
            metrics: job.metrics,
            error: job.error,
            createdAt: job.createdAt,
            startedAt: job.startedAt,
            completedAt: job.completedAt
        });
    }
    catch (error) {
        next(error);
    }
});
// Get user's batch jobs
router.get('/jobs', (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        const { status, type, limit = 50, offset = 0 } = req.query;
        let jobs = batchProcessor.getUserJobs(req.user.id);
        // Filter by status if provided
        if (status && typeof status === 'string') {
            jobs = jobs.filter(job => job.status === status);
        }
        // Filter by type if provided
        if (type && typeof type === 'string') {
            jobs = jobs.filter(job => job.type === type);
        }
        // Sort by creation date (newest first)
        jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        // Apply pagination
        const limitNum = parseInt(limit);
        const offsetNum = parseInt(offset);
        const paginatedJobs = jobs.slice(offsetNum, offsetNum + limitNum);
        res.json({
            jobs: paginatedJobs.map(job => ({
                jobId: job.id,
                type: job.type,
                status: job.status,
                progress: job.progress,
                priority: job.priority,
                filesCount: job.files.length,
                metrics: job.metrics,
                createdAt: job.createdAt,
                startedAt: job.startedAt,
                completedAt: job.completedAt
            })),
            total: jobs.length,
            limit: limitNum,
            offset: offsetNum
        });
    }
    catch (error) {
        next(error);
    }
});
// Cancel batch job
router.post('/cancel/:jobId', (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        const { jobId } = req.params;
        const job = batchProcessor.getJob(jobId);
        if (!job) {
            throw (0, errorHandler_1.createError)('Job not found', 404, 'JOB_NOT_FOUND');
        }
        if (job.userId !== req.user.id) {
            throw (0, errorHandler_1.createError)('Access denied', 403, 'ACCESS_DENIED');
        }
        const cancelled = batchProcessor.cancelJob(jobId);
        if (!cancelled) {
            throw (0, errorHandler_1.createError)('Job cannot be cancelled', 400, 'CANNOT_CANCEL');
        }
        res.json({
            message: 'Job cancelled successfully',
            jobId,
            status: 'cancelled'
        });
    }
    catch (error) {
        next(error);
    }
});
// Get queue status
router.get('/queue/status', (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        const queueStatus = batchProcessor.getQueueStatus();
        res.json({
            ...queueStatus,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=batch.js.map