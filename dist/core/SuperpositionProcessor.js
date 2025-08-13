"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperpositionProcessor = void 0;
const QuantumStateVector_1 = require("../models/QuantumStateVector");
const SuperpositionState_1 = require("../models/SuperpositionState");
const QuantumMath_1 = require("../math/QuantumMath");
/**
 * Processes quantum superposition states for parallel pattern analysis
 * Enables simultaneous analysis of multiple data patterns through quantum superposition
 */
class SuperpositionProcessor {
    constructor(maxSuperpositionSize = 16, coherenceThreshold = 0.1, patternThreshold = 0.05, parallelismFactor = 4) {
        this.validateParameters(maxSuperpositionSize, coherenceThreshold, patternThreshold, parallelismFactor);
        this._maxSuperpositionSize = maxSuperpositionSize;
        this._coherenceThreshold = coherenceThreshold;
        this._patternThreshold = patternThreshold;
        this._parallelismFactor = parallelismFactor;
    }
    /**
     * Get maximum superposition size
     */
    get maxSuperpositionSize() {
        return this._maxSuperpositionSize;
    }
    /**
     * Set maximum superposition size
     */
    set maxSuperpositionSize(value) {
        if (value < 2 || value > 64) {
            throw new Error('Maximum superposition size must be between 2 and 64');
        }
        this._maxSuperpositionSize = value;
    }
    /**
     * Get coherence threshold
     */
    get coherenceThreshold() {
        return this._coherenceThreshold;
    }
    /**
     * Set coherence threshold
     */
    set coherenceThreshold(value) {
        if (value < 0 || value > 1) {
            throw new Error('Coherence threshold must be between 0 and 1');
        }
        this._coherenceThreshold = value;
    }
    /**
     * Get pattern threshold
     */
    get patternThreshold() {
        return this._patternThreshold;
    }
    /**
     * Set pattern threshold
     */
    set patternThreshold(value) {
        if (value < 0 || value > 1) {
            throw new Error('Pattern threshold must be between 0 and 1');
        }
        this._patternThreshold = value;
    }
    /**
     * Get parallelism factor
     */
    get parallelismFactor() {
        return this._parallelismFactor;
    }
    /**
     * Set parallelism factor
     */
    set parallelismFactor(value) {
        if (value < 1 || value > 16) {
            throw new Error('Parallelism factor must be between 1 and 16');
        }
        this._parallelismFactor = value;
    }
    /**
     * Create superposition from quantum states for parallel analysis
     */
    createSuperposition(states, weights) {
        if (states.length === 0) {
            throw new Error('Cannot create superposition from empty states array');
        }
        if (states.length > this._maxSuperpositionSize) {
            // Split into multiple superpositions if too large
            return this.createHierarchicalSuperposition(states, weights);
        }
        // Use equal weights if none provided
        const actualWeights = weights || this.calculateOptimalWeights(states);
        return SuperpositionState_1.SuperpositionState.fromQuantumStates(states, actualWeights);
    }
    /**
     * Analyze probability amplitudes to identify patterns
     */
    analyzeProbabilityAmplitudes(superposition) {
        const patterns = superposition.analyzeProbabilityAmplitudes();
        // Filter patterns above threshold
        const significantPatterns = patterns.filter(pattern => pattern.probability >= this._patternThreshold);
        // Sort by probability (highest first)
        return significantPatterns.sort((a, b) => b.probability - a.probability);
    }
    /**
     * Process multiple superpositions in parallel
     */
    processParallelSuperpositions(stateGroups, weights) {
        if (stateGroups.length === 0) {
            throw new Error('Cannot process empty state groups');
        }
        const superpositions = [];
        const patternAnalyses = [];
        const processingMetrics = [];
        // Process each group in parallel (simulated)
        for (let i = 0; i < stateGroups.length; i++) {
            const startTime = performance.now();
            try {
                const groupWeights = weights ? weights[i] : undefined;
                const superposition = this.createSuperposition(stateGroups[i], groupWeights);
                const patterns = this.analyzeProbabilityAmplitudes(superposition);
                superpositions.push(superposition);
                patternAnalyses.push(patterns);
                const endTime = performance.now();
                processingMetrics.push({
                    groupIndex: i,
                    stateCount: stateGroups[i].length,
                    patternCount: patterns.length,
                    processingTime: endTime - startTime,
                    coherenceTime: superposition.coherenceTime,
                    entropy: superposition.calculateEntropy()
                });
            }
            catch (error) {
                // Handle processing errors gracefully
                processingMetrics.push({
                    groupIndex: i,
                    stateCount: stateGroups[i].length,
                    patternCount: 0,
                    processingTime: performance.now() - startTime,
                    coherenceTime: 0,
                    entropy: 0,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return {
            superpositions,
            patternAnalyses,
            processingMetrics,
            totalProcessingTime: processingMetrics.reduce((sum, metric) => sum + metric.processingTime, 0),
            successfulGroups: processingMetrics.filter(metric => !metric.error).length,
            failedGroups: processingMetrics.filter(metric => metric.error).length
        };
    }
    /**
     * Identify dominant patterns across multiple superpositions
     */
    identifyDominantPatterns(patternAnalyses, dominanceThreshold = 0.1) {
        const patternMap = new Map();
        // Aggregate patterns across all analyses
        patternAnalyses.forEach((patterns, groupIndex) => {
            patterns.forEach(pattern => {
                const patternKey = this.generatePatternKey(pattern);
                if (patternMap.has(patternKey)) {
                    const existing = patternMap.get(patternKey);
                    existing.occurrences++;
                    existing.totalProbability += pattern.probability;
                    existing.groupIndices.push(groupIndex);
                    existing.averageProbability = existing.totalProbability / existing.occurrences;
                }
                else {
                    patternMap.set(patternKey, {
                        patternKey,
                        amplitude: pattern.amplitude,
                        averageProbability: pattern.probability,
                        totalProbability: pattern.probability,
                        occurrences: 1,
                        groupIndices: [groupIndex],
                        dominanceScore: pattern.probability
                    });
                }
            });
        });
        // Calculate dominance scores and filter
        const dominantPatterns = Array.from(patternMap.values())
            .map(pattern => {
            // Dominance score considers both probability and frequency
            pattern.dominanceScore =
                (pattern.averageProbability * 0.7) +
                    ((pattern.occurrences / patternAnalyses.length) * 0.3);
            return pattern;
        })
            .filter(pattern => pattern.dominanceScore >= dominanceThreshold)
            .sort((a, b) => b.dominanceScore - a.dominanceScore);
        return dominantPatterns;
    }
    /**
     * Optimize superposition for better pattern recognition
     */
    optimizeSuperposition(superposition, targetPatterns) {
        if (!superposition.isCoherent(this._coherenceThreshold)) {
            // Superposition has lost coherence, cannot optimize
            throw new Error('Cannot optimize incoherent superposition');
        }
        // If no target patterns specified, use current dominant patterns
        const patterns = targetPatterns || this.analyzeProbabilityAmplitudes(superposition);
        if (patterns.length === 0) {
            return superposition;
        }
        // Create optimized weights based on pattern importance
        const optimizedWeights = this.calculatePatternBasedWeights(Array.from(superposition.constituentStates), patterns);
        // Create new superposition with optimized weights
        return SuperpositionState_1.SuperpositionState.fromQuantumStates(Array.from(superposition.constituentStates), optimizedWeights, superposition.coherenceTime);
    }
    /**
     * Apply quantum interference to enhance or suppress patterns
     */
    applyQuantumInterference(superposition, interferenceType, targetPatternIndices) {
        const amplitudes = [...superposition.combinedAmplitudes];
        // Apply interference to target patterns
        for (const index of targetPatternIndices) {
            if (index >= 0 && index < amplitudes.length) {
                const currentAmplitude = amplitudes[index];
                if (interferenceType === 'constructive') {
                    // Enhance amplitude through constructive interference
                    amplitudes[index] = currentAmplitude.scale(1.2);
                }
                else {
                    // Suppress amplitude through destructive interference
                    amplitudes[index] = currentAmplitude.scale(0.8);
                }
            }
        }
        // Normalize amplitudes
        const normalizedAmplitudes = QuantumMath_1.QuantumMath.normalizeAmplitudes(amplitudes);
        // Create new superposition with modified amplitudes
        return new SuperpositionState_1.SuperpositionState(normalizedAmplitudes, Array.from(superposition.constituentStates), Array.from(superposition.weights), superposition.coherenceTime);
    }
    /**
     * Measure superposition and extract pattern information
     */
    measureSuperposition(superposition) {
        const measurement = superposition.measure();
        const patterns = this.analyzeProbabilityAmplitudes(superposition);
        return {
            collapsedStateIndex: measurement.stateIndex,
            collapsedState: measurement.collapsedState,
            measurementProbability: measurement.probability,
            detectedPatterns: patterns,
            coherenceTime: superposition.coherenceTime,
            entropy: superposition.calculateEntropy(),
            measurementTimestamp: Date.now()
        };
    }
    /**
     * Calculate processing efficiency metrics
     */
    calculateProcessingEfficiency(result) {
        const totalStates = result.processingMetrics.reduce((sum, metric) => sum + metric.stateCount, 0);
        const totalPatterns = result.processingMetrics.reduce((sum, metric) => sum + metric.patternCount, 0);
        const averageCoherence = result.processingMetrics
            .filter(metric => !metric.error)
            .reduce((sum, metric) => sum + metric.coherenceTime, 0) / result.successfulGroups;
        const parallelismEfficiency = result.successfulGroups / result.processingMetrics.length;
        const patternDensity = totalPatterns / totalStates;
        const processingSpeed = totalStates / (result.totalProcessingTime / 1000); // states per second
        return {
            totalStatesProcessed: totalStates,
            totalPatternsDetected: totalPatterns,
            averageCoherenceTime: averageCoherence,
            parallelismEfficiency,
            patternDensity,
            processingSpeed,
            successRate: result.successfulGroups / result.processingMetrics.length,
            averageProcessingTime: result.totalProcessingTime / result.processingMetrics.length
        };
    }
    /**
     * Create hierarchical superposition for large state sets
     */
    createHierarchicalSuperposition(states, weights) {
        // Split states into manageable groups
        const groupSize = Math.floor(this._maxSuperpositionSize / 2);
        const groups = [];
        const groupWeights = [];
        for (let i = 0; i < states.length; i += groupSize) {
            const group = states.slice(i, i + groupSize);
            groups.push(group);
            if (weights) {
                groupWeights.push(weights.slice(i, i + groupSize));
            }
        }
        // Create superpositions for each group
        const groupSuperpositions = [];
        const superpositionWeights = [];
        for (let i = 0; i < groups.length; i++) {
            const groupWeight = weights ? groupWeights[i] : undefined;
            const groupSuperposition = SuperpositionState_1.SuperpositionState.fromQuantumStates(groups[i], groupWeight);
            // Convert superposition back to a representative quantum state
            const representativeState = this.createRepresentativeState(groupSuperposition);
            groupSuperpositions.push(representativeState);
            superpositionWeights.push(1 / groups.length); // Equal weights for groups
        }
        // Create final superposition from group representatives
        return SuperpositionState_1.SuperpositionState.fromQuantumStates(groupSuperpositions, superpositionWeights);
    }
    /**
     * Calculate optimal weights for quantum states
     */
    calculateOptimalWeights(states) {
        const weights = [];
        // Calculate weights based on state entropy and complexity
        for (const state of states) {
            const probabilities = state.getProbabilityDistribution();
            const entropy = QuantumMath_1.QuantumMath.calculateEntropy(probabilities);
            const complexity = this.calculateStateComplexity(state);
            // Weight combines entropy and complexity
            const weight = (entropy / 8) * 0.6 + complexity * 0.4;
            weights.push(weight);
        }
        // Normalize weights to sum to 1
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        return weights.map(w => w / totalWeight);
    }
    /**
     * Calculate complexity of a quantum state
     */
    calculateStateComplexity(state) {
        const amplitudes = state.amplitudes;
        if (amplitudes.length < 2)
            return 0;
        let complexity = 0;
        for (let i = 1; i < amplitudes.length; i++) {
            const diff = amplitudes[i].subtract(amplitudes[i - 1]).magnitude();
            complexity += diff;
        }
        return complexity / (amplitudes.length - 1);
    }
    /**
     * Generate a unique key for pattern identification
     */
    generatePatternKey(pattern) {
        const magnitude = Math.round(pattern.magnitude * 1000) / 1000;
        const phase = Math.round(pattern.phase * 1000) / 1000;
        return `${magnitude}_${phase}_${pattern.index}`;
    }
    /**
     * Calculate pattern-based weights for optimization
     */
    calculatePatternBasedWeights(states, patterns) {
        const weights = new Array(states.length).fill(1 / states.length);
        // Adjust weights based on pattern importance
        patterns.forEach(pattern => {
            if (pattern.index < weights.length) {
                weights[pattern.index] *= (1 + pattern.probability);
            }
        });
        // Normalize weights
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        return weights.map(w => w / totalWeight);
    }
    /**
     * Create representative state from superposition
     */
    createRepresentativeState(superposition) {
        // Use the combined amplitudes as the representative state
        return new QuantumStateVector_1.QuantumStateVector([...superposition.combinedAmplitudes]);
    }
    /**
     * Validate constructor parameters
     */
    validateParameters(maxSuperpositionSize, coherenceThreshold, patternThreshold, parallelismFactor) {
        if (maxSuperpositionSize < 2 || maxSuperpositionSize > 64) {
            throw new Error('Maximum superposition size must be between 2 and 64');
        }
        if (coherenceThreshold < 0 || coherenceThreshold > 1) {
            throw new Error('Coherence threshold must be between 0 and 1');
        }
        if (patternThreshold < 0 || patternThreshold > 1) {
            throw new Error('Pattern threshold must be between 0 and 1');
        }
        if (parallelismFactor < 1 || parallelismFactor > 16) {
            throw new Error('Parallelism factor must be between 1 and 16');
        }
    }
}
exports.SuperpositionProcessor = SuperpositionProcessor;
//# sourceMappingURL=SuperpositionProcessor.js.map