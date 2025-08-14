/**
 * QuantumMetrics - Performance tracking system for quantum compression operations
 * Tracks compression ratios, processing times, and quantum efficiency metrics
 */
export interface CompressionMetrics {
    /** Original file size in bytes */
    originalSize: number;
    /** Compressed file size in bytes */
    compressedSize: number;
    /** Compression ratio (originalSize / compressedSize) */
    compressionRatio: number;
    /** Compression percentage (1 - compressedSize/originalSize) * 100 */
    compressionPercentage: number;
}
export interface ProcessingMetrics {
    /** Total processing time in milliseconds */
    totalTime: number;
    /** Time spent in quantum state conversion */
    conversionTime: number;
    /** Time spent in superposition processing */
    superpositionTime: number;
    /** Time spent in entanglement analysis */
    entanglementTime: number;
    /** Time spent in interference optimization */
    interferenceTime: number;
    /** Time spent in final encoding */
    encodingTime: number;
}
export interface QuantumEfficiencyMetrics {
    /** Number of quantum states created */
    quantumStatesCreated: number;
    /** Number of entanglement pairs found */
    entanglementPairsFound: number;
    /** Average correlation strength of entangled pairs */
    averageCorrelationStrength: number;
    /** Superposition complexity achieved */
    superpositionComplexity: number;
    /** Interference optimization effectiveness (0-1) */
    interferenceEffectiveness: number;
    /** Quantum coherence time maintained */
    coherenceTime: number;
}
export interface SessionStatistics {
    /** Total files processed in this session */
    filesProcessed: number;
    /** Total bytes processed */
    totalBytesProcessed: number;
    /** Total bytes saved through compression */
    totalBytesSaved: number;
    /** Average compression ratio across all files */
    averageCompressionRatio: number;
    /** Best compression ratio achieved */
    bestCompressionRatio: number;
    /** Worst compression ratio achieved */
    worstCompressionRatio: number;
    /** Total processing time for all files */
    totalProcessingTime: number;
    /** Average processing time per file */
    averageProcessingTime: number;
    /** Performance trend over recent operations */
    performanceTrend: 'improving' | 'stable' | 'degrading';
    /** Baseline compression ratio for comparison */
    baselineCompressionRatio: number;
    /** Recent compression ratios for trend analysis */
    recentCompressionRatios: number[];
}
export interface OptimizationSuggestion {
    /** Type of optimization suggested */
    type: 'quantum_bit_depth' | 'entanglement_level' | 'superposition_complexity' | 'interference_threshold' | 'general';
    /** Priority level of the suggestion */
    priority: 'low' | 'medium' | 'high' | 'critical';
    /** Human-readable description of the issue */
    description: string;
    /** Suggested action to take */
    suggestion: string;
    /** Current parameter value (if applicable) */
    currentValue?: number;
    /** Suggested parameter value (if applicable) */
    suggestedValue?: number;
    /** Expected improvement description */
    expectedImprovement: string;
}
export declare class QuantumMetrics {
    private compressionMetrics;
    private processingMetrics;
    private efficiencyMetrics;
    private sessionStats;
    private startTime;
    private phaseStartTime;
    constructor();
    /**
     * Start timing a compression operation
     */
    startTiming(): void;
    /**
     * Start timing a specific processing phase
     */
    startPhase(): void;
    /**
     * End timing for a specific phase and record the duration
     */
    endPhase(phase: keyof Omit<ProcessingMetrics, 'totalTime'>): void;
    /**
     * End timing for the entire compression operation
     */
    endTiming(): void;
    /**
     * Record compression metrics
     */
    recordCompressionMetrics(originalSize: number, compressedSize: number): void;
    /**
     * Record quantum efficiency metrics
     */
    recordQuantumEfficiency(quantumStatesCreated: number, entanglementPairsFound: number, averageCorrelationStrength: number, superpositionComplexity: number, interferenceEffectiveness: number, coherenceTime: number): void;
    /**
     * Update session statistics with current operation
     */
    updateSessionStatistics(): void;
    /**
     * Get current compression metrics
     */
    getCompressionMetrics(): CompressionMetrics;
    /**
     * Get current processing metrics
     */
    getProcessingMetrics(): ProcessingMetrics;
    /**
     * Get current quantum efficiency metrics
     */
    getQuantumEfficiencyMetrics(): QuantumEfficiencyMetrics;
    /**
     * Get current session statistics
     */
    getSessionStatistics(): SessionStatistics;
    /**
     * Get all metrics in a single object
     */
    getAllMetrics(): {
        compression: CompressionMetrics;
        processing: ProcessingMetrics;
        efficiency: QuantumEfficiencyMetrics;
        session: SessionStatistics;
    };
    /**
     * Reset all metrics for a new operation
     */
    reset(): void;
    /**
     * Reset session statistics
     */
    resetSession(): void;
    /**
     * Set processing metrics directly (primarily for testing)
     */
    setProcessingMetrics(metrics: Partial<ProcessingMetrics>): void;
    /**
     * Update performance trend based on recent compression ratios
     */
    private updatePerformanceTrend;
    /**
     * Generate optimization suggestions based on current performance
     */
    generateOptimizationSuggestions(): OptimizationSuggestion[];
    /**
     * Set baseline compression ratio for performance comparison
     */
    setBaselineCompressionRatio(baseline: number): void;
    /**
     * Get performance trend analysis
     */
    getPerformanceTrend(): {
        trend: 'improving' | 'stable' | 'degrading';
        recentRatios: number[];
        averageRecent: number;
        comparedToBaseline: 'above' | 'below' | 'at';
    };
    /**
     * Generate a formatted report of all metrics
     */
    generateReport(): string;
}
//# sourceMappingURL=QuantumMetrics.d.ts.map