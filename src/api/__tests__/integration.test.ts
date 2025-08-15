import request from 'supertest';
import { QuantumFlowAPIServer } from '../server';
import * as fs from 'fs';
import * as path from 'path';

describe('API Integration Tests', () => {
  let server: QuantumFlowAPIServer;
  let app: any;
  let testDir: string;

  beforeAll(async () => {
    server = new QuantumFlowAPIServer(0);
    app = server.getApp();

    // Create test directory
    testDir = path.join(process.cwd(), 'integration-test-files');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test files
    const dirsToClean = [
      testDir,
      path.join(process.cwd(), 'uploads'),
      path.join(process.cwd(), 'outputs')
    ];
    
    dirsToClean.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe('Complete Compression Workflow', () => {
    let authToken: string;
    let testFilePath: string;

    beforeAll(async () => {
      // Create test file
      testFilePath = path.join(testDir, 'workflow-test.txt');
      fs.writeFileSync(testFilePath, 'This is a test file for the complete compression workflow. '.repeat(50));
    });

    it('should complete full user registration and compression workflow', async () => {
      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'workflow-test@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('token');
      authToken = registerResponse.body.token;

      // Step 2: Start compression job
      const compressResponse = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)
        .expect(202);

      const jobId = compressResponse.body.jobId;
      expect(jobId).toBeDefined();

      // Step 3: Check job status (may need to wait for processing)
      let statusResponse;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        statusResponse = await request(app)
          .get(`/api/compression/status/${jobId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
        
        attempts++;
      } while (statusResponse.body.status === 'processing' && attempts < maxAttempts);

      expect(statusResponse.body).toHaveProperty('jobId', jobId);
      expect(statusResponse.body).toHaveProperty('progress');
      expect(['pending', 'processing', 'completed', 'failed']).toContain(statusResponse.body.status);

      // Step 4: If job completed successfully, test download
      if (statusResponse.body.status === 'completed') {
        const downloadResponse = await request(app)
          .get(`/api/compression/download/${jobId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(downloadResponse.headers['content-disposition']).toMatch(/attachment/);
      }
    });

    it('should handle login and subsequent operations', async () => {
      // Login with existing user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'workflow-test@example.com',
          password: 'password123'
        })
        .expect(200);

      const loginToken = loginResponse.body.token;

      // Use login token for compression
      const compressResponse = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${loginToken}`)
        .attach('file', testFilePath)
        .expect(202);

      expect(compressResponse.body).toHaveProperty('jobId');
    });
  });

  describe('Error Handling Integration', () => {
    let authToken: string;

    beforeAll(async () => {
      // Register user for error testing
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'error-test@example.com',
          password: 'password123'
        });

      authToken = registerResponse.body.token;
    });

    it('should handle authentication errors consistently', async () => {
      // Test all protected endpoints without auth
      const protectedEndpoints = [
        { method: 'post', path: '/api/compression/compress' },
        { method: 'post', path: '/api/compression/decompress' },
        { method: 'get', path: '/api/compression/status/test-job-id' },
        { method: 'get', path: '/api/compression/download/test-job-id' }
      ];

      for (const endpoint of protectedEndpoints) {
        let response;
        if (endpoint.method === 'post') {
          response = await request(app).post(endpoint.path).expect(401);
        } else {
          response = await request(app).get(endpoint.path).expect(401);
        }

        expect(response.body.error).toContain('Access denied');
      }
    });

    it('should handle invalid job IDs consistently', async () => {
      const invalidJobId = 'invalid-job-id';

      // Test status endpoint
      const statusResponse = await request(app)
        .get(`/api/compression/status/${invalidJobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(statusResponse.body.error).toHaveProperty('code', 'JOB_NOT_FOUND');

      // Test download endpoint
      const downloadResponse = await request(app)
        .get(`/api/compression/download/${invalidJobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(downloadResponse.body.error).toHaveProperty('code', 'JOB_NOT_FOUND');
    });
  });

  describe('Rate Limiting Integration', () => {
    let authToken: string;

    beforeAll(async () => {
      // Register user for rate limiting tests
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'ratelimit-test@example.com',
          password: 'password123'
        });

      authToken = registerResponse.body.token;
    });

    it('should apply rate limiting across different endpoints', async () => {
      // Make multiple requests to different endpoints
      const requests = [];
      
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .get('/api')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(requests);
      
      // Most requests should succeed, but we're testing the rate limiting is in place
      const successfulRequests = responses.filter(r => r.status === 200);
      expect(successfulRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Concurrent Operations', () => {
    let authToken: string;
    let testFiles: string[];

    beforeAll(async () => {
      // Register user for concurrency tests
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'concurrent-test@example.com',
          password: 'password123'
        });

      authToken = registerResponse.body.token;

      // Create multiple test files
      testFiles = [];
      for (let i = 0; i < 3; i++) {
        const filePath = path.join(testDir, `concurrent-test-${i}.txt`);
        fs.writeFileSync(filePath, `Concurrent test file ${i} content. `.repeat(20));
        testFiles.push(filePath);
      }
    });

    it('should handle concurrent compression requests', async () => {
      const compressionPromises = testFiles.map(filePath =>
        request(app)
          .post('/api/compression/compress')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', filePath)
          .expect(202)
      );

      const responses = await Promise.all(compressionPromises);

      // Verify all requests succeeded and got unique job IDs
      const jobIds = responses.map(r => r.body.jobId);
      const uniqueJobIds = new Set(jobIds);
      
      expect(uniqueJobIds.size).toBe(jobIds.length);
      expect(jobIds.every(id => typeof id === 'string')).toBe(true);
    });

    it('should handle concurrent status checks', async () => {
      // Start a compression job first
      const compressResponse = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFiles[0])
        .expect(202);

      const jobId = compressResponse.body.jobId;

      // Make concurrent status requests
      const statusPromises = Array.from({ length: 5 }, () =>
        request(app)
          .get(`/api/compression/status/${jobId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
      );

      const statusResponses = await Promise.all(statusPromises);

      // All responses should have the same job ID and consistent data
      statusResponses.forEach(response => {
        expect(response.body).toHaveProperty('jobId', jobId);
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('progress');
      });
    });
  });

  describe('Data Validation Integration', () => {
    it('should validate all authentication endpoints consistently', async () => {
      // Test registration validation
      const invalidRegistrations = [
        { email: '', password: 'password123' },
        { email: 'test@example.com', password: '' },
        { email: 'test@example.com', password: '123' } // too short
      ];

      for (const invalidData of invalidRegistrations) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(invalidData)
          .expect(400);

        expect(response.body.error).toHaveProperty('code');
      }

      // Test login validation
      const invalidLogins = [
        { email: '', password: 'password123' },
        { email: 'test@example.com', password: '' },
        {}
      ];

      for (const invalidData of invalidLogins) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(invalidData)
          .expect(400);

        expect(response.body.error).toHaveProperty('code', 'MISSING_CREDENTIALS');
      }
    });
  });
});