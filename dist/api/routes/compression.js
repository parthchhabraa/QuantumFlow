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
exports.compressionRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const QuantumCompressionEngine_1 = require("../../core/QuantumCompressionEngine");
const QuantumConfig_1 = require("../../models/QuantumConfig");
const errorHandler_1 = require("../middleware/errorHandler");
const ErrorHandler_1 = require("../../core/ErrorHandler");
const ConfigurationValidator_1 = require("../../core/ConfigurationValidator");
const progressTracker_1 = require("../middleware/progressTracker");
const router = (0, express_1.Router)();
exports.compressionRoutes = router;
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 1, // Only allow single file upload
    },
    fileFilter: (req, file, cb) => {
        // Allow all file types for compression
        cb(null, true);
    }
});
// Enhanced error handling for multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        const detailedError = (0, errorHandler_1.handleFileUploadError)(error, req.body?.originalname || 'unknown', req.body?.size || 0, req);
        return res.status(400).json(ErrorHandler_1.ErrorHandler.formatErrorForAPI(detailedError));
    }
    next(error);
};
const jobs = new Map();
// Apply progress tracking middleware
router.use(progressTracker_1.progressTrackingMiddleware);
router.use(progressTracker_1.progressCleanupMiddleware);
// Compress endpoint with enhanced error handling and progress tracking
router.post('/compress', handleMulterError, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            const error = ErrorHandler_1.ErrorHandler.createDetailedError('NO_FILE_PROVIDED', 'No file was provided for compression', ErrorHandler_1.ErrorCategory.VALIDATION, ErrorHandler_1.ErrorSeverity.MEDIUM, { operation: 'file upload', endpoint: req.path });
            return res.status(400).json(ErrorHandler_1.ErrorHandler.formatErrorForAPI(error));
        }
        if (!req.user) {
            const error = ErrorHandler_1.ErrorHandler.createDetailedError('NOT_AUTHENTICATED', 'User authentication required', ErrorHandler_1.ErrorCategory.NETWORK, ErrorHandler_1.ErrorSeverity.HIGH, { operation: 'authentication', endpoint: req.path });
            return res.status(401).json(ErrorHandler_1.ErrorHandler.formatErrorForAPI(error));
        }
        // Validate and parse quantum configuration from request
        let config;
        try {
            const configData = {
                quantumBitDepth: parseInt(req.body.quantumBitDepth) || 8,
                maxEntanglementLevel: parseInt(req.body.maxEntanglementLevel) || 4,
                superpositionComplexity: parseInt(req.body.superpositionComplexity) || 5,
                interferenceThreshold: parseFloat(req.body.interferenceThreshold) || 0.5
            };
            // Validate configuration
            const validationResult = ConfigurationValidator_1.ConfigurationValidator.validateConfiguration(configData, {
                size: req.file.size,
                dataType: req.body.dataType || 'binary'
            });
            if (!validationResult.isValid) {
                const error = ErrorHandler_1.ErrorHandler.createDetailedError('INVALID_CONFIGURATION', 'Invalid quantum compression configuration', ErrorHandler_1.ErrorCategory.CONFIGURATION, ErrorHandler_1.ErrorSeverity.MEDIUM, {
                    operation: 'configuration validation',
                    config: configData,
                    validationErrors: validationResult.errors
                });
                return res.status(400).json({
                    ...ErrorHandler_1.ErrorHandler.formatErrorForAPI(error),
                    validationResult: ConfigurationValidator_1.ConfigurationValidator.formatValidationResult(validationResult)
                });
            }
            config = validationResult.optimizedConfig || new QuantumConfig_1.QuantumConfig(configData.quantumBitDepth, configData.maxEntanglementLevel, configData.superpositionComplexity, configData.interferenceThreshold);
            // Send configuration warnings if any
            if (validationResult.warnings.length > 0) {
                res.set('X-Configuration-Warnings', JSON.stringify(validationResult.warnings));
            }
        }
        catch (configError) {
            const error = ErrorHandler_1.ErrorHandler.handleConfigurationError('configuration', req.body, { min: 'various', max: 'various' }, { operation: 'configuration parsing' });
            return res.status(400).json(ErrorHandler_1.ErrorHandler.formatErrorForAPI(error));
        }
        const jobId = (0, uuid_1.v4)();
        const job = {
            id: jobId,
            userId: req.user.id,
            type: 'compress',
            status: 'pending',
            originalFileName: req.file.originalname,
            inputFilePath: req.file.path,
            config: config.toObject(),
            progress: 0,
            warnings: [],
            createdAt: new Date()
        };
        jobs.set(jobId, job);
        // Start compression asynchronously with progress tracking
        processCompressionJob(jobId, req.progressTracker).catch(error => {
            console.error(`Compression job ${jobId} failed:`, error);
            const failedJob = jobs.get(jobId);
            if (failedJob) {
                const detailedError = (0, errorHandler_1.handleCompressionAPIError)(error, failedJob.originalFileName, fs.statSync(failedJob.inputFilePath).size, failedJob.config, req);
                failedJob.status = 'failed';
                failedJob.error = detailedError.userFriendlyMessage;
                failedJob.detailedError = ErrorHandler_1.ErrorHandler.formatErrorForAPI(detailedError);
                failedJob.recoverySuggestions = detailedError.recoverySuggestions.map(s => s.description);
                jobs.set(jobId, failedJob);
            }
        });
        res.status(202).json({
            message: 'Compression job started successfully',
            jobId,
            status: 'pending',
            configuration: {
                quantumBitDepth: config.quantumBitDepth,
                maxEntanglementLevel: config.maxEntanglementLevel,
                superpositionComplexity: config.superpositionComplexity,
                interferenceThreshold: config.interferenceThreshold
            },
            estimatedProcessingTime: `${Math.ceil(req.file.size / (1024 * 1024))} minutes`,
            progressTracking: !!req.progressTracker
        });
    }
    catch (error) {
        next(error);
    }
});
// Decompress endpoint
router.post('/decompress', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            throw (0, errorHandler_1.createError)('No file provided', 400, 'NO_FILE');
        }
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        const jobId = (0, uuid_1.v4)();
        const job = {
            id: jobId,
            userId: req.user.id,
            type: 'decompress',
            status: 'pending',
            originalFileName: req.file.originalname,
            inputFilePath: req.file.path,
            progress: 0,
            createdAt: new Date()
        };
        jobs.set(jobId, job);
        // Start decompression asynchronously
        processDecompressionJob(jobId).catch(error => {
            console.error(`Decompression job ${jobId} failed:`, error);
            const failedJob = jobs.get(jobId);
            if (failedJob) {
                failedJob.status = 'failed';
                failedJob.error = error.message;
                jobs.set(jobId, failedJob);
            }
        });
        res.status(202).json({
            message: 'Decompression job started',
            jobId,
            status: 'pending'
        });
    }
    catch (error) {
        next(error);
    }
});
// Get job status with detailed error information
router.get('/status/:jobId', (req, res, next) => {
    try {
        const { jobId } = req.params;
        const job = jobs.get(jobId);
        if (!job) {
            const error = ErrorHandler_1.ErrorHandler.createDetailedError('JOB_NOT_FOUND', `Job with ID ${jobId} was not found`, ErrorHandler_1.ErrorCategory.VALIDATION, ErrorHandler_1.ErrorSeverity.MEDIUM, { operation: 'job status check', jobId });
            return res.status(404).json(ErrorHandler_1.ErrorHandler.formatErrorForAPI(error));
        }
        if (!req.user || job.userId !== req.user.id) {
            const error = ErrorHandler_1.ErrorHandler.createDetailedError('ACCESS_DENIED', 'You do not have permission to access this job', ErrorHandler_1.ErrorCategory.NETWORK, ErrorHandler_1.ErrorSeverity.HIGH, { operation: 'job access check', jobId, userId: req.user?.id });
            return res.status(403).json(ErrorHandler_1.ErrorHandler.formatErrorForAPI(error));
        }
        const response = {
            jobId: job.id,
            status: job.status,
            progress: job.progress,
            type: job.type,
            originalFileName: job.originalFileName,
            configuration: job.config,
            metrics: job.metrics,
            createdAt: job.createdAt,
            completedAt: job.completedAt
        };
        // Include error information if job failed
        if (job.status === 'failed') {
            response.error = {
                message: job.error,
                detailedError: job.detailedError,
                recoverySuggestions: job.recoverySuggestions
            };
        }
        // Include warnings if any
        if (job.warnings && job.warnings.length > 0) {
            response.warnings = job.warnings;
        }
        // Add helpful status messages
        switch (job.status) {
            case 'pending':
                response.statusMessage = 'Job is queued and waiting to be processed';
                break;
            case 'processing':
                response.statusMessage = 'Job is currently being processed';
                if (job.progress > 0) {
                    response.statusMessage += ` (${job.progress}% complete)`;
                }
                break;
            case 'completed':
                response.statusMessage = 'Job completed successfully';
                if (job.metrics) {
                    response.statusMessage += ` - Compression ratio: ${job.metrics.compressionRatio.toFixed(1)}%`;
                }
                break;
            case 'failed':
                response.statusMessage = 'Job failed to complete';
                break;
        }
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
// Download result
router.get('/download/:jobId', (req, res, next) => {
    try {
        const { jobId } = req.params;
        const job = jobs.get(jobId);
        if (!job) {
            throw (0, errorHandler_1.createError)('Job not found', 404, 'JOB_NOT_FOUND');
        }
        if (!req.user || job.userId !== req.user.id) {
            throw (0, errorHandler_1.createError)('Access denied', 403, 'ACCESS_DENIED');
        }
        if (job.status !== 'completed' || !job.outputFilePath) {
            throw (0, errorHandler_1.createError)('Job not completed or output file not available', 400, 'JOB_NOT_READY');
        }
        if (!fs.existsSync(job.outputFilePath)) {
            throw (0, errorHandler_1.createError)('Output file not found', 404, 'FILE_NOT_FOUND');
        }
        const fileName = job.type === 'compress'
            ? `${path.parse(job.originalFileName).name}.qf`
            : path.parse(job.originalFileName).name;
        res.download(job.outputFilePath, fileName, (error) => {
            if (error) {
                console.error('Download error:', error);
                next((0, errorHandler_1.createError)('Failed to download file', 500, 'DOWNLOAD_ERROR'));
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// Helper function to process compression jobs with progress tracking
async function processCompressionJob(jobId, progressTracker) {
    const job = jobs.get(jobId);
    if (!job)
        return;
    try {
        job.status = 'processing';
        job.progress = 0;
        jobs.set(jobId, job);
        // Start progress tracking
        if (progressTracker) {
            progressTracker.startCompression();
        }
        // Read input file
        if (progressTracker) {
            progressTracker.setCurrentStep('initialization', 'Reading input file');
        }
        let inputData;
        try {
            inputData = fs.readFileSync(job.inputFilePath);
        }
        catch (error) {
            throw ErrorHandler_1.ErrorHandler.handleFileSystemError('read', job.inputFilePath, error);
        }
        job.progress = 10;
        jobs.set(jobId, job);
        if (progressTracker) {
            progressTracker.updateStepProgress(1.0);
            progressTracker.setCurrentStep('data_analysis', 'Analyzing file characteristics');
        }
        // Create quantum compression engine with job config
        const configData = job.config || {};
        const config = new QuantumConfig_1.QuantumConfig(configData.quantumBitDepth || 8, configData.maxEntanglementLevel || 4, configData.superpositionComplexity || 5, configData.interferenceThreshold || 0.5);
        const engine = new QuantumCompressionEngine_1.QuantumCompressionEngine(config);
        job.progress = 20;
        jobs.set(jobId, job);
        if (progressTracker) {
            progressTracker.updateStepProgress(1.0);
            progressTracker.setCurrentStep('quantum_state_preparation', 'Converting data to quantum states');
        }
        const startTime = Date.now();
        // Compress the data with error handling
        let compressedData;
        try {
            compressedData = engine.compress(inputData, config);
        }
        catch (compressionError) {
            const detailedError = ErrorHandler_1.ErrorHandler.handleCompressionError(job.originalFileName, inputData.length, config.toObject(), compressionError, { operation: 'quantum compression', jobId });
            if (progressTracker) {
                progressTracker.addError(detailedError.userFriendlyMessage);
                progressTracker.abort('Compression failed');
            }
            throw detailedError;
        }
        job.progress = 70;
        jobs.set(jobId, job);
        if (progressTracker) {
            progressTracker.setCurrentStep('data_encoding', 'Encoding compressed data');
            progressTracker.updateStepProgress(0.5);
        }
        // Save compressed file
        const outputDir = path.join(process.cwd(), 'outputs');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputFileName = `${jobId}.qf`;
        const outputFilePath = path.join(outputDir, outputFileName);
        try {
            // Use proper serialization method
            const serializedData = compressedData.serialize();
            fs.writeFileSync(outputFilePath, serializedData);
        }
        catch (error) {
            throw ErrorHandler_1.ErrorHandler.handleFileSystemError('write', outputFilePath, error);
        }
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        job.progress = 90;
        jobs.set(jobId, job);
        if (progressTracker) {
            progressTracker.updateStepProgress(1.0);
        }
        // Get compression metrics
        const metrics = engine.getCompressionMetrics();
        const compressedSize = fs.statSync(outputFilePath).size;
        // Update job with completion info
        job.status = 'completed';
        job.progress = 100;
        job.outputFilePath = outputFilePath;
        job.completedAt = new Date();
        job.metrics = {
            originalSize: inputData.length,
            compressedSize,
            compressionRatio: ((inputData.length - compressedSize) / inputData.length) * 100,
            processingTime,
            quantumEfficiency: metrics.getQuantumEfficiency()
        };
        jobs.set(jobId, job);
        if (progressTracker) {
            progressTracker.complete(`Compression completed successfully`);
        }
        // Clean up input file
        try {
            if (fs.existsSync(job.inputFilePath)) {
                fs.unlinkSync(job.inputFilePath);
            }
        }
        catch (error) {
            console.warn(`Failed to clean up input file ${job.inputFilePath}:`, error);
            // Don't fail the job for cleanup errors
        }
    }
    catch (error) {
        job.status = 'failed';
        if (error && typeof error === 'object' && 'userFriendlyMessage' in error) {
            // It's a DetailedError
            const detailedError = error;
            job.error = detailedError.userFriendlyMessage;
            job.detailedError = ErrorHandler_1.ErrorHandler.formatErrorForAPI(detailedError);
            job.recoverySuggestions = detailedError.recoverySuggestions.map((s) => s.description);
        }
        else {
            job.error = error instanceof Error ? error.message : 'Unknown compression error';
        }
        jobs.set(jobId, job);
        if (progressTracker) {
            progressTracker.abort(job.error);
        }
        throw error;
    }
}
// Helper function to process decompression jobs
async function processDecompressionJob(jobId) {
    const job = jobs.get(jobId);
    if (!job)
        return;
    try {
        job.status = 'processing';
        job.progress = 10;
        jobs.set(jobId, job);
        // Read compressed file
        const compressedDataStr = fs.readFileSync(job.inputFilePath, 'utf8');
        job.progress = 30;
        jobs.set(jobId, job);
        // Parse compressed data
        const compressedData = JSON.parse(compressedDataStr);
        job.progress = 50;
        jobs.set(jobId, job);
        // Create quantum compression engine
        const config = new QuantumConfig_1.QuantumConfig();
        const engine = new QuantumCompressionEngine_1.QuantumCompressionEngine(config);
        const startTime = Date.now();
        // Decompress the data
        const decompressedData = engine.decompress(compressedData);
        job.progress = 80;
        jobs.set(jobId, job);
        // Save decompressed file
        const outputDir = path.join(process.cwd(), 'outputs');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputFileName = `${jobId}_decompressed`;
        const outputFilePath = path.join(outputDir, outputFileName);
        fs.writeFileSync(outputFilePath, decompressedData);
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        // Update job with completion info
        job.status = 'completed';
        job.progress = 100;
        job.outputFilePath = outputFilePath;
        job.completedAt = new Date();
        job.metrics = {
            originalSize: compressedDataStr.length,
            compressedSize: decompressedData.length,
            compressionRatio: 0, // Not applicable for decompression
            processingTime
        };
        jobs.set(jobId, job);
        // Clean up input file
        if (fs.existsSync(job.inputFilePath)) {
            fs.unlinkSync(job.inputFilePath);
        }
    }
    catch (error) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        jobs.set(jobId, job);
        throw error;
    }
}
//# sourceMappingURL=compression.js.map