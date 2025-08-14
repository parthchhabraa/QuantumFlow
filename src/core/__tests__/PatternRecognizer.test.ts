import { PatternRecognizer, RecognizedPattern, ProbabilityAnalysis, HighProbabilityState } from '../PatternRecognizer';
import { QuantumStateVector } from '../../models/QuantumStateVector';
import { SuperpositionState } from '../../models/SuperpositionState';
import { Complex } from '../../math/Complex';

describe('PatternRecognizer', () => {
  let sampleStates: QuantumStateVector[];

  beforeEach(() => {
    // Create sample quantum states with recognizable patterns
    sampleStates = [
      new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]),
      new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]), // Duplicate pattern
      new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8)]),
      new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]), // Another duplicate
      new QuantumStateVector([new Complex(0.707, 0), new Complex(0, 0.707)])
    ];
  });

  describe('constructor and basic properties', () => {
    test('should create recognizer with default parameters', () => {
      const recognizer = new PatternRecognizer();
      
      expect(recognizer.minPatternLength).toBe(2);
      expect(recognizer.maxPatternLength).toBe(16);
      expect(recognizer.similarityThreshold).toBe(0.8);
      expect(recognizer.frequencyThreshold).toBe(2);
      expect(recognizer.complexityWeight).toBe(0.3);
    });

    test('should create recognizer with custom parameters', () => {
      const recognizer = new PatternRecognizer(3, 8, 0.9, 3, 0.4);
      
      expect(recognizer.minPatternLength).toBe(3);
      expect(recognizer.maxPatternLength).toBe(8);
      expect(recognizer.similarityThreshold).toBe(0.9);
      expect(recognizer.frequencyThreshold).toBe(3);
      expect(recognizer.complexityWeight).toBe(0.4);
    });

    test('should validate parameter bounds', () => {
      expect(() => new PatternRecognizer(0)).toThrow(
        'Minimum pattern length must be between 1 and maximum pattern length'
      );
      expect(() => new PatternRecognizer(2, 1)).toThrow(
        'Minimum pattern length must be between 1 and maximum pattern length'
      );
      expect(() => new PatternRecognizer(2, 16, 1.1)).toThrow(
        'Similarity threshold must be between 0 and 1'
      );
      expect(() => new PatternRecognizer(2, 16, 0.8, 0)).toThrow(
        'Frequency threshold must be at least 1'
      );
      expect(() => new PatternRecognizer(2, 16, 0.8, 2, 1.1)).toThrow(
        'Complexity weight must be between 0 and 1'
      );
    });
  });

  describe('property setters', () => {
    test('should validate and set minimum pattern length', () => {
      const recognizer = new PatternRecognizer();
      
      recognizer.minPatternLength = 3;
      expect(recognizer.minPatternLength).toBe(3);
      
      expect(() => recognizer.minPatternLength = 0).toThrow(
        'Minimum pattern length must be between 1 and maximum pattern length'
      );
      expect(() => recognizer.minPatternLength = 20).toThrow(
        'Minimum pattern length must be between 1 and maximum pattern length'
      );
    });

    test('should validate and set maximum pattern length', () => {
      const recognizer = new PatternRecognizer();
      
      recognizer.maxPatternLength = 32;
      expect(recognizer.maxPatternLength).toBe(32);
      
      expect(() => recognizer.maxPatternLength = 1).toThrow(
        'Maximum pattern length must be between minimum pattern length and 64'
      );
      expect(() => recognizer.maxPatternLength = 100).toThrow(
        'Maximum pattern length must be between minimum pattern length and 64'
      );
    });

    test('should validate and set similarity threshold', () => {
      const recognizer = new PatternRecognizer();
      
      recognizer.similarityThreshold = 0.9;
      expect(recognizer.similarityThreshold).toBe(0.9);
      
      expect(() => recognizer.similarityThreshold = -0.1).toThrow(
        'Similarity threshold must be between 0 and 1'
      );
      expect(() => recognizer.similarityThreshold = 1.1).toThrow(
        'Similarity threshold must be between 0 and 1'
      );
    });

    test('should validate and set frequency threshold', () => {
      const recognizer = new PatternRecognizer();
      
      recognizer.frequencyThreshold = 3;
      expect(recognizer.frequencyThreshold).toBe(3);
      
      expect(() => recognizer.frequencyThreshold = 0).toThrow(
        'Frequency threshold must be at least 1'
      );
    });

    test('should validate and set complexity weight', () => {
      const recognizer = new PatternRecognizer();
      
      recognizer.complexityWeight = 0.5;
      expect(recognizer.complexityWeight).toBe(0.5);
      
      expect(() => recognizer.complexityWeight = -0.1).toThrow(
        'Complexity weight must be between 0 and 1'
      );
      expect(() => recognizer.complexityWeight = 1.1).toThrow(
        'Complexity weight must be between 0 and 1'
      );
    });
  });

  describe('pattern recognition', () => {
    test('should recognize patterns in quantum states', () => {
      const recognizer = new PatternRecognizer(2, 4, 0.8, 2);
      
      const patterns = recognizer.recognizePatterns(sampleStates);
      
      expect(patterns).toBeInstanceOf(Array);
      patterns.forEach(pattern => {
        expect(pattern.frequency).toBeGreaterThanOrEqual(2);
        expect(pattern.length).toBeGreaterThanOrEqual(2);
        expect(pattern.length).toBeLessThanOrEqual(4);
        expect(pattern.amplitudes).toBeInstanceOf(Array);
        expect(pattern.positions).toBeInstanceOf(Array);
        expect(pattern.significance).toBeGreaterThan(0);
      });
    });

    test('should return empty array for empty states', () => {
      const recognizer = new PatternRecognizer();
      
      const patterns = recognizer.recognizePatterns([]);
      
      expect(patterns).toEqual([]);
    });

    test('should filter patterns by frequency threshold', () => {
      const recognizer = new PatternRecognizer(2, 4, 0.8, 5); // High frequency threshold
      
      const patterns = recognizer.recognizePatterns(sampleStates);
      
      patterns.forEach(pattern => {
        expect(pattern.frequency).toBeGreaterThanOrEqual(5);
      });
    });

    test('should rank patterns by significance', () => {
      const recognizer = new PatternRecognizer(2, 4, 0.8, 1);
      
      const patterns = recognizer.recognizePatterns(sampleStates);
      
      for (let i = 1; i < patterns.length; i++) {
        expect(patterns[i].significance).toBeLessThanOrEqual(patterns[i - 1].significance);
      }
    });
  });

  describe('probability distribution analysis', () => {
    test('should analyze probability distributions', () => {
      const recognizer = new PatternRecognizer();
      
      const analysis = recognizer.analyzeProbabilityDistributions(sampleStates);
      
      expect(analysis.averageEntropy).toBeGreaterThanOrEqual(0);
      expect(analysis.entropyVariance).toBeGreaterThanOrEqual(0);
      expect(analysis.probabilityDistributions).toHaveLength(sampleStates.length);
      expect(analysis.dominantProbabilities).toBeInstanceOf(Array);
      expect(analysis.correlationMatrix).toBeInstanceOf(Array);
      expect(analysis.informationContent).toBeGreaterThanOrEqual(0);
      expect(analysis.compressionPotential).toBeGreaterThanOrEqual(0);
      expect(analysis.compressionPotential).toBeLessThanOrEqual(1);
    });

    test('should handle empty states array', () => {
      const recognizer = new PatternRecognizer();
      
      const analysis = recognizer.analyzeProbabilityDistributions([]);
      
      expect(analysis.averageEntropy).toBe(0);
      expect(analysis.entropyVariance).toBe(0);
      expect(analysis.probabilityDistributions).toEqual([]);
      expect(analysis.dominantProbabilities).toEqual([]);
      expect(analysis.correlationMatrix).toEqual([]);
      expect(analysis.informationContent).toBe(0);
      expect(analysis.compressionPotential).toBe(0);
    });

    test('should calculate correlation matrix correctly', () => {
      const recognizer = new PatternRecognizer();
      
      const analysis = recognizer.analyzeProbabilityDistributions(sampleStates);
      
      expect(analysis.correlationMatrix).toHaveLength(sampleStates.length);
      analysis.correlationMatrix.forEach((row, i) => {
        expect(row).toHaveLength(sampleStates.length);
        expect(row[i]).toBe(1); // Diagonal should be 1 (self-correlation)
        row.forEach(correlation => {
          expect(correlation).toBeGreaterThanOrEqual(0);
          expect(correlation).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('high probability state identification', () => {
    test('should identify high probability states', () => {
      const recognizer = new PatternRecognizer();
      const superposition = SuperpositionState.fromQuantumStates(sampleStates);
      
      const highProbStates = recognizer.identifyHighProbabilityStates(superposition, 0.05);
      
      expect(highProbStates).toBeInstanceOf(Array);
      highProbStates.forEach(state => {
        expect(state.probability).toBeGreaterThanOrEqual(0.05);
        expect(state.amplitude).toBeInstanceOf(Complex);
        expect(state.magnitude).toBeGreaterThanOrEqual(0);
        expect(state.phase).toBeGreaterThanOrEqual(0);
        expect(state.significance).toBeGreaterThan(0);
        expect(state.compressionValue).toBeGreaterThanOrEqual(0);
      });
    });

    test('should sort high probability states by significance', () => {
      const recognizer = new PatternRecognizer();
      const superposition = SuperpositionState.fromQuantumStates(sampleStates);
      
      const highProbStates = recognizer.identifyHighProbabilityStates(superposition, 0.01);
      
      for (let i = 1; i < highProbStates.length; i++) {
        expect(highProbStates[i].significance).toBeLessThanOrEqual(highProbStates[i - 1].significance);
      }
    });

    test('should filter by probability threshold', () => {
      const recognizer = new PatternRecognizer();
      const superposition = SuperpositionState.fromQuantumStates(sampleStates);
      const threshold = 0.2;
      
      const highProbStates = recognizer.identifyHighProbabilityStates(superposition, threshold);
      
      highProbStates.forEach(state => {
        expect(state.probability).toBeGreaterThanOrEqual(threshold);
      });
    });
  });

  describe('interference pattern detection', () => {
    test('should detect interference patterns between states', () => {
      const recognizer = new PatternRecognizer();
      
      const interferencePatterns = recognizer.detectInterferencePatterns(sampleStates);
      
      expect(interferencePatterns).toBeInstanceOf(Array);
      interferencePatterns.forEach(pattern => {
        expect(['constructive', 'destructive']).toContain(pattern.type);
        expect(pattern.strength).toBeGreaterThan(0);
        expect(pattern.correlation).toBeGreaterThanOrEqual(0);
        expect(pattern.correlation).toBeLessThanOrEqual(1);
        expect(pattern.amplitudeIndices).toBeInstanceOf(Array);
      });
    });

    test('should return empty array for insufficient states', () => {
      const recognizer = new PatternRecognizer();
      const singleState = [sampleStates[0]];
      
      const interferencePatterns = recognizer.detectInterferencePatterns(singleState);
      
      expect(interferencePatterns).toEqual([]);
    });

    test('should sort interference patterns by strength', () => {
      const recognizer = new PatternRecognizer();
      
      const interferencePatterns = recognizer.detectInterferencePatterns(sampleStates);
      
      for (let i = 1; i < interferencePatterns.length; i++) {
        expect(interferencePatterns[i].strength).toBeLessThanOrEqual(interferencePatterns[i - 1].strength);
      }
    });
  });

  describe('compression efficiency calculation', () => {
    test('should calculate pattern compression efficiency', () => {
      const recognizer = new PatternRecognizer(2, 4, 0.8, 2);
      const patterns = recognizer.recognizePatterns(sampleStates);
      
      const efficiency = recognizer.calculatePatternCompressionEfficiency(patterns);
      
      expect(efficiency.totalPatterns).toBe(patterns.length);
      expect(efficiency.averageFrequency).toBeGreaterThan(0);
      expect(efficiency.compressionRatio).toBeGreaterThanOrEqual(1);
      expect(efficiency.spaceSavings).toBeGreaterThanOrEqual(0);
      expect(efficiency.efficiencyScore).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty patterns array', () => {
      const recognizer = new PatternRecognizer();
      
      const efficiency = recognizer.calculatePatternCompressionEfficiency([]);
      
      expect(efficiency.totalPatterns).toBe(0);
      expect(efficiency.averageFrequency).toBe(0);
      expect(efficiency.compressionRatio).toBe(1);
      expect(efficiency.spaceSavings).toBe(0);
      expect(efficiency.efficiencyScore).toBe(0);
    });
  });

  describe('pattern optimization', () => {
    test('should optimize patterns for compression', () => {
      const recognizer = new PatternRecognizer(2, 4, 0.8, 2);
      const patterns = recognizer.recognizePatterns(sampleStates);
      
      const optimized = recognizer.optimizePatternsForCompression(patterns);
      
      expect(optimized).toBeInstanceOf(Array);
      optimized.forEach(opt => {
        expect(opt.representativePattern).toBeDefined();
        expect(opt.groupSize).toBeGreaterThan(0);
        expect(opt.totalFrequency).toBeGreaterThan(0);
        expect(opt.averageComplexity).toBeGreaterThanOrEqual(0);
        expect(opt.totalSignificance).toBeGreaterThan(0);
        expect(opt.compressionValue).toBeGreaterThanOrEqual(0);
        expect(opt.patterns).toBeInstanceOf(Array);
      });
    });

    test('should sort optimized patterns by compression value', () => {
      const recognizer = new PatternRecognizer(2, 4, 0.8, 2);
      const patterns = recognizer.recognizePatterns(sampleStates);
      
      const optimized = recognizer.optimizePatternsForCompression(patterns);
      
      for (let i = 1; i < optimized.length; i++) {
        expect(optimized[i].compressionValue).toBeLessThanOrEqual(optimized[i - 1].compressionValue);
      }
    });

    test('should handle empty patterns array', () => {
      const recognizer = new PatternRecognizer();
      
      const optimized = recognizer.optimizePatternsForCompression([]);
      
      expect(optimized).toEqual([]);
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle states with different amplitude counts', () => {
      const recognizer = new PatternRecognizer();
      const mixedStates = [
        new QuantumStateVector([new Complex(1, 0)]),
        new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8), new Complex(0.1, 0)])
      ];
      
      const patterns = recognizer.recognizePatterns(mixedStates);
      
      expect(patterns).toBeInstanceOf(Array);
    });

    test('should handle very small pattern lengths', () => {
      const recognizer = new PatternRecognizer(1, 2, 0.8, 1);
      
      const patterns = recognizer.recognizePatterns(sampleStates);
      
      expect(patterns).toBeInstanceOf(Array);
      patterns.forEach(pattern => {
        expect(pattern.length).toBeGreaterThanOrEqual(1);
        expect(pattern.length).toBeLessThanOrEqual(2);
      });
    });

    test('should handle high similarity threshold', () => {
      const recognizer = new PatternRecognizer(2, 4, 0.99, 2); // Very high similarity
      
      const patterns = recognizer.recognizePatterns(sampleStates);
      const optimized = recognizer.optimizePatternsForCompression(patterns);
      
      expect(optimized).toBeInstanceOf(Array);
    });

    test('should handle single state array', () => {
      const recognizer = new PatternRecognizer();
      const singleState = [sampleStates[0]];
      
      const analysis = recognizer.analyzeProbabilityDistributions(singleState);
      
      expect(analysis.probabilityDistributions).toHaveLength(1);
      expect(analysis.correlationMatrix).toHaveLength(1);
      expect(analysis.correlationMatrix[0]).toHaveLength(1);
      expect(analysis.correlationMatrix[0][0]).toBe(1);
    });
  });
});