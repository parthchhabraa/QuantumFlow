import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { BatchProcessor, CloudStorageConfig } from '../services/BatchProcessor';
import { CloudStorageService } from '../services/CloudStorageService';
import { CloudAuthService } from '../services/CloudAuthService';
import { QuantumConfig } from '../../models/QuantumConfig';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Initialize services
const batchProcessor = new BatchProcessor();
const cloudStorageService = new CloudStorageService();
const cloudAuthService = new CloudAuthService();

// Configure multer for batch file uploads
const batchStorage = multer.diskStorage({
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

const batchUpload = multer({
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
router.post('/compress', batchUpload.array('files', 50), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw createError('No files provided', 400, 'NO_FILES');
    }

    const {
      priority = 0,
      quantumBitDepth = 8,
      maxEntanglementLevel = 4,
      superpositionComplexity = 5,
      interferenceThreshold = 0.5,
      cloudProvider,
      cloudCredentials,
      cloudConfig
    } = req.body;

    // Create quantum configuration
    const compressionConfig = new QuantumConfig(
      quantumBitDepth,
      maxEntanglementLevel,
      superpositionComplexity,
      interferenceThreshold
    );

    // Parse cloud configuration if provided
    let cloudStorageConfig: CloudStorageConfig | undefined;
    if (cloudProvider && cloudCredentials) {
      cloudStorageConfig = {
        provider: cloudProvider,
        credentials: JSON.parse(cloudCredentials),
        ...JSON.parse(cloudConfig || '{}')
      };

      // Validate cloud credentials
      if (!cloudAuthService.validateCredentials(cloudProvider, cloudStorageConfig.credentials)) {
        throw createError('Invalid cloud storage credentials', 400, 'INVALID_CREDENTIALS');
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
    const jobId = batchProcessor.createBatchJob(
      req.user.id,
      'compress',
      files,
      compressionConfig,
      cloudStorageConfig,
      parseInt(priority)
    );

    res.status(202).json({
      message: 'Batch compression job created',
      jobId,
      filesCount: files.length,
      status: 'pending'
    });
  } catch (error) {
    next(error);
  }
});

// Create batch decompression job
router.post('/decompress', batchUpload.array('files', 50), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw createError('No files provided', 400, 'NO_FILES');
    }

    const {
      priority = 0,
      quantumBitDepth = 8,
      maxEntanglementLevel = 4,
      superpositionComplexity = 5,
      interferenceThreshold = 0.5,
      cloudProvider,
      cloudCredentials,
      cloudConfig
    } = req.body;

    // Create quantum configuration
    const compressionConfig = new QuantumConfig(
      quantumBitDepth,
      maxEntanglementLevel,
      superpositionComplexity,
      interferenceThreshold
    );

    // Parse cloud configuration if provided
    let cloudStorageConfig: CloudStorageConfig | undefined;
    if (cloudProvider && cloudCredentials) {
      cloudStorageConfig = {
        provider: cloudProvider,
        credentials: JSON.parse(cloudCredentials),
        ...JSON.parse(cloudConfig || '{}')
      };

      // Validate cloud credentials
      if (!cloudAuthService.validateCredentials(cloudProvider, cloudStorageConfig.credentials)) {
        throw createError('Invalid cloud storage credentials', 400, 'INVALID_CREDENTIALS');
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
    const jobId = batchProcessor.createBatchJob(
      req.user.id,
      'decompress',
      files,
      compressionConfig,
      cloudStorageConfig,
      parseInt(priority)
    );

    res.status(202).json({
      message: 'Batch decompression job created',
      jobId,
      filesCount: files.length,
      status: 'pending'
    });
  } catch (error) {
    next(error);
  }
});

// Create batch job from cloud storage
router.post('/cloud/:provider', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const { provider } = req.params;
    const {
      type, // 'compress' or 'decompress'
      filePaths,
      priority = 0,
      quantumBitDepth = 8,
      maxEntanglementLevel = 4,
      superpositionComplexity = 5,
      interferenceThreshold = 0.5,
      credentials,
      sourceBucket,
      destinationBucket,
      sourceFolder,
      destinationFolder
    } = req.body;

    if (!type || !filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      throw createError('Missing required parameters', 400, 'MISSING_PARAMETERS');
    }

    if (!['compress', 'decompress'].includes(type)) {
      throw createError('Invalid job type', 400, 'INVALID_TYPE');
    }

    // Create quantum configuration
    const compressionConfig = new QuantumConfig(
      quantumBitDepth,
      maxEntanglementLevel,
      superpositionComplexity,
      interferenceThreshold
    );

    // Create cloud configuration
    const cloudStorageConfig: CloudStorageConfig = {
      provider: provider as any,
      credentials,
      sourceBucket,
      destinationBucket,
      sourceFolder,
      destinationFolder
    };

    // Validate cloud credentials
    if (!cloudAuthService.validateCredentials(provider, credentials)) {
      throw createError('Invalid cloud storage credentials', 400, 'INVALID_CREDENTIALS');
    }

    // Prepare file items from cloud paths
    const files = filePaths.map((filePath: string) => ({
      originalName: path.basename(filePath),
      sourcePath: '', // Not used for cloud files
      cloudSourcePath: filePath,
      cloudDestinationPath: type === 'compress' 
        ? `${destinationFolder || 'compressed'}/${path.basename(filePath)}.qf`
        : `${destinationFolder || 'decompressed'}/${path.parse(filePath).name}`
    }));

    // Create batch job
    const jobId = batchProcessor.createBatchJob(
      req.user.id,
      type,
      files,
      compressionConfig,
      cloudStorageConfig,
      parseInt(priority)
    );

    res.status(202).json({
      message: `Batch ${type} job created from ${provider}`,
      jobId,
      filesCount: files.length,
      status: 'pending'
    });
  } catch (error) {
    next(error);
  }
});

// Get batch job status
router.get('/status/:jobId', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const { jobId } = req.params;
    const job = batchProcessor.getJob(jobId);

    if (!job) {
      throw createError('Job not found', 404, 'JOB_NOT_FOUND');
    }

    if (job.userId !== req.user.id) {
      throw createError('Access denied', 403, 'ACCESS_DENIED');
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
  } catch (error) {
    next(error);
  }
});

// Get user's batch jobs
router.get('/jobs', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
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
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
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
  } catch (error) {
    next(error);
  }
});

// Cancel batch job
router.post('/cancel/:jobId', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const { jobId } = req.params;
    const job = batchProcessor.getJob(jobId);

    if (!job) {
      throw createError('Job not found', 404, 'JOB_NOT_FOUND');
    }

    if (job.userId !== req.user.id) {
      throw createError('Access denied', 403, 'ACCESS_DENIED');
    }

    const cancelled = batchProcessor.cancelJob(jobId);

    if (!cancelled) {
      throw createError('Job cannot be cancelled', 400, 'CANNOT_CANCEL');
    }

    res.json({
      message: 'Job cancelled successfully',
      jobId,
      status: 'cancelled'
    });
  } catch (error) {
    next(error);
  }
});

// Get queue status
router.get('/queue/status', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const queueStatus = batchProcessor.getQueueStatus();

    res.json({
      ...queueStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export { router as batchRoutes };