import { SuperpositionProcessor, ParallelProcessingResult, DominantPattern, MeasurementResult } from '../SuperpositionProcessor';
import { QuantumStateVector } from '../../models/QuantumStateVector';
import { SuperpositionState, PatternProbability } from '../../models/SuperpositionState';
import { Complex } from '../../math/Complex';

describe('SuperpositionProcessor', () => {
  let sampleStates: QuantumStateVector[];

  beforeEach(() => {
    // Create sample quantum states for testing
    sampleStates = [
      new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]),
      new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8)]),
      new QuantumStateVector([new Complex(0.707, 0), new Complex(0, 0.707)]),
      new QuantumStateVector([new Complex(0.5, 0.5), new Complex(0.5, -0.5)])
    ];
  });

  describe('constructor and basic properties', () => {
    test('should create processor with default parameters', () => {
      const processor = new SuperpositionProcessor();

      expect(processor.maxSuperpositionSize).toBe(16);
      expect(processor.coherenceThreshold).toBe(0.1);
      expect(processor.patternThreshold).toBe(0.05);
      expect(processor.parallelismFactor).toBe(4);
    });

    test('should create processor with custom parameters', () => {
      const processor = new SuperpositionProcessor(8, 0.2, 0.1, 2);

      expect(processor.maxSuperpositionSize).toBe(8);
      expect(processor.coherenceThreshold).toBe(0.2);
      expect(processor.patternThreshold).toBe(0.1);
      expect(processor.parallelismFactor).toBe(2);
    });

    test('should validate parameter bounds', () => {
      expect(() => new SuperpositionProcessor(1)).toThrow(
        'Maximum superposition size must be between 2 and 64'
      );
      expect(() => new SuperpositionProcessor(16, -0.1)).toThrow(
        'Coherence threshold must be between 0 and 1'
      );
      expect(() => new SuperpositionProcessor(16, 0.1, 1.1)).toThrow(
        'Pattern threshold must be between 0 and 1'
      );
      expect(() => new SuperpositionProcessor(16, 0.1, 0.1, 0)).toThrow(
        'Parallelism factor must be between 1 and 16'
      );
    });
  });

  describe('property setters', () => {
    test('should validate and set maximum superposition size', () => {
      const processor = new SuperpositionProcessor();

      processor.maxSuperpositionSize = 32;
      expect(processor.maxSuperpositionSize).toBe(32);

      expect(() => processor.maxSuperpositionSize = 1).toThrow(
        'Maximum superposition size must be between 2 and 64'
      );
      expect(() => processor.maxSuperpositionSize = 100).toThrow(
        'Maximum superposition size must be between 2 and 64'
      );
    });

    test('should validate and set coherence threshold', () => {
      const processor = new SuperpositionProcessor();

      processor.coherenceThreshold = 0.3;
      expect(processor.coherenceThreshold).toBe(0.3);

      expect(() => processor.coherenceThreshold = -0.1).toThrow(
        'Coherence threshold must be between 0 and 1'
      );
      expect(() => processor.coherenceThreshold = 1.1).toThrow(
        'Coherence threshold must be between 0 and 1'
      );
    });

    test('should validate and set pattern threshold', () => {
      const processor = new SuperpositionProcessor();

      processor.patternThreshold = 0.2;
      expect(processor.patternThreshold).toBe(0.2);

      expect(() => processor.patternThreshold = -0.1).toThrow(
        'Pattern threshold must be between 0 and 1'
      );
      expect(() => processor.patternThreshold = 1.1).toThrow(
        'Pattern threshold must be between 0 and 1'
      );
    });

    test('should validate and set parallelism factor', () => {
      const processor = new SuperpositionProcessor();

      processor.parallelismFactor = 8;
      expect(processor.parallelismFactor).toBe(8);

      expect(() => processor.parallelismFactor = 0).toThrow(
        'Parallelism factor must be between 1 and 16'
      );
      expect(() => processor.parallelismFactor = 20).toThrow(
        'Parallelism factor must be between 1 and 16'
      );
    });
  });

  describe('superposition creation', () => {
    test('should create superposition from quantum states', () => {
      const processor = new SuperpositionProcessor();

      const superposition = processor.createSuperposition(sampleStates);

      expect(superposition).toBeInstanceOf(SuperpositionState);
      expect(superposition.constituentStates).toHaveLength(sampleStates.length);
      expect(superposition.isCoherent()).toBe(true);
    });

    test('should create superposition with custom weights', () => {
      const processor = new SuperpositionProcessor();
      const weights = [0.4, 0.3, 0.2, 0.1];

      const superposition = processor.createSuperposition(sampleStates, weights);

      // Check weights with tolerance for floating point precision
      expect(superposition.weights).toHaveLength(weights.length);
      superposition.weights.forEach((weight, index) => {
        expect(weight).toBeCloseTo(weights[index], 10);
      });
    });

    test('should handle large state arrays with hierarchical superposition', () => {
      const processor = new SuperpositionProcessor(4); // Small max size to trigger hierarchical
      const largeStateArray = Array.from({ length: 10 }, (_, i) =>
        new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)])
      );

      const superposition = processor.createSuperposition(largeStateArray);

      expect(superposition).toBeInstanceOf(SuperpositionState);
    });

    test('should throw error for empty states array', () => {
      const processor = new SuperpositionProcessor();

      expect(() => processor.createSuperposition([])).toThrow(
        'Cannot create superposition from empty states array'
      );
    });
  });

  describe('probability amplitude analysis', () => {
    test('should analyze probability amplitudes', () => {
      const processor = new SuperpositionProcessor(16, 0.1, 0.01); // Low threshold
      const superposition = processor.createSuperposition(sampleStates);

      const patterns = processor.analyzeProbabilityAmplitudes(superposition);

      expect(patterns).toBeInstanceOf(Array);
      patterns.forEach(pattern => {
        expect(pattern.probability).toBeGreaterThanOrEqual(0.01);
        expect(pattern.amplitude).toBeInstanceOf(Complex);
        expect(pattern.magnitude).toBeGreaterThanOrEqual(0);
        expect(pattern.phase).toBeGreaterThanOrEqual(0);
      });
    });

    test('should filter patterns by threshold', () => {
      const processor = new SuperpositionProcessor(16, 0.1, 0.5); // High threshold
      const superposition = processor.createSuperposition(sampleStates);

      const patterns = processor.analyzeProbabilityAmplitudes(superposition);

      patterns.forEach(pattern => {
        expect(pattern.probability).toBeGreaterThanOrEqual(0.5);
      });
    });

    test('should sort patterns by probability', () => {
      const processor = new SuperpositionProcessor(16, 0.1, 0.01);
      const superposition = processor.createSuperposition(sampleStates);

      const patterns = processor.analyzeProbabilityAmplitudes(superposition);

      for (let i = 1; i < patterns.length; i++) {
        expect(patterns[i].probability).toBeLessThanOrEqual(patterns[i - 1].probability);
      }
    });
  });

  describe('parallel processing', () => {
    test('should process multiple state groups in parallel', () => {
      const processor = new SuperpositionProcessor();
      const stateGroups = [
        sampleStates.slice(0, 2),
        sampleStates.slice(2, 4)
      ];

      const result = processor.processParallelSuperpositions(stateGroups);

      expect(result.superpositions).toHaveLength(2);
      expect(result.patternAnalyses).toHaveLength(2);
      expect(result.processingMetrics).toHaveLength(2);
      expect(result.totalProcessingTime).toBeGreaterThan(0);
      expect(result.successfulGroups).toBe(2);
      expect(result.failedGroups).toBe(0);
    });

    test('should handle processing errors gracefully', () => {
      const processor = new SuperpositionProcessor();
      const stateGroups = [
        [], // Empty group should cause error
        sampleStates.slice(0, 2)
      ];

      const result = processor.processParallelSuperpositions(stateGroups);

      expect(result.processingMetrics).toHaveLength(2);
      expect(result.successfulGroups).toBe(1);
      expect(result.failedGroups).toBe(1);
      expect(result.processingMetrics[0].error).toBeDefined();
    });

    test('should use custom weights for parallel processing', () => {
      const processor = new SuperpositionProcessor();
      const stateGroups = [sampleStates.slice(0, 2), sampleStates.slice(2, 4)];
      const weights = [[0.7, 0.3], [0.4, 0.6]];

      const result = processor.processParallelSuperpositions(stateGroups, weights);

      expect(result.successfulGroups).toBe(2);
      // Check weights with tolerance for floating point precision
      expect(result.superpositions[0].weights[0]).toBeCloseTo(0.7, 10);
      expect(result.superpositions[0].weights[1]).toBeCloseTo(0.3, 10);
      expect(result.superpositions[1].weights[0]).toBeCloseTo(0.4, 10);
      expect(result.superpositions[1].weights[1]).toBeCloseTo(0.6, 10);
    });

    test('should throw error for empty state groups', () => {
      const processor = new SuperpositionProcessor();

      expect(() => processor.processParallelSuperpositions([])).toThrow(
        'Cannot process empty state groups'
      );
    });
  });

  describe('dominant pattern identification', () => {
    test('should identify dominant patterns across analyses', () => {
      const processor = new SuperpositionProcessor();

      // Create mock pattern analyses
      const patternAnalyses: PatternProbability[][] = [
        [
          { index: 0, amplitude: new Complex(0.8, 0), probability: 0.64, phase: 0, magnitude: 0.8 },
          { index: 1, amplitude: new Complex(0.6, 0), probability: 0.36, phase: 0, magnitude: 0.6 }
        ],
        [
          { index: 0, amplitude: new Complex(0.7, 0), probability: 0.49, phase: 0, magnitude: 0.7 },
          { index: 2, amplitude: new Complex(0.5, 0), probability: 0.25, phase: 0, magnitude: 0.5 }
        ]
      ];

      const dominantPatterns = processor.identifyDominantPatterns(patternAnalyses, 0.1);

      expect(dominantPatterns.length).toBeGreaterThan(0);
      dominantPatterns.forEach(pattern => {
        expect(pattern.dominanceScore).toBeGreaterThanOrEqual(0.1);
        expect(pattern.occurrences).toBeGreaterThan(0);
        expect(pattern.groupIndices).toBeInstanceOf(Array);
      });
    });

    test('should sort dominant patterns by dominance score', () => {
      const processor = new SuperpositionProcessor();
      const patternAnalyses: PatternProbability[][] = [
        [
          { index: 0, amplitude: new Complex(0.9, 0), probability: 0.81, phase: 0, magnitude: 0.9 },
          { index: 1, amplitude: new Complex(0.4, 0), probability: 0.16, phase: 0, magnitude: 0.4 }
        ]
      ];

      const dominantPatterns = processor.identifyDominantPatterns(patternAnalyses, 0.1);

      for (let i = 1; i < dominantPatterns.length; i++) {
        expect(dominantPatterns[i].dominanceScore).toBeLessThanOrEqual(dominantPatterns[i - 1].dominanceScore);
      }
    });

    test('should handle empty pattern analyses', () => {
      const processor = new SuperpositionProcessor();

      const dominantPatterns = processor.identifyDominantPatterns([], 0.1);

      expect(dominantPatterns).toHaveLength(0);
    });
  });

  describe('superposition optimization', () => {
    test('should optimize superposition for better pattern recognition', () => {
      const processor = new SuperpositionProcessor();
      const superposition = processor.createSuperposition(sampleStates);

      const optimized = processor.optimizeSuperposition(superposition);

      expect(optimized).toBeInstanceOf(SuperpositionState);
      expect(optimized.constituentStates).toHaveLength(superposition.constituentStates.length);
    });

    test('should optimize with target patterns', () => {
      const processor = new SuperpositionProcessor();
      const superposition = processor.createSuperposition(sampleStates);
      const targetPatterns: PatternProbability[] = [
        { index: 0, amplitude: new Complex(0.8, 0), probability: 0.64, phase: 0, magnitude: 0.8 }
      ];

      const optimized = processor.optimizeSuperposition(superposition, targetPatterns);

      expect(optimized).toBeInstanceOf(SuperpositionState);
    });

    test('should throw error for incoherent superposition', () => {
      const processor = new SuperpositionProcessor(16, 0.9); // High coherence threshold
      const superposition = processor.createSuperposition(sampleStates);

      // Apply decoherence to make it incoherent
      const decoherent = superposition.applyDecoherence(1.0);

      expect(() => processor.optimizeSuperposition(decoherent)).toThrow(
        'Cannot optimize incoherent superposition'
      );
    });
  });

  describe('quantum interference', () => {
    test('should apply constructive interference', () => {
      const processor = new SuperpositionProcessor();
      const superposition = processor.createSuperposition(sampleStates);
      const targetIndices = [0, 1];

      const enhanced = processor.applyQuantumInterference(
        superposition,
        'constructive',
        targetIndices
      );

      expect(enhanced).toBeInstanceOf(SuperpositionState);
      expect(enhanced.combinedAmplitudes).toHaveLength(superposition.combinedAmplitudes.length);
    });

    test('should apply destructive interference', () => {
      const processor = new SuperpositionProcessor();
      const superposition = processor.createSuperposition(sampleStates);
      const targetIndices = [0, 1];

      const suppressed = processor.applyQuantumInterference(
        superposition,
        'destructive',
        targetIndices
      );

      expect(suppressed).toBeInstanceOf(SuperpositionState);
    });

    test('should handle invalid target indices', () => {
      const processor = new SuperpositionProcessor();
      const superposition = processor.createSuperposition(sampleStates);
      const invalidIndices = [-1, 1000]; // Out of bounds

      const result = processor.applyQuantumInterference(
        superposition,
        'constructive',
        invalidIndices
      );

      expect(result).toBeInstanceOf(SuperpositionState);
    });
  });

  describe('superposition measurement', () => {
    test('should measure superposition and extract information', () => {
      const processor = new SuperpositionProcessor();
      const superposition = processor.createSuperposition(sampleStates);

      const measurement = processor.measureSuperposition(superposition);

      expect(measurement.collapsedStateIndex).toBeGreaterThanOrEqual(0);
      expect(measurement.collapsedStateIndex).toBeLessThan(sampleStates.length);
      expect(measurement.collapsedState).toBeInstanceOf(QuantumStateVector);
      expect(measurement.measurementProbability).toBeGreaterThan(0);
      expect(measurement.detectedPatterns).toBeInstanceOf(Array);
      expect(measurement.coherenceTime).toBeGreaterThanOrEqual(0);
      expect(measurement.entropy).toBeGreaterThanOrEqual(0);
      expect(measurement.measurementTimestamp).toBeGreaterThan(0);
    });
  });

  describe('processing efficiency', () => {
    test('should calculate processing efficiency metrics', () => {
      const processor = new SuperpositionProcessor();
      const stateGroups = [
        sampleStates.slice(0, 2),
        sampleStates.slice(2, 4)
      ];

      const result = processor.processParallelSuperpositions(stateGroups);
      const efficiency = processor.calculateProcessingEfficiency(result);

      expect(efficiency.totalStatesProcessed).toBe(4);
      expect(efficiency.totalPatternsDetected).toBeGreaterThanOrEqual(0);
      expect(efficiency.averageCoherenceTime).toBeGreaterThanOrEqual(0);
      expect(efficiency.parallelismEfficiency).toBeGreaterThan(0);
      expect(efficiency.parallelismEfficiency).toBeLessThanOrEqual(1);
      expect(efficiency.patternDensity).toBeGreaterThanOrEqual(0);
      expect(efficiency.processingSpeed).toBeGreaterThan(0);
      expect(efficiency.successRate).toBeGreaterThan(0);
      expect(efficiency.successRate).toBeLessThanOrEqual(1);
      expect(efficiency.averageProcessingTime).toBeGreaterThan(0);
    });

    test('should handle failed processing in efficiency calculation', () => {
      const processor = new SuperpositionProcessor();
      const stateGroups = [
        [], // This will fail
        sampleStates.slice(0, 2)
      ];

      const result = processor.processParallelSuperpositions(stateGroups);
      const efficiency = processor.calculateProcessingEfficiency(result);

      expect(efficiency.successRate).toBe(0.5); // 1 success out of 2
      expect(efficiency.parallelismEfficiency).toBe(0.5);
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle single state superposition', () => {
      const processor = new SuperpositionProcessor();
      const singleState = [sampleStates[0]];

      const superposition = processor.createSuperposition(singleState);

      expect(superposition).toBeInstanceOf(SuperpositionState);
      expect(superposition.constituentStates).toHaveLength(1);
    });

    test('should handle states with different amplitude counts', () => {
      const processor = new SuperpositionProcessor();
      const mixedStates = [
        new QuantumStateVector([new Complex(1, 0)]),
        new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8), new Complex(0.1, 0)])
      ];

      const superposition = processor.createSuperposition(mixedStates);

      expect(superposition).toBeInstanceOf(SuperpositionState);
    });

    test('should handle very small pattern thresholds', () => {
      const processor = new SuperpositionProcessor(16, 0.1, 0.001); // Very small threshold
      const superposition = processor.createSuperposition(sampleStates);

      const patterns = processor.analyzeProbabilityAmplitudes(superposition);

      expect(patterns).toBeInstanceOf(Array);
    });

    test('should handle maximum superposition size boundary', () => {
      const processor = new SuperpositionProcessor(4); // Small max size
      const exactSizeStates = sampleStates; // Exactly 4 states

      const superposition = processor.createSuperposition(exactSizeStates);

      expect(superposition).toBeInstanceOf(SuperpositionState);
    });
  });
});