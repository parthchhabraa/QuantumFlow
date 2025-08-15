import request from 'supertest';
import express from 'express';
import { batchRoutes } from '../routes/batch';
import { authMiddleware } from '../middleware/auth';
import { errorHandler } from '../middleware/errorHandler';

// Mock the services
jest.mock('../services/BatchProcessor');
jest.mock('../services/CloudStorageService');
jest.mock('../services/CloudAuthService');

// Mock multer
jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    array: jest.fn(() => (req: any, res: any, next: any) => {
      req.files = [
        {
          originalname: 'test1.txt',
          path: '/tmp/test1.txt',
          size: 1024
        },
        {
          originalname: 'test2.txt',
          path: '/tmp/test2.txt',
          size: 2048
        }
      ];
      next();
    }),
    single: jest.fn(() => (req: any, res: any, next: any) => {
      req.file = {
        originalname: 'test.txt',
        path: '/tmp/test.txt',
        size: 1024
      };
      next();
    })
  }));
  multer.diskStorage = jest.fn();
  return multer;
});

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}));

describe('Batch Routes', () => {
  let app: express.Application;
  let mockBatchProcessor: any;
  let mockCloudAuthService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware to add user to request
    app.use((req: any, res, next) => {
      req.user = { id: 'test-user-123', email: 'test@example.com' };
      next();
    });
    
    app.use('/api/batch', batchRoutes);
    app.use(errorHandler);

    // Setup mocks
    const { BatchProcessor } = require('../services/BatchProcessor');
    const { CloudAuthService } = require('../services/CloudAuthService');
    
    mockBatchProcessor = {
      createBatchJob: jest.fn().mockReturnValue('job-123'),
      getJob: jest.fn(),
      getUserJobs: jest.fn().mockReturnValue([]),
      cancelJob: jest.fn().mockReturnValue(true),
      getQueueStatus: jest.fn().mockReturnValue({
        queueLength: 2,
        processingJobs: 1,
        maxConcurrent: 3
      })
    };

    mockCloudAuthService = {
      validateCredentials: jest.fn().mockReturnValue(true)
    };

    BatchProcessor.mockImplementation(() => mockBatchProcessor);
    CloudAuthService.mockImplementation(() => mockCloudAuthService);

    jest.clearAllMocks();
  });

  describe('POST /compress', () => {
    it('should create batch compression job successfully', async () => {
      const response = await request(app)
        .post('/api/batch/compress')
        .field('priority', '5')
        .field('quantumBitDepth', '8')
        .field('maxEntanglementLevel', '4')
        .attach('files', Buffer.from('test content 1'), 'test1.txt')
        .attach('files', Buffer.from('test content 2'), 'test2.txt');

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('message', 'Batch compression job created');
      expect(response.body).toHaveProperty('jobId', 'job-123');
      expect(response.body).toHaveProperty('filesCount', 2);
      expect(response.body).toHaveProperty('status', 'pending');

      expect(mockBatchProcessor.createBatchJob).toHaveBeenCalledWith(
        'test-user-123',
        'compress',
        expect.arrayContaining([
          expect.objectContaining({
            originalName: 'test1.txt',
            sourcePath: '/tmp/test1.txt'
          }),
          expect.objectContaining({
            originalName: 'test2.txt',
            sourcePath: '/tmp/test2.txt'
          })
        ]),
        expect.any(Object), // QuantumConfig
        undefined, // No cloud config
        5 // Priority
      );
    });

    it('should create batch compression job with cloud storage', async () => {
      const cloudCredentials = JSON.stringify({
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
        region: 'us-east-1'
      });

      const cloudConfig = JSON.stringify({
        sourceBucket: 'test-bucket',
        destinationBucket: 'output-bucket'
      });

      const response = await request(app)
        .post('/api/batch/compress')
        .field('cloudProvider', 'aws-s3')
        .field('cloudCredentials', cloudCredentials)
        .field('cloudConfig', cloudConfig)
        .attach('files', Buffer.from('test content'), 'test.txt');

      expect(response.status).toBe(202);
      expect(mockCloudAuthService.validateCredentials).toHaveBeenCalledWith(
        'aws-s3',
        JSON.parse(cloudCredentials)
      );
    });

    it('should return 400 when no files provided', async () => {
      const response = await request(app)
        .post('/api/batch/compress');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'NO_FILES');
    });

    it('should return 400 when cloud credentials are invalid', async () => {
      mockCloudAuthService.validateCredentials.mockReturnValue(false);

      const response = await request(app)
        .post('/api/batch/compress')
        .field('cloudProvider', 'aws-s3')
        .field('cloudCredentials', JSON.stringify({ invalid: 'credentials' }))
        .attach('files', Buffer.from('test content'), 'test.txt');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'INVALID_CREDENTIALS');
    });
  });

  describe('POST /decompress', () => {
    it('should create batch decompression job successfully', async () => {
      const response = await request(app)
        .post('/api/batch/decompress')
        .attach('files', Buffer.from('compressed content'), 'test.qf');

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('message', 'Batch decompression job created');
      expect(response.body).toHaveProperty('jobId', 'job-123');

      expect(mockBatchProcessor.createBatchJob).toHaveBeenCalledWith(
        'test-user-123',
        'decompress',
        expect.arrayContaining([
          expect.objectContaining({
            originalName: 'test.qf',
            sourcePath: '/tmp/test.qf'
          })
        ]),
        expect.any(Object),
        undefined,
        0 // Default priority
      );
    });
  });

  describe('POST /cloud/:provider', () => {
    it('should create batch job from cloud storage', async () => {
      const requestBody = {
        type: 'compress',
        filePaths: ['/cloud/file1.txt', '/cloud/file2.txt'],
        priority: 3,
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret',
          region: 'us-east-1'
        },
        sourceBucket: 'source-bucket',
        destinationBucket: 'dest-bucket'
      };

      const response = await request(app)
        .post('/api/batch/cloud/aws-s3')
        .send(requestBody);

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('message', 'Batch compress job created from aws-s3');
      expect(response.body).toHaveProperty('filesCount', 2);

      expect(mockBatchProcessor.createBatchJob).toHaveBeenCalledWith(
        'test-user-123',
        'compress',
        expect.arrayContaining([
          expect.objectContaining({
            originalName: 'file1.txt',
            cloudSourcePath: '/cloud/file1.txt'
          }),
          expect.objectContaining({
            originalName: 'file2.txt',
            cloudSourcePath: '/cloud/file2.txt'
          })
        ]),
        expect.any(Object),
        expect.objectContaining({
          provider: 'aws-s3',
          credentials: requestBody.credentials
        }),
        3
      );
    });

    it('should return 400 for invalid job type', async () => {
      const response = await request(app)
        .post('/api/batch/cloud/aws-s3')
        .send({
          type: 'invalid-type',
          filePaths: ['/cloud/file.txt'],
          credentials: { accessKeyId: 'key' }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'INVALID_TYPE');
    });

    it('should return 400 when required parameters are missing', async () => {
      const response = await request(app)
        .post('/api/batch/cloud/aws-s3')
        .send({
          type: 'compress'
          // Missing filePaths
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'MISSING_PARAMETERS');
    });
  });

  describe('GET /status/:jobId', () => {
    it('should return job status successfully', async () => {
      const mockJob = {
        id: 'job-123',
        userId: 'test-user-123',
        type: 'compress',
        status: 'processing',
        progress: 50,
        priority: 5,
        files: [
          {
            id: 'file-1',
            originalName: 'test.txt',
            status: 'completed',
            progress: 100,
            metrics: { originalSize: 1024, processedSize: 512, processingTime: 1000 }
          }
        ],
        metrics: {
          totalFiles: 1,
          completedFiles: 1,
          failedFiles: 0,
          totalOriginalSize: 1024,
          totalProcessedSize: 512,
          averageCompressionRatio: 50,
          totalProcessingTime: 1000
        },
        createdAt: new Date(),
        startedAt: new Date(),
        completedAt: null
      };

      mockBatchProcessor.getJob.mockReturnValue(mockJob);

      const response = await request(app)
        .get('/api/batch/status/job-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jobId', 'job-123');
      expect(response.body).toHaveProperty('type', 'compress');
      expect(response.body).toHaveProperty('status', 'processing');
      expect(response.body).toHaveProperty('progress', 50);
      expect(response.body).toHaveProperty('files');
      expect(response.body.files).toHaveLength(1);
    });

    it('should return 404 for non-existent job', async () => {
      mockBatchProcessor.getJob.mockReturnValue(undefined);

      const response = await request(app)
        .get('/api/batch/status/non-existent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'JOB_NOT_FOUND');
    });

    it('should return 403 for job belonging to different user', async () => {
      const mockJob = {
        id: 'job-123',
        userId: 'different-user',
        type: 'compress'
      };

      mockBatchProcessor.getJob.mockReturnValue(mockJob);

      const response = await request(app)
        .get('/api/batch/status/job-123');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'ACCESS_DENIED');
    });
  });

  describe('GET /jobs', () => {
    it('should return user jobs successfully', async () => {
      const mockJobs = [
        {
          id: 'job-1',
          type: 'compress',
          status: 'completed',
          progress: 100,
          priority: 0,
          files: [{ id: 'file-1' }],
          createdAt: new Date()
        },
        {
          id: 'job-2',
          type: 'decompress',
          status: 'processing',
          progress: 50,
          priority: 5,
          files: [{ id: 'file-2' }, { id: 'file-3' }],
          createdAt: new Date()
        }
      ];

      mockBatchProcessor.getUserJobs.mockReturnValue(mockJobs);

      const response = await request(app)
        .get('/api/batch/jobs');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jobs');
      expect(response.body.jobs).toHaveLength(2);
      expect(response.body).toHaveProperty('total', 2);
      expect(response.body).toHaveProperty('limit', 50);
      expect(response.body).toHaveProperty('offset', 0);
    });

    it('should filter jobs by status', async () => {
      mockBatchProcessor.getUserJobs.mockReturnValue([
        { id: 'job-1', status: 'completed' },
        { id: 'job-2', status: 'processing' }
      ]);

      const response = await request(app)
        .get('/api/batch/jobs?status=completed');

      expect(response.status).toBe(200);
      expect(response.body.jobs).toHaveLength(1);
      expect(response.body.jobs[0].status).toBe('completed');
    });

    it('should apply pagination', async () => {
      const mockJobs = Array.from({ length: 10 }, (_, i) => ({
        id: `job-${i}`,
        createdAt: new Date(Date.now() - i * 1000) // Different timestamps for sorting
      }));

      mockBatchProcessor.getUserJobs.mockReturnValue(mockJobs);

      const response = await request(app)
        .get('/api/batch/jobs?limit=5&offset=2');

      expect(response.status).toBe(200);
      expect(response.body.jobs).toHaveLength(5);
      expect(response.body.limit).toBe(5);
      expect(response.body.offset).toBe(2);
      expect(response.body.total).toBe(10);
    });
  });

  describe('POST /cancel/:jobId', () => {
    it('should cancel job successfully', async () => {
      const mockJob = {
        id: 'job-123',
        userId: 'test-user-123',
        status: 'pending'
      };

      mockBatchProcessor.getJob.mockReturnValue(mockJob);
      mockBatchProcessor.cancelJob.mockReturnValue(true);

      const response = await request(app)
        .post('/api/batch/cancel/job-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Job cancelled successfully');
      expect(response.body).toHaveProperty('jobId', 'job-123');
      expect(response.body).toHaveProperty('status', 'cancelled');

      expect(mockBatchProcessor.cancelJob).toHaveBeenCalledWith('job-123');
    });

    it('should return 400 when job cannot be cancelled', async () => {
      const mockJob = {
        id: 'job-123',
        userId: 'test-user-123',
        status: 'completed'
      };

      mockBatchProcessor.getJob.mockReturnValue(mockJob);
      mockBatchProcessor.cancelJob.mockReturnValue(false);

      const response = await request(app)
        .post('/api/batch/cancel/job-123');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'CANNOT_CANCEL');
    });
  });

  describe('GET /queue/status', () => {
    it('should return queue status successfully', async () => {
      const response = await request(app)
        .get('/api/batch/queue/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('queueLength', 2);
      expect(response.body).toHaveProperty('processingJobs', 1);
      expect(response.body).toHaveProperty('maxConcurrent', 3);
      expect(response.body).toHaveProperty('timestamp');

      expect(mockBatchProcessor.getQueueStatus).toHaveBeenCalled();
    });
  });
});