import { QuantumErrorCorrection, EncodedQuantumState } from '../QuantumErrorCorrection';
import { QuantumStateVector } from '../../models/QuantumStateVector';
import { SuperpositionState } from '../../models/SuperpositionState';
import { Complex } from '../../math/Complex';

describe('QuantumErrorCorrection', () => {
  let errorCorrection: QuantumErrorCorrection;
  let testState: QuantumStateVector;
  let corruptedState: QuantumStateVector;

  beforeEach(() => {
    errorCorrection = new QuantumErrorCorrection(0.01, 0.1, 3);
    
    // Create a test quantum state
    const amplitudes = [
      new Complex(0.6, 0.2),
      new Complex(0.4, -0.3),
      new Complex(0.5, 0.1),
      new Complex(0.3, 0.4)
    ];
    testState = new QuantumStateVector(amplitudes, Math.PI / 4);

    // Create a corrupted version
    const corruptedAmplitudes = amplitudes.map((amp, i) => 
      i === 0 ? amp.scale(1.5) : amp
    );
    corruptedState = new QuantumStateVector(corruptedAmplitudes, Math.PI / 4);
  });

  describe('constructor', () => {
    it('should initialize with default parameters', () => {
      const defaultCorrection = new QuantumErrorCorrection();
      expect(defaultCorrection.errorThreshold).toBe(0.01);
    });

    it('should initialize with custom parameters', () => {
      const customCorrection = new QuantumErrorCorrection(0.05, 0.2, 5);
      expect(customCorrection.errorThreshold).toBe(0.05);
    });

    it('should clamp error threshold to valid range', () => {
      errorCorrection.errorThreshold = -0.1;
      expect(errorCorrection.errorThreshold).toBe(0);
      
      errorCorrection.errorThreshold = 1.5;
      expect(errorCorrection.errorThreshold).toBe(1);
    });
  });

  describe('encodeWithErrorCorrection', () => {
    it('should create encoded quantum state with redundancy', () => {
      const encoded = errorCorrection.encodeWithErrorCorrection(testState);

      expect(encoded.originalState).toBeDefined();
      expect(encoded.repetitionCode).toHaveLength(3);
      expect(encoded.parityCode.length).toBeGreaterThan(0);
      expect(encoded.hammingCode).toBeDefined();
      expect(encoded.syndromes.length).toBeGreaterThan(0);
      expect(encoded.checksum).toBeDefined();
      expect(encoded.encodingTimestamp).toBeGreaterThan(0);
    });

    it('should create identical repetition codes', () => {
      const encoded = errorCorrection.encodeWithErrorCorrection(testState);

      for (let i = 0; i < encoded.repetitionCode.length; i++) {
        expect(encoded.repetitionCode[i].equals(testState)).toBe(true);
      }
    });

    it('should generate consistent checksums for identical states', () => {
      const encoded1 = errorCorrection.encodeWithErrorCorrection(testState);
      const encoded2 = errorCorrection.encodeWithErrorCorrection(testState.clone());

      expect(encoded1.checksum).toBe(encoded2.checksum);
    });
  });

  describe('verifyIntegrity', () => {
    it('should pass all checks for valid quantum state', () => {
      const verification = errorCorrection.verifyIntegrity(testState);

      expect(verification.integrityScore).toBeGreaterThan(0.8);
      expect(verification.isIntact).toBe(true);
      expect(verification.checks.every((check: any) => check.passed)).toBe(true);
    });

    it('should provide appropriate recommendations', () => {
      const goodVerification = errorCorrection.verifyIntegrity(testState);
      expect(goodVerification.recommendedAction).toContain('excellent');

      // Create a more severely corrupted state
      const severelyCorruptedAmplitudes = [
        new Complex(NaN, 0),
        new Complex(Infinity, 0),
        new Complex(0, 0),
        new Complex(0, 0)
      ];
      const severelyCorruptedState = new QuantumStateVector([new Complex(1, 0)], 0);
      
      // Manually corrupt the state to bypass normalization
      Object.defineProperty(severelyCorruptedState, '_amplitudes', {
        value: severelyCorruptedAmplitudes,
        writable: true,
        configurable: true
      });

      const badVerification = errorCorrection.verifyIntegrity(severelyCorruptedState, testState);
      expect(badVerification.recommendedAction).toContain('compromised');
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle states with single amplitude', () => {
      const singleAmpState = new QuantumStateVector([new Complex(1, 0)], 0);
      const encoded = errorCorrection.encodeWithErrorCorrection(singleAmpState);
      const result = errorCorrection.decodeWithErrorCorrection(encoded);

      expect(result.correctedState.amplitudes).toHaveLength(1);
      expect(result.correctionSuccess).toBe(true);
    });

    it('should handle empty correction attempts gracefully', () => {
      const encoded = errorCorrection.encodeWithErrorCorrection(testState);
      // Simulate no errors detected
      const result = errorCorrection.decodeWithErrorCorrection(encoded);

      expect(result.correctionAttempts).toHaveLength(0);
      expect(result.correctionSuccess).toBe(true);
    });
  });

  describe('performance and scalability', () => {
    it('should handle large quantum states efficiently', () => {
      const largeAmplitudes = Array.from({ length: 50 }, (_, i) => 
        new Complex(Math.random(), Math.random())
      );
      const largeState = new QuantumStateVector(largeAmplitudes, 0);

      const startTime = performance.now();
      const encoded = errorCorrection.encodeWithErrorCorrection(largeState);
      const result = errorCorrection.decodeWithErrorCorrection(encoded);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should complete within 200ms
      expect(result.correctedState.amplitudes).toHaveLength(50);
    });

    it('should produce consistent results for identical inputs', () => {
      const encoded1 = errorCorrection.encodeWithErrorCorrection(testState);
      const encoded2 = errorCorrection.encodeWithErrorCorrection(testState.clone());

      expect(encoded1.checksum).toBe(encoded2.checksum);
      expect(encoded1.syndromes.length).toBe(encoded2.syndromes.length);
    });
  });
});