"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudAuthService = void 0;
class CloudAuthService {
    constructor() {
        this.authConfigs = new Map();
        // Initialize with default configurations
        this.initializeDefaultConfigs();
    }
    initializeDefaultConfigs() {
        // AWS S3 - uses access keys, not OAuth
        this.authConfigs.set('aws-s3', {
            provider: 'aws-s3'
        });
        // Google Drive OAuth configuration
        this.authConfigs.set('google-drive', {
            provider: 'google-drive',
            clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });
        // Dropbox OAuth configuration
        this.authConfigs.set('dropbox', {
            provider: 'dropbox',
            clientId: process.env.DROPBOX_CLIENT_ID,
            clientSecret: process.env.DROPBOX_CLIENT_SECRET,
            redirectUri: process.env.DROPBOX_REDIRECT_URI || 'http://localhost:3000/auth/dropbox/callback',
            scopes: ['files.content.write', 'files.content.read']
        });
    }
    getAuthorizationUrl(provider, userId) {
        const config = this.authConfigs.get(provider);
        if (!config) {
            throw new Error(`Unsupported provider: ${provider}`);
        }
        switch (provider) {
            case 'aws-s3':
                // AWS S3 doesn't use OAuth, return empty result
                return {};
            case 'google-drive':
                return this.getGoogleDriveAuthUrl(config, userId);
            case 'dropbox':
                return this.getDropboxAuthUrl(config, userId);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
    async exchangeCodeForToken(provider, code, state, codeVerifier) {
        const config = this.authConfigs.get(provider);
        if (!config) {
            throw new Error(`Unsupported provider: ${provider}`);
        }
        switch (provider) {
            case 'google-drive':
                return this.exchangeGoogleDriveCode(config, code);
            case 'dropbox':
                return this.exchangeDropboxCode(config, code);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
    async refreshToken(provider, refreshToken) {
        const config = this.authConfigs.get(provider);
        if (!config) {
            throw new Error(`Unsupported provider: ${provider}`);
        }
        switch (provider) {
            case 'google-drive':
                return this.refreshGoogleDriveToken(config, refreshToken);
            case 'dropbox':
                return this.refreshDropboxToken(config, refreshToken);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
    validateCredentials(provider, credentials) {
        switch (provider) {
            case 'aws-s3':
                return !!(credentials.accessKeyId && credentials.secretAccessKey && credentials.region);
            case 'google-drive':
                return !!(credentials.clientId && credentials.clientSecret && credentials.refreshToken);
            case 'dropbox':
                return !!credentials.accessToken;
            default:
                return false;
        }
    }
    // Google Drive OAuth methods
    getGoogleDriveAuthUrl(config, userId) {
        if (!config.clientId || !config.redirectUri) {
            throw new Error('Google Drive OAuth not configured');
        }
        const state = this.generateState(userId);
        const scopes = config.scopes?.join(' ') || '';
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: 'code',
            scope: scopes,
            state: state,
            access_type: 'offline',
            prompt: 'consent'
        });
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        return {
            authUrl,
            state
        };
    }
    async exchangeGoogleDriveCode(config, code) {
        // Mock implementation - in real app would make HTTP request to Google
        console.log('Exchanging Google Drive authorization code for tokens');
        return {
            accessToken: 'mock_google_access_token',
            refreshToken: 'mock_google_refresh_token',
            expiresIn: 3600,
            tokenType: 'Bearer'
        };
    }
    async refreshGoogleDriveToken(config, refreshToken) {
        // Mock implementation - in real app would make HTTP request to Google
        console.log('Refreshing Google Drive access token');
        return {
            accessToken: 'mock_google_refreshed_access_token',
            refreshToken: refreshToken,
            expiresIn: 3600,
            tokenType: 'Bearer'
        };
    }
    // Dropbox OAuth methods
    getDropboxAuthUrl(config, userId) {
        if (!config.clientId || !config.redirectUri) {
            throw new Error('Dropbox OAuth not configured');
        }
        const state = this.generateState(userId);
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: 'code',
            state: state,
            token_access_type: 'offline'
        });
        const authUrl = `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
        return {
            authUrl,
            state
        };
    }
    async exchangeDropboxCode(config, code) {
        // Mock implementation - in real app would make HTTP request to Dropbox
        console.log('Exchanging Dropbox authorization code for tokens');
        return {
            accessToken: 'mock_dropbox_access_token',
            refreshToken: 'mock_dropbox_refresh_token',
            expiresIn: 14400, // 4 hours
            tokenType: 'Bearer'
        };
    }
    async refreshDropboxToken(config, refreshToken) {
        // Mock implementation - in real app would make HTTP request to Dropbox
        console.log('Refreshing Dropbox access token');
        return {
            accessToken: 'mock_dropbox_refreshed_access_token',
            refreshToken: refreshToken,
            expiresIn: 14400,
            tokenType: 'Bearer'
        };
    }
    // Utility methods
    generateState(userId) {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        return Buffer.from(`${userId}:${timestamp}:${random}`).toString('base64');
    }
    parseState(state) {
        try {
            const decoded = Buffer.from(state, 'base64').toString();
            const [userId, timestamp] = decoded.split(':');
            return {
                userId,
                timestamp: parseInt(timestamp)
            };
        }
        catch (error) {
            return null;
        }
    }
}
exports.CloudAuthService = CloudAuthService;
//# sourceMappingURL=CloudAuthService.js.map