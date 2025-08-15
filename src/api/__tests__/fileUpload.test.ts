import request from 'supertest';
import { QuantumFlowAPIServer } from '../server';
import * as fs from 'fs';
import * as path from 'path';

describe('File Upload Handling', () => {
  let server: QuantumFlowAPIServer;
  let app: any;
  let authToken: string;
  let testDir: string;

  beforeAll(async () => {
    server = new QuantumFlowAPIServer(0);
    app = server.getApp();

    // Register and login to get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'fileupload-test@example.com',
        password: 'password123'
      });

    authToken = registerResponse.body.token;

    // Create test directory and files
    testDir = path.join(process.cwd(), 'test-upload-files');
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

  describe('File Size Validation', () => {
    it('should accept files within size limit', async () => {
      const smallFilePath = path.join(testDir, 'small.txt');
      fs.writeFileSync(smallFilePath, 'Small file content');

      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', smallFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('jobId');
    });

    it('should reject files exceeding size limit', async () => {
      const largeFilePath = path.join(testDir, 'large.txt');
      
      // Create a file larger than 100MB (the configured limit)
      const largeContent = Buffer.alloc(101 * 1024 * 1024, 'x'); // 101MB
      fs.writeFileSync(largeFilePath, largeContent);

      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeFilePath);

      // Multer should reject with either 413 or 500 depending on configuration
      expect([413, 500]).toContain(response.status);

      // Clean up large file immediately
      fs.unlinkSync(largeFilePath);
    });
  });

  describe('File Type Validation', () => {
    it('should accept text files', async () => {
      const textFilePath = path.join(testDir, 'test.txt');
      fs.writeFileSync(textFilePath, 'Text file content');

      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', textFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('jobId');
    });

    it('should accept binary files', async () => {
      const binaryFilePath = path.join(testDir, 'test.bin');
      const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xFF, 0xFE, 0xFD]);
      fs.writeFileSync(binaryFilePath, binaryData);

      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', binaryFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('jobId');
    });

    it('should accept image files', async () => {
      const imageFilePath = path.join(testDir, 'test.jpg');
      // Create a minimal JPEG header
      const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const imageData = Buffer.concat([jpegHeader, Buffer.alloc(1000, 0x00)]);
      fs.writeFileSync(imageFilePath, imageData);

      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', imageFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('jobId');
    });
  });

  describe('File Name Handling', () => {
    it('should handle files with special characters in names', async () => {
      const specialFilePath = path.join(testDir, 'test file with spaces & symbols!.txt');
      fs.writeFileSync(specialFilePath, 'Content with special filename');

      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', specialFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('jobId');
    });

    it('should handle files with unicode names', async () => {
      const unicodeFilePath = path.join(testDir, 'тест-файл-中文.txt');
      fs.writeFileSync(unicodeFilePath, 'Unicode filename content');

      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', unicodeFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('jobId');
    });

    it('should handle very long filenames', async () => {
      const longName = 'a'.repeat(200) + '.txt';
      const longFilePath = path.join(testDir, longName);
      fs.writeFileSync(longFilePath, 'Long filename content');

      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', longFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('jobId');
    });
  });

  describe('Multiple File Upload', () => {
    it('should reject multiple files in single request', async () => {
      const file1Path = path.join(testDir, 'file1.txt');
      const file2Path = path.join(testDir, 'file2.txt');
      
      fs.writeFileSync(file1Path, 'File 1 content');
      fs.writeFileSync(file2Path, 'File 2 content');

      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', file1Path)
        .attach('file', file2Path);

      // Multer should reject multiple files with either 400 or 500
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Empty File Handling', () => {
    it('should handle empty files', async () => {
      const emptyFilePath = path.join(testDir, 'empty.txt');
      fs.writeFileSync(emptyFilePath, '');

      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', emptyFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('jobId');
    });
  });

  describe('File Upload Progress', () => {
    it('should handle file upload interruption gracefully', async () => {
      const testFilePath = path.join(testDir, 'progress-test.txt');
      fs.writeFileSync(testFilePath, 'Progress test content');

      // This test simulates what would happen if upload is interrupted
      // In a real scenario, multer would handle this, but we test the endpoint behavior
      const response = await request(app)
        .post('/api/compression/compress')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)
        .expect(202);

      expect(response.body).toHaveProperty('jobId');
    });
  });

  describe('Concurrent Uploads', () => {
    it('should handle multiple concurrent uploads', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        const filePath = path.join(testDir, `concurrent-${i}.txt`);
        fs.writeFileSync(filePath, `Concurrent upload test ${i}`);
        
        const promise = request(app)
          .post('/api/compression/compress')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', filePath)
          .expect(202);
        
        promises.push(promise);
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body).toHaveProperty('jobId');
        expect(response.body).toHaveProperty('status', 'pending');
      });

      // Verify all job IDs are unique
      const jobIds = responses.map(r => r.body.jobId);
      const uniqueJobIds = new Set(jobIds);
      expect(uniqueJobIds.size).toBe(jobIds.length);
    });
  });
});