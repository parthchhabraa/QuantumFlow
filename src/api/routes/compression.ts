import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { QuantumCompressionEngine } from '../../core/QuantumCompressionEngine';
import { QuantumConfig } from '../../models/QuantumConfig';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError, handleFileUploadError, handleCompressionAPIError } from '../middleware/errorHandler';
import { ErrorHandler, ErrorCategory, ErrorSeverity } from '../../core/ErrorHandler';
import { ConfigurationValidator } from '../../core/ConfigurationValidator';
import { ProgressTracker, progressTrackingMiddleware, progressCleanupMiddleware, ProgressRequest } from '../middleware/progressTracker';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
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
const handleMulterError = (error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    const detailedError = handleFileUploadError(
      error,
      req.body?.originalname || 'unknown',
      req.body?.size || 0,
      req
    );
    return res.status(400).json(ErrorHandler.formatErrorForAPI(detailedError));
  }
  next(error);
};

// Job tracking with enhanced error information
interface CompressionJob {
  id: string;
  userId: string;
  type: 'compress' | 'decompress';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalFileName: string;
  inputFilePath: string;
  outputFilePath?: string;
  progress: number;
  error?: string;
  detailedError?: any; // Store detailed error information
  config?: any; // Store compression configuration
  metrics?: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    processingTime: number;
    quantumEfficiency?: number;
  };
  warnings?: string[];
  recoverySuggestions?: string[];
  createdAt: Date;
  completedAt?: Date;
}

const jobs: Map<string, CompressionJob> = new Map();

// Apply progress tracking middleware
router.use(progressTrackingMiddleware);
router.use(progressCleanupMiddleware);

// Compress endpoint with enhanced error handling and progress tracking
router.post('/compress', handleMulterError, upload.single('file'), async (req: ProgressRequest & AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.file) {
      const error = ErrorHandler.createDetailedError(
        'NO_FILE_PROVIDED',
        'No file was provided for compression',
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        { operation: 'file upload', endpoint: req.path }
      );
      return res.status(400).json(ErrorHandler.formatErrorForAPI(error));
    }

    if (!req.user) {
      const error = ErrorHandler.createDetailedError(
        'NOT_AUTHENTICATED',
        'User authentication required',
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH,
        { operation: 'authentication', endpoint: req.path }
      );
      return res.status(401).json(ErrorHandler.formatErrorForAPI(error));
    }

    // Validate and parse quantum configuration from request
    let config: QuantumConfig;
    try {
      const configData = {
        quantumBitDepth: parseInt(req.body.quantumBitDepth) || 8,
        maxEntanglementLevel: parseInt(req.body.maxEntanglementLevel) || 4,
        superpositionComplexity: parseInt(req.body.superpositionComplexity) || 5,
        interferenceThreshold: parseFloat(req.body.interferenceThreshold) || 0.5
      };

      // Validate configuration
      const validationResult = ConfigurationValidator.validateConfiguration(
        configData,
        {
          size: req.file.size,
          dataType: req.body.dataType || 'binary'
        }
      );

      if (!validationResult.isValid) {
        const error = ErrorHandler.createDetailedError(
          'INVALID_CONFIGURATION',
          'Invalid quantum compression configuration',
          ErrorCategory.CONFIGURATION,
          ErrorSeverity.MEDIUM,
          { 
            operation: 'configuration validation',
            config: configData,
            validationErrors: validationResult.errors
          }
        );
        return res.status(400).json({
          ...ErrorHandler.formatErrorForAPI(error),
          validationResult: ConfigurationValidator.formatValidationResult(validationResult)
        });
      }

      config = validationResult.optimizedConfig || new QuantumConfig(
        configData.quantumBitDepth,
        configData.maxEntanglementLevel,
        configData.superpositionComplexity,
        configData.interferenceThreshold
      );

      // Send configuration warnings if any
      if (validationResult.warnings.length > 0) {
        res.set('X-Configuration-Warnings', JSON.stringify(validationResult.warnings));
      }

    } catch (configError) {
      const error = ErrorHandler.handleConfigurationError(
        'configuration',
        req.body,
        { min: 'various', max: 'various' },
        { operation: 'configuration parsing' }
      );
      return res.status(400).json(ErrorHandler.formatErrorForAPI(error));
    }

    const jobId = uuidv4();
    const job: CompressionJob = {
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
        const detailedError = handleCompressionAPIError(
          error,
          failedJob.originalFileName,
          fs.statSync(failedJob.inputFilePath).size,
          failedJob.config,
          req
        );
        
        failedJob.status = 'failed';
        failedJob.error = detailedError.userFriendlyMessage;
        failedJob.detailedError = ErrorHandler.formatErrorForAPI(detailedError);
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
  } catch (error) {
    next(error);
  }
});

// Decompress endpoint
router.post('/decompress', upload.single('file'), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.file) {
      throw createError('No file provided', 400, 'NO_FILE');
    }

    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const jobId = uuidv4();
    const job: CompressionJob = {
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
  } catch (error) {
    next(error);
  }
});

// Get job status with detailed error information
router.get('/status/:jobId', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      const error = ErrorHandler.createDetailedError(
        'JOB_NOT_FOUND',
        `Job with ID ${jobId} was not found`,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        { operation: 'job status check', jobId }
      );
      return res.status(404).json(ErrorHandler.formatErrorForAPI(error));
    }

    if (!req.user || job.userId !== req.user.id) {
      const error = ErrorHandler.createDetailedError(
        'ACCESS_DENIED',
        'You do not have permission to access this job',
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH,
        { operation: 'job access check', jobId, userId: req.user?.id }
      );
      return res.status(403).json(ErrorHandler.formatErrorForAPI(error));
    }

    const response: any = {
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
  } catch (error) {
    next(error);
  }
});

// Download result
router.get('/download/:jobId', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      throw createError('Job not found', 404, 'JOB_NOT_FOUND');
    }

    if (!req.user || job.userId !== req.user.id) {
      throw createError('Access denied', 403, 'ACCESS_DENIED');
    }

    if (job.status !== 'completed' || !job.outputFilePath) {
      throw createError('Job not completed or output file not available', 400, 'JOB_NOT_READY');
    }

    if (!fs.existsSync(job.outputFilePath)) {
      throw createError('Output file not found', 404, 'FILE_NOT_FOUND');
    }

    const fileName = job.type === 'compress' 
      ? `${path.parse(job.originalFileName).name}.qf`
      : path.parse(job.originalFileName).name;

    res.download(job.outputFilePath, fileName, (error) => {
      if (error) {
        console.error('Download error:', error);
        next(createError('Failed to download file', 500, 'DOWNLOAD_ERROR'));
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to process compression jobs with progress tracking
async function processCompressionJob(jobId: string, progressTracker?: ProgressTracker): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

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
    
    let inputData: Buffer;
    try {
      inputData = fs.readFileSync(job.inputFilePath);
    } catch (error) {
      throw ErrorHandler.handleFileSystemError('read', job.inputFilePath, error as Error);
    }
    
    job.progress = 10;
    jobs.set(jobId, job);

    if (progressTracker) {
      progressTracker.updateStepProgress(1.0);
      progressTracker.setCurrentStep('data_analysis', 'Analyzing file characteristics');
    }

    // Create quantum compression engine with job config
    const configData = job.config || {};
    const config = new QuantumConfig(
      configData.quantumBitDepth || 8,
      configData.maxEntanglementLevel || 4,
      configData.superpositionComplexity || 5,
      configData.interferenceThreshold || 0.5
    );
    
    const engine = new QuantumCompressionEngine(config);
    
    job.progress = 20;
    jobs.set(jobId, job);

    if (progressTracker) {
      progressTracker.updateStepProgress(1.0);
      progressTracker.setCurrentStep('quantum_state_preparation', 'Converting data to quantum states');
    }

    const startTime = Date.now();
    
    // Compress the data with error handling
    let compressedData: any;
    try {
      compressedData = engine.compress(inputData, config);
    } catch (compressionError) {
      const detailedError = ErrorHandler.handleCompressionError(
        job.originalFileName,
        inputData.length,
        config.toObject(),
        compressionError as Error,
        { operation: 'quantum compression', jobId }
      );
      
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
    } catch (error) {
      throw ErrorHandler.handleFileSystemError('write', outputFilePath, error as Error);
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
    } catch (error) {
      console.warn(`Failed to clean up input file ${job.inputFilePath}:`, error);
      // Don't fail the job for cleanup errors
    }

  } catch (error) {
    job.status = 'failed';
    
    if (error && typeof error === 'object' && 'userFriendlyMessage' in error) {
      // It's a DetailedError
      const detailedError = error as any;
      job.error = detailedError.userFriendlyMessage;
      job.detailedError = ErrorHandler.formatErrorForAPI(detailedError);
      job.recoverySuggestions = detailedError.recoverySuggestions.map((s: any) => s.description);
    } else {
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
async function processDecompressionJob(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

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
    const config = new QuantumConfig();
    const engine = new QuantumCompressionEngine(config);

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
  } catch (error) {
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';
    jobs.set(jobId, job);
    throw error;
  }
}

export { router as compressionRoutes };