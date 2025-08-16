/**
 * Virtual backgrounds and filters with efficient video processing
 */
import { VideoFrame } from './models/VideoModels';
import { EventEmitter } from 'events';
export interface VirtualBackground {
    /** Background ID */
    id: string;
    /** Background name */
    name: string;
    /** Background type */
    type: 'image' | 'video' | 'blur' | 'color';
    /** Background data (URL, color code, etc.) */
    data: string;
    /** Thumbnail URL */
    thumbnail: string;
    /** Whether background is animated */
    isAnimated: boolean;
    /** Processing complexity (1-10) */
    complexity: number;
}
export interface VideoFilter {
    /** Filter ID */
    id: string;
    /** Filter name */
    name: string;
    /** Filter type */
    type: 'beauty' | 'color' | 'artistic' | 'fun' | 'professional';
    /** Filter parameters */
    parameters: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
        warmth?: number;
        sharpness?: number;
        smoothing?: number;
        [key: string]: any;
    };
    /** Processing intensity (1-10) */
    intensity: number;
}
export interface ProcessingConfig {
    /** Enable virtual background */
    enableBackground: boolean;
    /** Selected background */
    background?: VirtualBackground;
    /** Enable filters */
    enableFilters: boolean;
    /** Applied filters */
    filters: VideoFilter[];
    /** Processing quality */
    quality: 'low' | 'medium' | 'high';
    /** Enable edge smoothing */
    enableEdgeSmoothing: boolean;
    /** Background detection sensitivity */
    detectionSensitivity: number;
    /** Frame processing rate (every N frames) */
    processingRate: number;
}
export interface ProcessingStats {
    /** Frames processed */
    framesProcessed: number;
    /** Average processing time per frame */
    averageProcessingTime: number;
    /** Background detection accuracy */
    detectionAccuracy: number;
    /** Memory usage in MB */
    memoryUsage: number;
    /** CPU usage percentage */
    cpuUsage: number;
    /** Frames per second */
    fps: number;
}
export declare class VirtualBackgroundProcessor extends EventEmitter {
    private canvas;
    private context;
    private segmentationModel;
    private backgroundImage;
    private backgroundVideo;
    private isProcessing;
    private processingStats;
    private frameCount;
    private lastProcessingTime;
    private defaultBackgrounds;
    private defaultFilters;
    constructor();
    /**
     * Initialize background segmentation model
     */
    private initializeSegmentationModel;
    /**
     * Process video frame with background and filters
     */
    processFrame(inputFrame: VideoFrame, config: ProcessingConfig): Promise<VideoFrame>;
    /**
     * Apply virtual background to current canvas
     */
    private applyVirtualBackground;
    /**
     * Apply blur background
     */
    private applyBlurBackground;
    /**
     * Apply image background
     */
    private applyImageBackground;
    /**
     * Apply video background
     */
    private applyVideoBackground;
    /**
     * Apply color background
     */
    private applyColorBackground;
    /**
     * Apply filters to current canvas
     */
    private applyFilters;
    /**
     * Apply single filter
     */
    private applyFilter;
    /**
     * Apply beauty filter (smoothing, brightness)
     */
    private applyBeautyFilter;
    /**
     * Apply color filter
     */
    private applyColorFilter;
    /**
     * Apply professional filter
     */
    private applyProfessionalFilter;
    /**
     * Composite person over background using segmentation mask
     */
    private compositeWithMask;
    /**
     * Simulate person segmentation (placeholder for real ML model)
     */
    private simulateSegmentation;
    /**
     * Convert buffer to ImageData
     */
    private bufferToImageData;
    /**
     * Convert ImageData to buffer
     */
    private imageDataToBuffer;
    /**
     * Update processing statistics
     */
    private updateProcessingStats;
    /**
     * Get available backgrounds
     */
    getAvailableBackgrounds(): VirtualBackground[];
    /**
     * Get available filters
     */
    getAvailableFilters(): VideoFilter[];
    /**
     * Get processing statistics
     */
    getProcessingStats(): ProcessingStats;
    /**
     * Add custom background
     */
    addCustomBackground(background: Omit<VirtualBackground, 'id'>): VirtualBackground;
    /**
     * Remove custom background
     */
    removeCustomBackground(backgroundId: string): void;
    /**
     * Clean up resources
     */
    destroy(): void;
}
//# sourceMappingURL=VirtualBackgroundProcessor.d.ts.map