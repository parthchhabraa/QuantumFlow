import { CloudStorageConfig } from './BatchProcessor';
export interface CloudCredentials {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    accessToken?: string;
}
export interface CloudFileInfo {
    name: string;
    path: string;
    size: number;
    lastModified: Date;
    isDirectory: boolean;
}
export declare class CloudStorageService {
    authenticateAWS(credentials: CloudCredentials): Promise<boolean>;
    authenticateGoogleDrive(credentials: CloudCredentials): Promise<boolean>;
    authenticateDropbox(credentials: CloudCredentials): Promise<boolean>;
    listFiles(config: CloudStorageConfig, folderPath?: string): Promise<CloudFileInfo[]>;
    downloadFile(config: CloudStorageConfig, filePath: string): Promise<Buffer>;
    uploadFile(config: CloudStorageConfig, filePath: string, data: Buffer): Promise<void>;
    deleteFile(config: CloudStorageConfig, filePath: string): Promise<void>;
    private listS3Files;
    private downloadS3File;
    private uploadS3File;
    private deleteS3File;
    private listGoogleDriveFiles;
    private downloadGoogleDriveFile;
    private uploadGoogleDriveFile;
    private deleteGoogleDriveFile;
    private listDropboxFiles;
    private downloadDropboxFile;
    private uploadDropboxFile;
    private deleteDropboxFile;
}
//# sourceMappingURL=CloudStorageService.d.ts.map