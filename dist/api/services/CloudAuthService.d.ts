import { CloudCredentials } from './CloudStorageService';
export interface CloudAuthConfig {
    provider: 'aws-s3' | 'google-drive' | 'dropbox';
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    scopes?: string[];
}
export interface AuthorizationResult {
    authUrl?: string;
    state?: string;
    codeVerifier?: string;
}
export interface TokenResult {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    tokenType?: string;
}
export declare class CloudAuthService {
    private authConfigs;
    constructor();
    private initializeDefaultConfigs;
    getAuthorizationUrl(provider: string, userId: string): AuthorizationResult;
    exchangeCodeForToken(provider: string, code: string, state?: string, codeVerifier?: string): Promise<TokenResult>;
    refreshToken(provider: string, refreshToken: string): Promise<TokenResult>;
    validateCredentials(provider: string, credentials: CloudCredentials): boolean;
    private getGoogleDriveAuthUrl;
    private exchangeGoogleDriveCode;
    private refreshGoogleDriveToken;
    private getDropboxAuthUrl;
    private exchangeDropboxCode;
    private refreshDropboxToken;
    private generateState;
    parseState(state: string): {
        userId: string;
        timestamp: number;
    } | null;
}
//# sourceMappingURL=CloudAuthService.d.ts.map