/**
 * File Download Manager
 * Handles proper file processing and download functionality for the frontend
 */
interface ProcessedFile {
    originalFile: File;
    processedData: Buffer;
    metadata: ProcessingMetadata;
}
interface ProcessingMetadata {
    originalName: string;
    originalSize: number;
    processedSize: number;
    mimeType: string;
    processingType: 'compression' | 'decompression';
    timestamp: number;
}
export declare class FileDownloadManager {
    private static instance;
    private activeUrls;
    private constructor();
    static getInstance(): FileDownloadManager;
    /**
     * Process a file for compression
     */
    processFileForCompression(file: File): Promise<ProcessedFile>;
    /**
     * Process a file for decompression
     */
    processFileForDecompression(file: File): Promise<ProcessedFile>;
    /**
     * Generate a download URL for processed file data
     */
    generateDownloadUrl(data: Buffer, filename: string, mimeType: string): string;
    /**
     * Trigger download of a file
     */
    triggerDownload(url: string, filename: string): void;
    /**
     * Clean up a download URL
     */
    cleanup(url: string): void;
    /**
     * Clean up all active URLs
     */
    cleanupAll(): void;
    /**
     * Read file as ArrayBuffer
     */
    private readFileAsArrayBuffer;
    /**
     * Detect MIME type based on filename and content
     */
    private detectMimeType;
    /**
     * Get appropriate filename for processed file
     */
    getProcessedFilename(originalName: string, processingType: 'compression' | 'decompression'): string;
    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string;
}
export {};
//# sourceMappingURL=FileDownloadManager.d.ts.map