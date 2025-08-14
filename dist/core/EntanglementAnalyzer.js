"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntanglementAnalyzer = void 0;
const EntanglementPair_1 = require("../models/EntanglementPair");
/**
 * Analyzes quantum states to find entanglement opportunities for compression
 * Implements correlation detection and entanglement pairing logic
 */
class EntanglementAnalyzer {
    constructor(minCorrelationThreshold = 0.5, maxEntanglementPairs = 100) {
        if (minCorrelationThreshold < 0 || minCorrelationThreshold > 1) {
            throw new Error('Correlation threshold must be between 0 and 1');
        }
        this._minCorrelationThreshold = minCorrelationThreshold;
        this._maxEntanglementPairs = maxEntanglementPairs;
        this._correlationCache = new Map();
    }
    /**
     * Find entangled patterns in an array of quantum states
     */
    findEntangledPatterns(states) {
        if (states.length < 2) {
            return [];
        }
        const pairs = [];
        const usedStateIndices = new Set();
        const correlationMatrix = this.buildCorrelationMatrix(states);
        // Sort potential pairs by correlation strength (highest first)
        const potentialPairs = this.findPotentialPairs(correlationMatrix, states);
        for (const { indexA, indexB, correlation } of potentialPairs) {
            // Skip if either state is already used in another entanglement
            if (usedStateIndices.has(indexA) || usedStateIndices.has(indexB)) {
                continue;
            }
            // Skip if correlation is below threshold
            if (correlation < this._minCorrelationThreshold) {
                break; // Since pairs are sorted, no more valid pairs exist
            }
            // Create entanglement pair
            const pair = new EntanglementPair_1.EntanglementPair(states[indexA], states[indexB]);
            pairs.push(pair);
            // Mark states as used
            usedStateIndices.add(indexA);
            usedStateIndices.add(indexB);
            // Stop if we've reached the maximum number of pairs
            if (pairs.length >= this._maxEntanglementPairs) {
                break;
            }
        }
        return pairs;
    }
    /**
     * Calculate correlation strength between two quantum states
     */
    calculateCorrelationStrength(pair) {
        return pair.correlationStrength;
    }
    /**
     * Extract shared information from entangled pairs using advanced pattern analysis
     */
    extractSharedInformation(pairs) {
        if (pairs.length === 0) {
            return {
                totalSharedBytes: 0,
                compressionPotential: 0,
                sharedPatterns: [],
                informationDensity: 0
            };
        }
        let totalSharedBytes = 0;
        let totalCompressionBenefit = 0;
        const sharedPatterns = [];
        const patternFrequency = new Map();
        for (const pair of pairs) {
            const sharedInfo = pair.sharedInformation;
            totalSharedBytes += sharedInfo.length;
            totalCompressionBenefit += pair.getCompressionBenefit();
            // Analyze patterns in shared information
            const patterns = this.analyzeSharedPatterns(sharedInfo);
            for (const pattern of patterns) {
                sharedPatterns.push({
                    pattern: pattern.bytes,
                    frequency: pattern.frequency,
                    correlationStrength: pair.correlationStrength,
                    compressionValue: pattern.frequency * pair.correlationStrength
                });
                // Track pattern frequency across all pairs
                const patternKey = pattern.bytes.toString('hex');
                patternFrequency.set(patternKey, (patternFrequency.get(patternKey) || 0) + pattern.frequency);
            }
        }
        // Calculate information density (shared bytes per pair)
        const informationDensity = pairs.length > 0 ? totalSharedBytes / pairs.length : 0;
        // Calculate compression potential based on shared information
        const compressionPotential = this.calculateCompressionPotential(sharedPatterns, totalSharedBytes);
        return {
            totalSharedBytes,
            compressionPotential,
            sharedPatterns: sharedPatterns.sort((a, b) => b.compressionValue - a.compressionValue),
            informationDensity
        };
    }
    /**
     * Calculate advanced correlation strength metrics for multiple pairs
     */
    calculateAdvancedCorrelationMetrics(pairs) {
        if (pairs.length === 0) {
            return {
                averageCorrelation: 0,
                weightedCorrelation: 0,
                correlationVariance: 0,
                correlationStability: 0,
                strongCorrelationRatio: 0,
                correlationDistribution: this.createCorrelationHistogram([])
            };
        }
        const correlations = pairs.map(pair => pair.correlationStrength);
        const compressionBenefits = pairs.map(pair => pair.getCompressionBenefit());
        // Basic statistics
        const averageCorrelation = correlations.reduce((sum, c) => sum + c, 0) / correlations.length;
        // Weighted correlation by compression benefit
        const totalBenefit = compressionBenefits.reduce((sum, b) => sum + b, 0);
        const weightedCorrelation = totalBenefit > 0
            ? correlations.reduce((sum, c, i) => sum + c * (compressionBenefits[i] / totalBenefit), 0)
            : averageCorrelation;
        // Correlation variance
        const correlationVariance = correlations.reduce((sum, c) => sum + Math.pow(c - averageCorrelation, 2), 0) / correlations.length;
        // Correlation stability (inverse of coefficient of variation)
        const correlationStability = averageCorrelation > 0
            ? 1 - (Math.sqrt(correlationVariance) / averageCorrelation)
            : 0;
        // Strong correlation ratio (percentage above threshold)
        const strongCorrelations = correlations.filter(c => c >= this._minCorrelationThreshold).length;
        const strongCorrelationRatio = strongCorrelations / correlations.length;
        return {
            averageCorrelation,
            weightedCorrelation,
            correlationVariance,
            correlationStability: Math.max(0, correlationStability), // Ensure non-negative
            strongCorrelationRatio,
            correlationDistribution: this.createCorrelationHistogram(correlations)
        };
    }
    /**
     * Extract shared information patterns optimized for compression
     */
    extractOptimizedSharedPatterns(pairs, minPatternLength = 2) {
        const allSharedData = pairs.map(pair => pair.sharedInformation);
        const patternMap = new Map();
        // Analyze patterns across all shared information
        for (let i = 0; i < allSharedData.length; i++) {
            const data = allSharedData[i];
            const pair = pairs[i];
            // Extract patterns of different lengths
            for (let patternLength = minPatternLength; patternLength <= Math.min(data.length, 8); patternLength++) {
                for (let offset = 0; offset <= data.length - patternLength; offset++) {
                    const pattern = data.subarray(offset, offset + patternLength);
                    const patternKey = pattern.toString('hex');
                    if (!patternMap.has(patternKey)) {
                        patternMap.set(patternKey, {
                            pattern,
                            occurrences: 0,
                            totalCorrelationStrength: 0,
                            pairIndices: [],
                            compressionSavings: 0
                        });
                    }
                    const info = patternMap.get(patternKey);
                    info.occurrences++;
                    info.totalCorrelationStrength += pair.correlationStrength;
                    info.pairIndices.push(i);
                    // Calculate potential compression savings
                    info.compressionSavings = (info.occurrences - 1) * pattern.length;
                }
            }
        }
        // Filter and sort patterns by compression value
        const optimizedPatterns = [];
        for (const [key, info] of patternMap) {
            if (info.occurrences > 1) { // Only patterns that appear multiple times
                const averageCorrelation = info.totalCorrelationStrength / info.occurrences;
                const compressionValue = info.compressionSavings * averageCorrelation;
                optimizedPatterns.push({
                    pattern: info.pattern,
                    occurrences: info.occurrences,
                    averageCorrelation,
                    compressionSavings: info.compressionSavings,
                    compressionValue,
                    pairIndices: info.pairIndices
                });
            }
        }
        // Sort by compression value (highest first)
        optimizedPatterns.sort((a, b) => b.compressionValue - a.compressionValue);
        const totalSavings = optimizedPatterns.reduce((sum, p) => sum + p.compressionSavings, 0);
        const totalOriginalSize = allSharedData.reduce((sum, data) => sum + data.length, 0);
        const compressionRatio = totalOriginalSize > 0 ? totalSavings / totalOriginalSize : 0;
        return {
            patterns: optimizedPatterns,
            totalCompressionSavings: totalSavings,
            compressionRatio,
            patternCount: optimizedPatterns.length
        };
    }
    /**
     * Analyze correlation patterns in a set of quantum states
     */
    analyzeCorrelationPatterns(states) {
        if (states.length === 0) {
            return {
                averageCorrelation: 0,
                maxCorrelation: 0,
                minCorrelation: 0,
                correlationDistribution: [],
                stronglyCorrelatedPairs: 0,
                totalPairs: 0
            };
        }
        const correlations = [];
        let stronglyCorrelatedPairs = 0;
        const totalPairs = (states.length * (states.length - 1)) / 2;
        // Calculate all pairwise correlations
        for (let i = 0; i < states.length; i++) {
            for (let j = i + 1; j < states.length; j++) {
                const correlation = this.calculatePairwiseCorrelation(states[i], states[j]);
                correlations.push(correlation);
                if (correlation >= this._minCorrelationThreshold) {
                    stronglyCorrelatedPairs++;
                }
            }
        }
        const averageCorrelation = correlations.reduce((sum, c) => sum + c, 0) / correlations.length;
        const maxCorrelation = Math.max(...correlations);
        const minCorrelation = Math.min(...correlations);
        // Create correlation distribution histogram
        const correlationDistribution = this.createCorrelationHistogram(correlations);
        return {
            averageCorrelation,
            maxCorrelation,
            minCorrelation,
            correlationDistribution,
            stronglyCorrelatedPairs,
            totalPairs
        };
    }
    /**
     * Find optimal entanglement pairs for maximum compression benefit
     */
    findOptimalEntanglementPairs(states) {
        const allPairs = this.findEntangledPatterns(states);
        // Sort by compression benefit (highest first)
        return allPairs.sort((a, b) => b.getCompressionBenefit() - a.getCompressionBenefit());
    }
    /**
     * Validate entanglement quality and suggest improvements
     */
    validateEntanglementQuality(pairs) {
        const validPairs = [];
        const invalidPairs = [];
        const suggestions = [];
        let totalBenefit = 0;
        let averageCorrelation = 0;
        for (const pair of pairs) {
            if (pair.isValid(this._minCorrelationThreshold)) {
                validPairs.push(pair);
                totalBenefit += pair.getCompressionBenefit();
                averageCorrelation += pair.correlationStrength;
            }
            else {
                invalidPairs.push(pair);
            }
        }
        if (validPairs.length > 0) {
            averageCorrelation /= validPairs.length;
        }
        // Generate suggestions
        if (invalidPairs.length > 0) {
            suggestions.push(`${invalidPairs.length} pairs have correlation below threshold`);
        }
        if (averageCorrelation < 0.7) {
            suggestions.push('Consider lowering correlation threshold for more pairs');
        }
        if (validPairs.length < pairs.length * 0.5) {
            suggestions.push('Low entanglement success rate - check data patterns');
        }
        return {
            validPairs,
            invalidPairs,
            totalBenefit,
            averageCorrelation,
            suggestions
        };
    }
    /**
     * Clear correlation cache to free memory
     */
    clearCache() {
        this._correlationCache.clear();
    }
    /**
     * Get current correlation threshold
     */
    get correlationThreshold() {
        return this._minCorrelationThreshold;
    }
    /**
     * Set new correlation threshold
     */
    setCorrelationThreshold(threshold) {
        if (threshold < 0 || threshold > 1) {
            throw new Error('Correlation threshold must be between 0 and 1');
        }
        this._minCorrelationThreshold = threshold;
        this.clearCache(); // Clear cache as threshold changed
    }
    /**
     * Build correlation matrix for all state pairs
     */
    buildCorrelationMatrix(states) {
        const matrix = [];
        for (let i = 0; i < states.length; i++) {
            matrix[i] = [];
            for (let j = 0; j < states.length; j++) {
                if (i === j) {
                    matrix[i][j] = 1.0; // Perfect self-correlation
                }
                else if (i < j) {
                    matrix[i][j] = this.calculatePairwiseCorrelation(states[i], states[j]);
                }
                else {
                    matrix[i][j] = matrix[j][i]; // Symmetric matrix
                }
            }
        }
        return matrix;
    }
    /**
     * Calculate correlation between two quantum states with caching
     */
    calculatePairwiseCorrelation(stateA, stateB) {
        // Create cache key from state properties
        const keyA = this.createStateKey(stateA);
        const keyB = this.createStateKey(stateB);
        const cacheKey = keyA < keyB ? `${keyA}:${keyB}` : `${keyB}:${keyA}`;
        // Check cache first
        if (this._correlationCache.has(cacheKey)) {
            return this._correlationCache.get(cacheKey);
        }
        // Calculate correlation
        const correlation = stateA.calculateCorrelation(stateB);
        // Cache the result
        this._correlationCache.set(cacheKey, correlation);
        return correlation;
    }
    /**
     * Find potential entanglement pairs sorted by correlation strength
     */
    findPotentialPairs(correlationMatrix, states) {
        const pairs = [];
        for (let i = 0; i < states.length; i++) {
            for (let j = i + 1; j < states.length; j++) {
                pairs.push({
                    indexA: i,
                    indexB: j,
                    correlation: correlationMatrix[i][j]
                });
            }
        }
        // Sort by correlation strength (highest first)
        return pairs.sort((a, b) => b.correlation - a.correlation);
    }
    /**
     * Create correlation distribution histogram
     */
    createCorrelationHistogram(correlations) {
        const bins = [];
        const binCount = 10;
        const binSize = 1.0 / binCount;
        // Initialize bins
        for (let i = 0; i < binCount; i++) {
            bins.push({
                min: i * binSize,
                max: (i + 1) * binSize,
                count: 0,
                percentage: 0
            });
        }
        // Count correlations in each bin
        for (const correlation of correlations) {
            const binIndex = Math.min(Math.floor(correlation / binSize), binCount - 1);
            bins[binIndex].count++;
        }
        // Calculate percentages
        const total = correlations.length;
        for (const bin of bins) {
            bin.percentage = total > 0 ? (bin.count / total) * 100 : 0;
        }
        return bins;
    }
    /**
     * Create a unique key for a quantum state for caching
     */
    createStateKey(state) {
        // Create a hash-like key from state properties
        const amplitudeSum = state.amplitudes.reduce((sum, amp) => sum + amp.real + amp.imaginary, 0);
        const key = `${state.phase.toFixed(6)}_${amplitudeSum.toFixed(6)}_${state.amplitudes.length}`;
        return key;
    }
    /**
     * Analyze patterns in shared information buffer
     */
    analyzeSharedPatterns(sharedInfo) {
        const patterns = [];
        const patternCounts = new Map();
        // Analyze byte patterns of different lengths
        for (let patternLength = 1; patternLength <= Math.min(sharedInfo.length, 4); patternLength++) {
            for (let i = 0; i <= sharedInfo.length - patternLength; i++) {
                const pattern = sharedInfo.subarray(i, i + patternLength);
                const patternKey = pattern.toString('hex');
                patternCounts.set(patternKey, (patternCounts.get(patternKey) || 0) + 1);
            }
        }
        // Convert to pattern objects
        for (const [key, count] of patternCounts) {
            if (count > 1) { // Only include patterns that appear multiple times
                patterns.push({
                    bytes: Buffer.from(key, 'hex'),
                    frequency: count
                });
            }
        }
        return patterns.sort((a, b) => b.frequency - a.frequency);
    }
    /**
     * Calculate compression potential based on shared patterns
     */
    calculateCompressionPotential(patterns, totalBytes) {
        if (totalBytes === 0)
            return 0;
        let potentialSavings = 0;
        for (const pattern of patterns) {
            // Savings = (frequency - 1) * pattern_length * correlation_strength
            const patternLength = pattern.pattern.length;
            const savings = (pattern.frequency - 1) * patternLength * pattern.correlationStrength;
            potentialSavings += savings;
        }
        return Math.min(potentialSavings / totalBytes, 1.0); // Cap at 100%
    }
}
exports.EntanglementAnalyzer = EntanglementAnalyzer;
//# sourceMappingURL=EntanglementAnalyzer.js.map