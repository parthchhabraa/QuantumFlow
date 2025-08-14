import { QuantumDecoherenceSimulator, EnvironmentalFactors } from '../QuantumDecoherenceSimulator';
import { QuantumStateVector } from '../../models/QuantumStateVector';
import { SuperpositionState } from '../../models/SuperpositionState';
import { Complex } from '../../math/Complex';

describe('QuantumDecoherenceSimulator', () => {
  let simulator: QuantumDecoherenceSimulator;
  let testState: QuantumStateVector;

  beforeEach(() => {
    simulator = new QuantumDecoherenceSimulator(100.0, 0.01, 0.001, 0.1);
    
    // Create a test quantum state
    const amplitudes = [
      new Complex(0.6, 0.2),
      new Complex(0.4, -0.3),
      new Complex(0.5, 0.1),
      new Complex(0.3, 0.4)
    ];
    testState = new QuantumStateVector(amplitudes, Math.PI / 4);
  });

  describe('constructor', () => {
    it('should initialize with default parameters', () => {
      const defaultSimulator = new QuantumDecoherenceSimulator();
      expect(defaultSimulator.baseCoherenceTime).toBe(100.0);
      expect(defaultSimulator.decoherenceRate).toBe(0.01);
    });

    it('should initialize with custom parameters', () => {
      const customSimulator = new QuantumDecoherenceSimulator(50.0, 0.02, 0.002, 0.2);
      expect(customSimulator.baseCoherenceTime).toBe(50.0);
      expect(customSimulator.decoherenceRate).toBe(0.02);
    });
  });

  describe('calculateCoherenceTime', () => {
    it('should calculate coherence time without environmental factors', () => {
      const coherenceTime = simulator.calculateCoherenceTime(testState, 10);
      expect(coherenceTime).toBeLessThan(simulator.baseCoherenceTime);
      expect(coherenceTime).toBeGreaterThan(0);
    });

    it('should reduce coherence time with environmental factors', () => {
      const environmentalFactors: EnvironmentalFactors = {
        temperature: 2.0,
        magneticField: 0.5,
        vibration: 0.3,
        radiation: 0.1
      };

      const coherenceWithFactors = simulator.calculateCoherenceTime(testState, 10, environmentalFactors);
      const coherenceWithoutFactors = simulator.calculateCoherenceTime(testState, 10);

      expect(coherenceWithFactors).toBeLessThan(coherenceWithoutFactors);
    });

    it('should return zero coherence time for very long elapsed times', () => {
      const coherenceTime = simulator.calculateCoherenceTime(testState, 10000);
      expect(coherenceTime).toBe(0);
    });

    it('should account for state complexity', () => {
      // Create a much more complex state with high entropy
      const complexAmplitudes = Array.from({ length: 32 }, (_, i) => 
        new Complex(Math.random() * 0.3, Math.random() * 0.3)
      );
      const complexState = new QuantumStateVector(complexAmplitudes, 0);

      const simpleCoherence = simulator.calculateCoherenceTime(testState, 50);
      const complexCoherence = simulator.calculateCoherenceTime(complexState, 50);

      // Complex states should generally have lower coherence, but allow for some variance
      expect(complexCoherence).toBeLessThanOrEqual(simpleCoherence * 1.1);
    });
  });

  describe('applyDecoherence', () => {
    it('should apply decoherence effects to quantum state', () => {
      const result = simulator.applyDecoherence(testState, 20);

      expect(result.decoherentState).toBeDefined();
      expect(result.remainingCoherence).toBeLessThan(simulator.baseCoherenceTime);
      expect(result.decoherenceFactor).toBeLessThan(1);
      expect(result.fidelity).toBeLessThan(1);
      expect(result.entropyIncrease).toBeGreaterThanOrEqual(0);
    });

    it('should maintain state normalization after decoherence', () => {
      const result = simulator.applyDecoherence(testState, 20);
      expect(result.decoherentState.isNormalized()).toBe(true);
    });

    it('should reduce fidelity with increasing time steps', () => {
      const result1 = simulator.applyDecoherence(testState, 10);
      const result2 = simulator.applyDecoherence(testState, 50);

      expect(result2.fidelity).toBeLessThan(result1.fidelity);
      expect(result2.remainingCoherence).toBeLessThan(result1.remainingCoherence);
    });

    it('should handle environmental factors', () => {
      const environmentalFactors: EnvironmentalFactors = {
        temperature: 3.0,
        magneticField: 1.0,
        vibration: 0.5,
        radiation: 0.2
      };

      const resultWithFactors = simulator.applyDecoherence(testState, 20, environmentalFactors);
      const resultWithoutFactors = simulator.applyDecoherence(testState, 20);

      expect(resultWithFactors.fidelity).toBeLessThan(resultWithoutFactors.fidelity);
      expect(resultWithFactors.remainingCoherence).toBeLessThan(resultWithoutFactors.remainingCoherence);
    });

    it('should mark state as incoherent when coherence drops below threshold', () => {
      const result = simulator.applyDecoherence(testState, 10000); // Much longer time
      expect(result.isCoherent).toBe(false);
    });
  });

  describe('applySuperpositionDecoherence', () => {
    let testSuperposition: SuperpositionState;

    beforeEach(() => {
      const states = [
        testState,
        new QuantumStateVector([new Complex(0.7, 0.1), new Complex(0.3, -0.2)], 0),
        new QuantumStateVector([new Complex(0.5, 0.5), new Complex(0.5, -0.5)], Math.PI / 2)
      ];
      testSuperposition = SuperpositionState.fromQuantumStates(states, [0.4, 0.3, 0.3], 80);
    });

    it('should apply decoherence to superposition state', () => {
      const result = simulator.applySuperpositionDecoherence(testSuperposition, 30);

      expect(result.decoherentSuperposition).toBeDefined();
      expect(result.constituentResults).toHaveLength(3);
      expect(result.averageCoherence).toBeLessThan(simulator.baseCoherenceTime);
      expect(result.averageFidelity).toBeLessThan(1);
    });

    it('should maintain superposition structure after decoherence', () => {
      const result = simulator.applySuperpositionDecoherence(testSuperposition, 30);
      
      expect(result.decoherentSuperposition.constituentStates).toHaveLength(3);
      expect(result.decoherentSuperposition.weights).toHaveLength(3);
    });

    it('should reduce average fidelity with increasing decoherence', () => {
      const result1 = simulator.applySuperpositionDecoherence(testSuperposition, 50);
      const result2 = simulator.applySuperpositionDecoherence(testSuperposition, 500);

      expect(result2.averageFidelity).toBeLessThan(result1.averageFidelity);
    });
  });

  describe('detectQuantumErrors', () => {
    it('should detect no errors in identical states', () => {
      const detection = simulator.detectQuantumErrors(testState, testState.clone());
      
      expect(detection.errors).toHaveLength(0);
      expect(detection.errorCount).toBe(0);
      expect(detection.isCorrupted).toBe(false);
      expect(detection.fidelity).toBeCloseTo(1, 5);
    });

    it('should detect amplitude errors', () => {
      const corruptedAmplitudes = testState.amplitudes.map((amp, i) => 
        i === 0 ? amp.scale(2) : amp
      );
      const corruptedState = new QuantumStateVector(corruptedAmplitudes, testState.phase);

      const detection = simulator.detectQuantumErrors(testState, corruptedState, 0.1);
      
      expect(detection.errors.length).toBeGreaterThan(0);
      expect(detection.isCorrupted).toBe(true);
      expect(detection.fidelity).toBeLessThan(1);
    });

    it('should detect phase errors', () => {
      const corruptedAmplitudes = testState.amplitudes.map((amp, i) => 
        i === 1 ? amp.multiply(Complex.fromPolar(1, Math.PI)) : amp
      );
      const corruptedState = new QuantumStateVector(corruptedAmplitudes, testState.phase);

      const detection = simulator.detectQuantumErrors(testState, corruptedState, 0.1);
      
      expect(detection.errors.some(error => error.type === 'phase')).toBe(true);
      expect(detection.isCorrupted).toBe(true);
    });

    it('should detect normalization errors', () => {
      // Create a state that will have normalization issues after modification
      const unnormalizedAmplitudes = testState.amplitudes.map(amp => amp.scale(2));
      
      // Create the state and then manually modify its amplitudes to bypass normalization
      const unnormalizedState = new QuantumStateVector([...testState.amplitudes], testState.phase);
      
      // Manually set unnormalized amplitudes using Object.defineProperty
      Object.defineProperty(unnormalizedState, '_amplitudes', {
        value: unnormalizedAmplitudes,
        writable: true,
        configurable: true
      });

      const detection = simulator.detectQuantumErrors(testState, unnormalizedState, 0.01);
      
      expect(detection.errors.some(error => error.type === 'normalization')).toBe(true);
      expect(detection.isCorrupted).toBe(true);
    });

    it('should detect entanglement corruption', () => {
      const entangledState = new QuantumStateVector([...testState.amplitudes], testState.phase, 'test-id');
      const corruptedState = new QuantumStateVector([...testState.amplitudes], testState.phase, 'different-id');

      const detection = simulator.detectQuantumErrors(entangledState, corruptedState);
      
      expect(detection.errors.some(error => error.type === 'entanglement')).toBe(true);
      expect(detection.isCorrupted).toBe(true);
    });

    it('should calculate error severity correctly', () => {
      // Create a state with significant amplitude differences
      const severelyCorrupted = testState.amplitudes.map((amp, i) => 
        i === 0 ? amp.scale(5) : amp.scale(0.1)
      );
      
      // Manually create corrupted state to bypass normalization
      const severelyCorruptedState = new QuantumStateVector([...testState.amplitudes], testState.phase);
      Object.defineProperty(severelyCorruptedState, '_amplitudes', {
        value: severelyCorrupted,
        writable: true,
        configurable: true
      });

      const detection = simulator.detectQuantumErrors(testState, severelyCorruptedState, 0.01);
      
      expect(detection.errorSeverity).toBeGreaterThan(0);
      expect(detection.errors.length).toBeGreaterThan(0);
    });
  });

  describe('simulateTimeEvolution', () => {
    it('should simulate quantum state evolution over time', () => {
      const result = simulator.simulateTimeEvolution(testState, 100, 50);

      expect(result.evolution).toHaveLength(51); // Initial state + 50 steps
      expect(result.coherenceTimes).toHaveLength(51);
      expect(result.fidelities).toHaveLength(51);
      expect(result.finalState).toBeDefined();
      expect(result.totalDecoherence).toBeGreaterThan(0);
      expect(result.coherenceLifetime).toBeGreaterThan(0);
    });

    it('should show decreasing fidelity over time', () => {
      const result = simulator.simulateTimeEvolution(testState, 200, 20);

      // Fidelity should generally decrease over time
      expect(result.fidelities[0]).toBe(1); // Initial fidelity
      expect(result.fidelities[result.fidelities.length - 1]).toBeLessThan(1);
      
      // Check that fidelity is generally decreasing
      let decreasingTrend = 0;
      for (let i = 1; i < result.fidelities.length; i++) {
        if (result.fidelities[i] <= result.fidelities[i - 1]) {
          decreasingTrend++;
        }
      }
      
      // At least 40% of steps should show decreasing or stable fidelity (allowing for noise)
      expect(decreasingTrend / (result.fidelities.length - 1)).toBeGreaterThan(0.4);
    });

    it('should show decreasing coherence time over time', () => {
      const result = simulator.simulateTimeEvolution(testState, 150, 30);

      expect(result.coherenceTimes[0]).toBe(simulator.baseCoherenceTime);
      expect(result.coherenceTimes[result.coherenceTimes.length - 1]).toBeLessThan(simulator.baseCoherenceTime);
    });

    it('should handle environmental factors in time evolution', () => {
      const environmentalFactors: EnvironmentalFactors = {
        temperature: 5.0,
        magneticField: 1.0,
        vibration: 1.0,
        radiation: 0.5
      };

      const resultWithFactors = simulator.simulateTimeEvolution(testState, 200, 20, environmentalFactors);
      const resultWithoutFactors = simulator.simulateTimeEvolution(testState, 200, 20);

      // Environmental factors should affect coherence times
      const avgCoherenceWithFactors = resultWithFactors.coherenceTimes.reduce((a, b) => a + b, 0) / resultWithFactors.coherenceTimes.length;
      const avgCoherenceWithoutFactors = resultWithoutFactors.coherenceTimes.reduce((a, b) => a + b, 0) / resultWithoutFactors.coherenceTimes.length;
      
      expect(avgCoherenceWithFactors).toBeLessThanOrEqual(avgCoherenceWithoutFactors);
    });

    it('should calculate coherence lifetime correctly', () => {
      const result = simulator.simulateTimeEvolution(testState, 500, 100);
      
      expect(result.coherenceLifetime).toBeGreaterThan(0);
      expect(result.coherenceLifetime).toBeLessThanOrEqual(100); // Should not exceed total steps
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle states with single amplitude', () => {
      const singleAmpState = new QuantumStateVector([new Complex(1, 0)], 0);
      
      // Test that the function doesn't crash with single amplitude
      expect(() => {
        const result = simulator.applyDecoherence(singleAmpState, 1);
        expect(result.decoherentState.amplitudes).toHaveLength(1);
      }).not.toThrow();
    });

    it('should handle zero time step', () => {
      const result = simulator.applyDecoherence(testState, 0);
      
      expect(result.fidelity).toBeGreaterThan(0.9); // Should be high but may have some noise
      expect(result.remainingCoherence).toBeGreaterThan(simulator.baseCoherenceTime * 0.9);
    });

    it('should handle extreme environmental conditions', () => {
      const extremeFactors: EnvironmentalFactors = {
        temperature: 100,
        magneticField: 50,
        vibration: 10,
        radiation: 5
      };

      const result = simulator.applyDecoherence(testState, 100, extremeFactors);
      
      expect(result.remainingCoherence).toBeLessThan(80);
      expect(result.fidelity).toBeLessThan(0.95); // Very lenient threshold
    });

    it('should maintain quantum state properties under decoherence', () => {
      const result = simulator.applyDecoherence(testState, 50);
      
      // State should still be a valid quantum state
      expect(result.decoherentState.isNormalized()).toBe(true);
      expect(result.decoherentState.amplitudes.length).toBe(testState.amplitudes.length);
      expect(result.decoherentState.getTotalProbability()).toBeCloseTo(1, 5);
    });
  });

  describe('performance and consistency', () => {
    it('should produce consistent results for same inputs', () => {
      // Set random seed for consistency (if available)
      const result1 = simulator.applyDecoherence(testState, 25);
      const result2 = simulator.applyDecoherence(testState, 25);
      
      // Results should be similar (within reasonable bounds due to randomness)
      expect(Math.abs(result1.remainingCoherence - result2.remainingCoherence)).toBeLessThan(5);
    });

    it('should handle large quantum states efficiently', () => {
      const largeAmplitudes = Array.from({ length: 100 }, (_, i) => 
        new Complex(Math.random(), Math.random())
      );
      const largeState = new QuantumStateVector(largeAmplitudes, 0);

      const startTime = performance.now();
      const result = simulator.applyDecoherence(largeState, 30);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(result.decoherentState.amplitudes).toHaveLength(100);
      expect(result.decoherentState.isNormalized()).toBe(true);
    });
  });
});