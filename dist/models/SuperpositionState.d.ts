import { Complex } from '../math/Complex';
import { QuantumStateVector } from './QuantumStateVector';
/**
 * Represents a quantum superposition state combining multiple quantum states
 * Used for parallel pattern analysis in the compression algorithm
 */
export declare class SuperpositionState {
    private _combinedAmplitudes;
    private _probabilityDistribution;
    private _coherenceTime;
    private _constituentStates;
    private _weights;
    constructor(combinedAmplitudes: Complex[], constituentStates: QuantumStateVector[], weights: number[], coherenceTime?: number);
    /**
     * Get the combined amplitudes (read-only)
     */
    get combinedAmplitudes(): readonly Complex[];
    /**
     * Get the probability distribution (read-only)
     */
    get probabilityDistribution(): readonly number[];
    /**
     * Get the coherence time
     */
    get coherenceTime(): number;
    /**
     * Get the constituent states (read-only)
     */
    get constituentStates(): readonly QuantumStateVector[];
    /**
     * Get the weights (read-only)
     */
    get weights(): readonly number[];
    /**
     * Create a superposition state from multiple quantum states
     */
    static fromQuantumStates(states: QuantumStateVector[], weights?: number[], coherenceTime?: number): SuperpositionState;
    /**
     * Create a superposition from classical data patterns
     */
    static fromDataPatterns(dataPatterns: Buffer[], weights?: number[], coherenceTime?: number): SuperpositionState;
    /**
     * Analyze probability amplitudes to find dominant patterns
     */
    analyzeProbabilityAmplitudes(): PatternProbability[];
    /**
     * Get the dominant patterns above a threshold
     */
    getDominantPatterns(threshold?: number): PatternProbability[];
    /**
     * Calculate the entropy of the superposition state
     */
    calculateEntropy(): number;
    /**
     * Apply decoherence to simulate quantum state degradation
     */
    applyDecoherence(timeStep: number): SuperpositionState;
    /**
     * Measure the superposition state (collapse to classical state)
     */
    measure(): {
        stateIndex: number;
        probability: number;
        collapsedState: QuantumStateVector;
    };
    /**
     * Check if the superposition is still coherent
     */
    isCoherent(threshold?: number): boolean;
    /**
     * Calculate the total probability (should be 1 for valid superposition)
     */
    getTotalProbability(): number;
    /**
     * Create a deep copy of this superposition state
     */
    clone(): SuperpositionState;
    /**
     * Get string representation of the superposition state
     */
    toString(): string;
    /**
     * Calculate probability distribution from combined amplitudes
     */
    private calculateProbabilityDistribution;
    /**
     * Validate the superposition state
     */
    private validateSuperposition;
}
/**
 * Interface for pattern probability analysis
 */
export interface PatternProbability {
    index: number;
    amplitude: Complex;
    probability: number;
    phase: number;
    magnitude: number;
}
//# sourceMappingURL=SuperpositionState.d.ts.map