import { InterferenceOptimizer, OptimizedPattern, QuantumStateOptimizationResult, SuperpositionOptimizationResult } from '../InterferenceOptimizer';
import { QuantumStateVector } from '../../models/QuantumStateVector';
import { SuperpositionState, PatternProbability } from '../../models/SuperpositionState';
import { Complex } from '../../math/Complex';

describe('InterferenceOptimizer', () => {
  let optimizer: InterferenceOptimizer;

  beforeEach(() => {
    optimizer = new InterferenceOptimizer();
  });

  describe('Constructor and Parameter Validation', () => {
    it('should create optimizer with default parameters', () => {
      expect(optimizer.constructiveThreshold).toBe(0.7);
      expect(optimizer.destructiveThreshold).toBe(0.3);
      expect(optimizer.amplificationFactor).toBe(1.5);
      expect(optimizer.suppressionFactor).toBe(0.1);
    });

    it('should create optimizer with custom parameters', () => {
      const customOptimizer = new InterferenceOptimizer(0.8, 0.2, 2.0, 0.05, 5);
      expect(customOptimizer.constructiveThreshold).toBe(0.8);
      expect(customOptimizer.destructiveThreshold).toBe(0.2);
      expect(customOptimizer.amplificationFactor).toBe(2.0);
      expect(customOptimizer.suppressionFactor).toBe(0.05);
    });

    it('should throw error for invalid constructive threshold', () => {
      expect(() => new InterferenceOptimizer(0, 0.3, 1.5, 0.1, 10)).toThrow('Constructive threshold must be between 0 and 1');
      expect(() => new InterferenceOptimizer(1.1, 0.3, 1.5, 0.1, 10)).toThrow('Constructive threshold must be between 0 and 1');
    });

    it('should throw error for invalid destructive threshold', () => {
      expect(() => new InterferenceOptimizer(0.7, -0.1, 1.5, 0.1, 10)).toThrow('Destructive threshold must be between 0 and 1');
      expect(() => new InterferenceOptimizer(0.7, 1.0, 1.5, 0.1, 10)).toThrow('Destructive threshold must be between 0 and 1');
    });

    it('should throw error for invalid amplification factor', () => {
      expect(() => new InterferenceOptimizer(0.7, 0.3, 1.0, 0.1, 10)).toThrow('Amplification factor must be greater than 1');
      expect(() => new InterferenceOptimizer(0.7, 0.3, 0.5, 0.1, 10)).toThrow('Amplification factor must be greater than 1');
    });

    it('should throw error for invalid suppression factor', () => {
      expect(() => new InterferenceOptimizer(0.7, 0.3, 1.5, -0.1, 10)).toThrow('Suppression factor must be between 0 and 1');
      expect(() => new InterferenceOptimizer(0.7, 0.3, 1.5, 1.0, 10)).toThrow('Suppression factor must be between 0 and 1');
    });

    it('should throw error for invalid max iterations', () => {
      expect(() => new InterferenceOptimizer(0.7, 0.3, 1.5, 0.1, 0)).toThrow('Max iterations must be between 1 and 100');
      expect(() => new InterferenceOptimizer(0.7, 0.3, 1.5, 0.1, 101)).toThrow('Max iterations must be between 1 and 100');
    });
  });

  describe('Parameter Setters', () => {
    it('should set constructive threshold', () => {
      optimizer.constructiveThreshold = 0.8;
      expect(optimizer.constructiveThreshold).toBe(0.8);
    });

    it('should throw error for invalid constructive threshold setter', () => {
      expect(() => { optimizer.constructiveThreshold = 0; }).toThrow('Constructive threshold must be between 0 and 1');
      expect(() => { optimizer.constructiveThreshold = 1.1; }).toThrow('Constructive threshold must be between 0 and 1');
    });

    it('should set destructive threshold', () => {
      optimizer.destructiveThreshold = 0.2;
      expect(optimizer.destructiveThreshold).toBe(0.2);
    });

    it('should throw error for invalid destructive threshold setter', () => {
      expect(() => { optimizer.destructiveThreshold = -0.1; }).toThrow('Destructive threshold must be between 0 and 1');
      expect(() => { optimizer.destructiveThreshold = 1.0; }).toThrow('Destructive threshold must be between 0 and 1');
    });

    it('should set amplification factor', () => {
      optimizer.amplificationFactor = 2.0;
      expect(optimizer.amplificationFactor).toBe(2.0);
    });

    it('should throw error for invalid amplification factor setter', () => {
      expect(() => { optimizer.amplificationFactor = 1.0; }).toThrow('Amplification factor must be greater than 1');
      expect(() => { optimizer.amplificationFactor = 0.5; }).toThrow('Amplification factor must be greater than 1');
    });

    it('should set suppression factor', () => {
      optimizer.suppressionFactor = 0.05;
      expect(optimizer.suppressionFactor).toBe(0.05);
    });

    it('should throw error for invalid suppression factor setter', () => {
      expect(() => { optimizer.suppressionFactor = -0.1; }).toThrow('Suppression factor must be between 0 and 1');
      expect(() => { optimizer.suppressionFactor = 1.0; }).toThrow('Suppression factor must be between 0 and 1');
    });
  });

  describe('Constructive Interference', () => {
    it('should apply constructive interference to high-probability patterns', () => {
      const patterns: PatternProbability[] = [
        {
          index: 0,
          amplitude: new Complex(0.8, 0.2),
          probability: 0.68, // Above default threshold of 0.7
          phase: 0.24,
          magnitude: 0.82
        },
        {
          index: 1,
          amplitude: new Complex(0.9, 0.1),
          probability: 0.82, // Above threshold
          phase: 0.11,
          magnitude: 0.90
        },
        {
          index: 2,
          amplitude: new Complex(0.3, 0.4),
          probability: 0.25, // Below threshold
          phase: 0.93,
          magnitude: 0.5
        }
      ];

      // Lower threshold to include first pattern
      optimizer.constructiveThreshold = 0.6;
      const result = optimizer.applyConstructiveInterference(patterns);

      expect(result).toHaveLength(2); // Only patterns above threshold
      expect(result[0].interferenceType).toBe('constructive');
      expect(result[0].optimizedProbability).toBeGreaterThan(result[0].originalProbability);
      expect(result[0].amplificationFactor).toBe(1.5); // Default amplification factor
    });

    it('should return empty array for empty patterns', () => {
      const result = optimizer.applyConstructiveInterference([]);
      expect(result).toEqual([]);
    });

    it('should filter patterns below constructive threshold', () => {
      const patterns: PatternProbability[] = [
        {
          index: 0,
          amplitude: new Complex(0.5, 0.3),
          probability: 0.34, // Below default threshold of 0.7
          phase: 0.54,
          magnitude: 0.58
        }
      ];

      const result = optimizer.applyConstructiveInterference(patterns);
      expect(result).toHaveLength(0);
    });

    it('should sort results by optimized probability descending', () => {
      const patterns: PatternProbability[] = [
        {
          index: 0,
          amplitude: new Complex(0.7, 0.1),
          probability: 0.5,
          phase: 0.14,
          magnitude: 0.71
        },
        {
          index: 1,
          amplitude: new Complex(0.8, 0.2),
          probability: 0.68,
          phase: 0.24,
          magnitude: 0.82
        }
      ];

      optimizer.constructiveThreshold = 0.4; // Lower threshold to include both
      const result = optimizer.applyConstructiveInterference(patterns);

      expect(result).toHaveLength(2);
      expect(result[0].optimizedProbability).toBeGreaterThanOrEqual(result[1].optimizedProbability);
    });
  });

  describe('Destructive Interference', () => {
    it('should apply destructive interference to low-probability patterns', () => {
      const patterns: PatternProbability[] = [
        {
          index: 0,
          amplitude: new Complex(0.2, 0.1),
          probability: 0.05, // Below default threshold of 0.3
          phase: 0.46,
          magnitude: 0.22
        },
        {
          index: 1,
          amplitude: new Complex(0.3, 0.2),
          probability: 0.13, // Below threshold
          phase: 0.59,
          magnitude: 0.36
        },
        {
          index: 2,
          amplitude: new Complex(0.8, 0.1),
          probability: 0.65, // Above threshold
          phase: 0.12,
          magnitude: 0.81
        }
      ];

      const result = optimizer.applyDestructiveInterference(patterns);

      expect(result).toHaveLength(2); // Only patterns below threshold
      expect(result[0].interferenceType).toBe('destructive');
      expect(result[0].optimizedProbability).toBeLessThan(result[0].originalProbability);
      expect(result[0].amplificationFactor).toBe(0.1); // Default suppression factor
    });

    it('should return empty array for empty patterns', () => {
      const result = optimizer.applyDestructiveInterference([]);
      expect(result).toEqual([]);
    });

    it('should filter patterns above destructive threshold', () => {
      const patterns: PatternProbability[] = [
        {
          index: 0,
          amplitude: new Complex(0.8, 0.2),
          probability: 0.68, // Above default threshold of 0.3
          phase: 0.24,
          magnitude: 0.82
        }
      ];

      const result = optimizer.applyDestructiveInterference(patterns);
      expect(result).toHaveLength(0);
    });

    it('should sort results by optimized probability ascending', () => {
      const patterns: PatternProbability[] = [
        {
          index: 0,
          amplitude: new Complex(0.3, 0.2),
          probability: 0.13,
          phase: 0.59,
          magnitude: 0.36
        },
        {
          index: 1,
          amplitude: new Complex(0.2, 0.1),
          probability: 0.05,
          phase: 0.46,
          magnitude: 0.22
        }
      ];

      const result = optimizer.applyDestructiveInterference(patterns);

      expect(result).toHaveLength(2);
      expect(result[0].optimizedProbability).toBeLessThanOrEqual(result[1].optimizedProbability);
    });
  });

  describe('Quantum State Optimization', () => {
    it('should optimize quantum states with interference patterns', () => {
      // Create test quantum states with some correlation
      const amplitudes1 = [
        new Complex(0.7, 0.1),
        new Complex(0.5, 0.3),
        new Complex(0.2, 0.4)
      ];
      const amplitudes2 = [
        new Complex(0.6, 0.2),
        new Complex(0.4, 0.4),
        new Complex(0.3, 0.3)
      ];

      const state1 = new QuantumStateVector(amplitudes1);
      const state2 = new QuantumStateVector(amplitudes2);
      const states = [state1, state2];

      const result = optimizer.optimizeQuantumStates(states);

      expect(result.originalStates).toHaveLength(2);
      expect(result.optimizedStates).toHaveLength(2);
      expect(result.optimizationMetrics.totalStates).toBe(2);
      expect(result.optimizationMetrics.optimizedStates).toBe(2);
    });

    it('should return empty result for empty states', () => {
      const result = optimizer.optimizeQuantumStates([]);

      expect(result.originalStates).toEqual([]);
      expect(result.optimizedStates).toEqual([]);
      expect(result.interferencePatterns).toEqual([]);
      expect(result.optimizationMetrics.totalStates).toBe(0);
    });

    it('should preserve states without interference patterns', () => {
      // Create a single state (no pairs for interference)
      const amplitudes = [new Complex(0.7, 0.7)];
      const state = new QuantumStateVector(amplitudes);

      const result = optimizer.optimizeQuantumStates([state]);

      expect(result.optimizedStates).toHaveLength(1);
      expect(result.interferencePatterns).toHaveLength(0);
      expect(result.optimizationMetrics.constructiveOperations).toBe(0);
      expect(result.optimizationMetrics.destructiveOperations).toBe(0);
    });

    it('should calculate compression improvement', () => {
      const amplitudes1 = [new Complex(0.8, 0.2), new Complex(0.4, 0.4)];
      const amplitudes2 = [new Complex(0.7, 0.3), new Complex(0.5, 0.3)];
      
      const state1 = new QuantumStateVector(amplitudes1);
      const state2 = new QuantumStateVector(amplitudes2);

      const result = optimizer.optimizeQuantumStates([state1, state2]);

      expect(typeof result.optimizationMetrics.compressionImprovement).toBe('number');
      expect(result.optimizationMetrics.compressionImprovement).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Superposition Optimization', () => {
    it('should optimize superposition state', () => {
      // Create test superposition
      const amplitudes = [
        new Complex(0.8, 0.1), // High probability
        new Complex(0.3, 0.2), // Medium probability
        new Complex(0.1, 0.1)  // Low probability
      ];
      
      const state1 = new QuantumStateVector([new Complex(0.7, 0.7)]);
      const state2 = new QuantumStateVector([new Complex(0.7, -0.7)]);
      
      const superposition = new SuperpositionState(amplitudes, [state1, state2], [0.6, 0.4]);

      const result = optimizer.optimizeSuperposition(superposition);

      expect(result.originalSuperposition).toBe(superposition);
      expect(result.optimizedSuperposition).toBeDefined();
      expect(result.constructivePatterns).toBeDefined();
      expect(result.destructivePatterns).toBeDefined();
      expect(typeof result.compressionImprovement).toBe('number');
    });

    it('should apply both constructive and destructive interference', () => {
      const amplitudes = [
        new Complex(0.9, 0.1), // High probability - should get constructive
        new Complex(0.1, 0.05) // Low probability - should get destructive
      ];
      
      const state1 = new QuantumStateVector([new Complex(0.7, 0.7)]);
      const state2 = new QuantumStateVector([new Complex(0.7, -0.7)]);
      
      const superposition = new SuperpositionState(amplitudes, [state1, state2], [0.5, 0.5]);

      // Adjust thresholds to ensure both types of interference
      optimizer.constructiveThreshold = 0.6;
      optimizer.destructiveThreshold = 0.2;

      const result = optimizer.optimizeSuperposition(superposition);

      expect(result.constructivePatterns.length).toBeGreaterThan(0);
      expect(result.destructivePatterns.length).toBeGreaterThan(0);
    });
  });

  describe('Iterative Optimization', () => {
    it('should perform iterative optimization', () => {
      const amplitudes1 = [new Complex(0.6, 0.4), new Complex(0.4, 0.6)];
      const amplitudes2 = [new Complex(0.5, 0.5), new Complex(0.5, 0.5)];
      
      const state1 = new QuantumStateVector(amplitudes1);
      const state2 = new QuantumStateVector(amplitudes2);

      const result = optimizer.performIterativeOptimization([state1, state2]);

      expect(result.initialStates).toHaveLength(2);
      expect(result.finalStates).toHaveLength(2);
      expect(result.iterations.length).toBeGreaterThan(0);
      expect(typeof result.convergenceAchieved).toBe('boolean');
      expect(typeof result.totalImprovement).toBe('number');
    });

    it('should return empty result for empty states', () => {
      const result = optimizer.performIterativeOptimization([]);

      expect(result.initialStates).toEqual([]);
      expect(result.finalStates).toEqual([]);
      expect(result.iterations).toEqual([]);
      expect(result.convergenceAchieved).toBe(false);
      expect(result.totalImprovement).toBe(0);
    });

    it('should track iteration metrics', () => {
      const amplitudes = [new Complex(0.7, 0.3), new Complex(0.3, 0.7)];
      const state = new QuantumStateVector(amplitudes);

      const result = optimizer.performIterativeOptimization([state]);

      if (result.iterations.length > 0) {
        const iteration = result.iterations[0];
        expect(iteration.iterationNumber).toBe(1);
        expect(iteration.inputStates).toBe(1);
        expect(iteration.outputStates).toBe(1);
        expect(typeof iteration.compressionImprovement).toBe('number');
        expect(typeof iteration.constructiveOperations).toBe('number');
        expect(typeof iteration.destructiveOperations).toBe('number');
      }
    });

    it('should achieve convergence with similar states', () => {
      // Create very similar states that should converge quickly
      const amplitudes = [new Complex(0.7, 0.7)];
      const state1 = new QuantumStateVector(amplitudes);
      const state2 = new QuantumStateVector(amplitudes);

      const result = optimizer.performIterativeOptimization([state1, state2]);

      // Should converge quickly due to similarity
      expect(result.iterations.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle quantum states with different amplitude lengths', () => {
      const amplitudes1 = [new Complex(0.7, 0.7)];
      const amplitudes2 = [new Complex(0.5, 0.5), new Complex(0.5, 0.5)];
      
      const state1 = new QuantumStateVector(amplitudes1);
      const state2 = new QuantumStateVector(amplitudes2);

      const result = optimizer.optimizeQuantumStates([state1, state2]);

      expect(result.optimizedStates).toHaveLength(2);
      expect(result.optimizationMetrics.totalStates).toBe(2);
    });

    it('should handle zero amplitudes gracefully', () => {
      const patterns: PatternProbability[] = [
        {
          index: 0,
          amplitude: new Complex(0, 0),
          probability: 0,
          phase: 0,
          magnitude: 0
        }
      ];

      const constructiveResult = optimizer.applyConstructiveInterference(patterns);
      const destructiveResult = optimizer.applyDestructiveInterference(patterns);

      expect(constructiveResult).toHaveLength(0);
      expect(destructiveResult).toHaveLength(1); // Zero probability is below destructive threshold
    });

    it('should handle single quantum state', () => {
      const amplitudes = [new Complex(0.7, 0.7)];
      const state = new QuantumStateVector(amplitudes);

      const result = optimizer.optimizeQuantumStates([state]);

      expect(result.optimizedStates).toHaveLength(1);
      expect(result.interferencePatterns).toHaveLength(0); // No pairs for interference
    });

    it('should maintain quantum state normalization', () => {
      const amplitudes = [new Complex(0.6, 0.4), new Complex(0.4, 0.6)];
      const state = new QuantumStateVector(amplitudes);

      const result = optimizer.optimizeQuantumStates([state]);

      // Check that optimized state is still normalized
      const optimizedState = result.optimizedStates[0];
      const totalProbability = optimizedState.getProbabilityDistribution()
        .reduce((sum, p) => sum + p, 0);
      
      expect(totalProbability).toBeCloseTo(1, 5);
    });
  });

  describe('Performance and Metrics', () => {
    it('should calculate optimization metrics correctly', () => {
      const amplitudes1 = [new Complex(0.8, 0.2), new Complex(0.2, 0.8)];
      const amplitudes2 = [new Complex(0.7, 0.3), new Complex(0.3, 0.7)];
      
      const state1 = new QuantumStateVector(amplitudes1);
      const state2 = new QuantumStateVector(amplitudes2);

      const result = optimizer.optimizeQuantumStates([state1, state2]);
      const metrics = result.optimizationMetrics;

      expect(metrics.totalStates).toBe(2);
      expect(metrics.optimizedStates).toBe(2);
      expect(metrics.constructiveOperations).toBeGreaterThanOrEqual(0);
      expect(metrics.destructiveOperations).toBeGreaterThanOrEqual(0);
      expect(metrics.totalAmplification).toBeGreaterThanOrEqual(0);
      expect(metrics.totalSuppression).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average amplification and suppression', () => {
      const patterns: PatternProbability[] = [
        {
          index: 0,
          amplitude: new Complex(0.8, 0.2),
          probability: 0.68,
          phase: 0.24,
          magnitude: 0.82
        }
      ];

      optimizer.constructiveThreshold = 0.6;
      const result = optimizer.applyConstructiveInterference(patterns);

      expect(result).toHaveLength(1);
      expect(result[0].amplificationFactor).toBe(1.5);
      expect(result[0].optimizedProbability).toBeGreaterThan(result[0].originalProbability);
    });
  });

  describe('Threshold Management', () => {
    it('should create and load threshold profiles', () => {
      optimizer.createThresholdProfile('test-profile', 0.8, 0.2, 2.0, 0.05, 'Test profile');
      
      expect(optimizer.getAvailableProfiles()).toContain('test-profile');
      
      optimizer.loadThresholdProfile('test-profile');
      
      expect(optimizer.constructiveThreshold).toBe(0.8);
      expect(optimizer.destructiveThreshold).toBe(0.2);
      expect(optimizer.amplificationFactor).toBe(2.0);
      expect(optimizer.suppressionFactor).toBe(0.05);
      expect(optimizer.getCurrentProfile()).toBe('test-profile');
    });

    it('should throw error for non-existent profile', () => {
      expect(() => optimizer.loadThresholdProfile('non-existent')).toThrow("Threshold profile 'non-existent' not found");
    });

    it('should get profile details', () => {
      optimizer.createThresholdProfile('detailed-profile', 0.75, 0.25, 1.6, 0.08, 'Detailed test profile');
      
      const details = optimizer.getProfileDetails('detailed-profile');
      
      expect(details).toBeDefined();
      expect(details!.name).toBe('detailed-profile');
      expect(details!.constructiveThreshold).toBe(0.75);
      expect(details!.description).toBe('Detailed test profile');
    });

    it('should have default profiles available', () => {
      const profiles = optimizer.getAvailableProfiles();
      
      expect(profiles).toContain('default');
      expect(profiles).toContain('conservative');
      expect(profiles).toContain('aggressive');
      expect(profiles).toContain('high-quality');
    });

    it('should get current threshold configuration', () => {
      const thresholds = optimizer.getCurrentThresholds();
      
      expect(thresholds.constructiveThreshold).toBe(0.7);
      expect(thresholds.destructiveThreshold).toBe(0.3);
      expect(thresholds.amplificationFactor).toBe(1.5);
      expect(thresholds.suppressionFactor).toBe(0.1);
    });
  });

  describe('Adaptive Threshold Adjustment', () => {
    it('should adjust thresholds adaptively for high entropy data', () => {
      // Create high entropy states
      const highEntropyAmplitudes = [
        new Complex(0.5, 0.5),
        new Complex(0.5, -0.5),
        new Complex(-0.5, 0.5),
        new Complex(-0.5, -0.5)
      ];
      const state = new QuantumStateVector(highEntropyAmplitudes);
      
      optimizer.adaptiveThresholds = true;
      const result = optimizer.adjustThresholdsAdaptively([state]);
      
      expect(result.adjustedThresholds.constructiveThreshold).toBeGreaterThanOrEqual(result.originalThresholds.constructiveThreshold);
      expect(result.adjustmentReason).toContain('High entropy');
    });

    it('should adjust thresholds adaptively for low entropy data', () => {
      // Create low entropy states (more concentrated probabilities)
      const lowEntropyAmplitudes = [
        new Complex(0.95, 0.1),
        new Complex(0.1, 0.05)
      ];
      const state = new QuantumStateVector(lowEntropyAmplitudes);
      
      optimizer.adaptiveThresholds = true;
      const result = optimizer.adjustThresholdsAdaptively([state]);
      
      expect(result.adjustedThresholds.constructiveThreshold).toBeLessThanOrEqual(result.originalThresholds.constructiveThreshold);
      expect(result.adjustmentReason).toContain('Low entropy');
    });

    it('should return original thresholds for empty states', () => {
      const result = optimizer.adjustThresholdsAdaptively([]);
      
      expect(result.originalThresholds).toEqual(result.adjustedThresholds);
      expect(result.adjustmentReason).toBe('No states provided');
      expect(result.improvementEstimate).toBe(0);
    });

    it('should respect adaptive thresholds setting', () => {
      const amplitudes = [new Complex(0.7, 0.7)];
      const state = new QuantumStateVector(amplitudes);
      
      optimizer.adaptiveThresholds = false;
      const originalThreshold = optimizer.constructiveThreshold;
      
      optimizer.adjustThresholdsAdaptively([state]);
      
      // Thresholds should not change when adaptive mode is off
      expect(optimizer.constructiveThreshold).toBe(originalThreshold);
    });
  });

  describe('Minimal Representation Optimization', () => {
    it('should optimize states for minimal representation', () => {
      const amplitudes1 = [new Complex(0.8, 0.2), new Complex(0.4, 0.6)];
      const amplitudes2 = [new Complex(0.6, 0.4), new Complex(0.5, 0.5)];
      
      const state1 = new QuantumStateVector(amplitudes1);
      const state2 = new QuantumStateVector(amplitudes2);
      
      const result = optimizer.optimizeForMinimalRepresentation([state1, state2]);
      
      expect(result.originalStates).toHaveLength(2);
      expect(result.minimalStates).toHaveLength(2);
      expect(result.representationRatio).toBeGreaterThan(0);
      expect(result.representationRatio).toBeLessThanOrEqual(1);
      expect(result.compressionAchieved).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics).toBeDefined();
    });

    it('should return empty result for empty states', () => {
      const result = optimizer.optimizeForMinimalRepresentation([]);
      
      expect(result.originalStates).toEqual([]);
      expect(result.minimalStates).toEqual([]);
      expect(result.representationRatio).toBe(1);
      expect(result.compressionAchieved).toBe(0);
    });

    it('should respect minimal representation target', () => {
      optimizer.minimalRepresentationTarget = 0.8;
      
      // Create multiple states with some redundancy for optimization
      const amplitudes1 = [new Complex(0.8, 0.2), new Complex(0.4, 0.6)];
      const amplitudes2 = [new Complex(0.7, 0.3), new Complex(0.5, 0.5)];
      const amplitudes3 = [new Complex(0.6, 0.4), new Complex(0.6, 0.4)];
      
      const state1 = new QuantumStateVector(amplitudes1);
      const state2 = new QuantumStateVector(amplitudes2);
      const state3 = new QuantumStateVector(amplitudes3);
      
      const result = optimizer.optimizeForMinimalRepresentation([state1, state2, state3]);
      
      // The optimization should attempt to reach the target or get as close as possible
      expect(result.representationRatio).toBeLessThanOrEqual(1);
      expect(result.compressionAchieved).toBeGreaterThanOrEqual(0);
    });

    it('should calculate quality metrics', () => {
      const amplitudes = [new Complex(0.6, 0.8)];
      const state = new QuantumStateVector(amplitudes);
      
      const result = optimizer.optimizeForMinimalRepresentation([state]);
      const metrics = result.qualityMetrics;
      
      expect(metrics.fidelity).toBeGreaterThanOrEqual(0);
      expect(metrics.fidelity).toBeLessThanOrEqual(1);
      expect(metrics.informationPreservation).toBeGreaterThanOrEqual(0);
      expect(metrics.compressionEfficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.overallQuality).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Type Optimization', () => {
    it('should optimize thresholds for text data', () => {
      const amplitudes = [new Complex(0.7, 0.3), new Complex(0.3, 0.7)];
      const state = new QuantumStateVector(amplitudes);
      
      const result = optimizer.optimizeThresholdsForDataType([state], 'text');
      
      expect(result.dataType).toBe('text');
      expect(result.recommendedProfile).toBe('text-optimized');
      expect(result.optimizedThresholds.constructiveThreshold).toBe(0.6);
      expect(result.optimizedThresholds.destructiveThreshold).toBe(0.4);
    });

    it('should optimize thresholds for binary data', () => {
      const amplitudes = [new Complex(0.8, 0.2)];
      const state = new QuantumStateVector(amplitudes);
      
      const result = optimizer.optimizeThresholdsForDataType([state], 'binary');
      
      expect(result.dataType).toBe('binary');
      expect(result.recommendedProfile).toBe('binary-optimized');
      expect(result.optimizedThresholds.constructiveThreshold).toBe(0.8);
      expect(result.optimizedThresholds.destructiveThreshold).toBe(0.2);
    });

    it('should optimize thresholds for image data', () => {
      const amplitudes = [new Complex(0.6, 0.4), new Complex(0.4, 0.6)];
      const state = new QuantumStateVector(amplitudes);
      
      const result = optimizer.optimizeThresholdsForDataType([state], 'image');
      
      expect(result.dataType).toBe('image');
      expect(result.recommendedProfile).toBe('image-optimized');
      expect(result.optimizedThresholds.amplificationFactor).toBe(1.6);
    });

    it('should optimize thresholds for audio data', () => {
      const amplitudes = [new Complex(0.5, 0.5)];
      const state = new QuantumStateVector(amplitudes);
      
      const result = optimizer.optimizeThresholdsForDataType([state], 'audio');
      
      expect(result.dataType).toBe('audio');
      expect(result.recommendedProfile).toBe('audio-optimized');
      expect(result.optimizedThresholds.suppressionFactor).toBe(0.06);
    });

    it('should optimize thresholds for mixed data', () => {
      const amplitudes = [new Complex(0.7, 0.7)];
      const state = new QuantumStateVector(amplitudes);
      
      const result = optimizer.optimizeThresholdsForDataType([state], 'mixed');
      
      expect(result.dataType).toBe('mixed');
      expect(result.recommendedProfile).toBe('mixed-optimized');
      expect(result.expectedImprovement).toBeGreaterThanOrEqual(0);
    });

    it('should return original thresholds for empty states', () => {
      const result = optimizer.optimizeThresholdsForDataType([], 'text');
      
      expect(result.originalThresholds).toEqual(result.optimizedThresholds);
      expect(result.expectedImprovement).toBe(0);
    });

    it('should create recommended profiles', () => {
      const amplitudes = [new Complex(0.7, 0.3)];
      const state = new QuantumStateVector(amplitudes);
      
      optimizer.optimizeThresholdsForDataType([state], 'text');
      
      expect(optimizer.getAvailableProfiles()).toContain('text-optimized');
      
      const profile = optimizer.getProfileDetails('text-optimized');
      expect(profile).toBeDefined();
      expect(profile!.description).toContain('text data');
    });
  });

  describe('Advanced Parameter Management', () => {
    it('should set and get adaptive thresholds', () => {
      optimizer.adaptiveThresholds = true;
      expect(optimizer.adaptiveThresholds).toBe(true);
      
      optimizer.adaptiveThresholds = false;
      expect(optimizer.adaptiveThresholds).toBe(false);
    });

    it('should set and get minimal representation target', () => {
      optimizer.minimalRepresentationTarget = 0.6;
      expect(optimizer.minimalRepresentationTarget).toBe(0.6);
    });

    it('should throw error for invalid minimal representation target', () => {
      expect(() => { optimizer.minimalRepresentationTarget = 0; }).toThrow('Minimal representation target must be between 0 and 1');
      expect(() => { optimizer.minimalRepresentationTarget = 1.1; }).toThrow('Minimal representation target must be between 0 and 1');
    });

    it('should validate threshold profile parameters', () => {
      expect(() => optimizer.createThresholdProfile('invalid', 0, 0.3, 1.5, 0.1)).toThrow('Constructive threshold must be between 0 and 1');
      expect(() => optimizer.createThresholdProfile('invalid', 0.7, 1.0, 1.5, 0.1)).toThrow('Destructive threshold must be between 0 and 1');
      expect(() => optimizer.createThresholdProfile('invalid', 0.7, 0.3, 1.0, 0.1)).toThrow('Amplification factor must be greater than 1');
      expect(() => optimizer.createThresholdProfile('invalid', 0.7, 0.3, 1.5, 1.0)).toThrow('Suppression factor must be between 0 and 1');
    });
  });
});