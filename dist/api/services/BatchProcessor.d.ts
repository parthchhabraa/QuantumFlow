import { EventEmitter } from 'events';
import { QuantumConfig } from '../../models/QuantumConfig';
export interface BatchJob {
    id: string;
    userId: string;
    type: 'compress' | 'decompress';
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    priority: number;
    files: BatchFileItem[];
    cloudConfig?: CloudStorageConfig;
    compressionConfig: QuantumConfig;
    progress: number;
    error?: string;
    metrics?: BatchMetrics;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}
export interface BatchFileItem {
    id: string;
    originalName: string;
    sourcePath: string;
    destinationPath?: string;
    cloudSourcePath?: string;
    cloudDestinationPath?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    error?: string;
    metrics?: {
        originalSize: number;
        processedSize: number;
        compressionRatio?: number;
        processingTime: number;
    };
}
export interface CloudStorageConfig {
    provider: 'aws-s3' | 'google-drive' | 'dropbox';
    credentials: any;
    sourceBucket?: string;
    destinationBucket?: string;
    sourceFolder?: string;
    destinationFolder?: string;
}
export interface BatchMetrics {
    totalFiles: number;
    completedFiles: number;
    failedFiles: number;
    totalOriginalSize: number;
    totalProcessedSize: number;
    averageCompressionRatio: number;
    totalProcessingTime: number;
}
export declare class BatchProcessor extends EventEmitter {
    private jobs;
    private processingQueue;
    private isProcessing;
    private maxConcurrentJobs;
    private currentlyProcessing;
    private cloudStorageService;
    constructor();
    createBatchJob(userId: string, type: 'compress' | 'decompress', files: Omit<BatchFileItem, 'id' | 'status' | 'progress' | 'metrics'>[], compressionConfig: QuantumConfig, cloudConfig?: CloudStorageConfig, priority?: number): string;
    getJob(jobId: string): BatchJob | undefined;
    getUserJobs(userId: string): BatchJob[];
    cancelJob(jobId: string): boolean;
    getQueueStatus(): {
        queueLength: number;
        processingJobs: number;
        maxConcurrent: number;
    };
    private addToQueue;
    private removeFromQueue;
    private startProcessing;
    private processNextJobs;
    private processJob;
    private updateJobProgress;
}
//# sourceMappingURL=BatchProcessor.d.ts.map