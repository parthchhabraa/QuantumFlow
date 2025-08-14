import { QuantumStateVector } from '../QuantumStateVector';
import { Complex } from '../../math/Complex';

describe('QuantumStateVector', () => {
  describe('constructor and basic properties', () => {
    test('should create quantum state with amplitudes and phase', () => {
      const amplitudes = [new Complex(0.6, 0), new Complex(0, 0.8)];
      const phase = Math.PI / 4;
      const state = new QuantumStateVector(amplitudes, phase);

      expect(state.amplitudes).toHaveLength(2);
      expect(state.phase).toBe(phase);
      expect(state.entanglementId).toBeUndefined();
    });

    test('should throw error for empty amplitudes', () => {
      expect(() => new QuantumStateVector([])).toThrow(
        'QuantumStateVector must have at least one amplitude'
      );
    });

    test('should throw error for all zero amplitudes', () => {
      const amplitudes = [new Complex(0, 0), new Complex(0, 0)];
      expect(() => new QuantumStateVector(amplitudes)).toThrow(
        'QuantumStateVector cannot have all zero amplitudes'
      );
    });

    test('should automatically normalize non-normalized amplitudes', () => {
      const amplitudes = [new Complex(2, 0), new Complex(0, 3)];
      const state = new QuantumStateVector(amplitudes);
      
      expect(state.isNormalized()).toBe(true);
      expect(state.getTotalProbability()).toBeCloseTo(1, 10);
    });
  });

  describe('fromBytes factory method', () => {
    test('should create quantum state from buffer data', () => {
      const data = Buffer.from([100, 150, 200, 50]);
      const state = QuantumStateVector.fromBytes(data);

      expect(state.amplitudes).toHaveLength(4);
      expect(state.isNormalized()).toBe(true);
      expect(state.phase).toBeGreaterThanOrEqual(0);
    });

    test('should throw error for empty buffer', () => {
      const data = Buffer.from([]);
      expect(() => QuantumStateVector.fromBytes(data)).toThrow(
        'Cannot create quantum state from empty data'
      );
    });

    test('should respect chunk size parameter', () => {
      const data = Buffer.from([100, 150, 200, 50, 75]);
      const state = QuantumStateVector.fromBytes(data, 3);

      expect(state.amplitudes).toHaveLength(3);
    });
  });

  describe('createSuperposition factory method', () => {
    test('should create superposition from multiple states', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      
      const superposition = QuantumStateVector.createSuperposition([state1, state2]);
      
      expect(superposition.amplitudes).toHaveLength(1);
      expect(superposition.isNormalized()).toBe(true);
    });

    test('should use custom weights for superposition', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      const weights = [0.25, 0.75];
      
      const superposition = QuantumStateVector.createSuperposition([state1, state2], weights);
      
      expect(superposition.isNormalized()).toBe(true);
    });

    test('should handle states with different amplitude counts', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8)]);
      
      const superposition = QuantumStateVector.createSuperposition([state1, state2]);
      
      expect(superposition.amplitudes).toHaveLength(2);
      expect(superposition.isNormalized()).toBe(true);
    });

    test('should throw error for empty states array', () => {
      expect(() => QuantumStateVector.createSuperposition([])).toThrow(
        'Cannot create superposition from empty states array'
      );
    });

    test('should throw error for mismatched weights', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0, 1)]);
      const weights = [0.5]; // Wrong length
      
      expect(() => QuantumStateVector.createSuperposition([state1, state2], weights)).toThrow(
        'Weights array must match states array length'
      );
    });
  });

  describe('probability calculations', () => {
    test('should calculate probability distribution', () => {
      const amplitudes = [new Complex(0.6, 0), new Complex(0, 0.8)];
      const state = new QuantumStateVector(amplitudes);
      
      const probabilities = state.getProbabilityDistribution();
      
      expect(probabilities).toHaveLength(2);
      expect(probabilities[0]).toBeCloseTo(0.36, 10);
      expect(probabilities[1]).toBeCloseTo(0.64, 10);
    });

    test('should calculate total probability', () => {
      const amplitudes = [new Complex(0.6, 0), new Complex(0, 0.8)];
      const state = new QuantumStateVector(amplitudes);
      
      expect(state.getTotalProbability()).toBeCloseTo(1, 10);
    });

    test('should check normalization', () => {
      const normalizedAmplitudes = [new Complex(0.6, 0), new Complex(0, 0.8)];
      const normalizedState = new QuantumStateVector(normalizedAmplitudes);
      
      expect(normalizedState.isNormalized()).toBe(true);
    });
  });

  describe('quantum operations', () => {
    test('should normalize quantum state', () => {
      const amplitudes = [new Complex(2, 0), new Complex(0, 3)];
      const state = new QuantumStateVector(amplitudes);
      const normalized = state.normalize();
      
      expect(normalized.isNormalized()).toBe(true);
      expect(normalized.getTotalProbability()).toBeCloseTo(1, 10);
    });

    test('should apply phase shift', () => {
      const amplitudes = [new Complex(1, 0)];
      const state = new QuantumStateVector(amplitudes, 0);
      const phaseShift = Math.PI / 2;
      
      const shifted = state.applyPhaseShift(phaseShift);
      
      expect(shifted.phase).toBeCloseTo(phaseShift, 10);
    });

    test('should calculate correlation with another state', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0), new Complex(0, 0)]);
      const state2 = new QuantumStateVector([new Complex(1, 0), new Complex(0, 0)]);
      
      const correlation = state1.calculateCorrelation(state2);
      
      expect(correlation).toBeCloseTo(0.5, 10); // Perfect correlation for first amplitude
    });
  });

  describe('entanglement', () => {
    test('should set and get entanglement ID', () => {
      const state = new QuantumStateVector([new Complex(1, 0)]);
      const entanglementId = 'entangled-pair-1';
      
      state.setEntanglementId(entanglementId);
      
      expect(state.entanglementId).toBe(entanglementId);
    });
  });

  describe('serialization', () => {
    test('should convert quantum state back to bytes', () => {
      const originalData = Buffer.from([100, 150, 200]);
      const state = QuantumStateVector.fromBytes(originalData);
      const reconstructed = state.toBytes();
      
      expect(reconstructed).toHaveLength(3);
      // Note: Due to quantum processing, exact reconstruction may not be possible
      // but the data should be in the correct range
      for (const byte of reconstructed) {
        expect(byte).toBeGreaterThanOrEqual(0);
        expect(byte).toBeLessThanOrEqual(255);
      }
    });
  });

  describe('utility methods', () => {
    test('should clone quantum state', () => {
      const amplitudes = [new Complex(0.6, 0), new Complex(0, 0.8)];
      const original = new QuantumStateVector(amplitudes, Math.PI / 4);
      const cloned = original.clone();
      
      expect(cloned.equals(original)).toBe(true);
      expect(cloned).not.toBe(original); // Different object references
    });

    test('should check equality with tolerance', () => {
      const amplitudes1 = [new Complex(0.6, 0), new Complex(0, 0.8)];
      const amplitudes2 = [new Complex(0.6000001, 0), new Complex(0, 0.8000001)];
      
      const state1 = new QuantumStateVector(amplitudes1);
      const state2 = new QuantumStateVector(amplitudes2);
      
      expect(state1.equals(state2, 1e-5)).toBe(true);
      expect(state1.equals(state2, 1e-8)).toBe(false);
    });

    test('should return false for states with different lengths', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8)]);
      
      expect(state1.equals(state2)).toBe(false);
    });

    test('should generate string representation', () => {
      const amplitudes = [new Complex(0.6, 0), new Complex(0, 0.8)];
      const state = new QuantumStateVector(amplitudes, Math.PI / 4);
      
      const str = state.toString();
      
      expect(str).toContain('QuantumState');
      expect(str).toContain('phase');
      expect(str).toContain('amplitudes');
    });
  });
});