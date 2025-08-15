import { CloudAuthService } from '../services/CloudAuthService';
import { CloudCredentials } from '../services/CloudStorageService';

describe('CloudAuthService', () => {
  let cloudAuthService: CloudAuthService;

  beforeEach(() => {
    cloudAuthService = new CloudAuthService();
  });

  describe('getAuthorizationUrl', () => {
    it('should return empty result for AWS S3 (no OAuth)', () => {
      const result = cloudAuthService.getAuthorizationUrl('aws-s3', 'user123');
      
      expect(result).toEqual({});
    });

    it('should return authorization URL for Google Drive', () => {
      const result = cloudAuthService.getAuthorizationUrl('google-drive', 'user123');
      
      expect(result).toHaveProperty('authUrl');
      expect(result).toHaveProperty('state');
      expect(result.authUrl).toContain('accounts.google.com');
      expect(result.authUrl).toContain('oauth2');
      expect(result.state).toBeDefined();
    });

    it('should return authorization URL for Dropbox', () => {
      const result = cloudAuthService.getAuthorizationUrl('dropbox', 'user123');
      
      expect(result).toHaveProperty('authUrl');
      expect(result).toHaveProperty('state');
      expect(result.authUrl).toContain('dropbox.com');
      expect(result.authUrl).toContain('oauth2');
      expect(result.state).toBeDefined();
    });

    it('should throw error for unsupported provider', () => {
      expect(() => {
        cloudAuthService.getAuthorizationUrl('unsupported-provider', 'user123');
      }).toThrow('Unsupported provider');
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange Google Drive authorization code for tokens', async () => {
      const result = await cloudAuthService.exchangeCodeForToken('google-drive', 'test-code');
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).toHaveProperty('tokenType');
      expect(result.accessToken).toContain('mock_google');
      expect(result.tokenType).toBe('Bearer');
    });

    it('should exchange Dropbox authorization code for tokens', async () => {
      const result = await cloudAuthService.exchangeCodeForToken('dropbox', 'test-code');
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.accessToken).toContain('mock_dropbox');
      expect(result.expiresIn).toBe(14400); // 4 hours
    });

    it('should throw error for unsupported provider', async () => {
      await expect(cloudAuthService.exchangeCodeForToken('unsupported', 'test-code'))
        .rejects.toThrow('Unsupported provider');
    });
  });

  describe('refreshToken', () => {
    it('should refresh Google Drive access token', async () => {
      const result = await cloudAuthService.refreshToken('google-drive', 'refresh-token');
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).toContain('refreshed');
      expect(result.refreshToken).toBe('refresh-token'); // Should return same refresh token
    });

    it('should refresh Dropbox access token', async () => {
      const result = await cloudAuthService.refreshToken('dropbox', 'refresh-token');
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).toContain('refreshed');
    });

    it('should throw error for unsupported provider', async () => {
      await expect(cloudAuthService.refreshToken('unsupported', 'refresh-token'))
        .rejects.toThrow('Unsupported provider');
    });
  });

  describe('validateCredentials', () => {
    it('should validate AWS S3 credentials correctly', () => {
      const validCredentials: CloudCredentials = {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        region: 'us-east-1'
      };

      const invalidCredentials: CloudCredentials = {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        // Missing secretAccessKey and region
      };

      expect(cloudAuthService.validateCredentials('aws-s3', validCredentials)).toBe(true);
      expect(cloudAuthService.validateCredentials('aws-s3', invalidCredentials)).toBe(false);
    });

    it('should validate Google Drive credentials correctly', () => {
      const validCredentials: CloudCredentials = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        refreshToken: 'test-refresh-token'
      };

      const invalidCredentials: CloudCredentials = {
        clientId: 'test-client-id',
        // Missing clientSecret and refreshToken
      };

      expect(cloudAuthService.validateCredentials('google-drive', validCredentials)).toBe(true);
      expect(cloudAuthService.validateCredentials('google-drive', invalidCredentials)).toBe(false);
    });

    it('should validate Dropbox credentials correctly', () => {
      const validCredentials: CloudCredentials = {
        accessToken: 'test-access-token'
      };

      const invalidCredentials: CloudCredentials = {};

      expect(cloudAuthService.validateCredentials('dropbox', validCredentials)).toBe(true);
      expect(cloudAuthService.validateCredentials('dropbox', invalidCredentials)).toBe(false);
    });

    it('should return false for unsupported provider', () => {
      const credentials: CloudCredentials = {
        accessToken: 'test-token'
      };

      expect(cloudAuthService.validateCredentials('unsupported', credentials)).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should generate and parse state correctly', () => {
      const userId = 'user123';
      const authResult = cloudAuthService.getAuthorizationUrl('google-drive', userId);
      
      expect(authResult.state).toBeDefined();
      
      const parsedState = cloudAuthService.parseState(authResult.state!);
      expect(parsedState).not.toBeNull();
      expect(parsedState!.userId).toBe(userId);
      expect(parsedState!.timestamp).toBeCloseTo(Date.now(), -3); // Within 1000ms
    });

    it('should return null for invalid state', () => {
      const parsedState = cloudAuthService.parseState('invalid-state');
      expect(parsedState).toBeNull();
    });

    it('should handle malformed base64 state', () => {
      const parsedState = cloudAuthService.parseState('not-base64!@#');
      expect(parsedState).toBeNull();
    });
  });

  describe('OAuth URL Generation', () => {
    it('should generate Google Drive OAuth URL with correct parameters', () => {
      const result = cloudAuthService.getAuthorizationUrl('google-drive', 'user123');
      
      expect(result.authUrl).toContain('client_id=');
      expect(result.authUrl).toContain('redirect_uri=');
      expect(result.authUrl).toContain('response_type=code');
      expect(result.authUrl).toContain('scope=');
      expect(result.authUrl).toContain('state=');
      expect(result.authUrl).toContain('access_type=offline');
      expect(result.authUrl).toContain('prompt=consent');
    });

    it('should generate Dropbox OAuth URL with correct parameters', () => {
      const result = cloudAuthService.getAuthorizationUrl('dropbox', 'user123');
      
      expect(result.authUrl).toContain('client_id=');
      expect(result.authUrl).toContain('redirect_uri=');
      expect(result.authUrl).toContain('response_type=code');
      expect(result.authUrl).toContain('state=');
      expect(result.authUrl).toContain('token_access_type=offline');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing OAuth configuration gracefully', () => {
      // Mock environment variables to be undefined
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.GOOGLE_DRIVE_CLIENT_ID;
      delete process.env.GOOGLE_DRIVE_CLIENT_SECRET;

      // Create new instance to pick up the missing env vars
      const authService = new CloudAuthService();

      expect(() => {
        authService.getAuthorizationUrl('google-drive', 'user123');
      }).toThrow('Google Drive OAuth not configured');

      // Restore environment
      process.env = originalEnv;
    });

    it('should handle missing Dropbox configuration gracefully', () => {
      // Mock environment variables to be undefined
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.DROPBOX_CLIENT_ID;
      delete process.env.DROPBOX_CLIENT_SECRET;

      // Create new instance to pick up the missing env vars
      const authService = new CloudAuthService();

      expect(() => {
        authService.getAuthorizationUrl('dropbox', 'user123');
      }).toThrow('Dropbox OAuth not configured');

      // Restore environment
      process.env = originalEnv;
    });
  });
});