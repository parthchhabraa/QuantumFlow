import { SuperpositionState, PatternProbability } from '../SuperpositionState';
import { QuantumStateVector } from '../QuantumStateVector';
import { Complex } from '../../math/Complex';

describe('SuperpositionState', () => {
  describe('constructor and basic properties', () => {
    test('should create superposition state with amplitudes and constituent states', () => {
      const amplitudes = [new Complex(0.6, 0), new Complex(0, 0.8)];
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      const weights = [0.5, 0.5];
      
      const superposition = new SuperpositionState(amplitudes, [state1, state2], weights);
      
      expect(superposition.combinedAmplitudes).toHaveLength(2);
      expect(superposition.constituentStates).toHaveLength(2);
      expect(superposition.weights).toEqual([0.5, 0.5]);
      expect(superposition.coherenceTime).toBe(1.0);
    });

    test('should throw error for empty amplitudes', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const weights = [1.0];
      
      expect(() => new SuperpositionState([], [state1], weights)).toThrow(
        'SuperpositionState must have at least one amplitude'
      );
    });

    test('should throw error for empty constituent states', () => {
      const amplitudes = [new Complex(1, 0)];
      const weights: number[] = [];
      
      expect(() => new SuperpositionState(amplitudes, [], weights)).toThrow(
        'SuperpositionState must have at least one constituent state'
      );
    });

    test('should throw error for mismatched weights and states', () => {
      const amplitudes = [new Complex(1, 0)];
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const weights = [0.5, 0.5]; // Wrong length
      
      expect(() => new SuperpositionState(amplitudes, [state1], weights)).toThrow(
        'Weights array must match constituent states array length'
      );
    });
  });

  describe('fromQuantumStates factory method', () => {
    test('should create superposition from quantum states', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      
      const superposition = SuperpositionState.fromQuantumStates([state1, state2]);
      
      expect(superposition.constituentStates).toHaveLength(2);
      expect(superposition.weights).toEqual([0.5, 0.5]);
    });

    test('should use custom weights', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      const weights = [0.3, 0.7];
      
      const superposition = SuperpositionState.fromQuantumStates([state1, state2], weights);
      
      expect(superposition.weights).toEqual([0.3, 0.7]);
    });

    test('should normalize weights that don\'t sum to 1', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      const weights = [1, 2]; // Sum = 3
      
      const superposition = SuperpositionState.fromQuantumStates([state1, state2], weights);
      
      expect(superposition.weights[0]).toBeCloseTo(1/3, 10);
      expect(superposition.weights[1]).toBeCloseTo(2/3, 10);
    });

    test('should throw error for empty states array', () => {
      expect(() => SuperpositionState.fromQuantumStates([])).toThrow(
        'Cannot create superposition from empty states array'
      );
    });
  });

  describe('fromDataPatterns factory method', () => {
    test('should create superposition from data patterns', () => {
      const pattern1 = Buffer.from([100, 150]);
      const pattern2 = Buffer.from([200, 50]);
      
      const superposition = SuperpositionState.fromDataPatterns([pattern1, pattern2]);
      
      expect(superposition.constituentStates).toHaveLength(2);
    });

    test('should throw error for empty patterns array', () => {
      expect(() => SuperpositionState.fromDataPatterns([])).toThrow(
        'Cannot create superposition from empty data patterns'
      );
    });
  });

  describe('probability analysis', () => {
    test('should analyze probability amplitudes', () => {
      const state1 = new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]);
      const state2 = new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8)]);
      
      const superposition = SuperpositionState.fromQuantumStates([state1, state2]);
      const patterns = superposition.analyzeProbabilityAmplitudes();
      
      expect(patterns).toHaveLength(2);
      expect(patterns[0].probability).toBeGreaterThanOrEqual(patterns[1].probability);
    });

    test('should get dominant patterns above threshold', () => {
      const state1 = new QuantumStateVector([new Complex(0.9, 0), new Complex(0, 0.436)]);
      const state2 = new QuantumStateVector([new Complex(0.1, 0), new Complex(0, 0.995)]);
      
      const superposition = SuperpositionState.fromQuantumStates([state1, state2]);
      const dominantPatterns = superposition.getDominantPatterns(0.3);
      
      expect(dominantPatterns.length).toBeGreaterThan(0);
      dominantPatterns.forEach(pattern => {
        expect(pattern.probability).toBeGreaterThanOrEqual(0.3);
      });
    });

    test('should calculate entropy', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      
      const superposition = SuperpositionState.fromQuantumStates([state1, state2]);
      const entropy = superposition.calculateEntropy();
      
      expect(entropy).toBeGreaterThanOrEqual(-1e-10); // Allow for floating point precision
    });
  });

  describe('quantum operations', () => {
    test('should apply decoherence', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      
      const superposition = SuperpositionState.fromQuantumStates([state1, state2], undefined, 1.0);
      const decoherent = superposition.applyDecoherence(0.3);
      
      expect(decoherent.coherenceTime).toBe(0.7);
      expect(decoherent.isCoherent()).toBe(true);
    });

    test('should become incoherent after sufficient decoherence', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      
      const superposition = SuperpositionState.fromQuantumStates([state1, state2], undefined, 0.2);
      const decoherent = superposition.applyDecoherence(0.15);
      
      expect(decoherent.isCoherent(0.1)).toBe(false);
    });

    test('should measure superposition state', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      
      const superposition = SuperpositionState.fromQuantumStates([state1, state2]);
      const measurement = superposition.measure();
      
      expect(measurement.stateIndex).toBeGreaterThanOrEqual(0);
      expect(measurement.stateIndex).toBeLessThan(2);
      expect(measurement.probability).toBeGreaterThan(0);
      expect(measurement.collapsedState).toBeInstanceOf(QuantumStateVector);
    });
  });

  describe('validation', () => {
    test('should validate coherence time', () => {
      const amplitudes = [new Complex(1, 0)];
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const weights = [1.0];
      
      expect(() => new SuperpositionState(amplitudes, [state1], weights, -0.1)).toThrow(
        'Coherence time cannot be negative'
      );
    });

    test('should validate weights sum to 1', () => {
      const amplitudes = [new Complex(1, 0)];
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const weights = [0.5]; // Doesn't sum to 1
      
      expect(() => new SuperpositionState(amplitudes, [state1], weights)).toThrow(
        'Weights must sum to 1'
      );
    });

    test('should validate non-negative weights', () => {
      const amplitudes = [new Complex(0.6, 0), new Complex(0, 0.8)];
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      const weights = [1.5, -0.5]; // Negative weight
      
      expect(() => new SuperpositionState(amplitudes, [state1, state2], weights)).toThrow(
        'All weights must be non-negative'
      );
    });
  });

  describe('utility methods', () => {
    test('should calculate total probability', () => {
      const state1 = new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8)]);
      const state2 = new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]);
      
      const superposition = SuperpositionState.fromQuantumStates([state1, state2]);
      const totalProb = superposition.getTotalProbability();
      
      expect(totalProb).toBeCloseTo(1, 10);
    });

    test('should clone superposition state', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      
      const original = SuperpositionState.fromQuantumStates([state1, state2]);
      const cloned = original.clone();
      
      expect(cloned.constituentStates).toHaveLength(original.constituentStates.length);
      expect(cloned.coherenceTime).toBe(original.coherenceTime);
      expect(cloned).not.toBe(original);
    });

    test('should generate string representation', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      
      const superposition = SuperpositionState.fromQuantumStates([state1, state2]);
      const str = superposition.toString();
      
      expect(str).toContain('SuperpositionState');
      expect(str).toContain('states: 2');
      expect(str).toContain('entropy');
      expect(str).toContain('coherence');
    });
  });
});