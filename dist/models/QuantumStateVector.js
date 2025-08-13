"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumStateVector = void 0;
const Complex_1 = require("../math/Complex");
const QuantumMath_1 = require("../math/QuantumMath");
/**
 * Represents a quantum state vector with complex amplitudes and quantum phase
 * Used to simulate quantum superposition in the compression algorithm
 */
class QuantumStateVector {
    constructor(amplitudes, phase = 0, entanglementId) {
        if (amplitudes.length === 0) {
            throw new Error('QuantumStateVector must have at least one amplitude');
        }
        this._amplitudes = [...amplitudes]; // Create a copy
        this._phase = phase;
        this._entanglementId = entanglementId;
        // Validate and normalize the quantum state
        this.validateAndNormalize();
    }
    /**
     * Get the amplitudes (read-only)
     */
    get amplitudes() {
        return this._amplitudes;
    }
    /**
     * Get the quantum phase
     */
    get phase() {
        return this._phase;
    }
    /**
     * Get the entanglement ID if this state is entangled
     */
    get entanglementId() {
        return this._entanglementId;
    }
    /**
     * Set entanglement ID for this quantum state
     */
    setEntanglementId(id) {
        this._entanglementId = id;
    }
    /**
     * Create a quantum state vector from classical data bytes
     */
    static fromBytes(data, chunkSize = 4) {
        if (data.length === 0) {
            throw new Error('Cannot create quantum state from empty data');
        }
        const amplitudes = [];
        // Convert bytes to complex amplitudes
        for (let i = 0; i < Math.min(data.length, chunkSize); i++) {
            const byte = data[i];
            const phase = QuantumMath_1.QuantumMath.calculateQuantumPhase(byte);
            // Create amplitude with magnitude based on byte value and calculated phase
            const magnitude = (byte + 1) / 256; // Normalize to 0-1 range, avoid zero
            amplitudes.push(Complex_1.Complex.fromPolar(magnitude, phase));
        }
        // Calculate overall phase from data entropy
        const entropy = this.calculateDataEntropy(data);
        const overallPhase = entropy * Math.PI; // Map entropy to phase
        return new QuantumStateVector(amplitudes, overallPhase);
    }
    /**
     * Create a superposition state from multiple quantum states
     */
    static createSuperposition(states, weights) {
        if (states.length === 0) {
            throw new Error('Cannot create superposition from empty states array');
        }
        if (weights && weights.length !== states.length) {
            throw new Error('Weights array must match states array length');
        }
        // Use equal weights if none provided
        const actualWeights = weights || new Array(states.length).fill(1 / states.length);
        // Ensure weights sum to 1
        const weightSum = actualWeights.reduce((sum, w) => sum + w, 0);
        const normalizedWeights = actualWeights.map(w => w / weightSum);
        // Find the maximum amplitude count to pad shorter states
        const maxAmplitudes = Math.max(...states.map(s => s.amplitudes.length));
        const superpositionAmplitudes = [];
        for (let i = 0; i < maxAmplitudes; i++) {
            let combinedAmplitude = new Complex_1.Complex(0, 0);
            for (let j = 0; j < states.length; j++) {
                const state = states[j];
                const weight = Math.sqrt(normalizedWeights[j]); // Square root for amplitude weighting
                // Use zero amplitude if this state doesn't have enough amplitudes
                const amplitude = i < state.amplitudes.length
                    ? state.amplitudes[i]
                    : new Complex_1.Complex(0, 0);
                combinedAmplitude = combinedAmplitude.add(amplitude.scale(weight));
            }
            superpositionAmplitudes.push(combinedAmplitude);
        }
        // Calculate combined phase
        const combinedPhase = states.reduce((sum, state, index) => sum + state.phase * normalizedWeights[index], 0);
        return new QuantumStateVector(superpositionAmplitudes, combinedPhase);
    }
    /**
     * Calculate probability distribution from amplitudes
     */
    getProbabilityDistribution() {
        return this._amplitudes.map(amp => QuantumMath_1.QuantumMath.probabilityFromAmplitude(amp));
    }
    /**
     * Get the total probability (should be 1 for normalized states)
     */
    getTotalProbability() {
        return this.getProbabilityDistribution().reduce((sum, p) => sum + p, 0);
    }
    /**
     * Check if this state is normalized (total probability = 1)
     */
    isNormalized(tolerance = 1e-10) {
        return Math.abs(this.getTotalProbability() - 1) < tolerance;
    }
    /**
     * Create a normalized copy of this quantum state
     */
    normalize() {
        const normalizedAmplitudes = QuantumMath_1.QuantumMath.normalizeAmplitudes([...this._amplitudes]);
        return new QuantumStateVector(normalizedAmplitudes, this._phase, this._entanglementId);
    }
    /**
     * Apply a quantum phase shift to this state
     */
    applyPhaseShift(phaseShift) {
        const newPhase = (this._phase + phaseShift) % (2 * Math.PI);
        const shiftedAmplitudes = this._amplitudes.map(amp => amp.multiply(Complex_1.Complex.fromPolar(1, phaseShift)));
        return new QuantumStateVector(shiftedAmplitudes, newPhase, this._entanglementId);
    }
    /**
     * Calculate correlation with another quantum state
     */
    calculateCorrelation(other) {
        const minLength = Math.min(this._amplitudes.length, other._amplitudes.length);
        const thisAmps = this._amplitudes.slice(0, minLength);
        const otherAmps = other._amplitudes.slice(0, minLength);
        return QuantumMath_1.QuantumMath.calculateCorrelation(thisAmps, otherAmps);
    }
    /**
     * Convert quantum state back to classical bytes (for decompression)
     */
    toBytes() {
        const bytes = [];
        for (const amplitude of this._amplitudes) {
            // Convert amplitude back to byte value
            const magnitude = amplitude.magnitude();
            const phase = amplitude.phase();
            // Reconstruct byte from magnitude and phase
            const byte = Math.round((magnitude * 256 - 1) % 256);
            bytes.push(Math.max(0, Math.min(255, byte)));
        }
        return Buffer.from(bytes);
    }
    /**
     * Create a deep copy of this quantum state
     */
    clone() {
        const amplitudesCopy = this._amplitudes.map(amp => new Complex_1.Complex(amp.real, amp.imaginary));
        return new QuantumStateVector(amplitudesCopy, this._phase, this._entanglementId);
    }
    /**
     * Check if two quantum states are approximately equal
     */
    equals(other, tolerance = 1e-10) {
        if (this._amplitudes.length !== other._amplitudes.length) {
            return false;
        }
        if (Math.abs(this._phase - other._phase) > tolerance) {
            return false;
        }
        for (let i = 0; i < this._amplitudes.length; i++) {
            if (!this._amplitudes[i].equals(other._amplitudes[i], tolerance)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Get string representation of the quantum state
     */
    toString() {
        const ampStrings = this._amplitudes.map((amp, i) => `|${i}⟩: ${amp.toString()}`);
        return `QuantumState(phase: ${this._phase.toFixed(4)}, amplitudes: [${ampStrings.join(', ')}])`;
    }
    /**
     * Validate quantum state and normalize if needed
     */
    validateAndNormalize() {
        // Check for all-zero amplitudes
        const totalProbability = this.getTotalProbability();
        if (totalProbability === 0) {
            throw new Error('QuantumStateVector cannot have all zero amplitudes');
        }
        // Normalize if not already normalized
        if (!this.isNormalized()) {
            this._amplitudes = QuantumMath_1.QuantumMath.normalizeAmplitudes(this._amplitudes);
        }
    }
    /**
     * Calculate entropy of data for phase calculation
     */
    static calculateDataEntropy(data) {
        const frequencies = new Array(256).fill(0);
        // Count byte frequencies
        for (const byte of data) {
            frequencies[byte]++;
        }
        // Calculate probabilities and entropy
        const probabilities = frequencies.map(freq => freq / data.length);
        return QuantumMath_1.QuantumMath.calculateEntropy(probabilities);
    }
}
exports.QuantumStateVector = QuantumStateVector;
//# sourceMappingURL=QuantumStateVector.js.map