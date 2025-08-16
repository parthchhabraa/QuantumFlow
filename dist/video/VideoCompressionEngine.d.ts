import { QuantumMetrics } from '../models/QuantumMetrics';
import { VideoFrame, VideoCompressionConfig, VideoCompressionResult, NetworkConditions } from './models/VideoModels';
/**
 * Real-time video compression engine that adapts quantum compression algorithms for video streams
 * Provides real-time compression/decompression pipeline with adaptive quality control
 */
export declare class VideoCompressionEngine {
    private quantumEngine;
    private qualityController;
    private frameProcessor;
    private config;
    private metrics;
    private isProcessing;
    private frameQueue;
    private maxQueueSize;
    constructor(config?: VideoCompressionConfig);
    /**
     * Compress a video frame in real-time
     */
    compressFrame(frame: VideoFrame): Promise<VideoCompressionResult>;
    /**
     * Decompress a video frame in real-time
     */
    decompressFrame(compressedData: Buffer, frameMetadata: any): Promise<VideoFrame>;
    /**
     * Update network conditions for adaptive quality control
     */
    updateNetworkConditions(conditions: NetworkConditions): void;
    /**
     * Update video compression configuration
     */
    updateConfig(config: VideoCompressionConfig): void;
    /**
     * Get current compression metrics
     */
    getMetrics(): QuantumMetrics;
    /**
     * Get current quality level
     */
    getCurrentQualityLevel(): 'low' | 'medium' | 'high';
    /**
     * Get frame queue status
     */
    getQueueStatus(): {
        queueLength: number;
        maxQueueSize: number;
        isProcessing: boolean;
    };
    /**
     * Clear frame queue
     */
    clearQueue(): void;
    /**
     * Compress video buffer (for recording purposes)
     */
    compressVideoBuffer(buffer: Buffer, config: VideoCompressionConfig): Promise<{
        compressedData: Buffer;
        compressionRatio: number;
        originalSize: number;
        compressedSize: number;
    }>;
    /**
     * Process the next frame in the queue
     */
    private processNextFrame;
    /**
     * Create quantum configuration optimized for video compression
     */
    private createVideoOptimizedQuantumConfig;
    /**
     * Adapt quantum configuration based on network conditions
     */
    private adaptQuantumConfigForNetwork;
    /**
     * Serialize compressed quantum data for transmission
     */
    private serializeCompressedData;
    /**
     * Deserialize compressed quantum data from transmission
     */
    private deserializeCompressedData;
    /**
     * Get simulated compression ratio based on quality level
     */
    private getSimulatedCompressionRatio;
    /**
     * Create a mock quantum engine for testing purposes
     */
    private createMockQuantumEngine;
}
//# sourceMappingURL=VideoCompressionEngine.d.ts.map