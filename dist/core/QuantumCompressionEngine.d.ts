import { QuantumConfig } from '../models/QuantumConfig';
import { CompressedQuantumData } from '../models/CompressedQuantumData';
import { QuantumMetrics } from '../models/QuantumMetrics';
/**
 * Main quantum compression engine that orchestrates all quantum processing phases
 * Implements the complete compression workflow from classical data to compressed quantum representation
 */
export declare class QuantumCompressionEngine {
    private _stateConverter;
    private _superpositionProcessor;
    private _entanglementAnalyzer;
    private _interferenceOptimizer;
    private _config;
    private _metrics;
    constructor(config?: QuantumConfig);
    /**
     * Get current configuration
     */
    get config(): QuantumConfig;
    /**
     * Set new configuration and reinitialize components
     */
    set config(newConfig: QuantumConfig);
    /**
     * Compress input data using quantum-inspired algorithms with graceful degradation
     */
    compress(input: Buffer, config?: QuantumConfig): CompressedQuantumData;
    /**
     * Decompress quantum-compressed data back to original format
     * Implements quantum interference reversal algorithms for data recovery with fallback support
     */
    decompress(compressed: CompressedQuantumData): Buffer;
    /**
     * Decompress data that was compressed using fallback strategies
     */
    private decompressFallbackData;
    /**
     * Decompress chunked classical data
     */
    private decompressChunkedData;
    /**
     * Decompress hybrid compressed data
     */
    private decompressHybridData;
    /**
     * Decompress classical data with quantum metadata
     */
    private decompressClassicalWithMetadata;
    /**
     * Run-length decode implementation
     */
    private runLengthDecode;
    /**
     * Get comprehensive compression metrics for the last operation
     */
    getCompressionMetrics(): QuantumMetrics;
    /**
     * Get all metrics in a structured format
     */
    getAllMetrics(): {
        compression: import("../models/QuantumMetrics").CompressionMetrics;
        processing: import("../models/QuantumMetrics").ProcessingMetrics;
        efficiency: import("../models/QuantumMetrics").QuantumEfficiencyMetrics;
        session: import("../models/QuantumMetrics").SessionStatistics;
    };
    /**
     * Generate a formatted performance report
     */
    generatePerformanceReport(): string;
    /**
     * Reset session statistics
     */
    resetSessionStatistics(): void;
    /**
     * Phase 1: Quantum State Preparation
     * Convert classical data into quantum state vectors with optimal chunking and phase assignment
     */
    private performQuantumStatePreparation;
    /**
     * Phase 2: Superposition Analysis
     * Create superposition states and analyze probability patterns
     */
    private performSuperpositionAnalysis;
    /**
     * Phase 3: Entanglement Detection
     * Find correlated patterns and create entanglement pairs
     */
    private performEntanglementDetection;
    /**
     * Phase 4: Quantum Interference Optimization
     * Apply constructive and destructive interference to optimize patterns
     */
    private performQuantumInterference;
    /**
     * Initialize decompression components with original configuration
     */
    private initializeDecompressionComponents;
    /**
     * Reconstruct quantum states from compressed data
     */
    private reconstructQuantumStates;
    /**
     * Reverse quantum interference patterns applied during compression
     */
    private reverseQuantumInterference;
    /**
     * Apply reverse interference pattern to quantum states
     */
    private applyReverseInterferencePattern;
    /**
     * Reverse constructive interference applied during compression
     */
    private reverseConstructiveInterference;
    /**
     * Reverse destructive interference applied during compression
     */
    private reverseDestructiveInterference;
    /**
     * Reconstruct entanglement relationships
     */
    private reconstructEntanglement;
    /**
     * Restore quantum correlations between entangled states
     */
    private restoreQuantumCorrelations;
    /**
     * Collapse superposition states to classical representation
     */
    private collapseSuperpositionStates;
    /**
     * Convert quantum states back to classical data
     */
    private convertToClassicalData;
    /**
     * Validate decompression result against expected metadata
     */
    private validateDecompressionResult;
    /**
     * Initialize quantum processing components based on configuration
     */
    private initializeComponents;
    /**
     * Calculate optimal chunk size based on data size and configuration
     */
    private calculateOptimalChunkSize;
    /**
     * Calculate default chunk size
     */
    private calculateDefaultChunkSize;
    /**
     * Group quantum states for superposition processing
     */
    private groupStatesForSuperposition;
    /**
     * Reconstruct shared information from entanglement pair
     */
    private reconstructSharedInformation;
    /**
     * Extract shared pattern from shared information buffer
     */
    private extractSharedPattern;
    /**
     * Log compression metrics
     */
    private logCompressionMetrics;
    /**
     * Log decompression metrics
     */
    private logDecompressionMetrics;
    /**
     * Create compressed data structure from fallback compression result
     */
    private createFallbackCompressedData;
    /**
     * Create minimal quantum states for fallback data
     */
    private createFallbackQuantumStates;
    /**
     * Log fallback compression metrics
     */
    private logFallbackMetrics;
    /**
     * Enhanced decompression with integrity verification
     */
    decompressWithIntegrityCheck(compressed: CompressedQuantumData): {
        data: Buffer;
        verification: any;
    };
}
//# sourceMappingURL=QuantumCompressionEngine.d.ts.map