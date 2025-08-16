import { VideoCompressionConfig, NetworkConditions, VideoFrame, VideoCompressionResult, QualityMetrics } from './models/VideoModels';
/**
 * Adaptive quality controller that adjusts compression quality based on network conditions and performance
 */
export declare class AdaptiveQualityController {
    private config;
    private currentQuality;
    private networkConditions;
    private qualityHistory;
    private recentCompressionResults;
    private maxHistorySize;
    private qualityChangeThreshold;
    private stabilityWindow;
    constructor(config: VideoCompressionConfig);
    /**
     * Update network conditions for quality adaptation
     */
    updateNetworkConditions(conditions: NetworkConditions): void;
    /**
     * Update configuration
     */
    updateConfig(config: VideoCompressionConfig): void;
    /**
     * Determine optimal quality level for a frame
     */
    determineOptimalQuality(frame: VideoFrame): 'low' | 'medium' | 'high';
    /**
     * Record compression result for performance tracking
     */
    recordCompressionResult(result: VideoCompressionResult): void;
    /**
     * Get current quality level
     */
    getCurrentQuality(): 'low' | 'medium' | 'high';
    /**
     * Get quality metrics
     */
    getQualityMetrics(): QualityMetrics;
    /**
     * Force quality level (overrides adaptive behavior temporarily)
     */
    forceQuality(quality: 'low' | 'medium' | 'high', reason?: string): void;
    /**
     * Reset quality to base configuration
     */
    resetQuality(): void;
    /**
     * Analyze frame complexity to determine processing requirements
     */
    private analyzeFrameComplexity;
    /**
     * Calculate network score based on current conditions
     */
    private calculateNetworkScore;
    /**
     * Calculate performance score based on recent compression results
     */
    private calculatePerformanceScore;
    /**
     * Calculate overall quality score from individual factors
     */
    private calculateQualityScore;
    /**
     * Convert quality score to quality level
     */
    private scoreToQuality;
    /**
     * Determine if quality should be changed based on threshold
     */
    private shouldChangeQuality;
    /**
     * Set quality level and record the change
     */
    private setQuality;
    /**
     * Record quality change in history
     */
    private recordQualityChange;
    /**
     * Adapt quality based on network conditions
     */
    private adaptQualityToNetwork;
    /**
     * Adapt quality based on performance metrics
     */
    private adaptQualityToPerformance;
    /**
     * Calculate target quality based on current conditions
     */
    private calculateTargetQuality;
    /**
     * Lower quality level by one step
     */
    private lowerQuality;
    /**
     * Raise quality level by one step
     */
    private raiseQuality;
    /**
     * Calculate average compression ratio from results
     */
    private calculateAverageCompressionRatio;
    /**
     * Calculate average processing time from results
     */
    private calculateAverageProcessingTime;
    /**
     * Calculate frame drop rate percentage
     */
    private calculateFrameDropRate;
    /**
     * Calculate quality stability score
     */
    private calculateQualityStability;
    /**
     * Calculate data entropy as a measure of complexity
     */
    private calculateDataEntropy;
}
//# sourceMappingURL=AdaptiveQualityController.d.ts.map