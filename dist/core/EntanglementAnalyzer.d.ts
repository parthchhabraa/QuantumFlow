import { QuantumStateVector } from '../models/QuantumStateVector';
import { EntanglementPair } from '../models/EntanglementPair';
/**
 * Analyzes quantum states to find entanglement opportunities for compression
 * Implements correlation detection and entanglement pairing logic
 */
export declare class EntanglementAnalyzer {
    private _minCorrelationThreshold;
    private _maxEntanglementPairs;
    private _correlationCache;
    constructor(minCorrelationThreshold?: number, maxEntanglementPairs?: number);
    /**
     * Find entangled patterns in an array of quantum states
     */
    findEntangledPatterns(states: QuantumStateVector[]): EntanglementPair[];
    /**
     * Calculate correlation strength between two quantum states
     */
    calculateCorrelationStrength(pair: EntanglementPair): number;
    /**
     * Extract shared information from entangled pairs using advanced pattern analysis
     */
    extractSharedInformation(pairs: EntanglementPair[]): SharedInformationResult;
    /**
     * Calculate advanced correlation strength metrics for multiple pairs
     */
    calculateAdvancedCorrelationMetrics(pairs: EntanglementPair[]): CorrelationMetrics;
    /**
     * Extract shared information patterns optimized for compression
     */
    extractOptimizedSharedPatterns(pairs: EntanglementPair[], minPatternLength?: number): OptimizedSharedPatterns;
    /**
     * Analyze correlation patterns in a set of quantum states
     */
    analyzeCorrelationPatterns(states: QuantumStateVector[]): CorrelationAnalysis;
    /**
     * Find optimal entanglement pairs for maximum compression benefit
     */
    findOptimalEntanglementPairs(states: QuantumStateVector[]): EntanglementPair[];
    /**
     * Validate entanglement quality and suggest improvements
     */
    validateEntanglementQuality(pairs: EntanglementPair[]): EntanglementQualityReport;
    /**
     * Clear correlation cache to free memory
     */
    clearCache(): void;
    /**
     * Get current correlation threshold
     */
    get correlationThreshold(): number;
    /**
     * Set new correlation threshold
     */
    setCorrelationThreshold(threshold: number): void;
    /**
     * Build correlation matrix for all state pairs
     */
    private buildCorrelationMatrix;
    /**
     * Calculate correlation between two quantum states with caching
     */
    private calculatePairwiseCorrelation;
    /**
     * Find potential entanglement pairs sorted by correlation strength
     */
    private findPotentialPairs;
    /**
     * Create correlation distribution histogram
     */
    private createCorrelationHistogram;
    /**
     * Create a unique key for a quantum state for caching
     */
    private createStateKey;
    /**
     * Analyze patterns in shared information buffer
     */
    private analyzeSharedPatterns;
    /**
     * Calculate compression potential based on shared patterns
     */
    private calculateCompressionPotential;
}
/**
 * Interface for correlation analysis results
 */
export interface CorrelationAnalysis {
    averageCorrelation: number;
    maxCorrelation: number;
    minCorrelation: number;
    correlationDistribution: CorrelationBin[];
    stronglyCorrelatedPairs: number;
    totalPairs: number;
}
/**
 * Interface for correlation histogram bins
 */
export interface CorrelationBin {
    min: number;
    max: number;
    count: number;
    percentage: number;
}
/**
 * Interface for entanglement quality report
 */
export interface EntanglementQualityReport {
    validPairs: EntanglementPair[];
    invalidPairs: EntanglementPair[];
    totalBenefit: number;
    averageCorrelation: number;
    suggestions: string[];
}
/**
 * Interface for shared information extraction results
 */
export interface SharedInformationResult {
    totalSharedBytes: number;
    compressionPotential: number;
    sharedPatterns: SharedPattern[];
    informationDensity: number;
}
/**
 * Interface for shared pattern information
 */
export interface SharedPattern {
    pattern: Buffer;
    frequency: number;
    correlationStrength: number;
    compressionValue: number;
}
/**
 * Interface for advanced correlation metrics
 */
export interface CorrelationMetrics {
    averageCorrelation: number;
    weightedCorrelation: number;
    correlationVariance: number;
    correlationStability: number;
    strongCorrelationRatio: number;
    correlationDistribution: CorrelationBin[];
}
/**
 * Interface for optimized shared patterns
 */
export interface OptimizedSharedPatterns {
    patterns: OptimizedPattern[];
    totalCompressionSavings: number;
    compressionRatio: number;
    patternCount: number;
}
/**
 * Interface for optimized pattern information
 */
export interface OptimizedPattern {
    pattern: Buffer;
    occurrences: number;
    averageCorrelation: number;
    compressionSavings: number;
    compressionValue: number;
    pairIndices: number[];
}
//# sourceMappingURL=EntanglementAnalyzer.d.ts.map