/**
 * Advanced quantum phase assignment algorithms
 * Implements sophisticated phase calculation strategies for optimal quantum representation
 */
export declare class QuantumPhaseAssigner {
    private _strategy;
    private _adaptiveThreshold;
    constructor(strategy?: PhaseAssignmentStrategy, adaptiveThreshold?: number);
    /**
     * Get current phase assignment strategy
     */
    get strategy(): PhaseAssignmentStrategy;
    /**
     * Set phase assignment strategy
     */
    set strategy(value: PhaseAssignmentStrategy);
    /**
     * Get adaptive threshold
     */
    get adaptiveThreshold(): number;
    /**
     * Set adaptive threshold
     */
    set adaptiveThreshold(value: number);
    /**
     * Calculate quantum phase for a data chunk using the selected strategy
     */
    calculatePhase(chunk: Buffer, context?: PhaseContext): number;
    /**
     * Calculate phase based on data entropy
     */
    private calculateEntropyBasedPhase;
    /**
     * Calculate phase based on byte frequency distribution
     */
    private calculateFrequencyBasedPhase;
    /**
     * Calculate phase based on data patterns
     */
    private calculatePatternBasedPhase;
    /**
     * Calculate adaptive phase based on chunk characteristics
     */
    private calculateAdaptivePhase;
    /**
     * Calculate correlation-based phase using context
     */
    private calculateCorrelationBasedPhase;
    /**
     * Calculate entropy of a chunk
     */
    private calculateChunkEntropy;
    /**
     * Calculate uniformity of byte distribution
     */
    private calculateUniformity;
    /**
     * Calculate complexity based on local patterns
     */
    private calculateComplexity;
    /**
     * Calculate correlation between two chunks
     */
    private calculateChunkCorrelation;
    /**
     * Optimize phase assignment strategy for given data
     */
    optimizeStrategy(data: Buffer): PhaseAssignmentStrategy;
    /**
     * Create phase context for correlation-based assignment
     */
    createPhaseContext(previousChunks?: ChunkPhaseInfo[]): PhaseContext;
    /**
     * Update phase context with new chunk information
     */
    updatePhaseContext(context: PhaseContext, chunk: Buffer, phase: number): PhaseContext;
}
/**
 * Phase assignment strategy types
 */
export type PhaseAssignmentStrategy = 'entropy-based' | 'frequency-based' | 'pattern-based' | 'adaptive' | 'correlation-based';
/**
 * Context for phase assignment
 */
export interface PhaseContext {
    previousChunks: ChunkPhaseInfo[];
    timestamp: number;
}
/**
 * Information about a chunk and its assigned phase
 */
export interface ChunkPhaseInfo {
    data: Buffer;
    phase: number;
    timestamp: number;
}
//# sourceMappingURL=QuantumPhaseAssigner.d.ts.map