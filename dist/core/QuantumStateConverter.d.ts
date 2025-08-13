import { QuantumStateVector } from '../models/QuantumStateVector';
/**
 * Converts classical data to quantum state vectors and vice versa
 * Implements Hadamard-like transformations for quantum state preparation
 */
export declare class QuantumStateConverter {
    private _quantumBitDepth;
    private _chunkSize;
    constructor(quantumBitDepth?: number, chunkSize?: number);
    /**
     * Get quantum bit depth
     */
    get quantumBitDepth(): number;
    /**
     * Get chunk size
     */
    get chunkSize(): number;
    /**
     * Convert Buffer data to array of QuantumStateVector
     */
    convertToQuantumStates(data: Buffer): QuantumStateVector[];
    /**
     * Convert array of QuantumStateVector back to Buffer
     */
    convertFromQuantumStates(states: QuantumStateVector[]): Buffer;
    /**
     * Convert a single data chunk to quantum state vector
     */
    private convertChunkToQuantumState;
    /**
     * Convert quantum state vector back to data chunk
     */
    private convertQuantumStateToChunk;
    /**
     * Create quantum amplitudes from data chunk using Hadamard-like transformations
     */
    private createQuantumAmplitudes;
    /**
     * Apply Hadamard-like transformation to a byte value
     */
    private applyHadamardTransformation;
    /**
     * Calculate quantum phase from chunk data
     */
    private calculateChunkPhase;
    /**
     * Extract byte value from quantum amplitude and phase
     */
    private extractByteFromAmplitude;
    /**
     * Analyze data patterns for optimal quantum representation
     */
    analyzeDataPatterns(data: Buffer): DataPatternAnalysis;
    /**
     * Calculate pattern complexity of data
     */
    private calculatePatternComplexity;
    /**
     * Calculate entropy of a data window
     */
    private calculateWindowEntropy;
    /**
     * Recommend optimal chunk size based on data analysis
     */
    private recommendChunkSize;
    /**
     * Recommend optimal bit depth based on data analysis
     */
    private recommendBitDepth;
    /**
     * Optimize converter parameters based on data analysis
     */
    optimizeForData(data: Buffer): QuantumStateConverter;
    /**
     * Get conversion statistics
     */
    getConversionStats(originalSize: number, quantumStates: QuantumStateVector[]): ConversionStats;
}
/**
 * Interface for data pattern analysis results
 */
export interface DataPatternAnalysis {
    entropy: number;
    repetitionRate: number;
    byteFrequencies: number[];
    recommendedChunkSize: number;
    recommendedBitDepth: number;
    patternComplexity: number;
}
/**
 * Interface for conversion statistics
 */
export interface ConversionStats {
    originalSize: number;
    quantumStateCount: number;
    totalAmplitudes: number;
    averageAmplitudesPerState: number;
    estimatedQuantumSize: number;
    expansionRatio: number;
    chunksProcessed: number;
    averageChunkSize: number;
}
//# sourceMappingURL=QuantumStateConverter.d.ts.map