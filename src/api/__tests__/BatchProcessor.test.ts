import { BatchProcessor, BatchJob, CloudStorageConfig } from '../services/BatchProcessor';
import { QuantumConfig } from '../../models/QuantumConfig';

// Mock the QuantumCompressionEngine
jest.mock('../../core/QuantumCompressionEngine', () => ({
  QuantumCompressionEngine: jest.fn().mockImplementation(() => ({
    compress: jest.fn().mockReturnValue({ mockCompressedData: true }),
    decompress: jest.fn().mockReturnValue(Buffer.from('mock decompressed data'))
  }))
}));

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock file content')),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}));

describe('BatchProcessor', () => {
  let batchProcessor: BatchProcessor;
  let mockConfig: QuantumConfig;

  beforeEach(() => {
    batchProcessor = new BatchProcessor();
    mockConfig = new QuantumConfig(8, 4, 5, 0.5);
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any running processes
    batchProcessor.removeAllListeners();
  });

  describe('createBatchJob', () => {
    it('should create a batch compression job successfully', () => {
      const files = [
        {
          originalName: 'test1.txt',
          sourcePath: '/path/to/test1.txt'
        },
        {
          originalName: 'test2.txt',
          sourcePath: '/path/to/test2.txt'
        }
      ];

      const jobId = batchProcessor.createBatchJob(
        'user123',
        'compress',
        files,
        mockConfig
      );

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');

      const job = batchProcessor.getJob(jobId);
      expect(job).toBeDefined();
      expect(job?.userId).toBe('user123');
      expect(job?.type).toBe('compress');
      expect(job?.status).toBe('pending');
      expect(job?.files).toHaveLength(2);
      expect(job?.files[0].originalName).toBe('test1.txt');
      expect(job?.files[1].originalName).toBe('test2.txt');
    });

    it('should create a batch decompression job successfully', () => {
      const files = [
        {
          originalName: 'test1.qf',
          sourcePath: '/path/to/test1.qf'
        }
      ];

      const jobId = batchProcessor.createBatchJob(
        'user456',
        'decompress',
        files,
        mockConfig
      );

      const job = batchProcessor.getJob(jobId);
      expect(job?.type).toBe('decompress');
      expect(job?.userId).toBe('user456');
    });

    it('should create a batch job with cloud storage configuration', () => {
      const files = [
        {
          originalName: 'cloud-test.txt',
          sourcePath: '/local/path/cloud-test.txt',
          cloudSourcePath: 's3://bucket/cloud-test.txt',
          cloudDestinationPath: 's3://bucket/compressed/cloud-test.txt.qf'
        }
      ];

      const cloudConfig: CloudStorageConfig = {
        provider: 'aws-s3',
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret',
          region: 'us-east-1'
        },
        sourceBucket: 'test-bucket',
        destinationBucket: 'test-bucket'
      };

      const jobId = batchProcessor.createBatchJob(
        'user789',
        'compress',
        files,
        mockConfig,
        cloudConfig,
        5 // high priority
      );

      const job = batchProcessor.getJob(jobId);
      expect(job?.cloudConfig).toEqual(cloudConfig);
      expect(job?.priority).toBe(5);
      expect(job?.files[0].cloudSourcePath).toBe('s3://bucket/cloud-test.txt');
    });

    it('should emit jobCreated event when job is created', (done) => {
      const files = [{ originalName: 'test.txt', sourcePath: '/path/test.txt' }];

      batchProcessor.on('jobCreated', (job: BatchJob) => {
        expect(job.type).toBe('compress');
        expect(job.files).toHaveLength(1);
        done();
      });

      batchProcessor.createBatchJob('user123', 'compress', files, mockConfig);
    });
  });

  describe('getJob', () => {
    it('should return undefined for non-existent job', () => {
      const job = batchProcessor.getJob('non-existent-id');
      expect(job).toBeUndefined();
    });

    it('should return the correct job for valid job ID', () => {
      const files = [{ originalName: 'test.txt', sourcePath: '/path/test.txt' }];
      const jobId = batchProcessor.createBatchJob('user123', 'compress', files, mockConfig);

      const job = batchProcessor.getJob(jobId);
      expect(job).toBeDefined();
      expect(job?.id).toBe(jobId);
    });
  });

  describe('getUserJobs', () => {
    it('should return empty array for user with no jobs', () => {
      const jobs = batchProcessor.getUserJobs('user-no-jobs');
      expect(jobs).toEqual([]);
    });

    it('should return only jobs for the specified user', () => {
      const files = [{ originalName: 'test.txt', sourcePath: '/path/test.txt' }];
      
      const jobId1 = batchProcessor.createBatchJob('user1', 'compress', files, mockConfig);
      const jobId2 = batchProcessor.createBatchJob('user2', 'compress', files, mockConfig);
      const jobId3 = batchProcessor.createBatchJob('user1', 'decompress', files, mockConfig);

      const user1Jobs = batchProcessor.getUserJobs('user1');
      const user2Jobs = batchProcessor.getUserJobs('user2');

      expect(user1Jobs).toHaveLength(2);
      expect(user2Jobs).toHaveLength(1);
      expect(user1Jobs.map(j => j.id)).toContain(jobId1);
      expect(user1Jobs.map(j => j.id)).toContain(jobId3);
      expect(user2Jobs[0].id).toBe(jobId2);
    });
  });

  describe('cancelJob', () => {
    it('should cancel a pending job successfully', () => {
      const files = [{ originalName: 'test.txt', sourcePath: '/path/test.txt' }];
      const jobId = batchProcessor.createBatchJob('user123', 'compress', files, mockConfig);

      const cancelled = batchProcessor.cancelJob(jobId);
      expect(cancelled).toBe(true);

      const job = batchProcessor.getJob(jobId);
      expect(job?.status).toBe('cancelled');
    });

    it('should return false for non-existent job', () => {
      const cancelled = batchProcessor.cancelJob('non-existent-id');
      expect(cancelled).toBe(false);
    });

    it('should emit jobCancelled event when job is cancelled', (done) => {
      const files = [{ originalName: 'test.txt', sourcePath: '/path/test.txt' }];
      const jobId = batchProcessor.createBatchJob('user123', 'compress', files, mockConfig);

      batchProcessor.on('jobCancelled', (job: BatchJob) => {
        expect(job.id).toBe(jobId);
        expect(job.status).toBe('cancelled');
        done();
      });

      batchProcessor.cancelJob(jobId);
    });
  });

  describe('getQueueStatus', () => {
    it('should return correct queue status', () => {
      const files = [{ originalName: 'test.txt', sourcePath: '/path/test.txt' }];
      
      // Create a few jobs
      batchProcessor.createBatchJob('user1', 'compress', files, mockConfig);
      batchProcessor.createBatchJob('user2', 'compress', files, mockConfig);

      const status = batchProcessor.getQueueStatus();
      
      expect(status).toHaveProperty('queueLength');
      expect(status).toHaveProperty('processingJobs');
      expect(status).toHaveProperty('maxConcurrent');
      expect(typeof status.queueLength).toBe('number');
      expect(typeof status.processingJobs).toBe('number');
      expect(status.maxConcurrent).toBe(3);
    });
  });

  describe('job processing', () => {
    it('should process compression job and update status', (done) => {
      const files = [{ originalName: 'test.txt', sourcePath: '/path/test.txt' }];
      const jobId = batchProcessor.createBatchJob('user123', 'compress', files, mockConfig);

      let jobStartedEmitted = false;
      let jobCompletedEmitted = false;

      batchProcessor.on('jobStarted', (job: BatchJob) => {
        expect(job.id).toBe(jobId);
        expect(job.status).toBe('processing');
        jobStartedEmitted = true;
      });

      batchProcessor.on('jobCompleted', (job: BatchJob) => {
        expect(job.id).toBe(jobId);
        expect(job.status).toBe('completed');
        expect(job.metrics).toBeDefined();
        expect(job.metrics?.totalFiles).toBe(1);
        expect(job.metrics?.completedFiles).toBe(1);
        jobCompletedEmitted = true;

        // Verify both events were emitted
        expect(jobStartedEmitted).toBe(true);
        expect(jobCompletedEmitted).toBe(true);
        done();
      });

      // Wait a bit for processing to start
      setTimeout(() => {
        const job = batchProcessor.getJob(jobId);
        expect(job?.status).toMatch(/processing|completed/);
      }, 100);
    }, 10000); // Increase timeout for async processing

    it('should handle job processing errors gracefully', (done) => {
      // Mock fs.readFileSync to throw an error
      const fs = require('fs');
      fs.readFileSync.mockImplementationOnce(() => {
        throw new Error('File not found');
      });

      const files = [{ originalName: 'missing.txt', sourcePath: '/path/missing.txt' }];
      const jobId = batchProcessor.createBatchJob('user123', 'compress', files, mockConfig);

      batchProcessor.on('jobFailed', ({ job, error }) => {
        expect(job.id).toBe(jobId);
        expect(job.status).toBe('failed');
        expect(error).toBeDefined();
        done();
      });
    }, 10000);
  });
});