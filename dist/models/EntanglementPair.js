"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntanglementPair = void 0;
const QuantumStateVector_1 = require("./QuantumStateVector");
const QuantumMath_1 = require("../math/QuantumMath");
/**
 * Represents a quantum entanglement pair between two quantum states
 * Used for identifying and exploiting correlated patterns in compression
 */
class EntanglementPair {
    constructor(stateA, stateB, sharedInformation) {
        this._stateA = stateA.clone();
        this._stateB = stateB.clone();
        this._creationTime = Date.now();
        // Generate unique entanglement ID
        this._entanglementId = this.generateEntanglementId();
        // Set entanglement IDs on both states
        this._stateA.setEntanglementId(this._entanglementId);
        this._stateB.setEntanglementId(this._entanglementId);
        // Calculate correlation strength
        this._correlationStrength = this.calculateCorrelationStrength();
        // Extract or use provided shared information
        this._sharedInformation = sharedInformation || this.extractSharedInformation();
        // Validate the entanglement
        this.validateEntanglement();
    }
    /**
     * Get state A (read-only)
     */
    get stateA() {
        return this._stateA;
    }
    /**
     * Get state B (read-only)
     */
    get stateB() {
        return this._stateB;
    }
    /**
     * Get correlation strength
     */
    get correlationStrength() {
        return this._correlationStrength;
    }
    /**
     * Get shared information
     */
    get sharedInformation() {
        return Buffer.from(this._sharedInformation);
    }
    /**
     * Get entanglement ID
     */
    get entanglementId() {
        return this._entanglementId;
    }
    /**
     * Get creation time
     */
    get creationTime() {
        return this._creationTime;
    }
    /**
     * Create an entanglement pair from two quantum states if they are sufficiently correlated
     */
    static createIfCorrelated(stateA, stateB, minCorrelation = 0.5) {
        const correlation = stateA.calculateCorrelation(stateB);
        if (correlation >= minCorrelation) {
            return new EntanglementPair(stateA, stateB);
        }
        return null;
    }
    /**
     * Create entanglement pairs from an array of quantum states
     */
    static findEntanglementPairs(states, minCorrelation = 0.5) {
        const pairs = [];
        const usedStates = new Set();
        for (let i = 0; i < states.length; i++) {
            if (usedStates.has(i))
                continue;
            for (let j = i + 1; j < states.length; j++) {
                if (usedStates.has(j))
                    continue;
                const pair = EntanglementPair.createIfCorrelated(states[i], states[j], minCorrelation);
                if (pair) {
                    pairs.push(pair);
                    usedStates.add(i);
                    usedStates.add(j);
                    break; // Each state can only be in one entanglement pair
                }
            }
        }
        return pairs;
    }
    /**
     * Create entanglement from data patterns with high correlation
     */
    static fromDataPatterns(patternA, patternB, minCorrelation = 0.5) {
        const stateA = QuantumStateVector_1.QuantumStateVector.fromBytes(patternA);
        const stateB = QuantumStateVector_1.QuantumStateVector.fromBytes(patternB);
        return EntanglementPair.createIfCorrelated(stateA, stateB, minCorrelation);
    }
    /**
     * Check if the entanglement is still valid (correlation above threshold)
     */
    isValid(minCorrelation = 0.3) {
        return this._correlationStrength >= minCorrelation;
    }
    /**
     * Measure one state and get the correlated result for the other
     */
    measureCorrelatedStates() {
        const stateABytes = this._stateA.toBytes();
        const stateBBytes = this._stateB.toBytes();
        return {
            stateABytes,
            stateBBytes,
            correlation: this._correlationStrength
        };
    }
    /**
     * Apply quantum operation to both entangled states simultaneously
     */
    applyCorrelatedPhaseShift(phaseShift) {
        const newStateA = this._stateA.applyPhaseShift(phaseShift);
        const newStateB = this._stateB.applyPhaseShift(-phaseShift); // Anti-correlated phase
        return new EntanglementPair(newStateA, newStateB, this._sharedInformation);
    }
    /**
     * Break the entanglement (decoherence)
     */
    breakEntanglement() {
        // Remove entanglement IDs
        const independentStateA = this._stateA.clone();
        const independentStateB = this._stateB.clone();
        // Note: We can't directly remove entanglement ID as it's read-only
        // In a real implementation, we'd need a method to clear entanglement
        return {
            stateA: independentStateA,
            stateB: independentStateB
        };
    }
    /**
     * Calculate the mutual information between the entangled states
     */
    calculateMutualInformation() {
        const probsA = this._stateA.getProbabilityDistribution();
        const probsB = this._stateB.getProbabilityDistribution();
        const entropyA = QuantumMath_1.QuantumMath.calculateEntropy(probsA);
        const entropyB = QuantumMath_1.QuantumMath.calculateEntropy(probsB);
        // Simplified joint entropy calculation
        const minLength = Math.min(probsA.length, probsB.length);
        const jointProbs = [];
        for (let i = 0; i < minLength; i++) {
            jointProbs.push(probsA[i] * probsB[i] * this._correlationStrength);
        }
        const jointEntropy = QuantumMath_1.QuantumMath.calculateEntropy(jointProbs);
        // Mutual information = H(A) + H(B) - H(A,B)
        return entropyA + entropyB - jointEntropy;
    }
    /**
     * Get the compression benefit from this entanglement
     */
    getCompressionBenefit() {
        const mutualInfo = this.calculateMutualInformation();
        const sharedInfoSize = this._sharedInformation.length;
        // Benefit is proportional to mutual information and shared data size
        return mutualInfo * sharedInfoSize * this._correlationStrength;
    }
    /**
     * Check if this entanglement pair is equivalent to another
     */
    equals(other, tolerance = 1e-10) {
        return (this._stateA.equals(other._stateA, tolerance) &&
            this._stateB.equals(other._stateB, tolerance)) || (this._stateA.equals(other._stateB, tolerance) &&
            this._stateB.equals(other._stateA, tolerance));
    }
    /**
     * Create a deep copy of this entanglement pair
     */
    clone() {
        return new EntanglementPair(this._stateA, this._stateB, this._sharedInformation);
    }
    /**
     * Get string representation of the entanglement pair
     */
    toString() {
        const correlation = this._correlationStrength.toFixed(4);
        const sharedSize = this._sharedInformation.length;
        const benefit = this.getCompressionBenefit().toFixed(4);
        return `EntanglementPair(correlation: ${correlation}, shared: ${sharedSize}B, benefit: ${benefit})`;
    }
    /**
     * Calculate correlation strength between the two states
     */
    calculateCorrelationStrength() {
        return this._stateA.calculateCorrelation(this._stateB);
    }
    /**
     * Extract shared information from the correlated states
     */
    extractSharedInformation() {
        const bytesA = this._stateA.toBytes();
        const bytesB = this._stateB.toBytes();
        const sharedBytes = [];
        const minLength = Math.min(bytesA.length, bytesB.length);
        // Extract common patterns
        for (let i = 0; i < minLength; i++) {
            const similarity = 1 - Math.abs(bytesA[i] - bytesB[i]) / 255;
            if (similarity > 0.7) { // High similarity threshold
                // Store the average as shared information
                sharedBytes.push(Math.round((bytesA[i] + bytesB[i]) / 2));
            }
        }
        return Buffer.from(sharedBytes);
    }
    /**
     * Generate unique entanglement ID
     */
    generateEntanglementId() {
        const timestamp = this._creationTime.toString(36);
        const random = Math.random().toString(36).substring(2);
        return `entangled-${timestamp}-${random}`;
    }
    /**
     * Validate the entanglement pair
     */
    validateEntanglement() {
        if (this._correlationStrength < 0 || this._correlationStrength > 1) {
            throw new Error('Correlation strength must be between 0 and 1');
        }
        if (this._correlationStrength < 0.1) {
            throw new Error('States must have minimum correlation to form entanglement');
        }
    }
}
exports.EntanglementPair = EntanglementPair;
//# sourceMappingURL=EntanglementPair.js.map