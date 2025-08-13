"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProbabilityAnalyzer = void 0;
const QuantumMath_1 = require("../math/QuantumMath");
/**
 * Advanced probability analysis for quantum compression optimization
 * Analyzes probability distributions and quantum state probabilities for compression insights
 */
class ProbabilityAnalyzer {
    constructor(confidenceLevel = 0.95, samplingRate = 1.0, distributionBins = 256, outlierThreshold = 2.0) {
        this.validateParameters(confidenceLevel, samplingRate, distributionBins, outlierThreshold);
        this._confidenceLevel = confidenceLevel;
        this._samplingRate = samplingRate;
        this._distributionBins = distributionBins;
        this._outlierThreshold = outlierThreshold;
    }
    /**
     * Get confidence level
     */
    get confidenceLevel() {
        return this._confidenceLevel;
    }
    /**
     * Set confidence level
     */
    set confidenceLevel(value) {
        if (value <= 0 || value >= 1) {
            throw new Error('Confidence level must be between 0 and 1 (exclusive)');
        }
        this._confidenceLevel = value;
    }
    /**
     * Get sampling rate
     */
    get samplingRate() {
        return this._samplingRate;
    }
    /**
     * Set sampling rate
     */
    set samplingRate(value) {
        if (value <= 0 || value > 1) {
            throw new Error('Sampling rate must be between 0 (exclusive) and 1 (inclusive)');
        }
        this._samplingRate = value;
    }
    /**
     * Get distribution bins
     */
    get distributionBins() {
        return this._distributionBins;
    }
    /**
     * Set distribution bins
     */
    set distributionBins(value) {
        if (value < 2 || value > 1024) {
            throw new Error('Distribution bins must be between 2 and 1024');
        }
        this._distributionBins = value;
    }
    /**
     * Get outlier threshold
     */
    get outlierThreshold() {
        return this._outlierThreshold;
    }
    /**
     * Set outlier threshold
     */
    set outlierThreshold(value) {
        if (value <= 0) {
            throw new Error('Outlier threshold must be positive');
        }
        this._outlierThreshold = value;
    }
    /**
     * Analyze probability distributions in quantum states
     */
    analyzeProbabilityDistributions(states) {
        if (states.length === 0) {
            return this.createEmptyDistributionAnalysis();
        }
        const sampledStates = this.sampleStates(states);
        const distributions = sampledStates.map(state => state.getProbabilityDistribution());
        const statistics = this.calculateDistributionStatistics(distributions);
        const histogram = this.createProbabilityHistogram(distributions);
        const outliers = this.detectOutliers(distributions, statistics);
        const clusters = this.clusterDistributions(distributions);
        const trends = this.analyzeTrends(distributions);
        return {
            totalStates: states.length,
            sampledStates: sampledStates.length,
            statistics,
            histogram,
            outliers,
            clusters,
            trends,
            confidenceInterval: this.calculateConfidenceInterval(statistics)
        };
    }
    /**
     * Calculate quantum state probabilities with uncertainty
     */
    calculateQuantumProbabilities(superposition) {
        const patterns = superposition.analyzeProbabilityAmplitudes();
        const probabilities = patterns.map(pattern => pattern.probability);
        const statistics = this.calculateBasicStatistics(probabilities);
        const uncertainties = this.calculateUncertainties(patterns);
        const confidenceIntervals = this.calculateProbabilityConfidenceIntervals(probabilities);
        return {
            patterns,
            statistics,
            uncertainties,
            confidenceIntervals,
            totalProbability: probabilities.reduce((sum, p) => sum + p, 0),
            normalizedProbabilities: this.normalizeProbabilities(probabilities)
        };
    }
    /**
     * Perform statistical significance testing
     */
    performSignificanceTests(distributions1, distributions2) {
        if (distributions1.length === 0 || distributions2.length === 0) {
            throw new Error('Cannot perform significance tests on empty distributions');
        }
        const kolmogorovSmirnov = this.kolmogorovSmirnovTest(distributions1, distributions2);
        const mannWhitney = this.mannWhitneyTest(distributions1, distributions2);
        const chisquare = this.chiSquareTest(distributions1, distributions2);
        return {
            kolmogorovSmirnov,
            mannWhitney,
            chisquare,
            overallSignificance: this.calculateOverallSignificance([kolmogorovSmirnov, mannWhitney, chisquare])
        };
    }
    /**
     * Estimate compression potential from probability analysis
     */
    estimateCompressionPotential(analysis) {
        const entropyReduction = this.calculateEntropyReduction(analysis);
        const redundancyFactor = this.calculateRedundancyFactor(analysis);
        const clusteringBenefit = this.calculateClusteringBenefit(analysis.clusters.clusters);
        const theoreticalMaxCompression = 1 - (analysis.statistics.averageEntropy / Math.log2(this._distributionBins));
        const practicalCompression = theoreticalMaxCompression * 0.7; // Account for overhead
        const adjustedCompression = practicalCompression * (1 + redundancyFactor) * (1 + clusteringBenefit);
        return {
            theoreticalMaxCompression,
            practicalCompression,
            adjustedCompression: Math.min(0.95, adjustedCompression), // Cap at 95%
            entropyReduction,
            redundancyFactor,
            clusteringBenefit,
            confidence: this.calculateCompressionConfidence(analysis)
        };
    }
    /**
     * Analyze quantum coherence effects on probabilities
     */
    analyzeCoherenceEffects(superposition, timeSteps = 10) {
        const initialCoherence = superposition.coherenceTime;
        const coherenceDecay = [];
        const probabilityEvolution = [];
        let currentSuperposition = superposition;
        const timeStep = initialCoherence / timeSteps;
        for (let i = 0; i <= timeSteps; i++) {
            const time = i * timeStep;
            const coherenceLevel = Math.max(0, initialCoherence - time);
            if (i > 0) {
                currentSuperposition = currentSuperposition.applyDecoherence(timeStep);
            }
            const patterns = currentSuperposition.analyzeProbabilityAmplitudes();
            const probabilities = patterns.map(p => p.probability);
            coherenceDecay.push({
                time,
                coherenceLevel,
                entropy: currentSuperposition.calculateEntropy(),
                isCoherent: currentSuperposition.isCoherent()
            });
            probabilityEvolution.push(probabilities);
        }
        return {
            initialCoherence,
            coherenceDecay,
            probabilityEvolution,
            decoherenceRate: this.calculateDecoherenceRate(coherenceDecay),
            stabilityMetric: this.calculateStabilityMetric(probabilityEvolution)
        };
    }
    /**
     * Sample states based on sampling rate
     */
    sampleStates(states) {
        if (this._samplingRate >= 1.0) {
            return states;
        }
        const sampleSize = Math.max(1, Math.floor(states.length * this._samplingRate));
        const sampledIndices = new Set();
        while (sampledIndices.size < sampleSize) {
            const randomIndex = Math.floor(Math.random() * states.length);
            sampledIndices.add(randomIndex);
        }
        return Array.from(sampledIndices).map(index => states[index]);
    }
    /**
     * Calculate distribution statistics
     */
    calculateDistributionStatistics(distributions) {
        const allProbabilities = distributions.flat();
        const entropies = distributions.map(dist => QuantumMath_1.QuantumMath.calculateEntropy(dist));
        return {
            count: distributions.length,
            averageEntropy: entropies.reduce((sum, e) => sum + e, 0) / entropies.length,
            entropyVariance: this.calculateVariance(entropies),
            entropyStdDev: Math.sqrt(this.calculateVariance(entropies)),
            minEntropy: Math.min(...entropies),
            maxEntropy: Math.max(...entropies),
            averageProbability: allProbabilities.reduce((sum, p) => sum + p, 0) / allProbabilities.length,
            probabilityVariance: this.calculateVariance(allProbabilities)
        };
    }
    /**
     * Create probability histogram
     */
    createProbabilityHistogram(distributions) {
        const allProbabilities = distributions.flat();
        const bins = new Array(this._distributionBins).fill(0);
        const binSize = 1.0 / this._distributionBins;
        for (const prob of allProbabilities) {
            const binIndex = Math.min(this._distributionBins - 1, Math.floor(prob / binSize));
            bins[binIndex]++;
        }
        return {
            bins,
            binSize,
            totalSamples: allProbabilities.length,
            peakBin: bins.indexOf(Math.max(...bins)),
            peakValue: Math.max(...bins)
        };
    }
    /**
     * Detect outliers in distributions
     */
    detectOutliers(distributions, statistics) {
        const entropies = distributions.map(dist => QuantumMath_1.QuantumMath.calculateEntropy(dist));
        const outlierIndices = [];
        for (let i = 0; i < entropies.length; i++) {
            const zScore = Math.abs(entropies[i] - statistics.averageEntropy) / statistics.entropyStdDev;
            if (zScore > this._outlierThreshold) {
                outlierIndices.push(i);
            }
        }
        return {
            outlierIndices,
            outlierCount: outlierIndices.length,
            outlierPercentage: (outlierIndices.length / distributions.length) * 100,
            threshold: this._outlierThreshold
        };
    }
    /**
     * Cluster probability distributions
     */
    clusterDistributions(distributions) {
        if (distributions.length < 2) {
            return {
                clusters: [],
                clusterCount: 0,
                silhouetteScore: 0,
                intraClusterVariance: 0,
                interClusterDistance: 0
            };
        }
        // Simple k-means clustering (k=3 for simplicity)
        const k = Math.min(3, distributions.length);
        const clusters = this.performKMeansClustering(distributions, k);
        return {
            clusters,
            clusterCount: clusters.length,
            silhouetteScore: this.calculateSilhouetteScore(distributions, clusters),
            intraClusterVariance: this.calculateIntraClusterVariance(distributions, clusters),
            interClusterDistance: this.calculateInterClusterDistance(distributions, clusters)
        };
    }
    /**
     * Analyze trends in probability distributions
     */
    analyzeTrends(distributions) {
        if (distributions.length < 3) {
            return {
                trend: 'insufficient_data',
                slope: 0,
                correlation: 0,
                seasonality: 0,
                volatility: 0
            };
        }
        const entropies = distributions.map(dist => QuantumMath_1.QuantumMath.calculateEntropy(dist));
        const indices = Array.from({ length: entropies.length }, (_, i) => i);
        const slope = this.calculateLinearRegression(indices, entropies).slope;
        const correlation = this.calculateCorrelation(indices, entropies);
        const volatility = this.calculateVolatility(entropies);
        let trend;
        if (Math.abs(slope) < 0.01) {
            trend = 'stable';
        }
        else if (slope > 0) {
            trend = 'increasing';
        }
        else {
            trend = 'decreasing';
        }
        return {
            trend,
            slope,
            correlation,
            seasonality: 0, // Simplified - would need more sophisticated analysis
            volatility
        };
    }
    /**
     * Calculate confidence interval
     */
    calculateConfidenceInterval(statistics) {
        const zScore = this.getZScore(this._confidenceLevel);
        const marginOfError = zScore * (statistics.entropyStdDev / Math.sqrt(statistics.count));
        return {
            level: this._confidenceLevel,
            lowerBound: statistics.averageEntropy - marginOfError,
            upperBound: statistics.averageEntropy + marginOfError,
            marginOfError
        };
    }
    /**
     * Calculate basic statistics for an array of numbers
     */
    calculateBasicStatistics(values) {
        if (values.length === 0) {
            return {
                count: 0,
                mean: 0,
                variance: 0,
                stdDev: 0,
                min: 0,
                max: 0,
                median: 0
            };
        }
        const sorted = [...values].sort((a, b) => a - b);
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = this.calculateVariance(values);
        return {
            count: values.length,
            mean,
            variance,
            stdDev: Math.sqrt(variance),
            min: sorted[0],
            max: sorted[sorted.length - 1],
            median: this.calculateMedian(sorted)
        };
    }
    /**
     * Calculate uncertainties for pattern probabilities
     */
    calculateUncertainties(patterns) {
        return patterns.map(pattern => ({
            patternIndex: pattern.index,
            probability: pattern.probability,
            standardError: Math.sqrt(pattern.probability * (1 - pattern.probability) / 100), // Simplified
            confidenceInterval: this.calculateSingleProbabilityConfidenceInterval(pattern.probability)
        }));
    }
    /**
     * Calculate confidence intervals for probabilities
     */
    calculateProbabilityConfidenceIntervals(probabilities) {
        return probabilities.map(prob => this.calculateSingleProbabilityConfidenceInterval(prob));
    }
    /**
     * Calculate confidence interval for a single probability
     */
    calculateSingleProbabilityConfidenceInterval(probability) {
        const n = 100; // Assumed sample size
        const zScore = this.getZScore(this._confidenceLevel);
        const standardError = Math.sqrt(probability * (1 - probability) / n);
        const marginOfError = zScore * standardError;
        return {
            level: this._confidenceLevel,
            lowerBound: Math.max(0, probability - marginOfError),
            upperBound: Math.min(1, probability + marginOfError),
            marginOfError
        };
    }
    /**
     * Normalize probabilities to sum to 1
     */
    normalizeProbabilities(probabilities) {
        const sum = probabilities.reduce((s, p) => s + p, 0);
        return sum > 0 ? probabilities.map(p => p / sum) : probabilities;
    }
    /**
     * Perform Kolmogorov-Smirnov test
     */
    kolmogorovSmirnovTest(dist1, dist2) {
        // Simplified implementation
        const flat1 = dist1.flat().sort((a, b) => a - b);
        const flat2 = dist2.flat().sort((a, b) => a - b);
        let maxDiff = 0;
        let i = 0, j = 0;
        while (i < flat1.length && j < flat2.length) {
            const cdf1 = (i + 1) / flat1.length;
            const cdf2 = (j + 1) / flat2.length;
            maxDiff = Math.max(maxDiff, Math.abs(cdf1 - cdf2));
            if (flat1[i] <= flat2[j])
                i++;
            else
                j++;
        }
        const criticalValue = 1.36 * Math.sqrt((flat1.length + flat2.length) / (flat1.length * flat2.length));
        return {
            testName: 'Kolmogorov-Smirnov',
            statistic: maxDiff,
            pValue: maxDiff > criticalValue ? 0.01 : 0.1, // Simplified
            isSignificant: maxDiff > criticalValue,
            criticalValue
        };
    }
    /**
     * Perform Mann-Whitney U test
     */
    mannWhitneyTest(dist1, dist2) {
        // Simplified implementation
        const flat1 = dist1.flat();
        const flat2 = dist2.flat();
        const combined = [...flat1.map(v => ({ value: v, group: 1 })), ...flat2.map(v => ({ value: v, group: 2 }))];
        combined.sort((a, b) => a.value - b.value);
        let u1 = 0;
        for (let i = 0; i < combined.length; i++) {
            if (combined[i].group === 1) {
                u1 += i + 1;
            }
        }
        u1 -= (flat1.length * (flat1.length + 1)) / 2;
        const u2 = flat1.length * flat2.length - u1;
        const u = Math.min(u1, u2);
        const meanU = (flat1.length * flat2.length) / 2;
        const stdU = Math.sqrt((flat1.length * flat2.length * (flat1.length + flat2.length + 1)) / 12);
        const zScore = (u - meanU) / stdU;
        return {
            testName: 'Mann-Whitney U',
            statistic: u,
            pValue: Math.abs(zScore) > 1.96 ? 0.01 : 0.1, // Simplified
            isSignificant: Math.abs(zScore) > 1.96,
            criticalValue: 1.96
        };
    }
    /**
     * Perform Chi-square test
     */
    chiSquareTest(dist1, dist2) {
        // Simplified implementation
        const bins = 10;
        const hist1 = this.createSimpleHistogram(dist1.flat(), bins);
        const hist2 = this.createSimpleHistogram(dist2.flat(), bins);
        let chiSquare = 0;
        for (let i = 0; i < bins; i++) {
            const expected = (hist1[i] + hist2[i]) / 2;
            if (expected > 0) {
                chiSquare += Math.pow(hist1[i] - expected, 2) / expected;
                chiSquare += Math.pow(hist2[i] - expected, 2) / expected;
            }
        }
        const criticalValue = 16.92; // Chi-square critical value for df=9, α=0.05
        return {
            testName: 'Chi-square',
            statistic: chiSquare,
            pValue: chiSquare > criticalValue ? 0.01 : 0.1, // Simplified
            isSignificant: chiSquare > criticalValue,
            criticalValue
        };
    }
    /**
     * Calculate overall significance from multiple tests
     */
    calculateOverallSignificance(tests) {
        const significantTests = tests.filter(test => test.isSignificant).length;
        return significantTests / tests.length;
    }
    /**
     * Helper methods for statistical calculations
     */
    calculateVariance(values) {
        if (values.length === 0)
            return 0;
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    }
    calculateMedian(sortedValues) {
        const mid = Math.floor(sortedValues.length / 2);
        return sortedValues.length % 2 === 0
            ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
            : sortedValues[mid];
    }
    getZScore(confidenceLevel) {
        // Simplified z-score lookup
        if (confidenceLevel >= 0.99)
            return 2.576;
        if (confidenceLevel >= 0.95)
            return 1.96;
        if (confidenceLevel >= 0.90)
            return 1.645;
        return 1.96; // Default to 95%
    }
    calculateLinearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumXX = x.reduce((sum, val) => sum + val * val, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
    }
    calculateCorrelation(x, y) {
        const n = x.length;
        const meanX = x.reduce((sum, val) => sum + val, 0) / n;
        const meanY = y.reduce((sum, val) => sum + val, 0) / n;
        let numerator = 0;
        let denomX = 0;
        let denomY = 0;
        for (let i = 0; i < n; i++) {
            const diffX = x[i] - meanX;
            const diffY = y[i] - meanY;
            numerator += diffX * diffY;
            denomX += diffX * diffX;
            denomY += diffY * diffY;
        }
        return numerator / Math.sqrt(denomX * denomY);
    }
    calculateVolatility(values) {
        if (values.length < 2)
            return 0;
        const returns = [];
        for (let i = 1; i < values.length; i++) {
            if (values[i - 1] !== 0) {
                returns.push((values[i] - values[i - 1]) / values[i - 1]);
            }
        }
        return Math.sqrt(this.calculateVariance(returns));
    }
    performKMeansClustering(distributions, k) {
        // Simplified k-means implementation
        const clusters = [];
        // Initialize clusters with random centroids
        for (let i = 0; i < k; i++) {
            const randomIndex = Math.floor(Math.random() * distributions.length);
            clusters.push({
                id: i,
                centroid: [...distributions[randomIndex]],
                members: [],
                size: 0
            });
        }
        // Assign distributions to clusters (simplified)
        for (let i = 0; i < distributions.length; i++) {
            let bestCluster = 0;
            let bestDistance = Infinity;
            for (let j = 0; j < clusters.length; j++) {
                const distance = this.calculateEuclideanDistance(distributions[i], clusters[j].centroid);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestCluster = j;
                }
            }
            clusters[bestCluster].members.push(i);
            clusters[bestCluster].size++;
        }
        return clusters;
    }
    calculateEuclideanDistance(dist1, dist2) {
        const minLength = Math.min(dist1.length, dist2.length);
        let sum = 0;
        for (let i = 0; i < minLength; i++) {
            sum += Math.pow(dist1[i] - dist2[i], 2);
        }
        return Math.sqrt(sum);
    }
    calculateSilhouetteScore(distributions, clusters) {
        // Simplified silhouette score calculation
        return 0.5; // Placeholder
    }
    calculateIntraClusterVariance(distributions, clusters) {
        let totalVariance = 0;
        for (const cluster of clusters) {
            if (cluster.members.length > 1) {
                const clusterDistributions = cluster.members.map(i => distributions[i]);
                const distances = clusterDistributions.map(dist => this.calculateEuclideanDistance(dist, cluster.centroid));
                totalVariance += this.calculateVariance(distances);
            }
        }
        return totalVariance / clusters.length;
    }
    calculateInterClusterDistance(distributions, clusters) {
        if (clusters.length < 2)
            return 0;
        let totalDistance = 0;
        let pairCount = 0;
        for (let i = 0; i < clusters.length - 1; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                totalDistance += this.calculateEuclideanDistance(clusters[i].centroid, clusters[j].centroid);
                pairCount++;
            }
        }
        return totalDistance / pairCount;
    }
    createSimpleHistogram(values, bins) {
        const histogram = new Array(bins).fill(0);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binSize = (max - min) / bins;
        for (const value of values) {
            const binIndex = Math.min(bins - 1, Math.floor((value - min) / binSize));
            histogram[binIndex]++;
        }
        return histogram;
    }
    calculateEntropyReduction(analysis) {
        const maxEntropy = Math.log2(this._distributionBins);
        return (maxEntropy - analysis.statistics.averageEntropy) / maxEntropy;
    }
    calculateRedundancyFactor(analysis) {
        return analysis.outliers.outlierPercentage / 100;
    }
    calculateClusteringBenefit(clusters) {
        if (clusters.length === 0)
            return 0;
        const averageClusterSize = clusters.reduce((sum, cluster) => sum + cluster.size, 0) / clusters.length;
        return Math.min(0.3, averageClusterSize / 100); // Cap at 30% benefit
    }
    calculateCompressionConfidence(analysis) {
        const entropyConsistency = 1 - (analysis.statistics.entropyStdDev / analysis.statistics.averageEntropy);
        const outlierPenalty = 1 - (analysis.outliers.outlierPercentage / 100);
        return Math.max(0.1, Math.min(0.95, (entropyConsistency + outlierPenalty) / 2));
    }
    calculateDecoherenceRate(coherenceDecay) {
        if (coherenceDecay.length < 2)
            return 0;
        const initialCoherence = coherenceDecay[0].coherenceLevel;
        const finalCoherence = coherenceDecay[coherenceDecay.length - 1].coherenceLevel;
        const totalTime = coherenceDecay[coherenceDecay.length - 1].time - coherenceDecay[0].time;
        return totalTime > 0 ? (initialCoherence - finalCoherence) / totalTime : 0;
    }
    calculateStabilityMetric(probabilityEvolution) {
        if (probabilityEvolution.length < 2)
            return 1;
        let totalVariation = 0;
        for (let i = 1; i < probabilityEvolution.length; i++) {
            const prev = probabilityEvolution[i - 1];
            const curr = probabilityEvolution[i];
            const minLength = Math.min(prev.length, curr.length);
            let variation = 0;
            for (let j = 0; j < minLength; j++) {
                variation += Math.abs(curr[j] - prev[j]);
            }
            totalVariation += variation / minLength;
        }
        const averageVariation = totalVariation / (probabilityEvolution.length - 1);
        return Math.max(0, 1 - averageVariation);
    }
    createEmptyDistributionAnalysis() {
        return {
            totalStates: 0,
            sampledStates: 0,
            statistics: {
                count: 0,
                averageEntropy: 0,
                entropyVariance: 0,
                entropyStdDev: 0,
                minEntropy: 0,
                maxEntropy: 0,
                averageProbability: 0,
                probabilityVariance: 0
            },
            histogram: {
                bins: [],
                binSize: 0,
                totalSamples: 0,
                peakBin: 0,
                peakValue: 0
            },
            outliers: {
                outlierIndices: [],
                outlierCount: 0,
                outlierPercentage: 0,
                threshold: this._outlierThreshold
            },
            clusters: {
                clusters: [],
                clusterCount: 0,
                silhouetteScore: 0,
                intraClusterVariance: 0,
                interClusterDistance: 0
            },
            trends: {
                trend: 'insufficient_data',
                slope: 0,
                correlation: 0,
                seasonality: 0,
                volatility: 0
            },
            confidenceInterval: {
                level: this._confidenceLevel,
                lowerBound: 0,
                upperBound: 0,
                marginOfError: 0
            }
        };
    }
    /**
     * Validate constructor parameters
     */
    validateParameters(confidenceLevel, samplingRate, distributionBins, outlierThreshold) {
        if (confidenceLevel <= 0 || confidenceLevel >= 1) {
            throw new Error('Confidence level must be between 0 and 1 (exclusive)');
        }
        if (samplingRate <= 0 || samplingRate > 1) {
            throw new Error('Sampling rate must be between 0 (exclusive) and 1 (inclusive)');
        }
        if (distributionBins < 2 || distributionBins > 1024) {
            throw new Error('Distribution bins must be between 2 and 1024');
        }
        if (outlierThreshold <= 0) {
            throw new Error('Outlier threshold must be positive');
        }
    }
}
exports.ProbabilityAnalyzer = ProbabilityAnalyzer;
//# sourceMappingURL=ProbabilityAnalyzer.js.map