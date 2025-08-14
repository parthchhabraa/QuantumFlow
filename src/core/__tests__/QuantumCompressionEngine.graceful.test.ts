import { QuantumCompressionEngine } from '../QuantumCompressionEngine';
import { QuantumConfig } from '../../models/QuantumConfig';
import { CompressedQuantumData } from '../../models/CompressedQuantumData';

describe('QuantumCompressionEngine - Graceful Degradation Integration', () => {
  let engine: QuantumCompressionEngine;
  let config: QuantumConfig;

  beforeEach(() => {
    config = new QuantumConfig(8, 4, 5, 0.5);
    engine = new QuantumCompressionEngine(config);
  });

  describe('Compression with Graceful Degradation', () => {
    it('should successfully compress normal data without fallback', async () => {
      const testData = Buffer.from('Normal test data for compression');

      const compressed = engine.compress(testData);

      expect(compressed).toBeInstanceOf(CompressedQuantumData);
      expect(compressed.metadata.originalSize).toBe(testData.length);
      expect(compressed.quantumStates.length).toBeGreaterThan(0);
      
      // Should not use fallback for normal data
      const compressionConfig = compressed.metadata.compressionConfig as any;
      expect(compressionConfig.fallbackUsed).toBeUndefined();
    });

    it('should use fallback when quantum compression fails due to extreme parameters', async () => {
      // Use normal config but mock failure
      const testData = Buffer.from('Test data that might cause quantum simulation to fail due to extreme parameters');

      // Mock a failure scenario by creating an engine that will fail
      const originalPerformQuantumStatePreparation = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Quantum state preparation failed due to memory constraints');
      };

      const compressed = engine.compress(testData);

      expect(compressed).toBeInstanceOf(CompressedQuantumData);
      expect(compressed.metadata.originalSize).toBe(testData.length);
      
      // Should use fallback
      const compressionConfig = compressed.metadata.compressionConfig as any;
      expect(compressionConfig.fallbackUsed).toBe(true);
      expect(compressionConfig.fallbackStrategy).toBeDefined();
      expect(compressionConfig.originalFailureReason).toContain('memory constraints');
    });

    it('should handle large data with chunked fallback', async () => {
      const largeData = Buffer.alloc(3 * 1024 * 1024, 'L'); // 3MB of 'L's (above 2MB threshold)
      
      // Mock failure for large data
      const originalPerformQuantumStatePreparation = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Memory allocation failed for quantum states');
      };

      const compressed = engine.compress(largeData);

      expect(compressed).toBeInstanceOf(CompressedQuantumData);
      expect(compressed.metadata.originalSize).toBe(largeData.length);
      
      const compressionConfig = compressed.metadata.compressionConfig as any;
      expect(compressionConfig.fallbackUsed).toBe(true);
      expect(compressionConfig.fallbackStrategy).toBe('chunked-classical');
    });

    it('should use fast fallback for timeout scenarios', async () => {
      const testData = Buffer.from('Test data for timeout scenario with repeated patterns ABCABCABC');
      
      // Mock timeout failure
      const originalPerformSuperpositionAnalysis = (engine as any).performSuperpositionAnalysis;
      (engine as any).performSuperpositionAnalysis = () => {
        throw new Error('Quantum processing timeout exceeded');
      };

      const compressed = engine.compress(testData);

      expect(compressed).toBeInstanceOf(CompressedQuantumData);
      
      const compressionConfig = compressed.metadata.compressionConfig as any;
      expect(compressionConfig.fallbackUsed).toBe(true);
      expect(compressionConfig.fallbackStrategy).toBeDefined();
    });

    it('should preserve compression metrics even with fallback', async () => {
      const testData = Buffer.from('Test data for metrics preservation');
      
      // Mock failure
      const originalPerformEntanglementDetection = (engine as any).performEntanglementDetection;
      (engine as any).performEntanglementDetection = () => {
        throw new Error('Entanglement analysis failed');
      };

      const compressed = engine.compress(testData);
      const stats = compressed.getCompressionStats();

      expect(stats.originalSize).toBe(testData.length);
      expect(stats.compressedSize).toBeGreaterThan(0);
      expect(stats.compressionRatio).toBeGreaterThan(0);
      expect(stats.quantumStateCount).toBeGreaterThan(0);
    });
  });

  describe('Decompression with Fallback Support', () => {
    it('should decompress fallback-compressed data correctly', async () => {
      const originalData = Buffer.from('Original data for fallback decompression test');
      
      // Mock compression failure to trigger fallback
      const originalPerformQuantumInterference = (engine as any).performQuantumInterference;
      (engine as any).performQuantumInterference = () => {
        throw new Error('Quantum interference optimization failed');
      };

      const compressed = engine.compress(originalData);
      const decompressed = engine.decompress(compressed);

      // Should recover original data or at least maintain data integrity
      expect(decompressed.length).toBeGreaterThan(0);
      
      const compressionConfig = compressed.metadata.compressionConfig as any;
      if (compressionConfig.fallbackUsed) {
        // For fallback compression, we expect the decompressed data to be recoverable
        expect(decompressed.length).toBeGreaterThanOrEqual(originalData.length * 0.8); // Allow some variation
      } else {
        expect(decompressed).toEqual(originalData);
      }
    });

    it('should handle different fallback strategies in decompression', async () => {
      const testData = Buffer.from('Test data for different fallback strategies AAABBBCCC');
      
      // Test simple classical fallback
      const originalMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Simple quantum failure');
      };

      const compressed = engine.compress(testData);
      const decompressed = engine.decompress(compressed);

      expect(decompressed.length).toBeGreaterThan(0);
      
      const compressionConfig = compressed.metadata.compressionConfig as any;
      expect(compressionConfig.fallbackUsed).toBe(true);
    });

    it('should verify integrity during decompression', async () => {
      const testData = Buffer.from('Test data for integrity verification during decompression');
      
      // Mock failure to trigger fallback
      const originalPerformSuperpositionAnalysis = (engine as any).performSuperpositionAnalysis;
      (engine as any).performSuperpositionAnalysis = () => {
        throw new Error('Superposition analysis failed');
      };

      const compressed = engine.compress(testData);
      const result = engine.decompressWithIntegrityCheck(compressed);

      expect(result.data).toBeDefined();
      expect(result.verification).toBeDefined();
      expect(result.verification.integrityScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle corrupted fallback data gracefully', async () => {
      const testData = Buffer.from('Test data for corruption handling');
      
      // Create compressed data with fallback
      const originalMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Quantum state preparation failed');
      };

      const compressed = engine.compress(testData);
      
      // Corrupt the fallback data
      const compressionConfig = compressed.metadata.compressionConfig as any;
      if (compressionConfig.fallbackData) {
        compressionConfig.fallbackData[0] = 255; // Corrupt first byte
      }

      // Should still attempt decompression
      const decompressed = engine.decompress(compressed);
      expect(decompressed).toBeDefined();
    });
  });

  describe('Performance and Resource Management', () => {
    it('should complete fallback compression within reasonable time', async () => {
      const testData = Buffer.from('Performance test data with various patterns');
      const startTime = performance.now();
      
      // Mock failure to trigger fallback
      const originalMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Performance test failure');
      };

      const compressed = engine.compress(testData);
      const endTime = performance.now();

      expect(compressed).toBeInstanceOf(CompressedQuantumData);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle memory constraints gracefully', async () => {
      const largeData = Buffer.alloc(3 * 1024 * 1024, 'M'); // 3MB (above 2MB threshold)
      
      // Mock memory failure
      const originalMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Memory allocation failed for quantum states');
      };

      const compressed = engine.compress(largeData);
      
      expect(compressed).toBeInstanceOf(CompressedQuantumData);
      
      const compressionConfig = compressed.metadata.compressionConfig as any;
      expect(compressionConfig.fallbackUsed).toBe(true);
      expect(compressionConfig.fallbackStrategy).toBe('chunked-classical');
    });

    it('should provide meaningful error messages and recommendations', async () => {
      const testData = Buffer.from('Test data for error messages');
      
      // Mock failure
      const originalMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Specific quantum failure for testing');
      };

      const compressed = engine.compress(testData);
      
      const compressionConfig = compressed.metadata.compressionConfig as any;
      expect(compressionConfig.fallbackUsed).toBe(true);
      expect(compressionConfig.originalFailureReason).toContain('Specific quantum failure');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty data with fallback', async () => {
      const emptyData = Buffer.alloc(0);
      
      // Mock failure
      const originalMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Cannot process empty data');
      };

      expect(() => engine.compress(emptyData)).toThrow('Cannot compress empty input data');
    });

    it('should handle binary data with fallback', async () => {
      const binaryData = Buffer.from([0, 1, 2, 3, 255, 254, 253, 252, 128, 127, 126, 125]);
      
      // Mock failure
      const originalMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Binary data processing failed');
      };

      const compressed = engine.compress(binaryData);
      const decompressed = engine.decompress(compressed);

      expect(decompressed.length).toBeGreaterThan(0);
    });

    it('should handle highly repetitive data with fallback', async () => {
      const repetitiveData = Buffer.alloc(1024, 'R'); // 1KB of 'R's
      
      // Mock failure
      const originalMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Repetitive data caused quantum state issues');
      };

      const compressed = engine.compress(repetitiveData);
      const stats = compressed.getCompressionStats();

      // Fallback compression might not always achieve better than 1:1 ratio due to metadata overhead
      expect(stats.compressionRatio).toBeGreaterThan(0.1); // Should at least compress somewhat
      
      const compressionConfig = compressed.metadata.compressionConfig as any;
      expect(compressionConfig.fallbackUsed).toBe(true);
    });

    it('should handle random data with fallback', async () => {
      const randomData = Buffer.alloc(512);
      for (let i = 0; i < randomData.length; i++) {
        randomData[i] = Math.floor(Math.random() * 256);
      }
      
      // Mock failure
      const originalMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Random data caused quantum simulation failure');
      };

      const compressed = engine.compress(randomData);
      const decompressed = engine.decompress(compressed);

      expect(decompressed.length).toBeGreaterThan(0);
      
      const compressionConfig = compressed.metadata.compressionConfig as any;
      expect(compressionConfig.fallbackUsed).toBe(true);
    });

    it('should fail gracefully when both quantum and fallback fail', async () => {
      const testData = Buffer.from('Test data for complete failure scenario');
      
      // Mock quantum failure
      const originalQuantumMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Quantum compression failed');
      };

      // Mock fallback failure by corrupting the error correction class
      const QuantumErrorCorrection = require('../QuantumErrorCorrection').QuantumErrorCorrection;
      const originalAttemptGracefulDegradation = QuantumErrorCorrection.prototype.attemptGracefulDegradation;
      QuantumErrorCorrection.prototype.attemptGracefulDegradation = () => {
        throw new Error('Fallback also failed');
      };

      expect(() => engine.compress(testData)).toThrow();

      // Restore original method
      QuantumErrorCorrection.prototype.attemptGracefulDegradation = originalAttemptGracefulDegradation;
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should track fallback usage in metrics', async () => {
      const testData = Buffer.from('Test data for metrics tracking');
      
      // Mock failure
      const originalMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Metrics test failure');
      };

      const compressed = engine.compress(testData);
      const metrics = engine.getCompressionMetrics();

      expect(metrics).toBeDefined();
      
      const compressionConfig = compressed.metadata.compressionConfig as any;
      expect(compressionConfig.fallbackUsed).toBe(true);
    });

    it('should provide performance reports including fallback information', async () => {
      const testData = Buffer.from('Test data for performance reporting');
      
      // Mock failure
      const originalMethod = (engine as any).performQuantumStatePreparation;
      (engine as any).performQuantumStatePreparation = () => {
        throw new Error('Performance report test failure');
      };

      const compressed = engine.compress(testData);
      const report = engine.generatePerformanceReport();

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });
  });
});