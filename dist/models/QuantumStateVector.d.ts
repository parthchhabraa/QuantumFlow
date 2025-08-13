import { Complex } from '../math/Complex';
/**
 * Represents a quantum state vector with complex amplitudes and quantum phase
 * Used to simulate quantum superposition in the compression algorithm
 */
export declare class QuantumStateVector {
    private _amplitudes;
    private _phase;
    private _entanglementId?;
    constructor(amplitudes: Complex[], phase?: number, entanglementId?: string);
    /**
     * Get the amplitudes (read-only)
     */
    get amplitudes(): readonly Complex[];
    /**
     * Get the quantum phase
     */
    get phase(): number;
    /**
     * Get the entanglement ID if this state is entangled
     */
    get entanglementId(): string | undefined;
    /**
     * Set entanglement ID for this quantum state
     */
    setEntanglementId(id: string): void;
    /**
     * Create a quantum state vector from classical data bytes
     */
    static fromBytes(data: Buffer, chunkSize?: number): QuantumStateVector;
    /**
     * Create a superposition state from multiple quantum states
     */
    static createSuperposition(states: QuantumStateVector[], weights?: number[]): QuantumStateVector;
    /**
     * Calculate probability distribution from amplitudes
     */
    getProbabilityDistribution(): number[];
    /**
     * Get the total probability (should be 1 for normalized states)
     */
    getTotalProbability(): number;
    /**
     * Check if this state is normalized (total probability = 1)
     */
    isNormalized(tolerance?: number): boolean;
    /**
     * Create a normalized copy of this quantum state
     */
    normalize(): QuantumStateVector;
    /**
     * Apply a quantum phase shift to this state
     */
    applyPhaseShift(phaseShift: number): QuantumStateVector;
    /**
     * Calculate correlation with another quantum state
     */
    calculateCorrelation(other: QuantumStateVector): number;
    /**
     * Convert quantum state back to classical bytes (for decompression)
     */
    toBytes(): Buffer;
    /**
     * Create a deep copy of this quantum state
     */
    clone(): QuantumStateVector;
    /**
     * Check if two quantum states are approximately equal
     */
    equals(other: QuantumStateVector, tolerance?: number): boolean;
    /**
     * Get string representation of the quantum state
     */
    toString(): string;
    /**
     * Validate quantum state and normalize if needed
     */
    private validateAndNormalize;
    /**
     * Calculate entropy of data for phase calculation
     */
    private static calculateDataEntropy;
}
//# sourceMappingURL=QuantumStateVector.d.ts.map