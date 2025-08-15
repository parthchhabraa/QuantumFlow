import request from 'supertest';
import express from 'express';
import { cloudAuthRoutes } from '../routes/cloud-auth';
import { errorHandler } from '../middleware/errorHandler';

// Mock the services
jest.mock('../services/CloudAuthService');
jest.mock('../services/CloudStorageService');

describe('Cloud Auth Routes', () => {
  let app: express.Application;
  let mockCloudAuthService: any;
  let mockCloudStorageService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware to add user to request
    app.use((req: any, res, next) => {
      req.user = { id: 'test-user-123', email: 'test@example.com' };
      next();
    });
    
    app.use('/api/cloud-auth', cloudAuthRoutes);
    app.use(errorHandler);

    // Setup mocks
    const { CloudAuthService } = require('../services/CloudAuthService');
    const { CloudStorageService } = require('../services/CloudStorageService');
    
    mockCloudAuthService = {
      getAuthorizationUrl: jest.fn(),
      exchangeCodeForToken: jest.fn(),
      refreshToken: jest.fn(),
      validateCredentials: jest.fn(),
      parseState: jest.fn()
    };

    mockCloudStorageService = {
      authenticateAWS: jest.fn(),
      authenticateGoogleDrive: jest.fn(),
      authenticateDropbox: jest.fn(),
      listFiles: jest.fn()
    };

    CloudAuthService.mockImplementation(() => mockCloudAuthService);
    CloudStorageService.mockImplementation(() => mockCloudStorageService);

    jest.clearAllMocks();
  });

  describe('GET /authorize/:provider', () => {
    it('should return credential fields for AWS S3', async () => {
      const response = await request(app)
        .get('/api/cloud-auth/authorize/aws-s3');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('provider', 'aws-s3');
      expect(response.body).toHaveProperty('requiresCredentials', true);
      expect(response.body).toHaveProperty('credentialFields');
      expect(response.body.credentialFields).toHaveLength(3);
      expect(response.body.credentialFields[0]).toHaveProperty('name', 'accessKeyId');
    });

    it('should return authorization URL for Google Drive', async () => {
      mockCloudAuthService.getAuthorizationUrl.mockReturnValue({
        authUrl: 'https://accounts.google.com/oauth2/authorize?client_id=test',
        state: 'test-state'
      });

      const response = await request(app)
        .get('/api/cloud-auth/authorize/google-drive');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('provider', 'google-drive');
      expect(response.body).toHaveProperty('authUrl');
      expect(response.body).toHaveProperty('state', 'test-state');
      expect(response.body.authUrl).toContain('accounts.google.com');

      expect(mockCloudAuthService.getAuthorizationUrl).toHaveBeenCalledWith(
        'google-drive',
        'test-user-123'
      );
    });

    it('should return authorization URL for Dropbox', async () => {
      mockCloudAuthService.getAuthorizationUrl.mockReturnValue({
        authUrl: 'https://www.dropbox.com/oauth2/authorize?client_id=test',
        state: 'test-state'
      });

      const response = await request(app)
        .get('/api/cloud-auth/authorize/dropbox');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('provider', 'dropbox');
      expect(response.body).toHaveProperty('authUrl');
      expect(response.body.authUrl).toContain('dropbox.com');
    });

    it('should return 400 for unsupported provider', async () => {
      const response = await request(app)
        .get('/api/cloud-auth/authorize/unsupported-provider');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'UNSUPPORTED_PROVIDER');
    });
  });

  describe('POST /callback/:provider', () => {
    it('should handle OAuth callback successfully', async () => {
      mockCloudAuthService.parseState.mockReturnValue({
        userId: 'test-user-123',
        timestamp: Date.now()
      });

      mockCloudAuthService.exchangeCodeForToken.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer'
      });

      const response = await request(app)
        .post('/api/cloud-auth/callback/google-drive')
        .send({
          code: 'auth-code',
          state: 'valid-state'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Authorization successful');
      expect(response.body).toHaveProperty('provider', 'google-drive');
      expect(response.body).toHaveProperty('accessToken', 'access-token');
      expect(response.body).toHaveProperty('refreshToken', 'refresh-token');

      expect(mockCloudAuthService.parseState).toHaveBeenCalledWith('valid-state');
      expect(mockCloudAuthService.exchangeCodeForToken).toHaveBeenCalledWith(
        'google-drive',
        'auth-code',
        'valid-state',
        undefined
      );
    });

    it('should return 400 when authorization code is missing', async () => {
      const response = await request(app)
        .post('/api/cloud-auth/callback/google-drive')
        .send({
          state: 'test-state'
          // Missing code
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'MISSING_CODE');
    });

    it('should return 400 for invalid state parameter', async () => {
      mockCloudAuthService.parseState.mockReturnValue({
        userId: 'different-user',
        timestamp: Date.now()
      });

      const response = await request(app)
        .post('/api/cloud-auth/callback/google-drive')
        .send({
          code: 'auth-code',
          state: 'invalid-state'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'INVALID_STATE');
    });

    it('should return 400 for expired state parameter', async () => {
      mockCloudAuthService.parseState.mockReturnValue({
        userId: 'test-user-123',
        timestamp: Date.now() - 10 * 60 * 1000 // 10 minutes ago
      });

      const response = await request(app)
        .post('/api/cloud-auth/callback/google-drive')
        .send({
          code: 'auth-code',
          state: 'expired-state'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'EXPIRED_STATE');
    });
  });

  describe('POST /refresh/:provider', () => {
    it('should refresh token successfully', async () => {
      mockCloudAuthService.refreshToken.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer'
      });

      const response = await request(app)
        .post('/api/cloud-auth/refresh/google-drive')
        .send({
          refreshToken: 'old-refresh-token'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Token refreshed successfully');
      expect(response.body).toHaveProperty('accessToken', 'new-access-token');

      expect(mockCloudAuthService.refreshToken).toHaveBeenCalledWith(
        'google-drive',
        'old-refresh-token'
      );
    });

    it('should return 400 when refresh token is missing', async () => {
      const response = await request(app)
        .post('/api/cloud-auth/refresh/google-drive')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'MISSING_REFRESH_TOKEN');
    });
  });

  describe('POST /test/:provider', () => {
    it('should test AWS credentials successfully', async () => {
      mockCloudAuthService.validateCredentials.mockReturnValue(true);
      mockCloudStorageService.authenticateAWS.mockResolvedValue(true);

      const credentials = {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
        region: 'us-east-1'
      };

      const response = await request(app)
        .post('/api/cloud-auth/test/aws-s3')
        .send({ credentials });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Credentials are valid');
      expect(response.body).toHaveProperty('authenticated', true);

      expect(mockCloudAuthService.validateCredentials).toHaveBeenCalledWith('aws-s3', credentials);
      expect(mockCloudStorageService.authenticateAWS).toHaveBeenCalledWith(credentials);
    });

    it('should test Google Drive credentials successfully', async () => {
      mockCloudAuthService.validateCredentials.mockReturnValue(true);
      mockCloudStorageService.authenticateGoogleDrive.mockResolvedValue(true);

      const credentials = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        refreshToken: 'test-refresh-token'
      };

      const response = await request(app)
        .post('/api/cloud-auth/test/google-drive')
        .send({ credentials });

      expect(response.status).toBe(200);
      expect(mockCloudStorageService.authenticateGoogleDrive).toHaveBeenCalledWith(credentials);
    });

    it('should test Dropbox credentials successfully', async () => {
      mockCloudAuthService.validateCredentials.mockReturnValue(true);
      mockCloudStorageService.authenticateDropbox.mockResolvedValue(true);

      const credentials = {
        accessToken: 'test-access-token'
      };

      const response = await request(app)
        .post('/api/cloud-auth/test/dropbox')
        .send({ credentials });

      expect(response.status).toBe(200);
      expect(mockCloudStorageService.authenticateDropbox).toHaveBeenCalledWith(credentials);
    });

    it('should return 400 for invalid credentials format', async () => {
      mockCloudAuthService.validateCredentials.mockReturnValue(false);

      const response = await request(app)
        .post('/api/cloud-auth/test/aws-s3')
        .send({
          credentials: { invalid: 'format' }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'INVALID_CREDENTIALS');
    });

    it('should return 401 when authentication fails', async () => {
      mockCloudAuthService.validateCredentials.mockReturnValue(true);
      mockCloudStorageService.authenticateAWS.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/cloud-auth/test/aws-s3')
        .send({
          credentials: {
            accessKeyId: 'invalid-key',
            secretAccessKey: 'invalid-secret',
            region: 'us-east-1'
          }
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'AUTH_FAILED');
    });

    it('should return 400 when credentials are missing', async () => {
      const response = await request(app)
        .post('/api/cloud-auth/test/aws-s3')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'MISSING_CREDENTIALS');
    });
  });

  describe('POST /files/:provider', () => {
    it('should list cloud files successfully', async () => {
      mockCloudAuthService.validateCredentials.mockReturnValue(true);
      mockCloudStorageService.listFiles.mockResolvedValue([
        {
          name: 'file1.txt',
          path: '/folder/file1.txt',
          size: 1024,
          lastModified: new Date(),
          isDirectory: false
        },
        {
          name: 'subfolder',
          path: '/folder/subfolder',
          size: 0,
          lastModified: new Date(),
          isDirectory: true
        }
      ]);

      const credentials = {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
        region: 'us-east-1'
      };

      const response = await request(app)
        .post('/api/cloud-auth/files/aws-s3')
        .send({
          credentials,
          folderPath: '/folder',
          bucket: 'test-bucket'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('provider', 'aws-s3');
      expect(response.body).toHaveProperty('folderPath', '/folder');
      expect(response.body).toHaveProperty('files');
      expect(response.body.files).toHaveLength(2);
      expect(response.body.files[0]).toHaveProperty('name', 'file1.txt');
      expect(response.body.files[1]).toHaveProperty('isDirectory', true);

      expect(mockCloudStorageService.listFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'aws-s3',
          credentials,
          sourceBucket: 'test-bucket'
        }),
        '/folder'
      );
    });

    it('should return 400 for invalid credentials', async () => {
      mockCloudAuthService.validateCredentials.mockReturnValue(false);

      const response = await request(app)
        .post('/api/cloud-auth/files/aws-s3')
        .send({
          credentials: { invalid: 'credentials' }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'INVALID_CREDENTIALS');
    });

    it('should return 400 when credentials are missing', async () => {
      const response = await request(app)
        .post('/api/cloud-auth/files/aws-s3')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'MISSING_CREDENTIALS');
    });
  });

  describe('GET /providers', () => {
    it('should return supported cloud providers', async () => {
      const response = await request(app)
        .get('/api/cloud-auth/providers');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('providers');
      expect(response.body.providers).toHaveLength(3);

      const providers = response.body.providers;
      expect(providers.find((p: any) => p.id === 'aws-s3')).toBeDefined();
      expect(providers.find((p: any) => p.id === 'google-drive')).toBeDefined();
      expect(providers.find((p: any) => p.id === 'dropbox')).toBeDefined();

      // Check AWS S3 provider details
      const awsProvider = providers.find((p: any) => p.id === 'aws-s3');
      expect(awsProvider).toHaveProperty('name', 'Amazon S3');
      expect(awsProvider).toHaveProperty('authType', 'credentials');
      expect(awsProvider).toHaveProperty('features');
      expect(awsProvider.features).toContain('file-storage');
      expect(awsProvider.features).toContain('batch-processing');

      // Check Google Drive provider details
      const googleProvider = providers.find((p: any) => p.id === 'google-drive');
      expect(googleProvider).toHaveProperty('authType', 'oauth');

      // Check Dropbox provider details
      const dropboxProvider = providers.find((p: any) => p.id === 'dropbox');
      expect(dropboxProvider).toHaveProperty('authType', 'oauth');
    });
  });

  describe('Authentication Required', () => {
    beforeEach(() => {
      // Create app without authentication middleware
      app = express();
      app.use(express.json());
      app.use('/api/cloud-auth', cloudAuthRoutes);
      app.use(errorHandler);
    });

    it('should return 401 when user is not authenticated', async () => {
      const response = await request(app)
        .get('/api/cloud-auth/authorize/aws-s3');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'NOT_AUTHENTICATED');
    });
  });
});