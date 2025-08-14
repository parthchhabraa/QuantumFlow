import { ProbabilityAnalyzer, DistributionAnalysis, ProbabilityCalculation, SignificanceTestResults } from '../ProbabilityAnalyzer';
import { QuantumStateVector } from '../../models/QuantumStateVector';
import { SuperpositionState } from '../../models/SuperpositionState';
import { Complex } from '../../math/Complex';

describe('ProbabilityAnalyzer', () => {
  let sampleStates: QuantumStateVector[];

  beforeEach(() => {
    // Create sample quantum states for testing
    sampleStates = [
      new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]),
      new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8)]),
      new QuantumStateVector([new Complex(0.707, 0), new Complex(0, 0.707)]),
      new QuantumStateVector([new Complex(0.5, 0.5), new Complex(0.5, -0.5)]),
      new QuantumStateVector([new Complex(0.9, 0), new Complex(0, 0.436)])
    ];
  });

  describe('constructor and basic properties', () => {
    test('should create analyzer with default parameters', () => {
      const analyzer = new ProbabilityAnalyzer();
      
      expect(analyzer.confidenceLevel).toBe(0.95);
      expect(analyzer.samplingRate).toBe(1.0);
      expect(analyzer.distributionBins).toBe(256);
      expect(analyzer.outlierThreshold).toBe(2.0);
    });

    test('should create analyzer with custom parameters', () => {
      const analyzer = new ProbabilityAnalyzer(0.99, 0.8, 128, 2.5);
      
      expect(analyzer.confidenceLevel).toBe(0.99);
      expect(analyzer.samplingRate).toBe(0.8);
      expect(analyzer.distributionBins).toBe(128);
      expect(analyzer.outlierThreshold).toBe(2.5);
    });

    test('should validate parameter bounds', () => {
      expect(() => new ProbabilityAnalyzer(0)).toThrow(
        'Confidence level must be between 0 and 1 (exclusive)'
      );
      expect(() => new ProbabilityAnalyzer(1)).toThrow(
        'Confidence level must be between 0 and 1 (exclusive)'
      );
      expect(() => new ProbabilityAnalyzer(0.95, 0)).toThrow(
        'Sampling rate must be between 0 (exclusive) and 1 (inclusive)'
      );
      expect(() => new ProbabilityAnalyzer(0.95, 1.1)).toThrow(
        'Sampling rate must be between 0 (exclusive) and 1 (inclusive)'
      );
      expect(() => new ProbabilityAnalyzer(0.95, 1.0, 1)).toThrow(
        'Distribution bins must be between 2 and 1024'
      );
      expect(() => new ProbabilityAnalyzer(0.95, 1.0, 256, 0)).toThrow(
        'Outlier threshold must be positive'
      );
    });
  });

  describe('property setters', () => {
    test('should validate and set confidence level', () => {
      const analyzer = new ProbabilityAnalyzer();
      
      analyzer.confidenceLevel = 0.99;
      expect(analyzer.confidenceLevel).toBe(0.99);
      
      expect(() => analyzer.confidenceLevel = 0).toThrow(
        'Confidence level must be between 0 and 1 (exclusive)'
      );
      expect(() => analyzer.confidenceLevel = 1).toThrow(
        'Confidence level must be between 0 and 1 (exclusive)'
      );
    });

    test('should validate and set sampling rate', () => {
      const analyzer = new ProbabilityAnalyzer();
      
      analyzer.samplingRate = 0.5;
      expect(analyzer.samplingRate).toBe(0.5);
      
      expect(() => analyzer.samplingRate = 0).toThrow(
        'Sampling rate must be between 0 (exclusive) and 1 (inclusive)'
      );
      expect(() => analyzer.samplingRate = 1.1).toThrow(
        'Sampling rate must be between 0 (exclusive) and 1 (inclusive)'
      );
    });

    test('should validate and set distribution bins', () => {
      const analyzer = new ProbabilityAnalyzer();
      
      analyzer.distributionBins = 128;
      expect(analyzer.distributionBins).toBe(128);
      
      expect(() => analyzer.distributionBins = 1).toThrow(
        'Distribution bins must be between 2 and 1024'
      );
      expect(() => analyzer.distributionBins = 2000).toThrow(
        'Distribution bins must be between 2 and 1024'
      );
    });

    test('should validate and set outlier threshold', () => {
      const analyzer = new ProbabilityAnalyzer();
      
      analyzer.outlierThreshold = 3.0;
      expect(analyzer.outlierThreshold).toBe(3.0);
      
      expect(() => analyzer.outlierThreshold = 0).toThrow(
        'Outlier threshold must be positive'
      );
      expect(() => analyzer.outlierThreshold = -1).toThrow(
        'Outlier threshold must be positive'
      );
    });
  });

  describe('probability distribution analysis', () => {
    test('should analyze probability distributions', () => {
      const analyzer = new ProbabilityAnalyzer();
      
      const analysis = analyzer.analyzeProbabilityDistributions(sampleStates);
      
      expect(analysis.totalStates).toBe(sampleStates.length);
      expect(analysis.sampledStates).toBe(sampleStates.length);
      expect(analysis.statistics.count).toBe(sampleStates.length);
      expect(analysis.statistics.averageEntropy).toBeGreaterThanOrEqual(0);
      expect(analysis.statistics.entropyVariance).toBeGreaterThanOrEqual(0);
      expect(analysis.histogram.bins).toBeInstanceOf(Array);
      expect(analysis.histogram.totalSamples).toBeGreaterThan(0);
      expect(analysis.outliers.outlierCount).toBeGreaterThanOrEqual(0);
      expect(analysis.clusters.clusterCount).toBeGreaterThanOrEqual(0);
      expect(analysis.confidenceInterval.level).toBe(0.95);
    });

    test('should handle empty states array', () => {
      const analyzer = new ProbabilityAnalyzer();
      
      const analysis = analyzer.analyzeProbabilityDistributions([]);
      
      expect(analysis.totalStates).toBe(0);
      expect(analysis.sampledStates).toBe(0);
      expect(analysis.statistics.count).toBe(0);
      expect(analysis.statistics.averageEntropy).toBe(0);
      expect(analysis.histogram.bins).toEqual([]);
      expect(analysis.outliers.outlierCount).toBe(0);
      expect(analysis.clusters.clusterCount).toBe(0);
    });

    test('should respect sampling rate', () => {
      const analyzer = new ProbabilityAnalyzer(0.95, 0.6); // 60% sampling
      
      const analysis = analyzer.analyzeProbabilityDistributions(sampleStates);
      
      expect(analysis.totalStates).toBe(sampleStates.length);
      expect(analysis.sampledStates).toBeLessThanOrEqual(sampleStates.length);
      expect(analysis.sampledStates).toBeGreaterThan(0);
    });

    test('should detect outliers correctly', () => {
      const analyzer = new ProbabilityAnalyzer(0.95, 1.0, 256, 1.0); // Low outlier threshold
      
      const analysis = analyzer.analyzeProbabilityDistributions(sampleStates);
      
      expect(analysis.outliers.outlierIndices).toBeInstanceOf(Array);
      expect(analysis.outliers.outlierPercentage).toBeGreaterThanOrEqual(0);
      expect(analysis.outliers.outlierPercentage).toBeLessThanOrEqual(100);
      expect(analysis.outliers.threshold).toBe(1.0);
    });

    test('should create meaningful histogram', () => {
      const analyzer = new ProbabilityAnalyzer();
      
      const analysis = analyzer.analyzeProbabilityDistributions(sampleStates);
      
      expect(analysis.histogram.bins).toHaveLength(256);
      expect(analysis.histogram.binSize).toBeCloseTo(1/256, 10);
      expect(analysis.histogram.peakBin).toBeGreaterThanOrEqual(0);
      expect(analysis.histogram.peakBin).toBeLessThan(256);
      expect(analysis.histogram.peakValue).toBeGreaterThanOrEqual(0);
    });
  });

  describe('quantum probability calculations', () => {
    test('should calculate quantum probabilities with uncertainty', () => {
      const analyzer = new ProbabilityAnalyzer();
      const superposition = SuperpositionState.fromQuantumStates(sampleStates);
      
      const calculation = analyzer.calculateQuantumProbabilities(superposition);
      
      expect(calculation.patterns).toBeInstanceOf(Array);
      expect(calculation.statistics.count).toBe(calculation.patterns.length);
      expect(calculation.uncertainties).toHaveLength(calculation.patterns.length);
      expect(calculation.confidenceIntervals).toHaveLength(calculation.patterns.length);
      expect(calculation.totalProbability).toBeGreaterThan(0);
      expect(calculation.normalizedProbabilities).toBeInstanceOf(Array);
      
      // Check that normalized probabilities sum to 1
      const sum = calculation.normalizedProbabilities.reduce((s, p) => s + p, 0);
      expect(sum).toBeCloseTo(1, 10);
    });

    test('should calculate uncertainties for each pattern', () => {
      const analyzer = new ProbabilityAnalyzer();
      const superposition = SuperpositionState.fromQuantumStates(sampleStates);
      
      const calculation = analyzer.calculateQuantumProbabilities(superposition);
      
      calculation.uncertainties.forEach(uncertainty => {
        expect(uncertainty.patternIndex).toBeGreaterThanOrEqual(0);
        expect(uncertainty.probability).toBeGreaterThanOrEqual(0);
        expect(uncertainty.probability).toBeLessThanOrEqual(1);
        expect(uncertainty.standardError).toBeGreaterThanOrEqual(0);
        expect(uncertainty.confidenceInterval.level).toBe(0.95);
        expect(uncertainty.confidenceInterval.lowerBound).toBeLessThanOrEqual(uncertainty.probability);
        expect(uncertainty.confidenceInterval.upperBound).toBeGreaterThanOrEqual(uncertainty.probability);
      });
    });
  });

  describe('statistical significance testing', () => {
    test('should perform significance tests between distributions', () => {
      const analyzer = new ProbabilityAnalyzer();
      const dist1 = sampleStates.slice(0, 3).map(state => state.getProbabilityDistribution());
      const dist2 = sampleStates.slice(2, 5).map(state => state.getProbabilityDistribution());
      
      const results = analyzer.performSignificanceTests(dist1, dist2);
      
      expect(results.kolmogorovSmirnov.testName).toBe('Kolmogorov-Smirnov');
      expect(results.kolmogorovSmirnov.statistic).toBeGreaterThanOrEqual(0);
      expect(results.kolmogorovSmirnov.pValue).toBeGreaterThan(0);
      expect(results.kolmogorovSmirnov.pValue).toBeLessThanOrEqual(1);
      
      expect(results.mannWhitney.testName).toBe('Mann-Whitney U');
      expect(results.mannWhitney.statistic).toBeGreaterThanOrEqual(0);
      
      expect(results.chisquare.testName).toBe('Chi-square');
      expect(results.chisquare.statistic).toBeGreaterThanOrEqual(0);
      
      expect(results.overallSignificance).toBeGreaterThanOrEqual(0);
      expect(results.overallSignificance).toBeLessThanOrEqual(1);
    });

    test('should throw error for empty distributions', () => {
      const analyzer = new ProbabilityAnalyzer();
      const dist1: number[][] = [];
      const dist2 = sampleStates.map(state => state.getProbabilityDistribution());
      
      expect(() => analyzer.performSignificanceTests(dist1, dist2)).toThrow(
        'Cannot perform significance tests on empty distributions'
      );
    });
  });

  describe('compression potential estimation', () => {
    test('should estimate compression potential from analysis', () => {
      const analyzer = new ProbabilityAnalyzer();
      const analysis = analyzer.analyzeProbabilityDistributions(sampleStates);
      
      const estimate = analyzer.estimateCompressionPotential(analysis);
      
      expect(estimate.theoreticalMaxCompression).toBeGreaterThanOrEqual(0);
      expect(estimate.theoreticalMaxCompression).toBeLessThanOrEqual(1);
      expect(estimate.practicalCompression).toBeGreaterThanOrEqual(0);
      expect(estimate.practicalCompression).toBeLessThanOrEqual(estimate.theoreticalMaxCompression);
      expect(estimate.adjustedCompression).toBeGreaterThanOrEqual(0);
      expect(estimate.adjustedCompression).toBeLessThanOrEqual(0.95);
      expect(estimate.entropyReduction).toBeGreaterThanOrEqual(0);
      expect(estimate.entropyReduction).toBeLessThanOrEqual(1);
      expect(estimate.redundancyFactor).toBeGreaterThanOrEqual(0);
      expect(estimate.clusteringBenefit).toBeGreaterThanOrEqual(0);
      expect(estimate.confidence).toBeGreaterThan(0);
      expect(estimate.confidence).toBeLessThanOrEqual(1);
    });

    test('should provide reasonable compression estimates', () => {
      const analyzer = new ProbabilityAnalyzer();
      const analysis = analyzer.analyzeProbabilityDistributions(sampleStates);
      
      const estimate = analyzer.estimateCompressionPotential(analysis);
      
      // Practical compression should be less than theoretical
      expect(estimate.practicalCompression).toBeLessThanOrEqual(estimate.theoreticalMaxCompression);
      
      // Confidence should be reasonable
      expect(estimate.confidence).toBeGreaterThan(0.1);
    });
  });

  describe('coherence effects analysis', () => {
    test('should analyze coherence effects on probabilities', () => {
      const analyzer = new ProbabilityAnalyzer();
      const superposition = SuperpositionState.fromQuantumStates(sampleStates);
      
      const coherenceAnalysis = analyzer.analyzeCoherenceEffects(superposition, 5);
      
      expect(coherenceAnalysis.initialCoherence).toBe(superposition.coherenceTime);
      expect(coherenceAnalysis.coherenceDecay).toHaveLength(6); // 0 to 5 inclusive
      expect(coherenceAnalysis.probabilityEvolution).toHaveLength(6);
      expect(coherenceAnalysis.decoherenceRate).toBeGreaterThanOrEqual(0);
      expect(coherenceAnalysis.stabilityMetric).toBeGreaterThanOrEqual(0);
      expect(coherenceAnalysis.stabilityMetric).toBeLessThanOrEqual(1);
      
      // Check coherence decay progression
      for (let i = 1; i < coherenceAnalysis.coherenceDecay.length; i++) {
        const prev = coherenceAnalysis.coherenceDecay[i - 1];
        const curr = coherenceAnalysis.coherenceDecay[i];
        expect(curr.time).toBeGreaterThan(prev.time);
        expect(curr.coherenceLevel).toBeLessThanOrEqual(prev.coherenceLevel);
      }
    });

    test('should handle single time step', () => {
      const analyzer = new ProbabilityAnalyzer();
      const superposition = SuperpositionState.fromQuantumStates(sampleStates);
      
      const coherenceAnalysis = analyzer.analyzeCoherenceEffects(superposition, 1);
      
      expect(coherenceAnalysis.coherenceDecay).toHaveLength(2); // 0 and 1
      expect(coherenceAnalysis.probabilityEvolution).toHaveLength(2);
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle single state analysis', () => {
      const analyzer = new ProbabilityAnalyzer();
      const singleState = [sampleStates[0]];
      
      const analysis = analyzer.analyzeProbabilityDistributions(singleState);
      
      expect(analysis.totalStates).toBe(1);
      expect(analysis.statistics.count).toBe(1);
      expect(analysis.statistics.entropyVariance).toBe(0); // No variance with single sample
    });

    test('should handle very low sampling rate', () => {
      const analyzer = new ProbabilityAnalyzer(0.95, 0.01); // 1% sampling
      
      const analysis = analyzer.analyzeProbabilityDistributions(sampleStates);
      
      expect(analysis.sampledStates).toBeGreaterThan(0);
      expect(analysis.sampledStates).toBeLessThanOrEqual(sampleStates.length);
    });

    test('should handle high outlier threshold', () => {
      const analyzer = new ProbabilityAnalyzer(0.95, 1.0, 256, 10.0); // Very high threshold
      
      const analysis = analyzer.analyzeProbabilityDistributions(sampleStates);
      
      expect(analysis.outliers.outlierCount).toBe(0); // Should find no outliers
    });

    test('should handle small number of distribution bins', () => {
      const analyzer = new ProbabilityAnalyzer(0.95, 1.0, 4); // Only 4 bins
      
      const analysis = analyzer.analyzeProbabilityDistributions(sampleStates);
      
      expect(analysis.histogram.bins).toHaveLength(4);
      expect(analysis.histogram.binSize).toBe(0.25);
    });

    test('should handle states with different amplitude counts', () => {
      const analyzer = new ProbabilityAnalyzer();
      const mixedStates = [
        new QuantumStateVector([new Complex(1, 0)]),
        new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8), new Complex(0.1, 0)])
      ];
      
      const analysis = analyzer.analyzeProbabilityDistributions(mixedStates);
      
      expect(analysis.totalStates).toBe(2);
      expect(analysis.statistics.count).toBe(2);
    });

    test('should handle extreme confidence levels', () => {
      const analyzer = new ProbabilityAnalyzer(0.999); // Very high confidence
      
      const analysis = analyzer.analyzeProbabilityDistributions(sampleStates);
      
      expect(analysis.confidenceInterval.level).toBe(0.999);
      expect(analysis.confidenceInterval.marginOfError).toBeGreaterThan(0);
    });
  });
});