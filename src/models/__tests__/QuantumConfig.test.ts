import { QuantumConfig, QuantumConfigData } from '../QuantumConfig';

describe('QuantumConfig', () => {
  describe('constructor and basic properties', () => {
    test('should create config with default values', () => {
      const config = new QuantumConfig();
      
      expect(config.quantumBitDepth).toBe(8);
      expect(config.maxEntanglementLevel).toBe(4);
      expect(config.superpositionComplexity).toBe(5);
      expect(config.interferenceThreshold).toBe(0.5);
      expect(config.profileName).toBeUndefined();
    });

    test('should create config with custom values', () => {
      const config = new QuantumConfig(10, 5, 7, 0.7, 'custom');
      
      expect(config.quantumBitDepth).toBe(10);
      expect(config.maxEntanglementLevel).toBe(5);
      expect(config.superpositionComplexity).toBe(7);
      expect(config.interferenceThreshold).toBe(0.7);
      expect(config.profileName).toBe('custom');
    });
  });

  describe('parameter validation', () => {
    test('should validate quantum bit depth bounds', () => {
      expect(() => new QuantumConfig(1)).toThrow('Quantum bit depth must be between 2 and 16');
      expect(() => new QuantumConfig(17)).toThrow('Quantum bit depth must be between 2 and 16');
    });

    test('should validate quantum bit depth type', () => {
      expect(() => new QuantumConfig(8.5)).toThrow('Quantum bit depth must be an integer');
      expect(() => new QuantumConfig(NaN)).toThrow('Quantum bit depth must be an integer');
    });

    test('should validate entanglement level bounds', () => {
      expect(() => new QuantumConfig(8, 0)).toThrow('Maximum entanglement level must be between 1 and 8');
      expect(() => new QuantumConfig(8, 9)).toThrow('Maximum entanglement level must be between 1 and 8');
    });

    test('should validate entanglement level type', () => {
      expect(() => new QuantumConfig(8, 4.5)).toThrow('Maximum entanglement level must be an integer');
      expect(() => new QuantumConfig(8, NaN)).toThrow('Maximum entanglement level must be an integer');
    });

    test('should validate superposition complexity bounds', () => {
      expect(() => new QuantumConfig(8, 4, 0)).toThrow('Superposition complexity must be between 1 and 10');
      expect(() => new QuantumConfig(8, 4, 11)).toThrow('Superposition complexity must be between 1 and 10');
    });

    test('should validate superposition complexity type', () => {
      expect(() => new QuantumConfig(8, 4, 5.5)).toThrow('Superposition complexity must be an integer');
      expect(() => new QuantumConfig(8, 4, NaN)).toThrow('Superposition complexity must be an integer');
    });

    test('should validate interference threshold bounds', () => {
      expect(() => new QuantumConfig(8, 4, 5, 0.05)).toThrow('Interference threshold must be between 0.1 and 0.9');
      expect(() => new QuantumConfig(8, 4, 5, 0.95)).toThrow('Interference threshold must be between 0.1 and 0.9');
    });

    test('should validate interference threshold type', () => {
      expect(() => new QuantumConfig(8, 4, 5, NaN)).toThrow('Interference threshold must be a valid number');
      expect(() => new QuantumConfig(8, 4, 5, 'invalid' as any)).toThrow('Interference threshold must be a valid number');
    });

    test('should validate parameter combinations', () => {
      // Entanglement level too high for bit depth
      expect(() => new QuantumConfig(4, 8)).toThrow('Maximum entanglement level (8) should not exceed half the quantum bit depth (2 for 4 bits)');
      
      // Superposition complexity higher than bit depth
      expect(() => new QuantumConfig(6, 3, 8)).toThrow('Superposition complexity (8) should not exceed quantum bit depth (6)');
      
      // Extremely high computational complexity
      expect(() => new QuantumConfig(16, 8, 10)).toThrow('Parameter combination exceeds computational feasibility bounds');
    });
  });

  describe('property setters with validation', () => {
    test('should validate quantum bit depth setter', () => {
      const config = new QuantumConfig();
      
      config.quantumBitDepth = 12;
      expect(config.quantumBitDepth).toBe(12);
      
      expect(() => config.quantumBitDepth = 1).toThrow('Quantum bit depth must be between 2 and 16');
      expect(() => config.quantumBitDepth = 17).toThrow('Quantum bit depth must be between 2 and 16');
      expect(() => config.quantumBitDepth = 8.5).toThrow('Quantum bit depth must be an integer');
    });

    test('should validate entanglement level setter', () => {
      const config = new QuantumConfig();
      
      config.maxEntanglementLevel = 6;
      expect(config.maxEntanglementLevel).toBe(6);
      
      expect(() => config.maxEntanglementLevel = 0).toThrow('Maximum entanglement level must be between 1 and 8');
      expect(() => config.maxEntanglementLevel = 9).toThrow('Maximum entanglement level must be between 1 and 8');
      expect(() => config.maxEntanglementLevel = 4.5).toThrow('Maximum entanglement level must be an integer');
    });

    test('should validate superposition complexity setter', () => {
      const config = new QuantumConfig();
      
      config.superpositionComplexity = 8;
      expect(config.superpositionComplexity).toBe(8);
      
      expect(() => config.superpositionComplexity = 0).toThrow('Superposition complexity must be between 1 and 10');
      expect(() => config.superpositionComplexity = 11).toThrow('Superposition complexity must be between 1 and 10');
      expect(() => config.superpositionComplexity = 5.5).toThrow('Superposition complexity must be an integer');
    });

    test('should validate interference threshold setter', () => {
      const config = new QuantumConfig();
      
      config.interferenceThreshold = 0.8;
      expect(config.interferenceThreshold).toBe(0.8);
      
      expect(() => config.interferenceThreshold = 0.05).toThrow('Interference threshold must be between 0.1 and 0.9');
      expect(() => config.interferenceThreshold = 0.95).toThrow('Interference threshold must be between 0.1 and 0.9');
      expect(() => config.interferenceThreshold = NaN).toThrow('Interference threshold must be a valid number');
    });

    test('should validate parameter combinations when setting properties', () => {
      const config = new QuantumConfig(8, 3, 5, 0.5);
      
      // Setting entanglement level too high should trigger combination validation
      expect(() => config.maxEntanglementLevel = 8).toThrow('Maximum entanglement level (8) should not exceed half the quantum bit depth (4 for 8 bits)');
      
      // Setting superposition complexity too high should trigger combination validation
      expect(() => config.superpositionComplexity = 9).toThrow('Superposition complexity (9) should not exceed quantum bit depth (8)');
      
      // Setting bit depth too low should trigger combination validation
      expect(() => config.quantumBitDepth = 4).toThrow('Maximum entanglement level (3) should not exceed half the quantum bit depth (2 for 4 bits)');
    });
  });

  describe('factory methods', () => {
    test('should create text compression config', () => {
      const config = QuantumConfig.forTextCompression();
      
      expect(config.quantumBitDepth).toBe(6);
      expect(config.maxEntanglementLevel).toBe(3);
      expect(config.superpositionComplexity).toBe(4);
      expect(config.interferenceThreshold).toBe(0.4);
      expect(config.profileName).toBe('text-optimized');
    });

    test('should create binary compression config', () => {
      const config = QuantumConfig.forBinaryCompression();
      
      expect(config.quantumBitDepth).toBe(8);
      expect(config.maxEntanglementLevel).toBe(4);
      expect(config.superpositionComplexity).toBe(6);
      expect(config.interferenceThreshold).toBe(0.6);
      expect(config.profileName).toBe('binary-optimized');
    });

    test('should create image compression config', () => {
      const config = QuantumConfig.forImageCompression();
      
      expect(config.quantumBitDepth).toBe(10);
      expect(config.maxEntanglementLevel).toBe(5);
      expect(config.superpositionComplexity).toBe(7);
      expect(config.interferenceThreshold).toBe(0.7);
      expect(config.profileName).toBe('image-optimized');
    });

    test('should create high performance config', () => {
      const config = QuantumConfig.forHighPerformance();
      
      expect(config.quantumBitDepth).toBe(12);
      expect(config.maxEntanglementLevel).toBe(6);
      expect(config.superpositionComplexity).toBe(8);
      expect(config.interferenceThreshold).toBe(0.8);
      expect(config.profileName).toBe('high-performance');
    });

    test('should create low resource config', () => {
      const config = QuantumConfig.forLowResource();
      
      expect(config.quantumBitDepth).toBe(4);
      expect(config.maxEntanglementLevel).toBe(2);
      expect(config.superpositionComplexity).toBe(3);
      expect(config.interferenceThreshold).toBe(0.3);
      expect(config.profileName).toBe('low-resource');
    });
  });

  describe('serialization', () => {
    test('should serialize to JSON', () => {
      const config = new QuantumConfig(10, 5, 7, 0.7, 'test');
      const json = config.toJSON();
      
      expect(json).toContain('"quantumBitDepth": 10');
      expect(json).toContain('"maxEntanglementLevel": 5');
      expect(json).toContain('"superpositionComplexity": 7');
      expect(json).toContain('"interferenceThreshold": 0.7');
      expect(json).toContain('"profileName": "test"');
    });

    test('should deserialize from JSON', () => {
      const originalConfig = new QuantumConfig(10, 5, 7, 0.7, 'test');
      const json = originalConfig.toJSON();
      const deserializedConfig = QuantumConfig.fromJSON(json);
      
      expect(deserializedConfig.equals(originalConfig)).toBe(true);
    });

    test('should handle invalid JSON', () => {
      expect(() => QuantumConfig.fromJSON('invalid json')).toThrow('Invalid JSON configuration');
    });

    test('should convert to object', () => {
      const config = new QuantumConfig(10, 5, 7, 0.7, 'test');
      const obj = config.toObject();
      
      expect(obj.quantumBitDepth).toBe(10);
      expect(obj.maxEntanglementLevel).toBe(5);
      expect(obj.superpositionComplexity).toBe(7);
      expect(obj.interferenceThreshold).toBe(0.7);
      expect(obj.profileName).toBe('test');
    });

    test('should create from object', () => {
      const obj: QuantumConfigData = {
        quantumBitDepth: 10,
        maxEntanglementLevel: 5,
        superpositionComplexity: 7,
        interferenceThreshold: 0.7,
        profileName: 'test'
      };
      
      const config = QuantumConfig.fromObject(obj);
      
      expect(config.quantumBitDepth).toBe(10);
      expect(config.maxEntanglementLevel).toBe(5);
      expect(config.superpositionComplexity).toBe(7);
      expect(config.interferenceThreshold).toBe(0.7);
      expect(config.profileName).toBe('test');
    });
  });

  describe('performance calculations', () => {
    test('should calculate memory usage', () => {
      const config = new QuantumConfig(8, 4, 5, 0.5);
      const memoryUsage = config.calculateMemoryUsage(1024);
      
      expect(memoryUsage).toBeGreaterThan(0);
    });

    test('should calculate processing multiplier', () => {
      const config = new QuantumConfig(8, 4, 5, 0.5);
      const multiplier = config.calculateProcessingMultiplier();
      
      expect(multiplier).toBeGreaterThan(0);
    });

    test('should check suitability for data size', () => {
      const config = QuantumConfig.forLowResource();
      
      expect(config.isSuitableForDataSize(1024, 512)).toBe(true);
      expect(config.isSuitableForDataSize(1024 * 1024 * 100, 1)).toBe(false);
    });
  });

  describe('optimization', () => {
    test('should optimize for text data', () => {
      const config = new QuantumConfig();
      const optimized = config.optimizeForData(1024, 'text');
      
      expect(optimized.profileName).toBe('text-optimized');
    });

    test('should optimize for small files', () => {
      const config = new QuantumConfig();
      const optimized = config.optimizeForData(512, 'binary');
      
      expect(optimized.quantumBitDepth).toBeLessThanOrEqual(config.quantumBitDepth);
    });

    test('should optimize for large files', () => {
      const config = new QuantumConfig();
      const optimized = config.optimizeForData(2 * 1024 * 1024, 'binary');
      
      expect(optimized.quantumBitDepth).toBeGreaterThanOrEqual(config.quantumBitDepth);
    });
  });

  describe('static validation methods', () => {
    test('should validate quantum bit depth statically', () => {
      expect(() => QuantumConfig.validateQuantumBitDepth(8)).not.toThrow();
      expect(() => QuantumConfig.validateQuantumBitDepth(1)).toThrow('Quantum bit depth must be between 2 and 16');
      expect(() => QuantumConfig.validateQuantumBitDepth(17)).toThrow('Quantum bit depth must be between 2 and 16');
      expect(() => QuantumConfig.validateQuantumBitDepth(8.5)).toThrow('Quantum bit depth must be an integer');
    });

    test('should validate entanglement level statically', () => {
      expect(() => QuantumConfig.validateEntanglementLevel(4)).not.toThrow();
      expect(() => QuantumConfig.validateEntanglementLevel(0)).toThrow('Maximum entanglement level must be between 1 and 8');
      expect(() => QuantumConfig.validateEntanglementLevel(9)).toThrow('Maximum entanglement level must be between 1 and 8');
      expect(() => QuantumConfig.validateEntanglementLevel(4.5)).toThrow('Maximum entanglement level must be an integer');
    });

    test('should validate superposition complexity statically', () => {
      expect(() => QuantumConfig.validateSuperpositionComplexity(5)).not.toThrow();
      expect(() => QuantumConfig.validateSuperpositionComplexity(0)).toThrow('Superposition complexity must be between 1 and 10');
      expect(() => QuantumConfig.validateSuperpositionComplexity(11)).toThrow('Superposition complexity must be between 1 and 10');
      expect(() => QuantumConfig.validateSuperpositionComplexity(5.5)).toThrow('Superposition complexity must be an integer');
    });

    test('should validate interference threshold statically', () => {
      expect(() => QuantumConfig.validateInterferenceThreshold(0.5)).not.toThrow();
      expect(() => QuantumConfig.validateInterferenceThreshold(0.05)).toThrow('Interference threshold must be between 0.1 and 0.9');
      expect(() => QuantumConfig.validateInterferenceThreshold(0.95)).toThrow('Interference threshold must be between 0.1 and 0.9');
      expect(() => QuantumConfig.validateInterferenceThreshold(NaN)).toThrow('Interference threshold must be a valid number');
    });

    test('should validate complete configuration', () => {
      const validConfig = {
        quantumBitDepth: 8,
        maxEntanglementLevel: 4,
        superpositionComplexity: 5,
        interferenceThreshold: 0.5
      };
      
      const errors = QuantumConfig.validateConfiguration(validConfig);
      expect(errors).toHaveLength(0);
      
      const invalidConfig = {
        quantumBitDepth: 1,
        maxEntanglementLevel: 9,
        superpositionComplexity: 11,
        interferenceThreshold: 1.5
      };
      
      const invalidErrors = QuantumConfig.validateConfiguration(invalidConfig);
      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(invalidErrors.some(error => error.includes('Quantum bit depth'))).toBe(true);
      expect(invalidErrors.some(error => error.includes('Entanglement level'))).toBe(true);
      expect(invalidErrors.some(error => error.includes('Superposition complexity'))).toBe(true);
      expect(invalidErrors.some(error => error.includes('Interference threshold'))).toBe(true);
    });

    test('should check configuration validity', () => {
      const validConfig = {
        quantumBitDepth: 8,
        maxEntanglementLevel: 4,
        superpositionComplexity: 5,
        interferenceThreshold: 0.5
      };
      
      expect(QuantumConfig.isValidConfiguration(validConfig)).toBe(true);
      
      const invalidConfig = {
        quantumBitDepth: 1,
        maxEntanglementLevel: 9
      };
      
      expect(QuantumConfig.isValidConfiguration(invalidConfig)).toBe(false);
    });

    test('should provide parameter ranges', () => {
      const ranges = QuantumConfig.getParameterRanges();
      
      expect(ranges.quantumBitDepth.min).toBe(2);
      expect(ranges.quantumBitDepth.max).toBe(16);
      expect(ranges.quantumBitDepth.recommended).toContain(8);
      
      expect(ranges.maxEntanglementLevel.min).toBe(1);
      expect(ranges.maxEntanglementLevel.max).toBe(8);
      expect(ranges.maxEntanglementLevel.recommended).toContain(4);
      
      expect(ranges.superpositionComplexity.min).toBe(1);
      expect(ranges.superpositionComplexity.max).toBe(10);
      expect(ranges.superpositionComplexity.recommended).toContain(5);
      
      expect(ranges.interferenceThreshold.min).toBe(0.1);
      expect(ranges.interferenceThreshold.max).toBe(0.9);
      expect(ranges.interferenceThreshold.recommended).toContain(0.5);
    });
  });

  describe('computational complexity', () => {
    test('should calculate computational complexity', () => {
      const config = new QuantumConfig(8, 4, 5, 0.5);
      const complexity = config.calculateComputationalComplexity();
      
      expect(complexity).toBeGreaterThan(0);
      expect(typeof complexity).toBe('number');
    });

    test('should increase complexity with higher parameters', () => {
      const lowConfig = new QuantumConfig(4, 2, 3, 0.3);
      const highConfig = new QuantumConfig(10, 5, 8, 0.7);
      
      const lowComplexity = lowConfig.calculateComputationalComplexity();
      const highComplexity = highConfig.calculateComputationalComplexity();
      
      expect(highComplexity).toBeGreaterThan(lowComplexity);
    });
  });

  describe('boundary checking', () => {
    test('should enforce meaningful entanglement relative to bit depth', () => {
      // 4 bits should allow max 2 entanglement levels
      expect(() => new QuantumConfig(4, 3)).toThrow('Maximum entanglement level (3) should not exceed half the quantum bit depth (2 for 4 bits)');
      
      // 8 bits should allow max 4 entanglement levels
      expect(() => new QuantumConfig(8, 5)).toThrow('Maximum entanglement level (5) should not exceed half the quantum bit depth (4 for 8 bits)');
      
      // Valid combinations should work
      expect(() => new QuantumConfig(8, 4)).not.toThrow();
      expect(() => new QuantumConfig(12, 6)).not.toThrow();
    });

    test('should enforce superposition complexity relative to bit depth', () => {
      // Superposition complexity should not exceed bit depth
      expect(() => new QuantumConfig(6, 3, 8)).toThrow('Superposition complexity (8) should not exceed quantum bit depth (6)');
      expect(() => new QuantumConfig(4, 2, 5)).toThrow('Superposition complexity (5) should not exceed quantum bit depth (4)');
      
      // Valid combinations should work
      expect(() => new QuantumConfig(8, 4, 6)).not.toThrow();
      expect(() => new QuantumConfig(10, 5, 8)).not.toThrow();
    });

    test('should prevent computationally infeasible combinations', () => {
      // Very high bit depth with high complexity should be rejected
      expect(() => new QuantumConfig(16, 8, 10)).toThrow('Parameter combination exceeds computational feasibility bounds');
      
      // Reasonable combinations should work
      expect(() => new QuantumConfig(10, 5, 8)).not.toThrow();
      expect(() => new QuantumConfig(8, 4, 5)).not.toThrow();
    });
  });

  describe('utility methods', () => {
    test('should clone configuration', () => {
      const original = new QuantumConfig(10, 5, 7, 0.7, 'test');
      const cloned = original.clone();
      
      expect(cloned.equals(original)).toBe(true);
      expect(cloned).not.toBe(original);
    });

    test('should check equality', () => {
      const config1 = new QuantumConfig(10, 5, 7, 0.7, 'test');
      const config2 = new QuantumConfig(10, 5, 7, 0.7, 'test');
      const config3 = new QuantumConfig(8, 4, 7, 0.7, 'test');
      
      expect(config1.equals(config2)).toBe(true);
      expect(config1.equals(config3)).toBe(false);
    });

    test('should generate string representation', () => {
      const config = new QuantumConfig(10, 6, 7, 0.7, 'test');
      const str = config.toString();
      
      expect(str).toContain('QuantumConfig');
      expect(str).toContain('test');
      expect(str).toContain('bits=10');
      expect(str).toContain('entanglement=6');
      expect(str).toContain('complexity=7');
      expect(str).toContain('threshold=0.7');
    });
  });
});