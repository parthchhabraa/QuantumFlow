import { QuantumStateVector } from '../models/QuantumStateVector';
import { SuperpositionState } from '../models/SuperpositionState';
import { Complex } from '../math/Complex';
/**
 * Advanced pattern recognition system for quantum compression
 * Identifies and analyzes patterns in quantum states for optimal compression
 */
export declare class PatternRecognizer {
    private _minPatternLength;
    private _maxPatternLength;
    private _similarityThreshold;
    private _frequencyThreshold;
    private _complexityWeight;
    constructor(minPatternLength?: number, maxPatternLength?: number, similarityThreshold?: number, frequencyThreshold?: number, complexityWeight?: number);
    /**
     * Get minimum pattern length
     */
    get minPatternLength(): number;
    /**
     * Set minimum pattern length
     */
    set minPatternLength(value: number);
    /**
     * Get maximum pattern length
     */
    get maxPatternLength(): number;
    /**
     * Set maximum pattern length
     */
    set maxPatternLength(value: number);
    /**
     * Get similarity threshold
     */
    get similarityThreshold(): number;
    /**
     * Set similarity threshold
     */
    set similarityThreshold(value: number);
    /**
     * Get frequency threshold
     */
    get frequencyThreshold(): number;
    /**
     * Set frequency threshold
     */
    set frequencyThreshold(value: number);
    /**
     * Get complexity weight
     */
    get complexityWeight(): number;
    /**
     * Set complexity weight
     */
    set complexityWeight(value: number);
    /**
     * Recognize patterns in quantum states
     */
    recognizePatterns(states: QuantumStateVector[]): RecognizedPattern[];
    /**
     * Analyze probability distributions in quantum states
     */
    analyzeProbabilityDistributions(states: QuantumStateVector[]): ProbabilityAnalysis;
    /**
     * Identify high-probability quantum states
     */
    identifyHighProbabilityStates(superposition: SuperpositionState, threshold?: number): HighProbabilityState[];
    /**
     * Detect quantum interference patterns
     */
    detectInterferencePatterns(states: QuantumStateVector[]): InterferencePattern[];
    /**
     * Calculate pattern compression efficiency
     */
    calculatePatternCompressionEfficiency(patterns: RecognizedPattern[]): CompressionEfficiency;
    /**
     * Optimize patterns for compression
     */
    optimizePatternsForCompression(patterns: RecognizedPattern[]): OptimizedPattern[];
    /**
     * Extract amplitude sequences from quantum states
     */
    private extractAmplitudeSequences;
    /**
     * Find patterns of specific length
     */
    private findPatternsOfLength;
    /**
     * Filter patterns by frequency threshold
     */
    private filterPatternsByFrequency;
    /**
     * Rank patterns by significance
     */
    private rankPatterns;
    /**
     * Generate unique key for pattern
     */
    private generatePatternKey;
    /**
     * Calculate pattern complexity
     */
    private calculatePatternComplexity;
    /**
     * Calculate pattern significance
     */
    private calculatePatternSignificance;
    /**
     * Find dominant probabilities across distributions
     */
    private findDominantProbabilities;
    /**
     * Calculate correlation matrix between probability distributions
     */
    private calculateCorrelationMatrix;
    /**
     * Calculate correlation between two probability distributions
     */
    private calculateDistributionCorrelation;
    /**
     * Calculate total information content
     */
    private calculateInformationContent;
    /**
     * Estimate compression potential
     */
    private estimateCompressionPotential;
    /**
     * Calculate state significance
     */
    private calculateStateSignificance;
    /**
     * Calculate compression value for a state
     */
    private calculateCompressionValue;
    /**
     * Analyze interference between two states
     */
    private analyzeStatePairInterference;
    /**
     * Calculate efficiency score for patterns
     */
    private calculateEfficiencyScore;
    /**
     * Group similar patterns together
     */
    private groupSimilarPatterns;
    /**
     * Calculate similarity between two patterns
     */
    private calculatePatternSimilarity;
    /**
     * Optimize a group of similar patterns
     */
    private optimizePatternGroup;
    /**
     * Calculate compression value for a pattern group
     */
    private calculateGroupCompressionValue;
    /**
     * Validate constructor parameters
     */
    private validateParameters;
}
/**
 * Recognized pattern in quantum states
 */
export interface RecognizedPattern {
    id: string;
    amplitudes: Complex[];
    length: number;
    frequency: number;
    positions: PatternPosition[];
    similarity: number;
    complexity: number;
    significance: number;
}
/**
 * Position of a pattern occurrence
 */
export interface PatternPosition {
    sequenceIndex: number;
    startIndex: number;
}
/**
 * Probability analysis results
 */
export interface ProbabilityAnalysis {
    averageEntropy: number;
    entropyVariance: number;
    probabilityDistributions: number[][];
    dominantProbabilities: DominantProbability[];
    correlationMatrix: number[][];
    informationContent: number;
    compressionPotential: number;
}
/**
 * Dominant probability information
 */
export interface DominantProbability {
    value: number;
    frequency: number;
    positions: ProbabilityPosition[];
    significance: number;
}
/**
 * Position of a probability value
 */
export interface ProbabilityPosition {
    distributionIndex: number;
    probabilityIndex: number;
}
/**
 * High probability quantum state
 */
export interface HighProbabilityState {
    stateIndex: number;
    amplitude: Complex;
    probability: number;
    phase: number;
    magnitude: number;
    significance: number;
    compressionValue: number;
}
/**
 * Quantum interference pattern
 */
export interface InterferencePattern {
    type: 'constructive' | 'destructive';
    strength: number;
    correlation: number;
    amplitudeIndices: number[];
}
/**
 * Compression efficiency metrics
 */
export interface CompressionEfficiency {
    totalPatterns: number;
    averageFrequency: number;
    compressionRatio: number;
    spaceSavings: number;
    efficiencyScore: number;
}
/**
 * Optimized pattern group
 */
export interface OptimizedPattern {
    id: string;
    representativePattern: RecognizedPattern;
    groupSize: number;
    totalFrequency: number;
    averageComplexity: number;
    totalSignificance: number;
    compressionValue: number;
    patterns: RecognizedPattern[];
}
//# sourceMappingURL=PatternRecognizer.d.ts.map