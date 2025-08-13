import { QuantumStateVector } from '../models/QuantumStateVector';
import { SuperpositionState, PatternProbability } from '../models/SuperpositionState';
import { Complex } from '../math/Complex';
/**
 * Processes quantum superposition states for parallel pattern analysis
 * Enables simultaneous analysis of multiple data patterns through quantum superposition
 */
export declare class SuperpositionProcessor {
    private _maxSuperpositionSize;
    private _coherenceThreshold;
    private _patternThreshold;
    private _parallelismFactor;
    constructor(maxSuperpositionSize?: number, coherenceThreshold?: number, patternThreshold?: number, parallelismFactor?: number);
    /**
     * Get maximum superposition size
     */
    get maxSuperpositionSize(): number;
    /**
     * Set maximum superposition size
     */
    set maxSuperpositionSize(value: number);
    /**
     * Get coherence threshold
     */
    get coherenceThreshold(): number;
    /**
     * Set coherence threshold
     */
    set coherenceThreshold(value: number);
    /**
     * Get pattern threshold
     */
    get patternThreshold(): number;
    /**
     * Set pattern threshold
     */
    set patternThreshold(value: number);
    /**
     * Get parallelism factor
     */
    get parallelismFactor(): number;
    /**
     * Set parallelism factor
     */
    set parallelismFactor(value: number);
    /**
     * Create superposition from quantum states for parallel analysis
     */
    createSuperposition(states: QuantumStateVector[], weights?: number[]): SuperpositionState;
    /**
     * Analyze probability amplitudes to identify patterns
     */
    analyzeProbabilityAmplitudes(superposition: SuperpositionState): PatternProbability[];
    /**
     * Process multiple superpositions in parallel
     */
    processParallelSuperpositions(stateGroups: QuantumStateVector[][], weights?: number[][]): ParallelProcessingResult;
    /**
     * Identify dominant patterns across multiple superpositions
     */
    identifyDominantPatterns(patternAnalyses: PatternProbability[][], dominanceThreshold?: number): DominantPattern[];
    /**
     * Optimize superposition for better pattern recognition
     */
    optimizeSuperposition(superposition: SuperpositionState, targetPatterns?: PatternProbability[]): SuperpositionState;
    /**
     * Apply quantum interference to enhance or suppress patterns
     */
    applyQuantumInterference(superposition: SuperpositionState, interferenceType: 'constructive' | 'destructive', targetPatternIndices: number[]): SuperpositionState;
    /**
     * Measure superposition and extract pattern information
     */
    measureSuperposition(superposition: SuperpositionState): MeasurementResult;
    /**
     * Calculate processing efficiency metrics
     */
    calculateProcessingEfficiency(result: ParallelProcessingResult): ProcessingEfficiency;
    /**
     * Create hierarchical superposition for large state sets
     */
    private createHierarchicalSuperposition;
    /**
     * Calculate optimal weights for quantum states
     */
    private calculateOptimalWeights;
    /**
     * Calculate complexity of a quantum state
     */
    private calculateStateComplexity;
    /**
     * Generate a unique key for pattern identification
     */
    private generatePatternKey;
    /**
     * Calculate pattern-based weights for optimization
     */
    private calculatePatternBasedWeights;
    /**
     * Create representative state from superposition
     */
    private createRepresentativeState;
    /**
     * Validate constructor parameters
     */
    private validateParameters;
}
/**
 * Result of parallel superposition processing
 */
export interface ParallelProcessingResult {
    superpositions: SuperpositionState[];
    patternAnalyses: PatternProbability[][];
    processingMetrics: ProcessingMetrics[];
    totalProcessingTime: number;
    successfulGroups: number;
    failedGroups: number;
}
/**
 * Metrics for processing a group of states
 */
export interface ProcessingMetrics {
    groupIndex: number;
    stateCount: number;
    patternCount: number;
    processingTime: number;
    coherenceTime: number;
    entropy: number;
    error?: string;
}
/**
 * Dominant pattern across multiple analyses
 */
export interface DominantPattern {
    patternKey: string;
    amplitude: Complex;
    averageProbability: number;
    totalProbability: number;
    occurrences: number;
    groupIndices: number[];
    dominanceScore: number;
}
/**
 * Result of superposition measurement
 */
export interface MeasurementResult {
    collapsedStateIndex: number;
    collapsedState: QuantumStateVector;
    measurementProbability: number;
    detectedPatterns: PatternProbability[];
    coherenceTime: number;
    entropy: number;
    measurementTimestamp: number;
}
/**
 * Processing efficiency metrics
 */
export interface ProcessingEfficiency {
    totalStatesProcessed: number;
    totalPatternsDetected: number;
    averageCoherenceTime: number;
    parallelismEfficiency: number;
    patternDensity: number;
    processingSpeed: number;
    successRate: number;
    averageProcessingTime: number;
}
//# sourceMappingURL=SuperpositionProcessor.d.ts.map