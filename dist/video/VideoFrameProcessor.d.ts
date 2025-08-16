import { VideoFrame, VideoCompressionConfig, FrameAnalysis } from './models/VideoModels';
/**
 * Video frame processor that handles pre-processing and analysis of video frames
 * for optimal quantum compression
 */
export declare class VideoFrameProcessor {
    private config;
    private previousFrame;
    private frameHistory;
    private maxHistorySize;
    constructor(config: VideoCompressionConfig);
    /**
     * Update configuration
     */
    updateConfig(config: VideoCompressionConfig): void;
    /**
     * Pre-process a video frame based on quality level
     */
    preprocessFrame(frame: VideoFrame, qualityLevel: 'low' | 'medium' | 'high'): Promise<VideoFrame>;
    /**
     * Analyze frame characteristics for optimal compression
     */
    analyzeFrame(frame: VideoFrame): FrameAnalysis;
    /**
     * Apply low quality preprocessing (aggressive compression)
     */
    private applyLowQualityPreprocessing;
    /**
     * Apply medium quality preprocessing (balanced)
     */
    private applyMediumQualityPreprocessing;
    /**
     * Apply high quality preprocessing (minimal processing)
     */
    private applyHighQualityPreprocessing;
    /**
     * Apply temporal compression using inter-frame analysis
     */
    private applyTemporalCompression;
    /**
     * Apply spatial compression using intra-frame analysis
     */
    private applySpatialCompression;
    /**
     * Analyze temporal characteristics of the frame
     */
    private analyzeTemporalCharacteristics;
    /**
     * Analyze spatial characteristics of the frame
     */
    private analyzeSpatialCharacteristics;
    /**
     * Determine recommended quality based on frame analysis
     */
    private determineRecommendedQuality;
    /**
     * Determine recommended quantum compression parameters
     */
    private determineRecommendedParams;
    /**
     * Update frame history for temporal analysis
     */
    private updateFrameHistory;
    /**
     * Downsample frame data
     */
    private downsampleFrame;
    /**
     * Apply quantization to frame data
     */
    private quantizeFrame;
    /**
     * Apply noise reduction
     */
    private applyNoiseReduction;
    /**
     * Calculate motion vectors between frames
     */
    private calculateMotionVectors;
    /**
     * Find best matching block for motion estimation (fast version for testing)
     */
    private findBestMatchFast;
    /**
     * Calculate error between two blocks (fast version for testing)
     */
    private calculateBlockErrorFast;
    /**
     * Apply motion compensation
     */
    private applyMotionCompensation;
    /**
     * Calculate residual between frames
     */
    private calculateResidual;
    /**
     * Calculate scene change score
     */
    private calculateSceneChangeScore;
    /**
     * Calculate temporal complexity
     */
    private calculateTemporalComplexity;
    /**
     * Calculate spatial complexity
     */
    private calculateSpatialComplexity;
    /**
     * Calculate edge density
     */
    private calculateEdgeDensity;
    /**
     * Calculate texture complexity
     */
    private calculateTextureComplexity;
    /**
     * Analyze color distribution
     */
    private analyzeColorDistribution;
    /**
     * Apply spatial transform (simplified DCT-like)
     */
    private applySpatialTransform;
    /**
     * Apply spatial quantization
     */
    private applySpatialQuantization;
    /**
     * Get quantization level based on quality
     */
    private getQuantizationLevel;
    /**
     * Count number of set bits in a number
     */
    private countBits;
}
//# sourceMappingURL=VideoFrameProcessor.d.ts.map