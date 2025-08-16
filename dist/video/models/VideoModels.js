"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoCompressionConfig = void 0;
/**
 * Video compression configuration
 */
class VideoCompressionConfig {
    constructor(baseQuality = 'medium', adaptiveQuality = true, quantumCompressionLevel = 5, bandwidthThreshold = 2, targetFrameRate = 30, maxLatency = 100, keyFrameInterval = 30, enableTemporalCompression = true, enableSpatialCompression = true) {
        this.baseQuality = baseQuality;
        this.adaptiveQuality = adaptiveQuality;
        this.quantumCompressionLevel = this.validateCompressionLevel(quantumCompressionLevel);
        this.bandwidthThreshold = bandwidthThreshold;
        this.targetFrameRate = targetFrameRate;
        this.maxLatency = maxLatency;
        this.keyFrameInterval = keyFrameInterval;
        this.enableTemporalCompression = enableTemporalCompression;
        this.enableSpatialCompression = enableSpatialCompression;
    }
    /**
     * Create default video compression configuration
     */
    static createDefault() {
        return new VideoCompressionConfig();
    }
    /**
     * Create low-latency configuration for real-time applications
     */
    static createLowLatency() {
        return new VideoCompressionConfig('medium', true, 3, // Lower compression level for speed
        1, // Lower bandwidth threshold
        30, 50, // Lower max latency
        15, // More frequent key frames
        false, // Disable temporal compression for lower latency
        true);
    }
    /**
     * Create high-quality configuration for recording
     */
    static createHighQuality() {
        return new VideoCompressionConfig('high', false, // Disable adaptive quality for consistent high quality
        8, // Higher compression level
        10, // Higher bandwidth threshold
        60, 200, // Allow higher latency for quality
        60, // Less frequent key frames
        true, true);
    }
    /**
     * Create mobile-optimized configuration
     */
    static createMobileOptimized() {
        return new VideoCompressionConfig('low', true, 4, 0.5, // Very low bandwidth threshold
        24, // Lower frame rate
        150, 20, true, true);
    }
    /**
     * Validate compression level parameter
     */
    validateCompressionLevel(level) {
        if (level < 1 || level > 10) {
            throw new Error('Quantum compression level must be between 1 and 10');
        }
        return level;
    }
    /**
     * Update configuration parameters
     */
    updateConfig(updates) {
        Object.assign(this, updates);
        if (updates.quantumCompressionLevel !== undefined) {
            this.quantumCompressionLevel = this.validateCompressionLevel(updates.quantumCompressionLevel);
        }
    }
    /**
     * Get configuration as plain object
     */
    toObject() {
        return {
            baseQuality: this.baseQuality,
            adaptiveQuality: this.adaptiveQuality,
            quantumCompressionLevel: this.quantumCompressionLevel,
            bandwidthThreshold: this.bandwidthThreshold,
            targetFrameRate: this.targetFrameRate,
            maxLatency: this.maxLatency,
            keyFrameInterval: this.keyFrameInterval,
            enableTemporalCompression: this.enableTemporalCompression,
            enableSpatialCompression: this.enableSpatialCompression
        };
    }
}
exports.VideoCompressionConfig = VideoCompressionConfig;
//# sourceMappingURL=VideoModels.js.map