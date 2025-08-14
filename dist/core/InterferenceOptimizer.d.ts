import { Complex } from '../math/Complex';
import { QuantumStateVector } from '../models/QuantumStateVector';
import { SuperpositionState, PatternProbability } from '../models/SuperpositionState';
import { InterferencePattern } from './PatternRecognizer';
/**
 * Quantum interference optimizer for pattern optimization in compression
 * Uses constructive and destructive interference to amplify important patterns
 * and eliminate redundant ones for optimal compression
 */
export declare class InterferenceOptimizer {
    private _constructiveThreshold;
    private _destructiveThreshold;
    private _amplificationFactor;
    private _suppressionFactor;
    private _maxIterations;
    private _thresholdProfiles;
    private _currentProfile;
    private _adaptiveThresholds;
    private _minimalRepresentationTarget;
    constructor(constructiveThreshold?: number, destructiveThreshold?: number, amplificationFactor?: number, suppressionFactor?: number, maxIterations?: number, adaptiveThresholds?: boolean, minimalRepresentationTarget?: number);
    /**
     * Get constructive interference threshold
     */
    get constructiveThreshold(): number;
    /**
     * Set constructive interference threshold
     */
    set constructiveThreshold(value: number);
    /**
     * Get destructive interference threshold
     */
    get destructiveThreshold(): number;
    /**
     * Set destructive interference threshold
     */
    set destructiveThreshold(value: number);
    /**
     * Get amplification factor
     */
    get amplificationFactor(): number;
    /**
     * Set amplification factor
     */
    set amplificationFactor(value: number);
    /**
     * Get suppression factor
     */
    get suppressionFactor(): number;
    /**
     * Set suppression factor
     */
    set suppressionFactor(value: number);
    /**
     * Apply constructive interference to amplify important patterns
     */
    applyConstructiveInterference(patterns: PatternProbability[]): OptimizedPattern[];
    /**
     * Apply destructive interference to eliminate redundant patterns
     */
    applyDestructiveInterference(redundantPatterns: PatternProbability[]): OptimizedPattern[];
    /**
     * Optimize quantum states using interference patterns
     */
    optimizeQuantumStates(states: QuantumStateVector[]): QuantumStateOptimizationResult;
    /**
     * Optimize superposition state using interference
     */
    optimizeSuperposition(superposition: SuperpositionState): SuperpositionOptimizationResult;
    /**
     * Get adaptive thresholds setting
     */
    get adaptiveThresholds(): boolean;
    /**
     * Set adaptive thresholds setting
     */
    set adaptiveThresholds(value: boolean);
    /**
     * Get minimal representation target
     */
    get minimalRepresentationTarget(): number;
    /**
     * Set minimal representation target
     */
    set minimalRepresentationTarget(value: number);
    /**
     * Create a new threshold profile
     */
    createThresholdProfile(name: string, constructiveThreshold: number, destructiveThreshold: number, amplificationFactor: number, suppressionFactor: number, description?: string): void;
    /**
     * Load a threshold profile
     */
    loadThresholdProfile(name: string): void;
    /**
     * Get current threshold profile name
     */
    getCurrentProfile(): string;
    /**
     * Get all available threshold profiles
     */
    getAvailableProfiles(): string[];
    /**
     * Get threshold profile details
     */
    getProfileDetails(name: string): ThresholdProfile | undefined;
    /**
     * Automatically adjust thresholds based on data characteristics
     */
    adjustThresholdsAdaptively(states: QuantumStateVector[]): ThresholdAdjustmentResult;
    /**
     * Optimize quantum states for minimal representation
     */
    optimizeForMinimalRepresentation(states: QuantumStateVector[]): MinimalRepresentationResult;
    /**
     * Optimize thresholds for specific data types
     */
    optimizeThresholdsForDataType(states: QuantumStateVector[], dataType: 'text' | 'binary' | 'image' | 'audio' | 'mixed'): ThresholdOptimizationResult;
    /**
     * Get current threshold configuration
     */
    getCurrentThresholds(): ThresholdConfiguration;
    /**
     * Perform iterative interference optimization
     */
    performIterativeOptimization(states: QuantumStateVector[]): IterativeOptimizationResult;
    /**
     * Initialize default threshold profiles
     */
    private initializeDefaultProfiles;
    /**
     * Analyze data characteristics for adaptive threshold adjustment
     */
    private analyzeDataCharacteristics;
    /**
     * Estimate improvement from threshold changes
     */
    private estimateThresholdImprovement;
    /**
     * Apply progressive optimization to states
     */
    private applyProgressiveOptimization;
    /**
     * Calculate representation ratio between original and optimized states
     */
    private calculateRepresentationRatio;
    /**
     * Calculate total information content of states
     */
    private calculateTotalInformation;
    /**
     * Calculate quality metrics for optimization
     */
    private calculateQualityMetrics;
    /**
     * Create empty quality metrics
     */
    private createEmptyQualityMetrics;
    /**
     * Estimate improvement for specific data type
     */
    private estimateDataTypeImprovement;
    /**
     * Validate threshold-related parameters
     */
    private validateThresholdParameters;
    /**
     * Detect interference patterns between quantum states
     */
    private detectInterferencePatterns;
    /**
     * Amplify amplitude using constructive interference
     */
    private amplifyAmplitude;
    /**
     * Suppress amplitude using destructive interference
     */
    private suppressAmplitude;
    /**
     * Calculate compression value for a pattern
     */
    private calculateCompressionValue;
    /**
     * Calculate interference strength from amplitudes
     */
    private calculateInterferenceStrength;
    /**
     * Calculate compression improvement between original and optimized states
     */
    private calculateCompressionImprovement;
    /**
     * Calculate compression improvement for superposition states
     */
    private calculateSuperpositionCompressionImprovement;
    /**
     * Calculate average entropy of quantum states
     */
    private calculateAverageEntropy;
    /**
     * Create empty optimization metrics
     */
    private createEmptyOptimizationMetrics;
    /**
     * Validate constructor parameters
     */
    private validateParameters;
}
/**
 * Optimized pattern with interference applied
 */
export interface OptimizedPattern {
    originalIndex: number;
    originalAmplitude: Complex;
    optimizedAmplitude: Complex;
    originalProbability: number;
    optimizedProbability: number;
    interferenceType: 'constructive' | 'destructive';
    amplificationFactor: number;
    phase: number;
    magnitude: number;
    compressionValue: number;
}
/**
 * Extended interference pattern with state indices
 */
export interface InterferencePatternExtended extends InterferencePattern {
    stateIndices: number[];
}
/**
 * Quantum state optimization result
 */
export interface QuantumStateOptimizationResult {
    originalStates: QuantumStateVector[];
    optimizedStates: QuantumStateVector[];
    interferencePatterns: InterferencePatternExtended[];
    optimizationMetrics: OptimizationMetrics;
}
/**
 * Superposition optimization result
 */
export interface SuperpositionOptimizationResult {
    originalSuperposition: SuperpositionState;
    optimizedSuperposition: SuperpositionState;
    constructivePatterns: OptimizedPattern[];
    destructivePatterns: OptimizedPattern[];
    compressionImprovement: number;
}
/**
 * Iterative optimization result
 */
export interface IterativeOptimizationResult {
    initialStates: QuantumStateVector[];
    finalStates: QuantumStateVector[];
    iterations: OptimizationIteration[];
    convergenceAchieved: boolean;
    totalImprovement: number;
}
/**
 * Single optimization iteration
 */
export interface OptimizationIteration {
    iterationNumber: number;
    inputStates: number;
    outputStates: number;
    compressionImprovement: number;
    constructiveOperations: number;
    destructiveOperations: number;
}
/**
 * Optimization metrics
 */
export interface OptimizationMetrics {
    totalStates: number;
    optimizedStates: number;
    constructiveOperations: number;
    destructiveOperations: number;
    totalAmplification: number;
    totalSuppression: number;
    averageAmplification: number;
    averageSuppression: number;
    compressionImprovement: number;
}
/**
 * Threshold profile configuration
 */
export interface ThresholdProfile {
    name: string;
    constructiveThreshold: number;
    destructiveThreshold: number;
    amplificationFactor: number;
    suppressionFactor: number;
    description: string;
}
/**
 * Threshold configuration
 */
export interface ThresholdConfiguration {
    constructiveThreshold: number;
    destructiveThreshold: number;
    amplificationFactor: number;
    suppressionFactor: number;
}
/**
 * Threshold adjustment result
 */
export interface ThresholdAdjustmentResult {
    originalThresholds: ThresholdConfiguration;
    adjustedThresholds: ThresholdConfiguration;
    adjustmentReason: string;
    improvementEstimate: number;
}
/**
 * Data characteristics for adaptive optimization
 */
export interface DataCharacteristics {
    averageEntropy: number;
    entropyVariance: number;
    probabilityConcentration: number;
    correlationStrength: number;
    patternComplexity: number;
}
/**
 * Minimal representation optimization result
 */
export interface MinimalRepresentationResult {
    originalStates: QuantumStateVector[];
    minimalStates: QuantumStateVector[];
    representationRatio: number;
    compressionAchieved: number;
    qualityMetrics: QualityMetrics;
}
/**
 * Progressive optimization result
 */
export interface ProgressiveOptimizationResult {
    optimizedStates: QuantumStateVector[];
    compressionImprovement: number;
    converged: boolean;
}
/**
 * Quality metrics for optimization
 */
export interface QualityMetrics {
    fidelity: number;
    informationPreservation: number;
    compressionEfficiency: number;
    overallQuality: number;
}
/**
 * Threshold optimization result for data types
 */
export interface ThresholdOptimizationResult {
    dataType: string;
    originalThresholds: ThresholdConfiguration;
    optimizedThresholds: ThresholdConfiguration;
    expectedImprovement: number;
    recommendedProfile: string;
}
//# sourceMappingURL=InterferenceOptimizer.d.ts.map