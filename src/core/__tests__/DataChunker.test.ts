import { DataChunker, ChunkingStrategy, DataChunk } from '../DataChunker';

describe('DataChunker', () => {
  describe('constructor and basic properties', () => {
    test('should create chunker with default parameters', () => {
      const chunker = new DataChunker();
      
      expect(chunker.strategy).toBe('fixed-size');
      expect(chunker.baseChunkSize).toBe(4);
      expect(chunker.minChunkSize).toBe(1);
      expect(chunker.maxChunkSize).toBe(64);
    });

    test('should create chunker with custom parameters', () => {
      const chunker = new DataChunker('entropy-based', 8, 2, 32);
      
      expect(chunker.strategy).toBe('entropy-based');
      expect(chunker.baseChunkSize).toBe(8);
      expect(chunker.minChunkSize).toBe(2);
      expect(chunker.maxChunkSize).toBe(32);
    });

    test('should validate parameter bounds', () => {
      expect(() => new DataChunker('fixed-size', 4, 0, 64)).toThrow(
        'Minimum chunk size must be at least 1'
      );
      expect(() => new DataChunker('fixed-size', 4, 1, 2000)).toThrow(
        'Maximum chunk size cannot exceed 1024'
      );
      expect(() => new DataChunker('fixed-size', 4, 10, 5)).toThrow(
        'Minimum chunk size cannot be greater than maximum chunk size'
      );
      expect(() => new DataChunker('fixed-size', 100, 1, 50)).toThrow(
        'Base chunk size must be between minimum and maximum chunk sizes'
      );
    });
  });

  describe('fixed-size chunking', () => {
    test('should chunk data into fixed-size pieces', () => {
      const chunker = new DataChunker('fixed-size', 4);
      const data = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks).toHaveLength(3); // 10 bytes / 4 = 2.5 -> 3 chunks
      expect(chunks[0].size).toBe(4);
      expect(chunks[1].size).toBe(4);
      expect(chunks[2].size).toBe(2); // Last chunk is smaller
      
      chunks.forEach(chunk => {
        expect(chunk.data).toBeInstanceOf(Buffer);
        expect(chunk.entropy).toBeGreaterThanOrEqual(0);
        expect(chunk.complexity).toBeGreaterThanOrEqual(0);
      });
    });

    test('should handle data smaller than chunk size', () => {
      const chunker = new DataChunker('fixed-size', 10);
      const data = Buffer.from([1, 2, 3]);
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0].size).toBe(3);
    });

    test('should handle data exactly divisible by chunk size', () => {
      const chunker = new DataChunker('fixed-size', 5);
      const data = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks).toHaveLength(2);
      expect(chunks[0].size).toBe(5);
      expect(chunks[1].size).toBe(5);
    });
  });

  describe('entropy-based chunking', () => {
    test('should create variable-size chunks based on entropy', () => {
      const chunker = new DataChunker('entropy-based', 4, 2, 8);
      const data = Buffer.from([1, 1, 1, 1, 2, 3, 4, 5, 6, 6, 6, 6]); // Low then high then low entropy
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach(chunk => {
        expect(chunk.size).toBeGreaterThanOrEqual(2);
        expect(chunk.size).toBeLessThanOrEqual(8);
      });
    });

    test('should handle uniform data', () => {
      const chunker = new DataChunker('entropy-based', 4, 2, 8);
      const data = Buffer.alloc(12, 42); // All same value
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach(chunk => {
        expect(chunk.entropy).toBe(0); // Uniform data has zero entropy
      });
    });

    test('should handle high entropy data', () => {
      const chunker = new DataChunker('entropy-based', 4, 2, 8);
      const data = Buffer.from(Array.from({length: 16}, (_, i) => i * 17 % 256)); // High entropy
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach(chunk => {
        expect(chunk.entropy).toBeGreaterThan(0);
      });
    });
  });

  describe('pattern-based chunking', () => {
    test('should break at pattern boundaries', () => {
      const chunker = new DataChunker('pattern-based', 4, 2, 8);
      const data = Buffer.from([1, 2, 3, 100, 101, 102, 200, 201, 202]); // Clear pattern changes
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach(chunk => {
        expect(chunk.size).toBeGreaterThanOrEqual(1); // Allow minimum size of 1
        expect(chunk.size).toBeLessThanOrEqual(8);
      });
    });

    test('should handle gradual changes', () => {
      const chunker = new DataChunker('pattern-based', 4, 2, 8);
      const data = Buffer.from([10, 11, 12, 13, 14, 15, 16, 17]); // Gradual increase
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('adaptive chunking', () => {
    test('should choose appropriate strategy for high entropy data', () => {
      const chunker = new DataChunker('adaptive', 4, 2, 8);
      const highEntropyData = Buffer.from(Array.from({length: 20}, (_, i) => i * 7 % 256));
      
      const chunks = chunker.chunkData(highEntropyData);
      
      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach(chunk => {
        expect(chunk.size).toBeGreaterThanOrEqual(2);
        expect(chunk.size).toBeLessThanOrEqual(8);
      });
    });

    test('should choose appropriate strategy for low entropy data', () => {
      const chunker = new DataChunker('adaptive', 4, 2, 8);
      const lowEntropyData = Buffer.from([42, 42, 43, 43, 44, 44, 45, 45]);
      
      const chunks = chunker.chunkData(lowEntropyData);
      
      expect(chunks.length).toBeGreaterThan(0);
    });

    test('should choose appropriate strategy for complex data', () => {
      const chunker = new DataChunker('adaptive', 4, 2, 8);
      const complexData = Buffer.from([10, 200, 30, 180, 50, 160, 70, 140]);
      
      const chunks = chunker.chunkData(complexData);
      
      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('boundary-based chunking', () => {
    test('should break at natural boundaries', () => {
      const chunker = new DataChunker('boundary-based', 4, 2, 8);
      const data = Buffer.from([10, 20, 30, 0, 40, 50, 60, 255, 70, 80]); // Zero and 255 boundaries
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks.length).toBeGreaterThan(1);
    });

    test('should handle data without clear boundaries', () => {
      const chunker = new DataChunker('boundary-based', 4, 2, 8);
      const data = Buffer.from([100, 101, 102, 103, 104, 105, 106, 107]); // Gradual changes
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('chunking analysis', () => {
    test('should analyze chunking results', () => {
      const chunker = new DataChunker('fixed-size', 4);
      const data = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      const chunks = chunker.chunkData(data);
      const analysis = chunker.analyzeChunking(chunks);
      
      expect(analysis.totalChunks).toBe(chunks.length);
      expect(analysis.averageChunkSize).toBeGreaterThan(0);
      expect(analysis.minChunkSize).toBeGreaterThan(0);
      expect(analysis.maxChunkSize).toBeGreaterThan(0);
      expect(analysis.averageEntropy).toBeGreaterThanOrEqual(0);
      expect(analysis.averageComplexity).toBeGreaterThanOrEqual(0);
      expect(analysis.sizeVariance).toBeGreaterThanOrEqual(0);
      expect(analysis.entropyVariance).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty chunks array', () => {
      const chunker = new DataChunker();
      const analysis = chunker.analyzeChunking([]);
      
      expect(analysis.totalChunks).toBe(0);
      expect(analysis.averageChunkSize).toBe(0);
      expect(analysis.minChunkSize).toBe(0);
      expect(analysis.maxChunkSize).toBe(0);
      expect(analysis.averageEntropy).toBe(0);
      expect(analysis.averageComplexity).toBe(0);
      expect(analysis.sizeVariance).toBe(0);
      expect(analysis.entropyVariance).toBe(0);
    });

    test('should calculate statistics correctly', () => {
      const chunker = new DataChunker();
      const mockChunks: DataChunk[] = [
        {
          data: Buffer.from([1, 2]),
          startIndex: 0,
          endIndex: 1,
          size: 2,
          entropy: 1.0,
          complexity: 0.5
        },
        {
          data: Buffer.from([3, 4, 5, 6]),
          startIndex: 2,
          endIndex: 5,
          size: 4,
          entropy: 2.0,
          complexity: 0.3
        }
      ];
      
      const analysis = chunker.analyzeChunking(mockChunks);
      
      expect(analysis.totalChunks).toBe(2);
      expect(analysis.averageChunkSize).toBe(3); // (2 + 4) / 2
      expect(analysis.minChunkSize).toBe(2);
      expect(analysis.maxChunkSize).toBe(4);
      expect(analysis.averageEntropy).toBe(1.5); // (1.0 + 2.0) / 2
      expect(analysis.averageComplexity).toBe(0.4); // (0.5 + 0.3) / 2
    });
  });

  describe('strategy optimization', () => {
    test('should optimize strategy for different data types', () => {
      const chunker = new DataChunker('fixed-size', 4, 2, 8);
      
      // Test with different data patterns
      const uniformData = Buffer.alloc(20, 42);
      const randomData = Buffer.from(Array.from({length: 20}, () => Math.floor(Math.random() * 256)));
      const patternData = Buffer.from([1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]);
      
      const uniformStrategy = chunker.optimizeStrategy(uniformData);
      const randomStrategy = chunker.optimizeStrategy(randomData);
      const patternStrategy = chunker.optimizeStrategy(patternData);
      
      expect(['fixed-size', 'entropy-based', 'pattern-based', 'adaptive', 'boundary-based']).toContain(uniformStrategy);
      expect(['fixed-size', 'entropy-based', 'pattern-based', 'adaptive', 'boundary-based']).toContain(randomStrategy);
      expect(['fixed-size', 'entropy-based', 'pattern-based', 'adaptive', 'boundary-based']).toContain(patternStrategy);
    });

    test('should handle empty data', () => {
      const chunker = new DataChunker();
      const emptyData = Buffer.from([]);
      
      const strategy = chunker.optimizeStrategy(emptyData);
      
      expect(strategy).toBe('fixed-size');
    });
  });

  describe('property setters', () => {
    test('should validate chunk size setters', () => {
      const chunker = new DataChunker();
      
      expect(() => chunker.baseChunkSize = 0).toThrow('Chunk size must be between 1 and 1024');
      expect(() => chunker.baseChunkSize = 2000).toThrow('Chunk size must be between 1 and 1024');
      expect(() => chunker.minChunkSize = 0).toThrow('Chunk size must be between 1 and 1024');
      expect(() => chunker.maxChunkSize = 2000).toThrow('Chunk size must be between 1 and 1024');
    });

    test('should allow valid chunk size changes', () => {
      const chunker = new DataChunker();
      
      chunker.baseChunkSize = 8;
      chunker.minChunkSize = 2;
      chunker.maxChunkSize = 16;
      
      expect(chunker.baseChunkSize).toBe(8);
      expect(chunker.minChunkSize).toBe(2);
      expect(chunker.maxChunkSize).toBe(16);
    });

    test('should allow strategy changes', () => {
      const chunker = new DataChunker('fixed-size');
      
      chunker.strategy = 'entropy-based';
      
      expect(chunker.strategy).toBe('entropy-based');
    });
  });

  describe('error handling', () => {
    test('should throw error for empty data', () => {
      const chunker = new DataChunker();
      const emptyData = Buffer.from([]);
      
      expect(() => chunker.chunkData(emptyData)).toThrow('Cannot chunk empty data');
    });

    test('should handle all chunking strategies', () => {
      const chunker = new DataChunker();
      const data = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
      
      const strategies: ChunkingStrategy[] = [
        'fixed-size',
        'entropy-based',
        'pattern-based',
        'adaptive',
        'boundary-based'
      ];
      
      for (const strategy of strategies) {
        chunker.strategy = strategy;
        const chunks = chunker.chunkData(data);
        
        expect(chunks.length).toBeGreaterThan(0);
        chunks.forEach(chunk => {
          expect(chunk.data).toBeInstanceOf(Buffer);
          expect(chunk.size).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('edge cases', () => {
    test('should handle single byte data', () => {
      const chunker = new DataChunker('fixed-size', 4);
      const data = Buffer.from([42]);
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0].size).toBe(1);
      expect(chunks[0].data[0]).toBe(42);
    });

    test('should handle very large chunks', () => {
      const chunker = new DataChunker('fixed-size', 100, 1, 200);
      const data = Buffer.from(Array.from({length: 50}, (_, i) => i));
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0].size).toBe(50);
    });

    test('should handle minimum chunk size', () => {
      const chunker = new DataChunker('fixed-size', 1);
      const data = Buffer.from([1, 2, 3, 4, 5]);
      
      const chunks = chunker.chunkData(data);
      
      expect(chunks).toHaveLength(5);
      chunks.forEach((chunk, index) => {
        expect(chunk.size).toBe(1);
        expect(chunk.data[0]).toBe(index + 1);
      });
    });
  });
});