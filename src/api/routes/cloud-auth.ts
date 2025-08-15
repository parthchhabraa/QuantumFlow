import { Router, Request, Response } from 'express';
import { CloudAuthService } from '../services/CloudAuthService';
import { CloudStorageService } from '../services/CloudStorageService';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Initialize services
const cloudAuthService = new CloudAuthService();
const cloudStorageService = new CloudStorageService();

// Get authorization URL for cloud provider
router.get('/authorize/:provider', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const { provider } = req.params;
    
    if (!['aws-s3', 'google-drive', 'dropbox'].includes(provider)) {
      throw createError('Unsupported cloud provider', 400, 'UNSUPPORTED_PROVIDER');
    }

    if (provider === 'aws-s3') {
      // AWS S3 uses access keys, not OAuth
      res.json({
        provider,
        requiresCredentials: true,
        credentialFields: [
          { name: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
          { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
          { name: 'region', label: 'Region', type: 'text', required: true, default: 'us-east-1' }
        ]
      });
      return;
    }

    const authResult = cloudAuthService.getAuthorizationUrl(provider, req.user.id);

    res.json({
      provider,
      authUrl: authResult.authUrl,
      state: authResult.state,
      codeVerifier: authResult.codeVerifier
    });
  } catch (error) {
    next(error);
  }
});

// Handle OAuth callback
router.post('/callback/:provider', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const { provider } = req.params;
    const { code, state, codeVerifier } = req.body;

    if (!code) {
      throw createError('Authorization code is required', 400, 'MISSING_CODE');
    }

    // Validate state parameter
    if (state) {
      const stateData = cloudAuthService.parseState(state);
      if (!stateData || stateData.userId !== req.user.id) {
        throw createError('Invalid state parameter', 400, 'INVALID_STATE');
      }

      // Check if state is not too old (5 minutes)
      const stateAge = Date.now() - stateData.timestamp;
      if (stateAge > 5 * 60 * 1000) {
        throw createError('State parameter expired', 400, 'EXPIRED_STATE');
      }
    }

    const tokenResult = await cloudAuthService.exchangeCodeForToken(
      provider,
      code,
      state,
      codeVerifier
    );

    res.json({
      message: 'Authorization successful',
      provider,
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
      expiresIn: tokenResult.expiresIn,
      tokenType: tokenResult.tokenType
    });
  } catch (error) {
    next(error);
  }
});

// Refresh access token
router.post('/refresh/:provider', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const { provider } = req.params;
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
    }

    const tokenResult = await cloudAuthService.refreshToken(provider, refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      provider,
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
      expiresIn: tokenResult.expiresIn,
      tokenType: tokenResult.tokenType
    });
  } catch (error) {
    next(error);
  }
});

// Test cloud storage credentials
router.post('/test/:provider', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const { provider } = req.params;
    const { credentials } = req.body;

    if (!credentials) {
      throw createError('Credentials are required', 400, 'MISSING_CREDENTIALS');
    }

    // Validate credentials format
    const isValid = cloudAuthService.validateCredentials(provider, credentials);
    if (!isValid) {
      throw createError('Invalid credentials format', 400, 'INVALID_CREDENTIALS');
    }

    // Test authentication with the cloud provider
    let authResult = false;
    switch (provider) {
      case 'aws-s3':
        authResult = await cloudStorageService.authenticateAWS(credentials);
        break;
      case 'google-drive':
        authResult = await cloudStorageService.authenticateGoogleDrive(credentials);
        break;
      case 'dropbox':
        authResult = await cloudStorageService.authenticateDropbox(credentials);
        break;
      default:
        throw createError('Unsupported provider', 400, 'UNSUPPORTED_PROVIDER');
    }

    if (!authResult) {
      throw createError('Authentication failed', 401, 'AUTH_FAILED');
    }

    res.json({
      message: 'Credentials are valid',
      provider,
      authenticated: true
    });
  } catch (error) {
    next(error);
  }
});

// List files in cloud storage
router.post('/files/:provider', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const { provider } = req.params;
    const { credentials, folderPath = '', bucket } = req.body;

    if (!credentials) {
      throw createError('Credentials are required', 400, 'MISSING_CREDENTIALS');
    }

    // Validate credentials
    const isValid = cloudAuthService.validateCredentials(provider, credentials);
    if (!isValid) {
      throw createError('Invalid credentials format', 400, 'INVALID_CREDENTIALS');
    }

    const cloudConfig = {
      provider: provider as any,
      credentials,
      sourceBucket: bucket
    };

    const files = await cloudStorageService.listFiles(cloudConfig, folderPath);

    res.json({
      provider,
      folderPath,
      files: files.map(file => ({
        name: file.name,
        path: file.path,
        size: file.size,
        lastModified: file.lastModified,
        isDirectory: file.isDirectory
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get supported cloud providers
router.get('/providers', (req: Request, res: Response) => {
  res.json({
    providers: [
      {
        id: 'aws-s3',
        name: 'Amazon S3',
        authType: 'credentials',
        description: 'Amazon Simple Storage Service',
        features: ['file-storage', 'batch-processing']
      },
      {
        id: 'google-drive',
        name: 'Google Drive',
        authType: 'oauth',
        description: 'Google Drive cloud storage',
        features: ['file-storage', 'batch-processing']
      },
      {
        id: 'dropbox',
        name: 'Dropbox',
        authType: 'oauth',
        description: 'Dropbox cloud storage',
        features: ['file-storage', 'batch-processing']
      }
    ]
  });
});

export { router as cloudAuthRoutes };