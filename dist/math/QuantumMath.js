"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumMath = void 0;
/**
 * Quantum mathematics utilities for state operations
 */
class QuantumMath {
    /**
     * Apply Hadamard-like transformation to create superposition
     * H = 1/√2 * [[1, 1], [1, -1]]
     */
    static hadamardTransform(amplitude) {
        const factor = 1 / Math.sqrt(2);
        return [
            amplitude.scale(factor),
            amplitude.scale(factor)
        ];
    }
    /**
     * Calculate probability from quantum amplitude
     */
    static probabilityFromAmplitude(amplitude) {
        return amplitude.magnitudeSquared();
    }
    /**
     * Normalize a set of quantum amplitudes so they sum to 1
     */
    static normalizeAmplitudes(amplitudes) {
        const totalProbability = amplitudes.reduce((sum, amp) => sum + amp.magnitudeSquared(), 0);
        if (totalProbability === 0) {
            throw new Error('Cannot normalize zero amplitudes');
        }
        const normalizationFactor = 1 / Math.sqrt(totalProbability);
        return amplitudes.map(amp => amp.scale(normalizationFactor));
    }
    /**
     * Calculate quantum phase from data byte
     */
    static calculateQuantumPhase(dataByte) {
        // Map byte value (0-255) to phase (0-2π)
        return (dataByte / 255) * 2 * Math.PI;
    }
    /**
     * Create quantum superposition of two states
     */
    static createSuperposition(state1, state2, weight = 0.5) {
        const w1 = Math.sqrt(weight);
        const w2 = Math.sqrt(1 - weight);
        return state1.scale(w1).add(state2.scale(w2));
    }
    /**
     * Calculate correlation coefficient between two amplitude arrays
     */
    static calculateCorrelation(amplitudes1, amplitudes2) {
        if (amplitudes1.length !== amplitudes2.length) {
            throw new Error('Amplitude arrays must have same length');
        }
        const n = amplitudes1.length;
        let correlation = 0;
        for (let i = 0; i < n; i++) {
            // Use magnitude product as correlation measure
            correlation += amplitudes1[i].magnitude() * amplitudes2[i].magnitude();
        }
        return correlation / n;
    }
    /**
     * Apply quantum interference between two amplitude sets
     */
    static applyInterference(amplitudes1, amplitudes2, interferenceType = 'constructive') {
        if (amplitudes1.length !== amplitudes2.length) {
            throw new Error('Amplitude arrays must have same length');
        }
        const result = [];
        const factor = interferenceType === 'constructive' ? 1 : -1;
        for (let i = 0; i < amplitudes1.length; i++) {
            result.push(amplitudes1[i].add(amplitudes2[i].scale(factor)));
        }
        // Check if all amplitudes are zero (perfect destructive interference)
        const totalProbability = result.reduce((sum, amp) => sum + amp.magnitudeSquared(), 0);
        if (totalProbability === 0) {
            // Return zero amplitudes for perfect destructive interference
            return result;
        }
        return this.normalizeAmplitudes(result);
    }
    /**
     * Calculate entropy of probability distribution
     */
    static calculateEntropy(probabilities) {
        let entropy = 0;
        for (const p of probabilities) {
            if (p > 0) {
                entropy -= p * Math.log2(p);
            }
        }
        return entropy;
    }
    /**
     * Generate quantum-inspired hash for data integrity
     */
    static quantumHash(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const phase = this.calculateQuantumPhase(data[i]);
            hash ^= Math.floor(phase * 1000000) % 0xFFFFFFFF;
        }
        return hash.toString(16);
    }
}
exports.QuantumMath = QuantumMath;
//# sourceMappingURL=QuantumMath.js.map