import { Complex } from './Complex';
/**
 * Quantum mathematics utilities for state operations
 */
export declare class QuantumMath {
    /**
     * Apply Hadamard-like transformation to create superposition
     * H = 1/√2 * [[1, 1], [1, -1]]
     */
    static hadamardTransform(amplitude: Complex): [Complex, Complex];
    /**
     * Calculate probability from quantum amplitude
     */
    static probabilityFromAmplitude(amplitude: Complex): number;
    /**
     * Normalize a set of quantum amplitudes so they sum to 1
     */
    static normalizeAmplitudes(amplitudes: Complex[]): Complex[];
    /**
     * Calculate quantum phase from data byte
     */
    static calculateQuantumPhase(dataByte: number): number;
    /**
     * Create quantum superposition of two states
     */
    static createSuperposition(state1: Complex, state2: Complex, weight?: number): Complex;
    /**
     * Calculate correlation coefficient between two amplitude arrays
     */
    static calculateCorrelation(amplitudes1: Complex[], amplitudes2: Complex[]): number;
    /**
     * Apply quantum interference between two amplitude sets
     */
    static applyInterference(amplitudes1: Complex[], amplitudes2: Complex[], interferenceType?: 'constructive' | 'destructive'): Complex[];
    /**
     * Calculate entropy of probability distribution
     */
    static calculateEntropy(probabilities: number[]): number;
    /**
     * Generate quantum-inspired hash for data integrity
     */
    static quantumHash(data: Buffer): string;
}
//# sourceMappingURL=QuantumMath.d.ts.map