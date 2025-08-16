"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudAuthRoutes = void 0;
const express_1 = require("express");
const CloudAuthService_1 = require("../services/CloudAuthService");
const CloudStorageService_1 = require("../services/CloudStorageService");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
exports.cloudAuthRoutes = router;
// Initialize services
const cloudAuthService = new CloudAuthService_1.CloudAuthService();
const cloudStorageService = new CloudStorageService_1.CloudStorageService();
// Get authorization URL for cloud provider
router.get('/authorize/:provider', (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        const { provider } = req.params;
        if (!['aws-s3', 'google-drive', 'dropbox'].includes(provider)) {
            throw (0, errorHandler_1.createError)('Unsupported cloud provider', 400, 'UNSUPPORTED_PROVIDER');
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
    }
    catch (error) {
        next(error);
    }
});
// Handle OAuth callback
router.post('/callback/:provider', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        const { provider } = req.params;
        const { code, state, codeVerifier } = req.body;
        if (!code) {
            throw (0, errorHandler_1.createError)('Authorization code is required', 400, 'MISSING_CODE');
        }
        // Validate state parameter
        if (state) {
            const stateData = cloudAuthService.parseState(state);
            if (!stateData || stateData.userId !== req.user.id) {
                throw (0, errorHandler_1.createError)('Invalid state parameter', 400, 'INVALID_STATE');
            }
            // Check if state is not too old (5 minutes)
            const stateAge = Date.now() - stateData.timestamp;
            if (stateAge > 5 * 60 * 1000) {
                throw (0, errorHandler_1.createError)('State parameter expired', 400, 'EXPIRED_STATE');
            }
        }
        const tokenResult = await cloudAuthService.exchangeCodeForToken(provider, code, state, codeVerifier);
        res.json({
            message: 'Authorization successful',
            provider,
            accessToken: tokenResult.accessToken,
            refreshToken: tokenResult.refreshToken,
            expiresIn: tokenResult.expiresIn,
            tokenType: tokenResult.tokenType
        });
    }
    catch (error) {
        next(error);
    }
});
// Refresh access token
router.post('/refresh/:provider', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        const { provider } = req.params;
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw (0, errorHandler_1.createError)('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
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
    }
    catch (error) {
        next(error);
    }
});
// Test cloud storage credentials
router.post('/test/:provider', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        const { provider } = req.params;
        const { credentials } = req.body;
        if (!credentials) {
            throw (0, errorHandler_1.createError)('Credentials are required', 400, 'MISSING_CREDENTIALS');
        }
        // Validate credentials format
        const isValid = cloudAuthService.validateCredentials(provider, credentials);
        if (!isValid) {
            throw (0, errorHandler_1.createError)('Invalid credentials format', 400, 'INVALID_CREDENTIALS');
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
                throw (0, errorHandler_1.createError)('Unsupported provider', 400, 'UNSUPPORTED_PROVIDER');
        }
        if (!authResult) {
            throw (0, errorHandler_1.createError)('Authentication failed', 401, 'AUTH_FAILED');
        }
        res.json({
            message: 'Credentials are valid',
            provider,
            authenticated: true
        });
    }
    catch (error) {
        next(error);
    }
});
// List files in cloud storage
router.post('/files/:provider', async (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401, 'NOT_AUTHENTICATED');
        }
        const { provider } = req.params;
        const { credentials, folderPath = '', bucket } = req.body;
        if (!credentials) {
            throw (0, errorHandler_1.createError)('Credentials are required', 400, 'MISSING_CREDENTIALS');
        }
        // Validate credentials
        const isValid = cloudAuthService.validateCredentials(provider, credentials);
        if (!isValid) {
            throw (0, errorHandler_1.createError)('Invalid credentials format', 400, 'INVALID_CREDENTIALS');
        }
        const cloudConfig = {
            provider: provider,
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
    }
    catch (error) {
        next(error);
    }
});
// Get supported cloud providers
router.get('/providers', (req, res) => {
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
//# sourceMappingURL=cloud-auth.js.map