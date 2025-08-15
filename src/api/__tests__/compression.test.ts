import request from 'supertest';
import { QuantumFlowAPIServer } from '../server';
import * as fs from 'fs';
import * as path from 'path';

describe('Compression API', () => {
  let server: QuantumFlowAPIServer;
  let app: any;
  let authToken: string;
  let testFilePath: string;

  beforeAll(async () => {
    server = new QuantumFlowAPIServer(0);
    app = server.getApp();

    // Register and login to get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'compression-test@example.com',
        password: 'password123'
      });

    authToken = registerResponse.body.token;

    // Create a test file
    const testDir = path.join(process.cwd(), 'test-files');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    testFilePath = path.join(testDir, 'test.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for compression testing. '.repeat(100));
  });

  afterAll(() => {
    // Clean up test files
    const testDir = path.join(process.cwd(), 'test-files');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const outputsDir = path.join(process.cwd(), 'outputs');
    
    [testDir, uploadsDir, outputsDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe('POST /api/compression/compress', () => {
    it('should reject compression without authentication', async () => {
      const response = await request(app)
        .post('/api/compression/compress')
        .attach('file', testFilePath)
        .expect(401);

      expect(response.body.error).toContain('Access denied');
    });

    it('should reject compression without file', async () => {
      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'NO_FILE');
    });

    it('should start compression job successfully', async () => {
      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('message', 'Compression job started');
      expect(response.body).toHaveProperty('jobId');
      expect(response.body).toHaveProperty('status', 'pending');
    });

    it('should handle large file uploads', async () => {
      // Create a larger test file
      const largeFilePath = path.join(path.dirname(testFilePath), 'large-test.txt');
      const largeContent = 'Large file content for testing. '.repeat(10000);
      fs.writeFileSync(largeFilePath, largeContent);

      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('jobId');
      
      // Clean up
      fs.unlinkSync(largeFilePath);
    });
  });

  describe('POST /api/compression/decompress', () => {
    it('should reject decompression without authentication', async () => {
      const response = await request(app)
        .post('/api/compression/decompress')
        .attach('file', testFilePath)
        .expect(401);

      expect(response.body.error).toContain('Access denied');
    });

    it('should reject decompression without file', async () => {
      const response = await request(app)
        .post('/api/compression/decompress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'NO_FILE');
    });

    it('should start decompression job successfully', async () => {
      // Create a mock compressed file
      const compressedFilePath = path.join(path.dirname(testFilePath), 'test.qf');
      const mockCompressedData = JSON.stringify({
        quantumStates: [],
        entanglementMap: {},
        interferencePatterns: [],
        metadata: { originalSize: 100 },
        checksum: 'mock-checksum'
      });
      fs.writeFileSync(compressedFilePath, mockCompressedData);

      const response = await request(app)
        .post('/api/compression/decompress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', compressedFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('message', 'Decompression job started');
      expect(response.body).toHaveProperty('jobId');
      expect(response.body).toHaveProperty('status', 'pending');

      // Clean up
      fs.unlinkSync(compressedFilePath);
    });
  });

  describe('GET /api/compression/status/:jobId', () => {
    let jobId: string;

    beforeAll(async () => {
      // Start a compression job
      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath);
      
      jobId = response.body.jobId;
    });

    it('should reject status check without authentication', async () => {
      const response = await request(app)
        .get(`/api/compression/status/${jobId}`)
        .expect(401);

      expect(response.body.error).toContain('Access denied');
    });

    it('should return job status for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/compression/status/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('jobId', jobId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('progress');
      expect(response.body).toHaveProperty('type', 'compress');
    });

    it('should return 404 for non-existent job', async () => {
      const response = await request(app)
        .get('/api/compression/status/non-existent-job-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toHaveProperty('code', 'JOB_NOT_FOUND');
    });

    it('should deny access to other users jobs', async () => {
      // Register another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other-user@example.com',
          password: 'password123'
        });

      const otherUserToken = otherUserResponse.body.token;

      const response = await request(app)
        .get(`/api/compression/status/${jobId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body.error).toHaveProperty('code', 'ACCESS_DENIED');
    });
  });

  describe('GET /api/compression/download/:jobId', () => {
    it('should reject download without authentication', async () => {
      const response = await request(app)
        .get('/api/compression/download/some-job-id')
        .expect(401);

      expect(response.body.error).toContain('Access denied');
    });

    it('should return 404 for non-existent job', async () => {
      const response = await request(app)
        .get('/api/compression/download/non-existent-job-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toHaveProperty('code', 'JOB_NOT_FOUND');
    });

    it('should return 400 for incomplete job', async () => {
      // Start a job but don't wait for completion
      const compressResponse = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath);

      const jobId = compressResponse.body.jobId;

      // Try to download immediately (should fail if job is still processing)
      const response = await request(app)
        .get(`/api/compression/download/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Job might complete quickly, so accept either 400 (not ready) or 200 (completed)
      expect([200, 400]).toContain(response.status);
      
      if (response.status === 400) {
        expect(response.body.error).toHaveProperty('code', 'JOB_NOT_READY');
      }
    });
  });

  describe('File Upload Validation', () => {
    it('should handle file upload errors gracefully', async () => {
      // Test with invalid file path
      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .field('file', 'not-a-file')
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'NO_FILE');
    });
  });

  describe('Progress Tracking', () => {
    it('should track job progress correctly', async () => {
      const compressResponse = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath);

      const jobId = compressResponse.body.jobId;

      // Check initial status
      const statusResponse = await request(app)
        .get(`/api/compression/status/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(statusResponse.body.progress).toBeGreaterThanOrEqual(0);
      expect(statusResponse.body.progress).toBeLessThanOrEqual(100);
    });
  });
});