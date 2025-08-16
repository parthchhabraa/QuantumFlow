/**
 * Optimized Quantum Compression Algorithm
 * Task 13.2: Implement memory usage optimizations for large files and fine-tune quantum simulation parameters
 *
 * This module provides optimized compression strategies based on data characteristics and performance profiling
 */
import { QuantumConfig } from '../models/QuantumConfig';
export interface CompressionStrategy {
    name: string;
    description: string;
    config: QuantumConfig;
    memoryLimit: number;
    timeLimit: number;
    applicableDataSizes: {
        min: number;
        max: number;
    };
}
export interface OptimizationResult {
    strategy: CompressionStrategy;
    compressionRatio: number;
    processingTime: number;
    memoryUsage: number;
    success: boolean;
    errorMessage?: string;
}
export declare class OptimizedQuantumCompression {
    private engine;
    private strategies;
    constructor();
    /**
     * Initialize compression strategies optimized for different scenarios
     */
    private initializeStrategies;
    /**
     * Select optimal compression strategy based on data characteristics
     */
    selectOptimalStrategy(data: Buffer, dataType?: 'text' | 'binary' | 'structured' | 'random'): CompressionStrategy;
    /**
     * Compress data using optimal strategy with performance monitoring
     */
    compressOptimized(data: Buffer, dataType?: 'text' | 'binary' | 'structured' | 'random'): Promise<OptimizationResult>;
    /**
     * Perform compression with memory monitoring
     */
    private performCompression;
    /**
     * Perform streaming compression for very large files
     */
    private performStreamingCompression;
    /**
     * Combine compressed chunks into a single compressed data structure
     */
    private combineCompressedChunks;
    /**
     * Calculate data entropy for optimization decisions
     */
    private calculateDataEntropy;
    /**
     * Calculate repetition ratio for pattern detection
     */
    private calculateRepetitionRatio;
    /**
     * Get available compression strategies
     */
    getAvailableStrategies(): CompressionStrategy[];
    /**
     * Get performance analysis from the engine
     */
    getPerformanceAnalysis(): string;
    /**
     * Benchmark all strategies against a dataset
     */
    benchmarkStrategies(data: Buffer): Promise<OptimizationResult[]>;
}
//# sourceMappingURL=OptimizedQuantumCompression.d.ts.map