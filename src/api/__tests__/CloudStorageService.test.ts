import { CloudStorageService, CloudCredentials } from '../services/CloudStorageService';
import { CloudStorageConfig } from '../services/BatchProcessor';

describe('CloudStorageService', () => {
  let cloudStorageService: CloudStorageService;

  beforeEach(() => {
    cloudStorageService = new CloudStorageService();
  });

  describe('AWS S3 Authentication', () => {
    it('should authenticate successfully with valid AWS credentials', async () => {
      const credentials: CloudCredentials = {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        region: 'us-east-1'
      };

      const result = await cloudStorageService.authenticateAWS(credentials);
      expect(result).toBe(true);
    });

    it('should fail authentication with missing AWS credentials', async () => {
      const credentials: CloudCredentials = {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        // Missing secretAccessKey and region
      };

      const result = await cloudStorageService.authenticateAWS(credentials);
      expect(result).toBe(false);
    });

    it('should fail authentication with empty AWS credentials', async () => {
      const credentials: CloudCredentials = {};

      const result = await cloudStorageService.authenticateAWS(credentials);
      expect(result).toBe(false);
    });
  });

  describe('Google Drive Authentication', () => {
    it('should authenticate successfully with valid Google Drive credentials', async () => {
      const credentials: CloudCredentials = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        refreshToken: 'test-refresh-token'
      };

      const result = await cloudStorageService.authenticateGoogleDrive(credentials);
      expect(result).toBe(true);
    });

    it('should fail authentication with missing Google Drive credentials', async () => {
      const credentials: CloudCredentials = {
        clientId: 'test-client-id',
        // Missing clientSecret and refreshToken
      };

      const result = await cloudStorageService.authenticateGoogleDrive(credentials);
      expect(result).toBe(false);
    });
  });

  describe('Dropbox Authentication', () => {
    it('should authenticate successfully with valid Dropbox credentials', async () => {
      const credentials: CloudCredentials = {
        accessToken: 'test-access-token'
      };

      const result = await cloudStorageService.authenticateDropbox(credentials);
      expect(result).toBe(true);
    });

    it('should fail authentication with missing Dropbox credentials', async () => {
      const credentials: CloudCredentials = {};

      const result = await cloudStorageService.authenticateDropbox(credentials);
      expect(result).toBe(false);
    });
  });

  describe('File Operations', () => {
    const awsConfig: CloudStorageConfig = {
      provider: 'aws-s3',
      credentials: {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
        region: 'us-east-1'
      },
      sourceBucket: 'test-bucket'
    };

    const googleDriveConfig: CloudStorageConfig = {
      provider: 'google-drive',
      credentials: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        refreshToken: 'test-refresh-token'
      }
    };

    const dropboxConfig: CloudStorageConfig = {
      provider: 'dropbox',
      credentials: {
        accessToken: 'test-access-token'
      }
    };

    describe('listFiles', () => {
      it('should list AWS S3 files successfully', async () => {
        const files = await cloudStorageService.listFiles(awsConfig, 'test-folder');
        
        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toBeGreaterThan(0);
        expect(files[0]).toHaveProperty('name');
        expect(files[0]).toHaveProperty('path');
        expect(files[0]).toHaveProperty('size');
        expect(files[0]).toHaveProperty('lastModified');
        expect(files[0]).toHaveProperty('isDirectory');
      });

      it('should list Google Drive files successfully', async () => {
        const files = await cloudStorageService.listFiles(googleDriveConfig, 'test-folder');
        
        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toBeGreaterThan(0);
        expect(files[0].name).toContain('gdrive');
      });

      it('should list Dropbox files successfully', async () => {
        const files = await cloudStorageService.listFiles(dropboxConfig, 'test-folder');
        
        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toBeGreaterThan(0);
        expect(files[0].name).toContain('dropbox');
      });

      it('should throw error for unsupported provider', async () => {
        const invalidConfig = {
          provider: 'invalid-provider' as any,
          credentials: {}
        };

        await expect(cloudStorageService.listFiles(invalidConfig, 'test-folder'))
          .rejects.toThrow('Unsupported cloud provider');
      });
    });

    describe('downloadFile', () => {
      it('should download AWS S3 file successfully', async () => {
        const data = await cloudStorageService.downloadFile(awsConfig, 'test-file.txt');
        
        expect(Buffer.isBuffer(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
        expect(data.toString()).toContain('Mock S3 file content');
      });

      it('should download Google Drive file successfully', async () => {
        const data = await cloudStorageService.downloadFile(googleDriveConfig, 'test-file.txt');
        
        expect(Buffer.isBuffer(data)).toBe(true);
        expect(data.toString()).toContain('Mock Google Drive file content');
      });

      it('should download Dropbox file successfully', async () => {
        const data = await cloudStorageService.downloadFile(dropboxConfig, 'test-file.txt');
        
        expect(Buffer.isBuffer(data)).toBe(true);
        expect(data.toString()).toContain('Mock Dropbox file content');
      });
    });

    describe('uploadFile', () => {
      const testData = Buffer.from('Test file content for upload');

      it('should upload to AWS S3 successfully', async () => {
        await expect(cloudStorageService.uploadFile(awsConfig, 'upload-test.txt', testData))
          .resolves.not.toThrow();
      });

      it('should upload to Google Drive successfully', async () => {
        await expect(cloudStorageService.uploadFile(googleDriveConfig, 'upload-test.txt', testData))
          .resolves.not.toThrow();
      });

      it('should upload to Dropbox successfully', async () => {
        await expect(cloudStorageService.uploadFile(dropboxConfig, 'upload-test.txt', testData))
          .resolves.not.toThrow();
      });
    });

    describe('deleteFile', () => {
      it('should delete AWS S3 file successfully', async () => {
        await expect(cloudStorageService.deleteFile(awsConfig, 'delete-test.txt'))
          .resolves.not.toThrow();
      });

      it('should delete Google Drive file successfully', async () => {
        await expect(cloudStorageService.deleteFile(googleDriveConfig, 'delete-test.txt'))
          .resolves.not.toThrow();
      });

      it('should delete Dropbox file successfully', async () => {
        await expect(cloudStorageService.deleteFile(dropboxConfig, 'delete-test.txt'))
          .resolves.not.toThrow();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      // Mock console.error to avoid cluttering test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const invalidCredentials: CloudCredentials = {
        accessKeyId: '', // Invalid empty key
        secretAccessKey: '',
        region: ''
      };

      const result = await cloudStorageService.authenticateAWS(invalidCredentials);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should throw error for unsupported provider in file operations', async () => {
      const invalidConfig = {
        provider: 'unsupported' as any,
        credentials: {}
      };

      await expect(cloudStorageService.downloadFile(invalidConfig, 'test.txt'))
        .rejects.toThrow('Unsupported cloud provider');

      await expect(cloudStorageService.uploadFile(invalidConfig, 'test.txt', Buffer.from('test')))
        .rejects.toThrow('Unsupported cloud provider');

      await expect(cloudStorageService.deleteFile(invalidConfig, 'test.txt'))
        .rejects.toThrow('Unsupported cloud provider');
    });
  });
});