import { QuantumStateVector } from './QuantumStateVector';
/**
 * Represents a quantum entanglement pair between two quantum states
 * Used for identifying and exploiting correlated patterns in compression
 */
export declare class EntanglementPair {
    private _stateA;
    private _stateB;
    private _correlationStrength;
    private _sharedInformation;
    private _entanglementId;
    private _creationTime;
    constructor(stateA: QuantumStateVector, stateB: QuantumStateVector, sharedInformation?: Buffer);
    /**
     * Get state A (read-only)
     */
    get stateA(): QuantumStateVector;
    /**
     * Get state B (read-only)
     */
    get stateB(): QuantumStateVector;
    /**
     * Get correlation strength
     */
    get correlationStrength(): number;
    /**
     * Get shared information
     */
    get sharedInformation(): Buffer;
    /**
     * Get entanglement ID
     */
    get entanglementId(): string;
    /**
     * Get creation time
     */
    get creationTime(): number;
    /**
     * Create an entanglement pair from two quantum states if they are sufficiently correlated
     */
    static createIfCorrelated(stateA: QuantumStateVector, stateB: QuantumStateVector, minCorrelation?: number): EntanglementPair | null;
    /**
     * Create entanglement pairs from an array of quantum states
     */
    static findEntanglementPairs(states: QuantumStateVector[], minCorrelation?: number): EntanglementPair[];
    /**
     * Create entanglement from data patterns with high correlation
     */
    static fromDataPatterns(patternA: Buffer, patternB: Buffer, minCorrelation?: number): EntanglementPair | null;
    /**
     * Check if the entanglement is still valid (correlation above threshold)
     */
    isValid(minCorrelation?: number): boolean;
    /**
     * Measure one state and get the correlated result for the other
     */
    measureCorrelatedStates(): {
        stateABytes: Buffer;
        stateBBytes: Buffer;
        correlation: number;
    };
    /**
     * Apply quantum operation to both entangled states simultaneously
     */
    applyCorrelatedPhaseShift(phaseShift: number): EntanglementPair;
    /**
     * Break the entanglement (decoherence)
     */
    breakEntanglement(): {
        stateA: QuantumStateVector;
        stateB: QuantumStateVector;
    };
    /**
     * Calculate the mutual information between the entangled states
     */
    calculateMutualInformation(): number;
    /**
     * Get the compression benefit from this entanglement
     */
    getCompressionBenefit(): number;
    /**
     * Check if this entanglement pair is equivalent to another
     */
    equals(other: EntanglementPair, tolerance?: number): boolean;
    /**
     * Create a deep copy of this entanglement pair
     */
    clone(): EntanglementPair;
    /**
     * Get string representation of the entanglement pair
     */
    toString(): string;
    /**
     * Calculate correlation strength between the two states
     */
    private calculateCorrelationStrength;
    /**
     * Extract shared information from the correlated states
     */
    private extractSharedInformation;
    /**
     * Generate unique entanglement ID
     */
    private generateEntanglementId;
    /**
     * Validate the entanglement pair
     */
    private validateEntanglement;
}
//# sourceMappingURL=EntanglementPair.d.ts.map