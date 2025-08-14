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
     * Extract detailed shared information with pattern analysis
     */
    extractDetailedSharedInformation() {
        const bytesA = this._stateA.toBytes();
        const bytesB = this._stateB.toBytes();
        const minLength = Math.min(bytesA.length, bytesB.length);
        const exactMatches = [];
        const similarBytes = [];
        const patterns = [];
        // Find exact matches and similar bytes
        for (let i = 0; i < minLength; i++) {
            if (bytesA[i] === bytesB[i]) {
                exactMatches.push(i);
            }
            else {
                const similarity = 1 - Math.abs(bytesA[i] - bytesB[i]) / 255;
                if (similarity > 0.5) {
                    similarBytes.push({
                        index: i,
                        valueA: bytesA[i],
                        valueB: bytesB[i],
                        similarity
                    });
                }
            }
        }
        // Find continuous patterns
        let patternStart = -1;
        let patternLength = 0;
        let patternSimilarity = 0;
        for (let i = 0; i < minLength; i++) {
            const similarity = 1 - Math.abs(bytesA[i] - bytesB[i]) / 255;
            if (similarity > 0.7) {
                if (patternStart === -1) {
                    patternStart = i;
                    patternLength = 1;
                    patternSimilarity = similarity;
                }
                else {
                    patternLength++;
                    patternSimilarity = (patternSimilarity * (patternLength - 1) + similarity) / patternLength;
                }
            }
            else {
                if (patternStart !== -1 && patternLength >= 2) {
                    patterns.push({
                        start: patternStart,
                        length: patternLength,
                        similarity: patternSimilarity
                    });
                }
                patternStart = -1;
                patternLength = 0;
                patternSimilarity = 0;
            }
        }
        // Add final pattern if exists
        if (patternStart !== -1 && patternLength >= 2) {
            patterns.push({
                start: patternStart,
                length: patternLength,
                similarity: patternSimilarity
            });
        }
        // Calculate information metrics
        const totalSharedBytes = exactMatches.length + similarBytes.length;
        const sharedRatio = minLength > 0 ? totalSharedBytes / minLength : 0;
        const averagePatternSimilarity = patterns.length > 0
            ? patterns.reduce((sum, p) => sum + p.similarity, 0) / patterns.length
            : 0;
        return {
            exactMatches,
            similarBytes,
            patterns,
            totalSharedBytes,
            sharedRatio,
            averagePatternSimilarity,
            compressionPotential: this.calculateCompressionPotential(patterns, totalSharedBytes)
        };
    }
    /**
     * Calculate advanced correlation strength with multiple metrics
     */
    calculateAdvancedCorrelationStrength() {
        const bytesA = this._stateA.toBytes();
        const bytesB = this._stateB.toBytes();
        const minLength = Math.min(bytesA.length, bytesB.length);
        if (minLength === 0) {
            return {
                pearsonCorrelation: 0,
                spearmanCorrelation: 0,
                mutualInformation: 0,
                normalizedMutualInformation: 0,
                structuralSimilarity: 0,
                overallStrength: 0
            };
        }
        // Pearson correlation coefficient
        const meanA = bytesA.slice(0, minLength).reduce((sum, b) => sum + b, 0) / minLength;
        const meanB = bytesB.slice(0, minLength).reduce((sum, b) => sum + b, 0) / minLength;
        let numerator = 0;
        let denomA = 0;
        let denomB = 0;
        for (let i = 0; i < minLength; i++) {
            const diffA = bytesA[i] - meanA;
            const diffB = bytesB[i] - meanB;
            numerator += diffA * diffB;
            denomA += diffA * diffA;
            denomB += diffB * diffB;
        }
        const pearsonCorrelation = (denomA * denomB > 0)
            ? numerator / Math.sqrt(denomA * denomB)
            : 0;
        // Spearman rank correlation (simplified)
        const ranksA = this.calculateRanks(Array.from(bytesA.slice(0, minLength)));
        const ranksB = this.calculateRanks(Array.from(bytesB.slice(0, minLength)));
        const meanRankA = ranksA.reduce((sum, r) => sum + r, 0) / ranksA.length;
        const meanRankB = ranksB.reduce((sum, r) => sum + r, 0) / ranksB.length;
        let spearmanNum = 0;
        let spearmanDenomA = 0;
        let spearmanDenomB = 0;
        for (let i = 0; i < ranksA.length; i++) {
            const diffA = ranksA[i] - meanRankA;
            const diffB = ranksB[i] - meanRankB;
            spearmanNum += diffA * diffB;
            spearmanDenomA += diffA * diffA;
            spearmanDenomB += diffB * diffB;
        }
        const spearmanCorrelation = (spearmanDenomA * spearmanDenomB > 0)
            ? spearmanNum / Math.sqrt(spearmanDenomA * spearmanDenomB)
            : 0;
        // Mutual information (already calculated)
        const mutualInformation = this.calculateMutualInformation();
        // Normalized mutual information
        const probsA = this._stateA.getProbabilityDistribution();
        const probsB = this._stateB.getProbabilityDistribution();
        const entropyA = QuantumMath_1.QuantumMath.calculateEntropy(probsA);
        const entropyB = QuantumMath_1.QuantumMath.calculateEntropy(probsB);
        const maxEntropy = Math.max(entropyA, entropyB);
        const normalizedMutualInformation = maxEntropy > 0 ? Math.min(mutualInformation / maxEntropy, 1.0) : 0;
        // Structural similarity (based on patterns)
        const detailedInfo = this.extractDetailedSharedInformation();
        const structuralSimilarity = detailedInfo.averagePatternSimilarity;
        // Overall strength (weighted combination)
        const overallStrength = (0.3 * Math.abs(pearsonCorrelation) +
            0.2 * Math.abs(spearmanCorrelation) +
            0.2 * normalizedMutualInformation +
            0.3 * structuralSimilarity);
        return {
            pearsonCorrelation,
            spearmanCorrelation,
            mutualInformation,
            normalizedMutualInformation,
            structuralSimilarity,
            overallStrength: Math.min(overallStrength, 1.0)
        };
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
    /**
     * Calculate compression potential based on patterns and shared bytes
     */
    calculateCompressionPotential(patterns, totalSharedBytes) {
        if (patterns.length === 0)
            return 0;
        // Calculate potential savings from patterns
        let potentialSavings = 0;
        for (const pattern of patterns) {
            // Savings = pattern_length * similarity * correlation_strength
            potentialSavings += pattern.length * pattern.similarity * this._correlationStrength;
        }
        // Add savings from shared bytes
        potentialSavings += totalSharedBytes * this._correlationStrength;
        // Normalize by total data size
        const totalSize = Math.max(this._stateA.toBytes().length, this._stateB.toBytes().length);
        return totalSize > 0 ? Math.min(potentialSavings / totalSize, 1.0) : 0;
    }
    /**
     * Calculate ranks for Spearman correlation
     */
    calculateRanks(values) {
        const indexed = values.map((value, index) => ({ value, index }));
        indexed.sort((a, b) => a.value - b.value);
        const ranks = new Array(values.length);
        for (let i = 0; i < indexed.length; i++) {
            ranks[indexed[i].index] = i + 1;
        }
        return ranks;
    }
}
exports.EntanglementPair = EntanglementPair;
//# sourceMappingURL=EntanglementPair.js.map