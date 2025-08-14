import { CompressedQuantumData, InterferencePattern, QuantumMetadata } from '../CompressedQuantumData';
import { QuantumStateVector } from '../QuantumStateVector';
import { EntanglementPair } from '../EntanglementPair';
import { Complex } from '../../math/Complex';

describe('CompressedQuantumData', () => {
  let sampleStates: QuantumStateVector[];
  let sampleEntanglementMap: Map<string, EntanglementPair>;
  let sampleInterferencePatterns: InterferencePattern[];
  let sampleMetadata: QuantumMetadata;

  beforeEach(() => {
    // Create sample quantum states
    sampleStates = [
      new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]),
      new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8)])
    ];

    // Create sample entanglement pair
    const pair = new EntanglementPair(sampleStates[0], sampleStates[1]);
    sampleEntanglementMap = new Map();
    sampleEntanglementMap.set(pair.entanglementId, pair);

    // Create sample interference patterns
    sampleInterferencePatterns = [
      {
        type: 'constructive',
        amplitude: 0.8,
        phase: Math.PI / 4,
        frequency: 2.0,
        stateIndices: [0, 1]
      }
    ];

    // Create sample metadata
    sampleMetadata = {
      originalSize: 1024,
      compressedSize: 512,
      compressionRatio: 2.0,
      quantumStateCount: 2,
      entanglementCount: 1,
      interferencePatternCount: 1,
      compressionTimestamp: Date.now(),
      quantumFlowVersion: '1.0.0',
      compressionConfig: { test: true }
    };
  });

  describe('constructor and basic properties', () => {
    test('should create compressed quantum data', () => {
      const compressed = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      expect(compressed.quantumStates).toHaveLength(2);
      expect(compressed.entanglementMap.size).toBe(1);
      expect(compressed.interferencePatterns).toHaveLength(1);
      expect(compressed.metadata.originalSize).toBe(1024);
      expect(compressed.checksum).toBeDefined();
    });

    test('should throw error for empty quantum states', () => {
      expect(() => new CompressedQuantumData(
        [],
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      )).toThrow('CompressedQuantumData must contain at least one quantum state');
    });

    test('should throw error for invalid original size', () => {
      const invalidMetadata = { ...sampleMetadata, originalSize: 0 };
      
      expect(() => new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        invalidMetadata
      )).toThrow('Original size must be positive');
    });
  });

  describe('create factory method', () => {
    test('should create compressed data from compression process', () => {
      const entanglementPairs = Array.from(sampleEntanglementMap.values());
      
      const compressed = CompressedQuantumData.create(
        sampleStates,
        entanglementPairs,
        sampleInterferencePatterns,
        1024,
        { test: true }
      );

      expect(compressed.quantumStates).toHaveLength(2);
      expect(compressed.entanglementMap.size).toBe(1);
      expect(compressed.metadata.originalSize).toBe(1024);
      expect(compressed.metadata.compressedSize).toBeGreaterThan(0);
      expect(compressed.metadata.compressionRatio).toBeGreaterThan(0);
    });
  });

  describe('serialization and deserialization', () => {
    test('should serialize to buffer', () => {
      const compressed = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      const buffer = compressed.serialize();
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    test('should deserialize from buffer', () => {
      const original = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      const buffer = original.serialize();
      const deserialized = CompressedQuantumData.deserialize(buffer);

      expect(deserialized.quantumStates).toHaveLength(original.quantumStates.length);
      expect(deserialized.entanglementMap.size).toBe(original.entanglementMap.size);
      expect(deserialized.metadata.originalSize).toBe(original.metadata.originalSize);
    });

    test('should handle serialization round-trip', () => {
      const original = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      const buffer = original.serialize();
      const deserialized = CompressedQuantumData.deserialize(buffer);
      const reserializedBuffer = deserialized.serialize();

      // Allow for small differences due to floating point precision and new entanglement IDs
      expect(Math.abs(buffer.length - reserializedBuffer.length)).toBeLessThan(10);
    });

    test('should throw error for invalid buffer', () => {
      const invalidBuffer = Buffer.from('invalid data');
      
      expect(() => CompressedQuantumData.deserialize(invalidBuffer)).toThrow(
        'Failed to deserialize compressed quantum data'
      );
    });

    test('should throw error for unsupported version', () => {
      const invalidData = {
        version: '2.0.0',
        quantumStates: [],
        entanglementMap: [],
        interferencePatterns: [],
        metadata: sampleMetadata,
        checksum: 'test'
      };
      
      const buffer = Buffer.from(JSON.stringify(invalidData));
      
      expect(() => CompressedQuantumData.deserialize(buffer)).toThrow(
        'Unsupported QuantumFlow version: 2.0.0'
      );
    });
  });

  describe('integrity verification', () => {
    test('should verify data integrity', () => {
      const compressed = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      expect(compressed.verifyIntegrity()).toBe(true);
    });

    test('should detect corrupted data', () => {
      // Create valid compressed data first
      const compressed = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      // Manually corrupt the checksum to test detection
      (compressed as any)._checksum = 'invalid-checksum';

      expect(compressed.verifyIntegrity()).toBe(false);
    });
  });

  describe('compression statistics', () => {
    test('should calculate compression stats', () => {
      const compressed = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      const stats = compressed.getCompressionStats();

      expect(stats.originalSize).toBe(1024);
      expect(stats.compressedSize).toBe(512);
      expect(stats.compressionRatio).toBe(2.0);
      expect(stats.spaceSaved).toBe(512);
      expect(stats.spaceSavedPercentage).toBe(50);
      expect(stats.quantumStateCount).toBe(2);
      expect(stats.entanglementCount).toBe(1);
      expect(stats.interferencePatternCount).toBe(1);
    });
  });

  describe('entanglement operations', () => {
    test('should get entanglement pairs as array', () => {
      const compressed = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      const pairs = compressed.getEntanglementPairs();
      
      expect(pairs).toHaveLength(1);
      expect(pairs[0]).toBeInstanceOf(EntanglementPair);
    });

    test('should find entanglement pair by ID', () => {
      const compressed = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      const pairId = Array.from(sampleEntanglementMap.keys())[0];
      const foundPair = compressed.findEntanglementPair(pairId);
      
      expect(foundPair).toBeInstanceOf(EntanglementPair);
      expect(foundPair!.entanglementId).toBe(pairId);
    });

    test('should return undefined for non-existent entanglement ID', () => {
      const compressed = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      const foundPair = compressed.findEntanglementPair('non-existent-id');
      
      expect(foundPair).toBeUndefined();
    });

    test('should get entangled states by ID', () => {
      // Create states with explicit entanglement IDs
      const state1 = new QuantumStateVector([new Complex(0.8, 0), new Complex(0, 0.6)]);
      const state2 = new QuantumStateVector([new Complex(0.6, 0), new Complex(0, 0.8)]);
      
      const pair = new EntanglementPair(state1, state2);
      const entanglementMap = new Map();
      entanglementMap.set(pair.entanglementId, pair);
      
      // Use the entangled states in the compressed data
      const entangledStates = [pair.stateA, pair.stateB];
      
      const compressed = new CompressedQuantumData(
        entangledStates,
        entanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      const foundStates = compressed.getEntangledStates(pair.entanglementId);
      
      expect(foundStates.length).toBeGreaterThan(0);
    });
  });

  describe('performance estimation', () => {
    test('should estimate decompression time', () => {
      const compressed = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      const estimatedTime = compressed.estimateDecompressionTime();
      
      expect(estimatedTime).toBeGreaterThan(0);
    });
  });

  describe('utility methods', () => {
    test('should clone compressed data', () => {
      const original = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      const cloned = original.clone();
      
      expect(cloned.quantumStates).toHaveLength(original.quantumStates.length);
      expect(cloned.entanglementMap.size).toBe(original.entanglementMap.size);
      expect(cloned.metadata.originalSize).toBe(original.metadata.originalSize);
      expect(cloned).not.toBe(original);
    });

    test('should generate string representation', () => {
      const compressed = new CompressedQuantumData(
        sampleStates,
        sampleEntanglementMap,
        sampleInterferencePatterns,
        sampleMetadata
      );

      const str = compressed.toString();
      
      expect(str).toContain('CompressedQuantumData');
      expect(str).toContain('1024B');
      expect(str).toContain('512B');
      expect(str).toContain('2.00x');
    });
  });
});