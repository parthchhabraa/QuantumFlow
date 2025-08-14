"use strict";
/**
 * QuantumMetrics - Performance tracking system for quantum compression operations
 * Tracks compression ratios, processing times, and quantum efficiency metrics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumMetrics = void 0;
class QuantumMetrics {
    constructor() {
        this.startTime = 0;
        this.phaseStartTime = 0;
        this.compressionMetrics = {
            originalSize: 0,
            compressedSize: 0,
            compressionRatio: 1,
            compressionPercentage: 0
        };
        this.processingMetrics = {
            totalTime: 0,
            conversionTime: 0,
            superpositionTime: 0,
            entanglementTime: 0,
            interferenceTime: 0,
            encodingTime: 0
        };
        this.efficiencyMetrics = {
            quantumStatesCreated: 0,
            entanglementPairsFound: 0,
            averageCorrelationStrength: 0,
            superpositionComplexity: 0,
            interferenceEffectiveness: 0,
            coherenceTime: 0
        };
        this.sessionStats = {
            filesProcessed: 0,
            totalBytesProcessed: 0,
            totalBytesSaved: 0,
            averageCompressionRatio: 1,
            bestCompressionRatio: 1,
            worstCompressionRatio: 1,
            totalProcessingTime: 0,
            averageProcessingTime: 0,
            performanceTrend: 'stable',
            baselineCompressionRatio: 1.15, // 15% better than gzip baseline
            recentCompressionRatios: []
        };
    }
    /**
     * Start timing a compression operation
     */
    startTiming() {
        this.startTime = Date.now();
        this.phaseStartTime = this.startTime;
    }
    /**
     * Start timing a specific processing phase
     */
    startPhase() {
        this.phaseStartTime = Date.now();
    }
    /**
     * End timing for a specific phase and record the duration
     */
    endPhase(phase) {
        const duration = Date.now() - this.phaseStartTime;
        this.processingMetrics[phase] = duration;
    }
    /**
     * End timing for the entire compression operation
     */
    endTiming() {
        this.processingMetrics.totalTime = Date.now() - this.startTime;
    }
    /**
     * Record compression metrics
     */
    recordCompressionMetrics(originalSize, compressedSize) {
        this.compressionMetrics.originalSize = originalSize;
        this.compressionMetrics.compressedSize = compressedSize;
        this.compressionMetrics.compressionRatio = originalSize / compressedSize;
        this.compressionMetrics.compressionPercentage =
            (1 - compressedSize / originalSize) * 100;
    }
    /**
     * Record quantum efficiency metrics
     */
    recordQuantumEfficiency(quantumStatesCreated, entanglementPairsFound, averageCorrelationStrength, superpositionComplexity, interferenceEffectiveness, coherenceTime) {
        this.efficiencyMetrics = {
            quantumStatesCreated,
            entanglementPairsFound,
            averageCorrelationStrength,
            superpositionComplexity,
            interferenceEffectiveness,
            coherenceTime
        };
    }
    /**
     * Update session statistics with current operation
     */
    updateSessionStatistics() {
        this.sessionStats.filesProcessed++;
        this.sessionStats.totalBytesProcessed += this.compressionMetrics.originalSize;
        this.sessionStats.totalBytesSaved +=
            (this.compressionMetrics.originalSize - this.compressionMetrics.compressedSize);
        this.sessionStats.totalProcessingTime += this.processingMetrics.totalTime;
        // Update averages
        this.sessionStats.averageProcessingTime =
            this.sessionStats.totalProcessingTime / this.sessionStats.filesProcessed;
        // Update compression ratio statistics
        const currentRatio = this.compressionMetrics.compressionRatio;
        if (this.sessionStats.filesProcessed === 1) {
            this.sessionStats.averageCompressionRatio = currentRatio;
            this.sessionStats.bestCompressionRatio = currentRatio;
            this.sessionStats.worstCompressionRatio = currentRatio;
        }
        else {
            // Update running average
            this.sessionStats.averageCompressionRatio =
                (this.sessionStats.averageCompressionRatio * (this.sessionStats.filesProcessed - 1) + currentRatio)
                    / this.sessionStats.filesProcessed;
            // Update best/worst
            this.sessionStats.bestCompressionRatio = Math.max(this.sessionStats.bestCompressionRatio, currentRatio);
            this.sessionStats.worstCompressionRatio = Math.min(this.sessionStats.worstCompressionRatio, currentRatio);
        }
        // Track recent compression ratios for trend analysis (keep last 10)
        this.sessionStats.recentCompressionRatios.push(currentRatio);
        if (this.sessionStats.recentCompressionRatios.length > 10) {
            this.sessionStats.recentCompressionRatios.shift();
        }
        // Update performance trend
        this.updatePerformanceTrend();
    }
    /**
     * Get current compression metrics
     */
    getCompressionMetrics() {
        return { ...this.compressionMetrics };
    }
    /**
     * Get current processing metrics
     */
    getProcessingMetrics() {
        return { ...this.processingMetrics };
    }
    /**
     * Get current quantum efficiency metrics
     */
    getQuantumEfficiencyMetrics() {
        return { ...this.efficiencyMetrics };
    }
    /**
     * Get current session statistics
     */
    getSessionStatistics() {
        return { ...this.sessionStats };
    }
    /**
     * Get all metrics in a single object
     */
    getAllMetrics() {
        return {
            compression: this.getCompressionMetrics(),
            processing: this.getProcessingMetrics(),
            efficiency: this.getQuantumEfficiencyMetrics(),
            session: this.getSessionStatistics()
        };
    }
    /**
     * Reset all metrics for a new operation
     */
    reset() {
        this.compressionMetrics = {
            originalSize: 0,
            compressedSize: 0,
            compressionRatio: 1,
            compressionPercentage: 0
        };
        this.processingMetrics = {
            totalTime: 0,
            conversionTime: 0,
            superpositionTime: 0,
            entanglementTime: 0,
            interferenceTime: 0,
            encodingTime: 0
        };
        this.efficiencyMetrics = {
            quantumStatesCreated: 0,
            entanglementPairsFound: 0,
            averageCorrelationStrength: 0,
            superpositionComplexity: 0,
            interferenceEffectiveness: 0,
            coherenceTime: 0
        };
    }
    /**
     * Reset session statistics
     */
    resetSession() {
        this.sessionStats = {
            filesProcessed: 0,
            totalBytesProcessed: 0,
            totalBytesSaved: 0,
            averageCompressionRatio: 1,
            bestCompressionRatio: 1,
            worstCompressionRatio: 1,
            totalProcessingTime: 0,
            averageProcessingTime: 0,
            performanceTrend: 'stable',
            baselineCompressionRatio: 1.15, // 15% better than gzip baseline
            recentCompressionRatios: []
        };
    }
    /**
     * Set processing metrics directly (primarily for testing)
     */
    setProcessingMetrics(metrics) {
        this.processingMetrics = { ...this.processingMetrics, ...metrics };
    }
    /**
     * Update performance trend based on recent compression ratios
     */
    updatePerformanceTrend() {
        const recent = this.sessionStats.recentCompressionRatios;
        if (recent.length < 3) {
            this.sessionStats.performanceTrend = 'stable';
            return;
        }
        // Calculate trend over last 5 operations (or all if less than 5)
        const trendWindow = Math.min(5, recent.length);
        const recentWindow = recent.slice(-trendWindow);
        // Simple linear regression to determine trend
        const n = recentWindow.length;
        const sumX = (n * (n - 1)) / 2; // Sum of indices 0, 1, 2, ...
        const sumY = recentWindow.reduce((sum, ratio) => sum + ratio, 0);
        const sumXY = recentWindow.reduce((sum, ratio, index) => sum + (index * ratio), 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares of indices
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        // Determine trend based on slope
        if (slope > 0.05) {
            this.sessionStats.performanceTrend = 'improving';
        }
        else if (slope < -0.05) {
            this.sessionStats.performanceTrend = 'degrading';
        }
        else {
            this.sessionStats.performanceTrend = 'stable';
        }
    }
    /**
     * Generate optimization suggestions based on current performance
     */
    generateOptimizationSuggestions() {
        const suggestions = [];
        const currentRatio = this.compressionMetrics.compressionRatio;
        const avgRatio = this.sessionStats.averageCompressionRatio;
        const baseline = this.sessionStats.baselineCompressionRatio;
        // Check if performance is below baseline
        if (avgRatio < baseline) {
            suggestions.push({
                type: 'general',
                priority: 'high',
                description: `Average compression ratio (${avgRatio.toFixed(2)}:1) is below baseline (${baseline.toFixed(2)}:1)`,
                suggestion: 'Consider increasing quantum simulation parameters to improve compression',
                expectedImprovement: 'Should achieve target 15% improvement over traditional compression'
            });
        }
        // Check for degrading performance trend
        if (this.sessionStats.performanceTrend === 'degrading') {
            suggestions.push({
                type: 'general',
                priority: 'medium',
                description: 'Performance trend is degrading over recent operations',
                suggestion: 'Review recent file types and consider parameter adjustments',
                expectedImprovement: 'Stabilize or improve compression ratios'
            });
        }
        // Quantum-specific suggestions based on efficiency metrics
        const efficiency = this.efficiencyMetrics;
        // Low entanglement effectiveness
        if (efficiency.entanglementPairsFound > 0 && efficiency.averageCorrelationStrength < 0.5) {
            suggestions.push({
                type: 'entanglement_level',
                priority: 'medium',
                description: `Low average correlation strength (${efficiency.averageCorrelationStrength.toFixed(3)})`,
                suggestion: 'Increase entanglement detection sensitivity or reduce entanglement threshold',
                currentValue: efficiency.averageCorrelationStrength,
                suggestedValue: 0.5,
                expectedImprovement: 'Better pattern correlation detection and compression'
            });
        }
        // Low interference effectiveness
        if (efficiency.interferenceEffectiveness < 0.6) {
            suggestions.push({
                type: 'interference_threshold',
                priority: 'medium',
                description: `Low interference effectiveness (${efficiency.interferenceEffectiveness.toFixed(3)})`,
                suggestion: 'Adjust interference thresholds to optimize pattern elimination',
                currentValue: efficiency.interferenceEffectiveness,
                suggestedValue: 0.75,
                expectedImprovement: 'More effective redundancy elimination'
            });
        }
        // High processing time relative to compression gain
        const processingEfficiency = currentRatio / (this.processingMetrics.totalTime / 1000); // ratio per second
        if (processingEfficiency < 0.5 && this.processingMetrics.totalTime > 1000) {
            suggestions.push({
                type: 'superposition_complexity',
                priority: 'low',
                description: `Low processing efficiency (${processingEfficiency.toFixed(2)} ratio/sec)`,
                suggestion: 'Consider reducing superposition complexity for faster processing',
                expectedImprovement: 'Faster compression with minimal ratio impact'
            });
        }
        // Very low quantum state utilization
        if (efficiency.quantumStatesCreated > 0 && efficiency.quantumStatesCreated < 10) {
            suggestions.push({
                type: 'quantum_bit_depth',
                priority: 'low',
                description: `Low quantum state utilization (${efficiency.quantumStatesCreated} states)`,
                suggestion: 'Increase quantum bit depth to create more states for better compression',
                currentValue: efficiency.quantumStatesCreated,
                suggestedValue: 50,
                expectedImprovement: 'More quantum states for pattern analysis'
            });
        }
        // Critical performance issues
        if (currentRatio < 1.0) {
            suggestions.push({
                type: 'general',
                priority: 'critical',
                description: 'Compression is expanding data instead of compressing it',
                suggestion: 'Check input data type and consider fallback to classical compression',
                expectedImprovement: 'Prevent data expansion and achieve actual compression'
            });
        }
        return suggestions.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
    /**
     * Set baseline compression ratio for performance comparison
     */
    setBaselineCompressionRatio(baseline) {
        this.sessionStats.baselineCompressionRatio = baseline;
    }
    /**
     * Get performance trend analysis
     */
    getPerformanceTrend() {
        const recent = this.sessionStats.recentCompressionRatios;
        const averageRecent = recent.length > 0
            ? recent.reduce((sum, ratio) => sum + ratio, 0) / recent.length
            : 1;
        let comparedToBaseline;
        if (averageRecent > this.sessionStats.baselineCompressionRatio * 1.05) {
            comparedToBaseline = 'above';
        }
        else if (averageRecent < this.sessionStats.baselineCompressionRatio * 0.95) {
            comparedToBaseline = 'below';
        }
        else {
            comparedToBaseline = 'at';
        }
        return {
            trend: this.sessionStats.performanceTrend,
            recentRatios: [...recent],
            averageRecent,
            comparedToBaseline
        };
    }
    /**
     * Generate a formatted report of all metrics
     */
    generateReport() {
        const compression = this.compressionMetrics;
        const processing = this.processingMetrics;
        const efficiency = this.efficiencyMetrics;
        const session = this.sessionStats;
        return `
QuantumFlow Performance Report
=============================

Compression Metrics:
- Original Size: ${compression.originalSize.toLocaleString()} bytes
- Compressed Size: ${compression.compressedSize.toLocaleString()} bytes
- Compression Ratio: ${compression.compressionRatio.toFixed(2)}:1
- Space Saved: ${compression.compressionPercentage.toFixed(1)}%

Processing Time:
- Total Time: ${processing.totalTime}ms
- Conversion: ${processing.conversionTime}ms
- Superposition: ${processing.superpositionTime}ms
- Entanglement: ${processing.entanglementTime}ms
- Interference: ${processing.interferenceTime}ms
- Encoding: ${processing.encodingTime}ms

Quantum Efficiency:
- Quantum States: ${efficiency.quantumStatesCreated}
- Entanglement Pairs: ${efficiency.entanglementPairsFound}
- Avg Correlation: ${efficiency.averageCorrelationStrength.toFixed(3)}
- Superposition Complexity: ${efficiency.superpositionComplexity.toFixed(2)}
- Interference Effectiveness: ${efficiency.interferenceEffectiveness.toFixed(3)}
- Coherence Time: ${efficiency.coherenceTime.toFixed(2)}ms

Session Statistics:
- Files Processed: ${session.filesProcessed}
- Total Bytes: ${session.totalBytesProcessed.toLocaleString()}
- Bytes Saved: ${session.totalBytesSaved.toLocaleString()}
- Avg Compression: ${session.averageCompressionRatio.toFixed(2)}:1
- Best Compression: ${session.bestCompressionRatio.toFixed(2)}:1
- Worst Compression: ${session.worstCompressionRatio.toFixed(2)}:1
- Avg Processing Time: ${session.averageProcessingTime.toFixed(0)}ms
- Performance Trend: ${session.performanceTrend}
- Baseline Target: ${session.baselineCompressionRatio.toFixed(2)}:1

Optimization Suggestions:
${this.generateOptimizationSuggestions().map(suggestion => `- [${suggestion.priority.toUpperCase()}] ${suggestion.description}: ${suggestion.suggestion}`).join('\n') || '- No optimization suggestions at this time'}
    `.trim();
    }
}
exports.QuantumMetrics = QuantumMetrics;
//# sourceMappingURL=QuantumMetrics.js.map