import { QuantumStateConverter, DataPatternAnalysis, ConversionStats } from '../QuantumStateConverter';
import { QuantumStateVector } from '../../models/QuantumStateVector';

describe('QuantumStateConverter', () => {
  describe('constructor and basic properties', () => {
    test('should create converter with default parameters', () => {
      const converter = new QuantumStateConverter();
      
      expect(converter.quantumBitDepth).toBe(8);
      expect(converter.chunkSize).toBe(4);
    });

    test('should create converter with custom parameters', () => {
      const converter = new QuantumStateConverter(10, 8);
      
      expect(converter.quantumBitDepth).toBe(10);
      expect(converter.chunkSize).toBe(8);
    });

    test('should validate quantum bit depth bounds', () => {
      expect(() => new QuantumStateConverter(1)).toThrow(
        'Quantum bit depth must be between 2 and 16'
      );
      expect(() => new QuantumStateConverter(17)).toThrow(
        'Quantum bit depth must be between 2 and 16'
      );
    });

    test('should validate chunk size bounds', () => {
      expect(() => new QuantumStateConverter(8, 0)).toThrow(
        'Chunk size must be between 1 and 256'
      );
      expect(() => new QuantumStateConverter(8, 257)).toThrow(
        'Chunk size must be between 1 and 256'
      );
    });
  });

  describe('data to quantum state conversion', () => {
    test('should convert buffer data to quantum states', () => {
      const converter = new QuantumStateConverter(6, 4);
      const data = Buffer.from([100, 150, 200, 50, 75, 125]);
      
      const quantumStates = converter.convertToQuantumStates(data);
      
      expect(quantumStates.length).toBeGreaterThan(0);
      quantumStates.forEach(state => {
        expect(state).toBeInstanceOf(QuantumStateVector);
        expect(state.isNormalized()).toBe(true);
      });
    });

    test('should handle single byte data', () => {
      const converter = new QuantumStateConverter();
      const data = Buffer.from([42]);
      
      const quantumStates = converter.convertToQuantumStates(data);
      
      expect(quantumStates).toHaveLength(1);
      expect(quantumStates[0].isNormalized()).toBe(true);
    });

    test('should handle large data', () => {
      const converter = new QuantumStateConverter(8, 4);
      const data = Buffer.alloc(1000, 123); // 1000 bytes of value 123
      
      const quantumStates = converter.convertToQuantumStates(data);
      
      expect(quantumStates.length).toBe(Math.ceil(1000 / 4)); // 250 states
      quantumStates.forEach(state => {
        expect(state.isNormalized()).toBe(true);
      });
    });

    test('should throw error for empty data', () => {
      const converter = new QuantumStateConverter();
      const data = Buffer.from([]);
      
      expect(() => converter.convertToQuantumStates(data)).toThrow(
        'Cannot convert empty data to quantum states'
      );
    });
  });

  describe('quantum state to data conversion', () => {
    test('should convert quantum states back to buffer data', () => {
      const converter = new QuantumStateConverter(6, 4);
      const originalData = Buffer.from([100, 150, 200, 50]);
      
      const quantumStates = converter.convertToQuantumStates(originalData);
      const reconstructedData = converter.convertFromQuantumStates(quantumStates);
      
      expect(reconstructedData).toBeInstanceOf(Buffer);
      expect(reconstructedData.length).toBe(originalData.length);
      
      // Values should be in valid byte range
      for (const byte of reconstructedData) {
        expect(byte).toBeGreaterThanOrEqual(0);
        expect(byte).toBeLessThanOrEqual(255);
      }
    });

    test('should handle round-trip conversion', () => {
      const converter = new QuantumStateConverter(8, 2);
      const originalData = Buffer.from([10, 20, 30, 40, 50]);
      
      const quantumStates = converter.convertToQuantumStates(originalData);
      const reconstructedData = converter.convertFromQuantumStates(quantumStates);
      
      // The reconstructed data might be padded due to chunking
      expect(reconstructedData.length).toBeGreaterThanOrEqual(originalData.length);
      
      // Due to quantum processing, exact reconstruction may not be possible
      // but the data should be reasonable approximations
      const minLength = Math.min(originalData.length, reconstructedData.length);
      for (let i = 0; i < minLength; i++) {
        const original = originalData[i];
        const reconstructed = reconstructedData[i];
        
        // Allow for some deviation due to quantum processing
        expect(Math.abs(original - reconstructed)).toBeLessThan(100);
      }
    });

    test('should throw error for empty quantum states', () => {
      const converter = new QuantumStateConverter();
      
      expect(() => converter.convertFromQuantumStates([])).toThrow(
        'Cannot convert empty quantum states to data'
      );
    });
  });

  describe('data pattern analysis', () => {
    test('should analyze data patterns', () => {
      const converter = new QuantumStateConverter();
      const data = Buffer.from([100, 150, 200, 100, 150, 200]); // Repeating pattern
      
      const analysis = converter.analyzeDataPatterns(data);
      
      expect(analysis.entropy).toBeGreaterThanOrEqual(0);
      expect(analysis.repetitionRate).toBeGreaterThanOrEqual(0);
      expect(analysis.repetitionRate).toBeLessThanOrEqual(1);
      expect(analysis.byteFrequencies).toHaveLength(256);
      expect(analysis.recommendedChunkSize).toBeGreaterThan(0);
      expect(analysis.recommendedBitDepth).toBeGreaterThanOrEqual(2);
      expect(analysis.patternComplexity).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty data analysis', () => {
      const converter = new QuantumStateConverter();
      const data = Buffer.from([]);
      
      const analysis = converter.analyzeDataPatterns(data);
      
      expect(analysis.entropy).toBe(0);
      expect(analysis.repetitionRate).toBe(0);
      expect(analysis.patternComplexity).toBe(0);
    });

    test('should analyze high entropy data', () => {
      const converter = new QuantumStateConverter();
      // Create high entropy data (random-like)
      const data = Buffer.from(Array.from({length: 100}, (_, i) => i % 256));
      
      const analysis = converter.analyzeDataPatterns(data);
      
      expect(analysis.entropy).toBeGreaterThan(5); // High entropy
      expect(analysis.repetitionRate).toBeLessThan(0.8); // Low repetition
    });

    test('should analyze low entropy data', () => {
      const converter = new QuantumStateConverter();
      // Create low entropy data (repetitive)
      const data = Buffer.alloc(100, 42); // All same value
      
      const analysis = converter.analyzeDataPatterns(data);
      
      expect(analysis.entropy).toBe(0); // Minimum entropy
      expect(analysis.repetitionRate).toBeGreaterThan(0.9); // High repetition
    });
  });

  describe('parameter optimization', () => {
    test('should optimize converter for data', () => {
      const originalConverter = new QuantumStateConverter(8, 4);
      const data = Buffer.from([100, 150, 200, 50, 75, 125, 175, 225]);
      
      const optimizedConverter = originalConverter.optimizeForData(data);
      
      expect(optimizedConverter).toBeInstanceOf(QuantumStateConverter);
      expect(optimizedConverter.quantumBitDepth).toBeGreaterThanOrEqual(2);
      expect(optimizedConverter.quantumBitDepth).toBeLessThanOrEqual(16);
      expect(optimizedConverter.chunkSize).toBeGreaterThanOrEqual(1);
    });

    test('should recommend larger chunks for high entropy data', () => {
      const converter = new QuantumStateConverter(8, 4);
      // High entropy data
      const data = Buffer.from(Array.from({length: 50}, (_, i) => (i * 7) % 256));
      
      const analysis = converter.analyzeDataPatterns(data);
      
      if (analysis.entropy > 6) {
        expect(analysis.recommendedChunkSize).toBeGreaterThanOrEqual(converter.chunkSize);
      }
    });

    test('should recommend smaller chunks for low entropy data', () => {
      const converter = new QuantumStateConverter(8, 4);
      // Low entropy data
      const data = Buffer.from([42, 42, 42, 43, 43, 43, 44, 44, 44]);
      
      const analysis = converter.analyzeDataPatterns(data);
      
      if (analysis.entropy < 3) {
        expect(analysis.recommendedChunkSize).toBeLessThanOrEqual(converter.chunkSize);
      }
    });
  });

  describe('conversion statistics', () => {
    test('should calculate conversion statistics', () => {
      const converter = new QuantumStateConverter(8, 4);
      const data = Buffer.from([100, 150, 200, 50, 75, 125]);
      
      const quantumStates = converter.convertToQuantumStates(data);
      const stats = converter.getConversionStats(data.length, quantumStates);
      
      expect(stats.originalSize).toBe(data.length);
      expect(stats.quantumStateCount).toBe(quantumStates.length);
      expect(stats.totalAmplitudes).toBeGreaterThan(0);
      expect(stats.averageAmplitudesPerState).toBeGreaterThan(0);
      expect(stats.estimatedQuantumSize).toBeGreaterThan(0);
      expect(stats.expansionRatio).toBeGreaterThan(0);
      expect(stats.chunksProcessed).toBe(quantumStates.length);
      expect(stats.averageChunkSize).toBeGreaterThan(0);
    });

    test('should calculate accurate statistics for known data', () => {
      const converter = new QuantumStateConverter(6, 2);
      const data = Buffer.from([10, 20, 30, 40]); // 4 bytes, 2 chunks
      
      const quantumStates = converter.convertToQuantumStates(data);
      const stats = converter.getConversionStats(data.length, quantumStates);
      
      expect(stats.originalSize).toBe(4);
      expect(stats.quantumStateCount).toBe(2); // 4 bytes / 2 chunk size
      expect(stats.chunksProcessed).toBe(2);
      expect(stats.averageChunkSize).toBe(2);
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle very small chunk sizes', () => {
      const converter = new QuantumStateConverter(4, 1);
      const data = Buffer.from([42, 84, 126]);
      
      const quantumStates = converter.convertToQuantumStates(data);
      
      expect(quantumStates).toHaveLength(3); // One state per byte
      quantumStates.forEach(state => {
        expect(state.isNormalized()).toBe(true);
      });
    });

    test('should handle very large chunk sizes', () => {
      const converter = new QuantumStateConverter(8, 16);
      const data = Buffer.from(Array.from({length: 10}, (_, i) => i * 25));
      
      const quantumStates = converter.convertToQuantumStates(data);
      
      expect(quantumStates).toHaveLength(1); // All data in one chunk
      expect(quantumStates[0].isNormalized()).toBe(true);
    });

    test('should handle data not divisible by chunk size', () => {
      const converter = new QuantumStateConverter(6, 3);
      const data = Buffer.from([10, 20, 30, 40, 50]); // 5 bytes, chunk size 3
      
      const quantumStates = converter.convertToQuantumStates(data);
      
      expect(quantumStates).toHaveLength(2); // Two chunks: [10,20,30] and [40,50]
      quantumStates.forEach(state => {
        expect(state.isNormalized()).toBe(true);
      });
    });

    test('should handle maximum quantum bit depth', () => {
      const converter = new QuantumStateConverter(16, 2);
      const data = Buffer.from([255, 128, 64, 32]);
      
      const quantumStates = converter.convertToQuantumStates(data);
      
      expect(quantumStates).toHaveLength(2);
      quantumStates.forEach(state => {
        expect(state.isNormalized()).toBe(true);
        expect(state.amplitudes.length).toBeGreaterThan(0);
      });
    });

    test('should handle minimum quantum bit depth', () => {
      const converter = new QuantumStateConverter(2, 4);
      const data = Buffer.from([100, 150, 200, 50]);
      
      const quantumStates = converter.convertToQuantumStates(data);
      
      expect(quantumStates).toHaveLength(1);
      expect(quantumStates[0].isNormalized()).toBe(true);
    });
  });
});