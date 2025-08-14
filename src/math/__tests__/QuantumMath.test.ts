import { QuantumMath } from '../QuantumMath';
import { Complex } from '../Complex';

describe('QuantumMath', () => {
  describe('hadamardTransform', () => {
    test('should create superposition with equal amplitudes', () => {
      const input = new Complex(1, 0);
      const [state1, state2] = QuantumMath.hadamardTransform(input);
      
      const expectedAmplitude = 1 / Math.sqrt(2);
      expect(state1.real).toBeCloseTo(expectedAmplitude, 10);
      expect(state2.real).toBeCloseTo(expectedAmplitude, 10);
    });
  });

  describe('probabilityFromAmplitude', () => {
    test('should calculate probability from amplitude', () => {
      const amplitude = new Complex(0.6, 0.8);
      const probability = QuantumMath.probabilityFromAmplitude(amplitude);
      expect(probability).toBeCloseTo(1, 10); // 0.6² + 0.8² = 1
    });
  });

  describe('normalizeAmplitudes', () => {
    test('should normalize amplitudes to unit probability', () => {
      const amplitudes = [
        new Complex(2, 0),
        new Complex(0, 3),
        new Complex(1, 1)
      ];
      
      const normalized = QuantumMath.normalizeAmplitudes(amplitudes);
      const totalProbability = normalized.reduce(
        (sum, amp) => sum + amp.magnitudeSquared(), 
        0
      );
      
      expect(totalProbability).toBeCloseTo(1, 10);
    });

    test('should throw error for zero amplitudes', () => {
      const amplitudes = [new Complex(0, 0), new Complex(0, 0)];
      expect(() => QuantumMath.normalizeAmplitudes(amplitudes))
        .toThrow('Cannot normalize zero amplitudes');
    });
  });

  describe('calculateQuantumPhase', () => {
    test('should map byte values to phase range', () => {
      expect(QuantumMath.calculateQuantumPhase(0)).toBe(0);
      expect(QuantumMath.calculateQuantumPhase(255)).toBeCloseTo(2 * Math.PI, 10);
      // 127.5/255 * 2π = π, so let's test the actual calculation
      const expectedPhase = (128 / 255) * 2 * Math.PI;
      expect(QuantumMath.calculateQuantumPhase(128)).toBeCloseTo(expectedPhase, 10);
    });
  });

  describe('createSuperposition', () => {
    test('should create weighted superposition', () => {
      const state1 = new Complex(1, 0);
      const state2 = new Complex(0, 1);
      const superposition = QuantumMath.createSuperposition(state1, state2, 0.25);
      
      // Weight 0.25 means √0.25 = 0.5 for state1, √0.75 ≈ 0.866 for state2
      expect(superposition.real).toBeCloseTo(0.5, 10);
      expect(superposition.imaginary).toBeCloseTo(0.866, 3);
    });
  });

  describe('calculateCorrelation', () => {
    test('should calculate correlation between amplitude arrays', () => {
      const amp1 = [new Complex(1, 0), new Complex(0, 1)];
      const amp2 = [new Complex(1, 0), new Complex(0, 1)];
      
      const correlation = QuantumMath.calculateCorrelation(amp1, amp2);
      expect(correlation).toBeCloseTo(1, 10);
    });

    test('should throw error for mismatched array lengths', () => {
      const amp1 = [new Complex(1, 0)];
      const amp2 = [new Complex(1, 0), new Complex(0, 1)];
      
      expect(() => QuantumMath.calculateCorrelation(amp1, amp2))
        .toThrow('Amplitude arrays must have same length');
    });
  });

  describe('applyInterference', () => {
    test('should apply constructive interference', () => {
      const amp1 = [new Complex(0.5, 0)];
      const amp2 = [new Complex(0.5, 0)];
      
      const result = QuantumMath.applyInterference(amp1, amp2, 'constructive');
      expect(result[0].real).toBeCloseTo(1, 10);
    });

    test('should apply destructive interference', () => {
      const amp1 = [new Complex(1, 0)];
      const amp2 = [new Complex(1, 0)];
      
      const result = QuantumMath.applyInterference(amp1, amp2, 'destructive');
      expect(result[0].real).toBeCloseTo(0, 10);
      expect(result[0].imaginary).toBeCloseTo(0, 10);
    });
  });

  describe('calculateEntropy', () => {
    test('should calculate entropy of probability distribution', () => {
      const probabilities = [0.5, 0.5];
      const entropy = QuantumMath.calculateEntropy(probabilities);
      expect(entropy).toBeCloseTo(1, 10); // Maximum entropy for 2 states
    });

    test('should handle zero probabilities', () => {
      const probabilities = [1, 0];
      const entropy = QuantumMath.calculateEntropy(probabilities);
      expect(entropy).toBe(0); // Minimum entropy
    });
  });

  describe('quantumHash', () => {
    test('should generate consistent hash for same data', () => {
      const data = Buffer.from('test data');
      const hash1 = QuantumMath.quantumHash(data);
      const hash2 = QuantumMath.quantumHash(data);
      expect(hash1).toBe(hash2);
    });

    test('should generate different hashes for different data', () => {
      const data1 = Buffer.from('test data 1');
      const data2 = Buffer.from('test data 2');
      const hash1 = QuantumMath.quantumHash(data1);
      const hash2 = QuantumMath.quantumHash(data2);
      expect(hash1).not.toBe(hash2);
    });
  });
});