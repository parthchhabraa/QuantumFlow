"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoFrameProcessor = void 0;
/**
 * Video frame processor that handles pre-processing and analysis of video frames
 * for optimal quantum compression
 */
class VideoFrameProcessor {
    constructor(config) {
        this.previousFrame = null;
        this.frameHistory = [];
        this.maxHistorySize = 5;
        this.config = config;
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = config;
    }
    /**
     * Pre-process a video frame based on quality level
     */
    async preprocessFrame(frame, qualityLevel) {
        let processedFrame = { ...frame };
        // Apply quality-specific preprocessing
        switch (qualityLevel) {
            case 'low':
                processedFrame = await this.applyLowQualityPreprocessing(processedFrame);
                break;
            case 'medium':
                processedFrame = await this.applyMediumQualityPreprocessing(processedFrame);
                break;
            case 'high':
                processedFrame = await this.applyHighQualityPreprocessing(processedFrame);
                break;
        }
        // Apply temporal compression if enabled
        if (this.config.enableTemporalCompression && this.previousFrame) {
            processedFrame = await this.applyTemporalCompression(processedFrame);
        }
        // Apply spatial compression if enabled
        if (this.config.enableSpatialCompression) {
            processedFrame = await this.applySpatialCompression(processedFrame, qualityLevel);
        }
        // Update frame history
        this.updateFrameHistory(processedFrame);
        return processedFrame;
    }
    /**
     * Analyze frame characteristics for optimal compression
     */
    analyzeFrame(frame) {
        const temporal = this.analyzeTemporalCharacteristics(frame);
        const spatial = this.analyzeSpatialCharacteristics(frame);
        const recommendedQuality = this.determineRecommendedQuality(temporal, spatial);
        const recommendedParams = this.determineRecommendedParams(temporal, spatial, recommendedQuality);
        return {
            frame,
            temporal,
            spatial,
            recommendedQuality,
            recommendedParams
        };
    }
    /**
     * Apply low quality preprocessing (aggressive compression)
     */
    async applyLowQualityPreprocessing(frame) {
        let processedData = Buffer.from(frame.data);
        // Reduce spatial resolution by downsampling
        const downsampledData = this.downsampleFrame(processedData, frame.width, frame.height, 0.75);
        // Apply aggressive quantization
        const quantizedData = this.quantizeFrame(downsampledData, 8); // 8-bit quantization
        // Apply noise reduction
        const finalData = this.applyNoiseReduction(quantizedData, 'aggressive');
        return {
            ...frame,
            data: finalData,
            qualityLevel: 'low'
        };
    }
    /**
     * Apply medium quality preprocessing (balanced)
     */
    async applyMediumQualityPreprocessing(frame) {
        let processedData = Buffer.from(frame.data);
        // Moderate spatial processing
        const downsampledData = this.downsampleFrame(processedData, frame.width, frame.height, 0.9);
        // Moderate quantization
        const quantizedData = this.quantizeFrame(downsampledData, 10); // 10-bit quantization
        // Moderate noise reduction
        const finalData = this.applyNoiseReduction(quantizedData, 'moderate');
        return {
            ...frame,
            data: finalData,
            qualityLevel: 'medium'
        };
    }
    /**
     * Apply high quality preprocessing (minimal processing)
     */
    async applyHighQualityPreprocessing(frame) {
        let processedData = Buffer.from(frame.data);
        // Minimal spatial processing
        const downsampledData = this.downsampleFrame(processedData, frame.width, frame.height, 0.98);
        // High-quality quantization
        const quantizedData = this.quantizeFrame(downsampledData, 12); // 12-bit quantization
        // Light noise reduction
        const finalData = this.applyNoiseReduction(quantizedData, 'light');
        return {
            ...frame,
            data: finalData,
            qualityLevel: 'high'
        };
    }
    /**
     * Apply temporal compression using inter-frame analysis
     */
    async applyTemporalCompression(frame) {
        if (!this.previousFrame) {
            return frame;
        }
        // Calculate motion vectors between frames
        const motionVectors = this.calculateMotionVectors(this.previousFrame, frame);
        // Apply motion compensation
        const compensatedData = this.applyMotionCompensation(frame.data, motionVectors);
        // Calculate residual (difference) frame
        const residualData = this.calculateResidual(compensatedData, this.previousFrame.data);
        return {
            ...frame,
            data: residualData
        };
    }
    /**
     * Apply spatial compression using intra-frame analysis
     */
    async applySpatialCompression(frame, qualityLevel) {
        let processedData = Buffer.from(frame.data);
        // Apply DCT-like transform for spatial frequency analysis
        const transformedData = this.applySpatialTransform(processedData, frame.width, frame.height);
        // Apply spatial quantization based on quality level
        const quantizationLevel = this.getQuantizationLevel(qualityLevel);
        const finalData = this.applySpatialQuantization(transformedData, quantizationLevel);
        return {
            ...frame,
            data: finalData
        };
    }
    /**
     * Analyze temporal characteristics of the frame
     */
    analyzeTemporalCharacteristics(frame) {
        let motionVectors = [];
        let sceneChangeScore = 0;
        let temporalComplexity = 0.5; // Default complexity
        if (this.previousFrame) {
            // Calculate motion vectors
            motionVectors = this.calculateMotionVectors(this.previousFrame, frame);
            // Detect scene changes
            sceneChangeScore = this.calculateSceneChangeScore(this.previousFrame, frame);
            // Calculate temporal complexity
            temporalComplexity = this.calculateTemporalComplexity(motionVectors, sceneChangeScore);
        }
        return {
            previousFrame: this.previousFrame || undefined,
            motionVectors,
            sceneChangeScore,
            temporalComplexity
        };
    }
    /**
     * Analyze spatial characteristics of the frame
     */
    analyzeSpatialCharacteristics(frame) {
        const spatialComplexity = this.calculateSpatialComplexity(frame.data, frame.width, frame.height);
        const edgeDensity = this.calculateEdgeDensity(frame.data, frame.width, frame.height);
        const textureComplexity = this.calculateTextureComplexity(frame.data, frame.width, frame.height);
        const colorDistribution = this.analyzeColorDistribution(frame.data);
        return {
            spatialComplexity,
            edgeDensity,
            textureComplexity,
            colorDistribution
        };
    }
    /**
     * Determine recommended quality based on frame analysis
     */
    determineRecommendedQuality(temporal, spatial) {
        let complexityScore = 0;
        // Factor in temporal complexity
        complexityScore += temporal.temporalComplexity * 0.4;
        // Factor in spatial complexity
        complexityScore += spatial.spatialComplexity * 0.4;
        // Factor in scene change
        complexityScore += temporal.sceneChangeScore * 0.2;
        // Convert complexity to quality recommendation
        if (complexityScore > 0.7) {
            return 'low'; // High complexity requires lower quality for real-time processing
        }
        else if (complexityScore > 0.4) {
            return 'medium';
        }
        else {
            return 'high';
        }
    }
    /**
     * Determine recommended quantum compression parameters
     */
    determineRecommendedParams(temporal, spatial, quality) {
        let quantumBitDepth;
        let entanglementLevel;
        let superpositionComplexity;
        // Base parameters on quality level
        switch (quality) {
            case 'low':
                quantumBitDepth = 4;
                entanglementLevel = 2;
                superpositionComplexity = 3;
                break;
            case 'medium':
                quantumBitDepth = 6;
                entanglementLevel = 3;
                superpositionComplexity = 4;
                break;
            case 'high':
                quantumBitDepth = 8;
                entanglementLevel = 4;
                superpositionComplexity = 5;
                break;
        }
        // Adjust based on spatial complexity
        if (spatial.spatialComplexity > 0.8) {
            entanglementLevel = Math.min(entanglementLevel + 1, Math.floor(quantumBitDepth / 2));
        }
        // Adjust based on temporal complexity
        if (temporal.temporalComplexity > 0.8) {
            superpositionComplexity = Math.min(superpositionComplexity + 1, quantumBitDepth);
        }
        return { quantumBitDepth, entanglementLevel, superpositionComplexity };
    }
    /**
     * Update frame history for temporal analysis
     */
    updateFrameHistory(frame) {
        this.previousFrame = frame;
        this.frameHistory.push(frame);
        if (this.frameHistory.length > this.maxHistorySize) {
            this.frameHistory.shift();
        }
    }
    /**
     * Downsample frame data
     */
    downsampleFrame(data, width, height, factor) {
        if (factor >= 1.0 || width <= 0 || height <= 0 || data.length === 0) {
            return data;
        }
        // Simple downsampling by skipping pixels
        const newWidth = Math.max(1, Math.floor(width * factor));
        const newHeight = Math.max(1, Math.floor(height * factor));
        const bytesPerPixel = Math.max(1, Math.floor(data.length / (width * height)));
        const targetSize = newWidth * newHeight * bytesPerPixel;
        if (targetSize <= 0 || !isFinite(targetSize)) {
            return data; // Return original if calculation is invalid
        }
        const downsampledData = Buffer.alloc(targetSize);
        for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
                const srcX = Math.min(width - 1, Math.floor(x / factor));
                const srcY = Math.min(height - 1, Math.floor(y / factor));
                const srcOffset = (srcY * width + srcX) * bytesPerPixel;
                const dstOffset = (y * newWidth + x) * bytesPerPixel;
                for (let c = 0; c < bytesPerPixel && srcOffset + c < data.length && dstOffset + c < downsampledData.length; c++) {
                    downsampledData[dstOffset + c] = data[srcOffset + c];
                }
            }
        }
        return downsampledData;
    }
    /**
     * Apply quantization to frame data
     */
    quantizeFrame(data, bits) {
        if (data.length === 0 || bits <= 0 || bits > 8) {
            return data;
        }
        const quantizationStep = Math.max(1, Math.pow(2, 8 - bits));
        const quantizedData = Buffer.alloc(data.length);
        for (let i = 0; i < data.length; i++) {
            quantizedData[i] = Math.min(255, Math.floor(data[i] / quantizationStep) * quantizationStep);
        }
        return quantizedData;
    }
    /**
     * Apply noise reduction
     */
    applyNoiseReduction(data, level) {
        const strength = level === 'light' ? 0.1 : level === 'moderate' ? 0.3 : 0.5;
        const processedData = Buffer.alloc(data.length);
        // Simple noise reduction using local averaging
        for (let i = 0; i < data.length; i++) {
            let sum = data[i];
            let count = 1;
            // Average with neighboring pixels
            if (i > 0) {
                sum += data[i - 1];
                count++;
            }
            if (i < data.length - 1) {
                sum += data[i + 1];
                count++;
            }
            const average = sum / count;
            processedData[i] = Math.round(data[i] * (1 - strength) + average * strength);
        }
        return processedData;
    }
    /**
     * Calculate motion vectors between frames
     */
    calculateMotionVectors(prevFrame, currentFrame) {
        // Simplified motion vector calculation for testing
        const blockSize = Math.min(32, Math.max(8, Math.floor(Math.min(currentFrame.width, currentFrame.height) / 8))); // Adaptive block size
        const vectors = [];
        const blocksX = Math.max(1, Math.floor(currentFrame.width / blockSize));
        const blocksY = Math.max(1, Math.floor(currentFrame.height / blockSize));
        // Limit to reasonable number of blocks for performance
        const maxBlocks = 16;
        const stepX = Math.max(1, Math.floor(blocksX / Math.sqrt(maxBlocks)));
        const stepY = Math.max(1, Math.floor(blocksY / Math.sqrt(maxBlocks)));
        for (let by = 0; by < blocksY; by += stepY) {
            for (let bx = 0; bx < blocksX; bx += stepX) {
                // Simple block matching (optimized for testing)
                const vector = this.findBestMatchFast(prevFrame, currentFrame, bx * blockSize, by * blockSize, blockSize);
                vectors.push(vector);
            }
        }
        return vectors;
    }
    /**
     * Find best matching block for motion estimation (fast version for testing)
     */
    findBestMatchFast(prevFrame, currentFrame, x, y, blockSize) {
        // Very simplified block matching for testing performance
        const searchRange = 4; // Reduced search range
        let bestX = 0;
        let bestY = 0;
        let bestError = Infinity;
        // Sample only a few positions for speed
        const positions = [
            { dx: 0, dy: 0 },
            { dx: -2, dy: -2 },
            { dx: 2, dy: 2 },
            { dx: -2, dy: 2 },
            { dx: 2, dy: -2 }
        ];
        for (const { dx, dy } of positions) {
            if (Math.abs(dx) <= searchRange && Math.abs(dy) <= searchRange) {
                const error = this.calculateBlockErrorFast(prevFrame, currentFrame, x, y, x + dx, y + dy, blockSize);
                if (error < bestError) {
                    bestError = error;
                    bestX = dx;
                    bestY = dy;
                }
            }
        }
        const magnitude = Math.sqrt(bestX * bestX + bestY * bestY);
        return { x: bestX, y: bestY, magnitude };
    }
    /**
     * Calculate error between two blocks (fast version for testing)
     */
    calculateBlockErrorFast(frame1, frame2, x1, y1, x2, y2, blockSize) {
        let error = 0;
        const bytesPerPixel = Math.max(1, Math.floor(frame1.data.length / (frame1.width * frame1.height)));
        // Sample only a few pixels for speed
        const sampleStep = Math.max(1, Math.floor(blockSize / 4));
        for (let y = 0; y < blockSize; y += sampleStep) {
            for (let x = 0; x < blockSize; x += sampleStep) {
                const offset1 = ((y1 + y) * frame1.width + (x1 + x)) * bytesPerPixel;
                const offset2 = ((y2 + y) * frame2.width + (x2 + x)) * bytesPerPixel;
                if (offset1 >= 0 && offset1 < frame1.data.length && offset2 >= 0 && offset2 < frame2.data.length) {
                    error += Math.abs(frame1.data[offset1] - frame2.data[offset2]);
                }
            }
        }
        return error;
    }
    /**
     * Apply motion compensation
     */
    applyMotionCompensation(frameData, motionVectors) {
        // Simplified motion compensation
        return Buffer.from(frameData);
    }
    /**
     * Calculate residual between frames
     */
    calculateResidual(frame1Data, frame2Data) {
        const residual = Buffer.alloc(Math.min(frame1Data.length, frame2Data.length));
        for (let i = 0; i < residual.length; i++) {
            residual[i] = Math.abs(frame1Data[i] - frame2Data[i]);
        }
        return residual;
    }
    /**
     * Calculate scene change score
     */
    calculateSceneChangeScore(prevFrame, currentFrame) {
        const minLength = Math.min(prevFrame.data.length, currentFrame.data.length);
        if (minLength === 0)
            return 0;
        let totalDifference = 0;
        // Sample every 10th pixel for performance
        const sampleStep = Math.max(1, Math.floor(minLength / 1000));
        let sampleCount = 0;
        for (let i = 0; i < minLength; i += sampleStep) {
            totalDifference += Math.abs(prevFrame.data[i] - currentFrame.data[i]);
            sampleCount++;
        }
        if (sampleCount === 0)
            return 0;
        // Normalize to 0-1 range
        const avgDifference = totalDifference / sampleCount;
        return Math.min(avgDifference / 255, 1);
    }
    /**
     * Calculate temporal complexity
     */
    calculateTemporalComplexity(motionVectors, sceneChangeScore) {
        if (motionVectors.length === 0)
            return sceneChangeScore;
        const avgMotion = motionVectors.reduce((sum, v) => sum + v.magnitude, 0) / motionVectors.length;
        const normalizedMotion = Math.min(avgMotion / 10, 1); // Normalize to 0-1
        return (normalizedMotion * 0.7 + sceneChangeScore * 0.3);
    }
    /**
     * Calculate spatial complexity
     */
    calculateSpatialComplexity(data, width, height) {
        // Calculate variance as a measure of spatial complexity
        let sum = 0;
        let sumSquares = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
            sumSquares += data[i] * data[i];
        }
        const mean = sum / data.length;
        const variance = (sumSquares / data.length) - (mean * mean);
        // Normalize variance to 0-1 range
        return Math.min(variance / (255 * 255), 1);
    }
    /**
     * Calculate edge density
     */
    calculateEdgeDensity(data, width, height) {
        if (width <= 2 || height <= 2 || data.length === 0)
            return 0;
        let edgeCount = 0;
        const threshold = 30; // Edge detection threshold
        const bytesPerPixel = Math.max(1, Math.floor(data.length / (width * height)));
        // Sample every few pixels for performance
        const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 20));
        let totalSamples = 0;
        for (let y = 1; y < height - 1; y += sampleStep) {
            for (let x = 1; x < width - 1; x += sampleStep) {
                const centerOffset = (y * width + x) * bytesPerPixel;
                const rightOffset = (y * width + (x + 1)) * bytesPerPixel;
                const bottomOffset = ((y + 1) * width + x) * bytesPerPixel;
                if (centerOffset < data.length && rightOffset < data.length && bottomOffset < data.length) {
                    const center = data[centerOffset];
                    const right = data[rightOffset];
                    const bottom = data[bottomOffset];
                    if (Math.abs(center - right) > threshold || Math.abs(center - bottom) > threshold) {
                        edgeCount++;
                    }
                    totalSamples++;
                }
            }
        }
        return totalSamples > 0 ? edgeCount / totalSamples : 0;
    }
    /**
     * Calculate texture complexity
     */
    calculateTextureComplexity(data, width, height) {
        // Use local binary patterns as a measure of texture complexity
        let textureScore = 0;
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const center = data[y * width + x];
                let pattern = 0;
                // Check 8 neighbors
                const neighbors = [
                    data[(y - 1) * width + (x - 1)],
                    data[(y - 1) * width + x],
                    data[(y - 1) * width + (x + 1)],
                    data[y * width + (x + 1)],
                    data[(y + 1) * width + (x + 1)],
                    data[(y + 1) * width + x],
                    data[(y + 1) * width + (x - 1)],
                    data[y * width + (x - 1)]
                ];
                for (let i = 0; i < neighbors.length; i++) {
                    if (neighbors[i] >= center) {
                        pattern |= (1 << i);
                    }
                }
                textureScore += this.countBits(pattern);
            }
        }
        return textureScore / ((width - 2) * (height - 2) * 8);
    }
    /**
     * Analyze color distribution
     */
    analyzeColorDistribution(data) {
        const histogram = new Array(256).fill(0);
        // Build histogram
        for (let i = 0; i < data.length; i++) {
            histogram[data[i]]++;
        }
        // Calculate entropy
        let entropy = 0;
        for (let i = 0; i < 256; i++) {
            if (histogram[i] > 0) {
                const probability = histogram[i] / data.length;
                entropy -= probability * Math.log2(probability);
            }
        }
        // Count dominant colors (colors with > 1% of pixels)
        const dominantColors = histogram.filter(count => count > data.length * 0.01).length;
        // Calculate color variance
        let sum = 0;
        let sumSquares = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
            sumSquares += data[i] * data[i];
        }
        const mean = sum / data.length;
        const colorVariance = (sumSquares / data.length) - (mean * mean);
        return {
            entropy: entropy / 8, // Normalize to 0-1
            dominantColors,
            colorVariance: colorVariance / (255 * 255) // Normalize to 0-1
        };
    }
    /**
     * Apply spatial transform (simplified DCT-like)
     */
    applySpatialTransform(data, width, height) {
        // Simplified spatial transform - in practice would use DCT or wavelet transform
        return Buffer.from(data);
    }
    /**
     * Apply spatial quantization
     */
    applySpatialQuantization(data, level) {
        const quantizationStep = Math.pow(2, 8 - level);
        const quantizedData = Buffer.alloc(data.length);
        for (let i = 0; i < data.length; i++) {
            quantizedData[i] = Math.floor(data[i] / quantizationStep) * quantizationStep;
        }
        return quantizedData;
    }
    /**
     * Get quantization level based on quality
     */
    getQuantizationLevel(quality) {
        switch (quality) {
            case 'low': return 6;
            case 'medium': return 8;
            case 'high': return 10;
        }
    }
    /**
     * Count number of set bits in a number
     */
    countBits(n) {
        let count = 0;
        while (n) {
            count += n & 1;
            n >>= 1;
        }
        return count;
    }
}
exports.VideoFrameProcessor = VideoFrameProcessor;
//# sourceMappingURL=VideoFrameProcessor.js.map