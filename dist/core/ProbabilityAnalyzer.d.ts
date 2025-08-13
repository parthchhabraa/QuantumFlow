import { QuantumStateVector } from '../models/QuantumStateVector';
import { SuperpositionState, PatternProbability } from '../models/SuperpositionState';
/**
 * Advanced probability analysis for quantum compression optimization
 * Analyzes probability distributions and quantum state probabilities for compression insights
 */
export declare class ProbabilityAnalyzer {
    private _confidenceLevel;
    private _samplingRate;
    private _distributionBins;
    private _outlierThreshold;
    constructor(confidenceLevel?: number, samplingRate?: number, distributionBins?: number, outlierThreshold?: number);
    /**
     * Get confidence level
     */
    get confidenceLevel(): number;
    /**
     * Set confidence level
     */
    set confidenceLevel(value: number);
    /**
     * Get sampling rate
     */
    get samplingRate(): number;
    /**
     * Set sampling rate
     */
    set samplingRate(value: number);
    /**
     * Get distribution bins
     */
    get distributionBins(): number;
    /**
     * Set distribution bins
     */
    set distributionBins(value: number);
    /**
     * Get outlier threshold
     */
    get outlierThreshold(): number;
    /**
     * Set outlier threshold
     */
    set outlierThreshold(value: number);
    /**
     * Analyze probability distributions in quantum states
     */
    analyzeProbabilityDistributions(states: QuantumStateVector[]): DistributionAnalysis;
    /**
     * Calculate quantum state probabilities with uncertainty
     */
    calculateQuantumProbabilities(superposition: SuperpositionState): ProbabilityCalculation;
    /**
     * Perform statistical significance testing
     */
    performSignificanceTests(distributions1: number[][], distributions2: number[][]): SignificanceTestResults;
    /**
     * Estimate compression potential from probability analysis
     */
    estimateCompressionPotential(analysis: DistributionAnalysis): CompressionPotentialEstimate;
    /**
     * Analyze quantum coherence effects on probabilities
     */
    analyzeCoherenceEffects(superposition: SuperpositionState, timeSteps?: number): CoherenceAnalysis;
    /**
     * Sample states based on sampling rate
     */
    private sampleStates;
    /**
     * Calculate distribution statistics
     */
    private calculateDistributionStatistics;
    /**
     * Create probability histogram
     */
    private createProbabilityHistogram;
    /**
     * Detect outliers in distributions
     */
    private detectOutliers;
    /**
     * Cluster probability distributions
     */
    private clusterDistributions;
    /**
     * Analyze trends in probability distributions
     */
    private analyzeTrends;
    /**
     * Calculate confidence interval
     */
    private calculateConfidenceInterval;
    /**
     * Calculate basic statistics for an array of numbers
     */
    private calculateBasicStatistics;
    /**
     * Calculate uncertainties for pattern probabilities
     */
    private calculateUncertainties;
    /**
     * Calculate confidence intervals for probabilities
     */
    private calculateProbabilityConfidenceIntervals;
    /**
     * Calculate confidence interval for a single probability
     */
    private calculateSingleProbabilityConfidenceInterval;
    /**
     * Normalize probabilities to sum to 1
     */
    private normalizeProbabilities;
    /**
     * Perform Kolmogorov-Smirnov test
     */
    private kolmogorovSmirnovTest;
    /**
     * Perform Mann-Whitney U test
     */
    private mannWhitneyTest;
    /**
     * Perform Chi-square test
     */
    private chiSquareTest;
    /**
     * Calculate overall significance from multiple tests
     */
    private calculateOverallSignificance;
    /**
     * Helper methods for statistical calculations
     */
    private calculateVariance;
    private calculateMedian;
    private getZScore;
    private calculateLinearRegression;
    private calculateCorrelation;
    private calculateVolatility;
    private performKMeansClustering;
    private calculateEuclideanDistance;
    private calculateSilhouetteScore;
    private calculateIntraClusterVariance;
    private calculateInterClusterDistance;
    private createSimpleHistogram;
    private calculateEntropyReduction;
    private calculateRedundancyFactor;
    private calculateClusteringBenefit;
    private calculateCompressionConfidence;
    private calculateDecoherenceRate;
    private calculateStabilityMetric;
    private createEmptyDistributionAnalysis;
    /**
     * Validate constructor parameters
     */
    private validateParameters;
}
export interface DistributionAnalysis {
    totalStates: number;
    sampledStates: number;
    statistics: DistributionStatistics;
    histogram: ProbabilityHistogram;
    outliers: OutlierAnalysis;
    clusters: ClusterAnalysis;
    trends: TrendAnalysis;
    confidenceInterval: ConfidenceInterval;
}
export interface DistributionStatistics {
    count: number;
    averageEntropy: number;
    entropyVariance: number;
    entropyStdDev: number;
    minEntropy: number;
    maxEntropy: number;
    averageProbability: number;
    probabilityVariance: number;
}
export interface ProbabilityHistogram {
    bins: number[];
    binSize: number;
    totalSamples: number;
    peakBin: number;
    peakValue: number;
}
export interface OutlierAnalysis {
    outlierIndices: number[];
    outlierCount: number;
    outlierPercentage: number;
    threshold: number;
}
export interface ClusterAnalysis {
    clusters: DistributionCluster[];
    clusterCount: number;
    silhouetteScore: number;
    intraClusterVariance: number;
    interClusterDistance: number;
}
export interface DistributionCluster {
    id: number;
    centroid: number[];
    members: number[];
    size: number;
}
export interface TrendAnalysis {
    trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
    slope: number;
    correlation: number;
    seasonality: number;
    volatility: number;
}
export interface ConfidenceInterval {
    level: number;
    lowerBound: number;
    upperBound: number;
    marginOfError: number;
}
export interface ProbabilityCalculation {
    patterns: PatternProbability[];
    statistics: BasicStatistics;
    uncertainties: ProbabilityUncertainty[];
    confidenceIntervals: ConfidenceInterval[];
    totalProbability: number;
    normalizedProbabilities: number[];
}
export interface BasicStatistics {
    count: number;
    mean: number;
    variance: number;
    stdDev: number;
    min: number;
    max: number;
    median: number;
}
export interface ProbabilityUncertainty {
    patternIndex: number;
    probability: number;
    standardError: number;
    confidenceInterval: ConfidenceInterval;
}
export interface SignificanceTestResults {
    kolmogorovSmirnov: StatisticalTest;
    mannWhitney: StatisticalTest;
    chisquare: StatisticalTest;
    overallSignificance: number;
}
export interface StatisticalTest {
    testName: string;
    statistic: number;
    pValue: number;
    isSignificant: boolean;
    criticalValue: number;
}
export interface CompressionPotentialEstimate {
    theoreticalMaxCompression: number;
    practicalCompression: number;
    adjustedCompression: number;
    entropyReduction: number;
    redundancyFactor: number;
    clusteringBenefit: number;
    confidence: number;
}
export interface CoherenceAnalysis {
    initialCoherence: number;
    coherenceDecay: CoherencePoint[];
    probabilityEvolution: number[][];
    decoherenceRate: number;
    stabilityMetric: number;
}
export interface CoherencePoint {
    time: number;
    coherenceLevel: number;
    entropy: number;
    isCoherent: boolean;
}
//# sourceMappingURL=ProbabilityAnalyzer.d.ts.map