import { EntanglementPair } from '../EntanglementPair';
import { QuantumStateVector } from '../QuantumStateVector';
import { Complex } from '../../math/Complex';

describe('EntanglementPair', () => {
  describe('constructor and basic properties', () => {
    test('should create entanglement pair from two quantum states', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0), new Complex(0, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]);
      
      const pair = new EntanglementPair(stateA, stateB);
      
      expect(pair.stateA).toBeInstanceOf(QuantumStateVector);
      expect(pair.stateB).toBeInstanceOf(QuantumStateVector);
      expect(pair.correlationStrength).toBeGreaterThan(0);
      expect(pair.entanglementId).toBeDefined();
      expect(pair.sharedInformation).toBeInstanceOf(Buffer);
    });

    test('should set entanglement IDs on both states', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.9, 0)]);
      
      const pair = new EntanglementPair(stateA, stateB);
      
      expect(pair.stateA.entanglementId).toBe(pair.entanglementId);
      expect(pair.stateB.entanglementId).toBe(pair.entanglementId);
    });

    test('should throw error for states with insufficient correlation', () => {
      // Create states with very low correlation by using different amplitude patterns
      const stateA = new QuantumStateVector([new Complex(1, 0), new Complex(0, 0)]);
      const stateB = new QuantumStateVector([new Complex(0, 0), new Complex(0, 1)]);
      
      expect(() => new EntanglementPair(stateA, stateB)).toThrow(
        'States must have minimum correlation to form entanglement'
      );
    });
  });

  describe('createIfCorrelated factory method', () => {
    test('should create entanglement for correlated states', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0), new Complex(0, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.9, 0), new Complex(0, 0.436)]);
      
      const pair = EntanglementPair.createIfCorrelated(stateA, stateB, 0.3);
      
      expect(pair).toBeInstanceOf(EntanglementPair);
      expect(pair!.correlationStrength).toBeGreaterThanOrEqual(0.3);
    });

    test('should return null for uncorrelated states', () => {
      // Create states with very low correlation
      const stateA = new QuantumStateVector([new Complex(1, 0), new Complex(0, 0)]);
      const stateB = new QuantumStateVector([new Complex(0, 0), new Complex(0, 1)]);
      
      const pair = EntanglementPair.createIfCorrelated(stateA, stateB, 0.8);
      
      expect(pair).toBeNull();
    });
  });

  describe('findEntanglementPairs factory method', () => {
    test('should find entanglement pairs from array of states', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0.9, 0)]);
      const state3 = new QuantumStateVector([new Complex(0, 1)]);
      const state4 = new QuantumStateVector([new Complex(0, 0.9)]);
      
      const pairs = EntanglementPair.findEntanglementPairs([state1, state2, state3, state4], 0.3);
      
      expect(pairs.length).toBeGreaterThan(0);
      pairs.forEach(pair => {
        expect(pair.correlationStrength).toBeGreaterThanOrEqual(0.3);
      });
    });

    test('should not reuse states in multiple pairs', () => {
      const state1 = new QuantumStateVector([new Complex(1, 0)]);
      const state2 = new QuantumStateVector([new Complex(0.9, 0)]);
      const state3 = new QuantumStateVector([new Complex(0.8, 0)]);
      
      const pairs = EntanglementPair.findEntanglementPairs([state1, state2, state3], 0.3);
      
      // Each state should appear in at most one pair
      const usedStates = new Set();
      pairs.forEach(pair => {
        expect(usedStates.has(pair.stateA)).toBe(false);
        expect(usedStates.has(pair.stateB)).toBe(false);
        usedStates.add(pair.stateA);
        usedStates.add(pair.stateB);
      });
    });
  });

  describe('fromDataPatterns factory method', () => {
    test('should create entanglement from correlated data patterns', () => {
      const patternA = Buffer.from([100, 150, 200]);
      const patternB = Buffer.from([105, 145, 195]); // Similar pattern
      
      const pair = EntanglementPair.fromDataPatterns(patternA, patternB, 0.1);
      
      expect(pair).toBeInstanceOf(EntanglementPair);
    });

    test('should return null for uncorrelated patterns', () => {
      const patternA = Buffer.from([100, 150, 200]);
      const patternB = Buffer.from([50, 25, 75]); // Very different pattern
      
      const pair = EntanglementPair.fromDataPatterns(patternA, patternB, 0.8);
      
      expect(pair).toBeNull();
    });
  });

  describe('entanglement operations', () => {
    test('should validate entanglement', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.8, 0)]);
      
      const pair = new EntanglementPair(stateA, stateB);
      
      expect(pair.isValid(0.1)).toBe(true);
    });

    test('should measure correlated states', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.9, 0)]);
      
      const pair = new EntanglementPair(stateA, stateB);
      const measurement = pair.measureCorrelatedStates();
      
      expect(measurement.stateABytes).toBeInstanceOf(Buffer);
      expect(measurement.stateBBytes).toBeInstanceOf(Buffer);
      expect(measurement.correlation).toBe(pair.correlationStrength);
    });

    test('should apply correlated phase shift', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.9, 0)]);
      
      const pair = new EntanglementPair(stateA, stateB);
      const shifted = pair.applyCorrelatedPhaseShift(Math.PI / 4);
      
      expect(shifted).toBeInstanceOf(EntanglementPair);
      expect(shifted.entanglementId).not.toBe(pair.entanglementId); // New pair
    });

    test('should break entanglement', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.9, 0)]);
      
      const pair = new EntanglementPair(stateA, stateB);
      const { stateA: independentA, stateB: independentB } = pair.breakEntanglement();
      
      expect(independentA).toBeInstanceOf(QuantumStateVector);
      expect(independentB).toBeInstanceOf(QuantumStateVector);
    });
  });

  describe('information theory', () => {
    test('should calculate mutual information', () => {
      const stateA = new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]);
      const stateB = new QuantumStateVector([new Complex(0.7, 0), new Complex(0, 0.714)]);
      
      const pair = new EntanglementPair(stateA, stateB);
      const mutualInfo = pair.calculateMutualInformation();
      
      expect(mutualInfo).toBeGreaterThanOrEqual(0);
    });

    test('should calculate compression benefit', () => {
      const stateA = new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]);
      const stateB = new QuantumStateVector([new Complex(0.7, 0), new Complex(0, 0.714)]);
      
      const pair = new EntanglementPair(stateA, stateB);
      const benefit = pair.getCompressionBenefit();
      
      expect(benefit).toBeGreaterThanOrEqual(0);
    });
  });

  describe('utility methods', () => {
    test('should check equality of entanglement pairs', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.9, 0)]);
      
      const pair1 = new EntanglementPair(stateA, stateB);
      const pair2 = new EntanglementPair(stateA, stateB);
      
      expect(pair1.equals(pair2)).toBe(true);
    });

    test('should check equality with reversed states', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.9, 0)]);
      
      const pair1 = new EntanglementPair(stateA, stateB);
      const pair2 = new EntanglementPair(stateB, stateA);
      
      expect(pair1.equals(pair2)).toBe(true);
    });

    test('should clone entanglement pair', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.9, 0)]);
      
      const original = new EntanglementPair(stateA, stateB);
      const cloned = original.clone();
      
      expect(cloned.correlationStrength).toBe(original.correlationStrength);
      expect(cloned.entanglementId).not.toBe(original.entanglementId); // New ID
      expect(cloned).not.toBe(original);
    });

    test('should generate string representation', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.9, 0)]);
      
      const pair = new EntanglementPair(stateA, stateB);
      const str = pair.toString();
      
      expect(str).toContain('EntanglementPair');
      expect(str).toContain('correlation');
      expect(str).toContain('shared');
      expect(str).toContain('benefit');
    });

    test('should have creation time', () => {
      const stateA = new QuantumStateVector([new Complex(1, 0)]);
      const stateB = new QuantumStateVector([new Complex(0.9, 0)]);
      
      const before = Date.now();
      const pair = new EntanglementPair(stateA, stateB);
      const after = Date.now();
      
      expect(pair.creationTime).toBeGreaterThanOrEqual(before);
      expect(pair.creationTime).toBeLessThanOrEqual(after);
    });
  });
});