/**
 * Advanced data chunking algorithms for optimal quantum state preparation
 * Implements various chunking strategies based on data characteristics
 */
export class DataChunker {
  private _strategy: ChunkingStrategy;
  private _baseChunkSize: number;
  private _maxChunkSize: number;
  private _minChunkSize: number;

  constructor(
    strategy: ChunkingStrategy = 'fixed-size',
    baseChunkSize: number = 4,
    minChunkSize: number = 1,
    maxChunkSize: number = 64
  ) {
    this.validateParameters(baseChunkSize, minChunkSize, maxChunkSize);
    
    this._strategy = strategy;
    this._baseChunkSize = baseChunkSize;
    this._minChunkSize = minChunkSize;
    this._maxChunkSize = maxChunkSize;
  }

  /**
   * Get current chunking strategy
   */
  get strategy(): ChunkingStrategy {
    return this._strategy;
  }

  /**
   * Set chunking strategy
   */
  set strategy(value: ChunkingStrategy) {
    this._strategy = value;
  }

  /**
   * Get base chunk size
   */
  get baseChunkSize(): number {
    return this._baseChunkSize;
  }

  /**
   * Set base chunk size
   */
  set baseChunkSize(value: number) {
    this.validateChunkSize(value);
    this._baseChunkSize = value;
  }

  /**
   * Get minimum chunk size
   */
  get minChunkSize(): number {
    return this._minChunkSize;
  }

  /**
   * Set minimum chunk size
   */
  set minChunkSize(value: number) {
    this.validateChunkSize(value);
    this._minChunkSize = value;
  }

  /**
   * Get maximum chunk size
   */
  get maxChunkSize(): number {
    return this._maxChunkSize;
  }

  /**
   * Set maximum chunk size
   */
  set maxChunkSize(value: number) {
    this.validateChunkSize(value);
    this._maxChunkSize = value;
  }

  /**
   * Chunk data using the selected strategy
   */
  chunkData(data: Buffer): DataChunk[] {
    if (data.length === 0) {
      throw new Error('Cannot chunk empty data');
    }

    switch (this._strategy) {
      case 'fixed-size':
        return this.fixedSizeChunking(data);
      case 'entropy-based':
        return this.entropyBasedChunking(data);
      case 'pattern-based':
        return this.patternBasedChunking(data);
      case 'adaptive':
        return this.adaptiveChunking(data);
      case 'boundary-based':
        return this.boundaryBasedChunking(data);
      default:
        return this.fixedSizeChunking(data);
    }
  }

  /**
   * Fixed-size chunking (traditional approach)
   */
  private fixedSizeChunking(data: Buffer): DataChunk[] {
    const chunks: DataChunk[] = [];
    
    for (let i = 0; i < data.length; i += this._baseChunkSize) {
      const end = Math.min(i + this._baseChunkSize, data.length);
      const chunkData = data.subarray(i, end);
      
      chunks.push({
        data: chunkData,
        startIndex: i,
        endIndex: end - 1,
        size: chunkData.length,
        entropy: this.calculateChunkEntropy(chunkData),
        complexity: this.calculateChunkComplexity(chunkData)
      });
    }
    
    return chunks;
  }

  /**
   * Entropy-based chunking (variable size based on information content)
   */
  private entropyBasedChunking(data: Buffer): DataChunk[] {
    const chunks: DataChunk[] = [];
    let currentStart = 0;
    
    while (currentStart < data.length) {
      let optimalSize = this._baseChunkSize;
      let bestEntropy = 0;
      
      // Try different chunk sizes to find optimal entropy
      for (let size = this._minChunkSize; size <= this._maxChunkSize; size++) {
        const end = Math.min(currentStart + size, data.length);
        if (end <= currentStart) break;
        
        const testChunk = data.subarray(currentStart, end);
        const entropy = this.calculateChunkEntropy(testChunk);
        
        // Prefer chunks with moderate entropy (good information content)
        const entropyScore = this.calculateEntropyScore(entropy, size);
        
        if (entropyScore > bestEntropy) {
          bestEntropy = entropyScore;
          optimalSize = size;
        }
      }
      
      const end = Math.min(currentStart + optimalSize, data.length);
      const chunkData = data.subarray(currentStart, end);
      
      chunks.push({
        data: chunkData,
        startIndex: currentStart,
        endIndex: end - 1,
        size: chunkData.length,
        entropy: this.calculateChunkEntropy(chunkData),
        complexity: this.calculateChunkComplexity(chunkData)
      });
      
      currentStart = end;
    }
    
    return chunks;
  }

  /**
   * Pattern-based chunking (break at pattern boundaries)
   */
  private patternBasedChunking(data: Buffer): DataChunk[] {
    const chunks: DataChunk[] = [];
    let currentStart = 0;
    
    while (currentStart < data.length) {
      let chunkEnd = Math.min(currentStart + this._baseChunkSize, data.length);
      
      // Look for pattern boundaries within reasonable range
      const searchEnd = Math.min(currentStart + this._maxChunkSize, data.length);
      
      for (let i = currentStart + this._minChunkSize; i < searchEnd - 1; i++) {
        if (this.isPatternBoundary(data, i)) {
          chunkEnd = i + 1;
          break;
        }
      }
      
      const chunkData = data.subarray(currentStart, chunkEnd);
      
      chunks.push({
        data: chunkData,
        startIndex: currentStart,
        endIndex: chunkEnd - 1,
        size: chunkData.length,
        entropy: this.calculateChunkEntropy(chunkData),
        complexity: this.calculateChunkComplexity(chunkData)
      });
      
      currentStart = chunkEnd;
    }
    
    return chunks;
  }

  /**
   * Adaptive chunking (combines multiple strategies)
   */
  private adaptiveChunking(data: Buffer): DataChunk[] {
    // Analyze data characteristics first
    const globalEntropy = this.calculateChunkEntropy(data);
    const globalComplexity = this.calculateChunkComplexity(data);
    
    // Choose sub-strategy based on data characteristics
    if (globalEntropy > 6) {
      // High entropy: use entropy-based chunking
      return this.entropyBasedChunking(data);
    } else if (globalComplexity > 0.5) {
      // High complexity: use pattern-based chunking
      return this.patternBasedChunking(data);
    } else {
      // Low entropy/complexity: use boundary-based chunking
      return this.boundaryBasedChunking(data);
    }
  }

  /**
   * Boundary-based chunking (break at natural data boundaries)
   */
  private boundaryBasedChunking(data: Buffer): DataChunk[] {
    const chunks: DataChunk[] = [];
    let currentStart = 0;
    
    while (currentStart < data.length) {
      let chunkEnd = Math.min(currentStart + this._baseChunkSize, data.length);
      
      // Look for natural boundaries (repeated bytes, zero bytes, etc.)
      const searchEnd = Math.min(currentStart + this._maxChunkSize, data.length);
      
      for (let i = currentStart + this._minChunkSize; i < searchEnd; i++) {
        if (this.isNaturalBoundary(data, i)) {
          chunkEnd = i;
          break;
        }
      }
      
      const chunkData = data.subarray(currentStart, chunkEnd);
      
      chunks.push({
        data: chunkData,
        startIndex: currentStart,
        endIndex: chunkEnd - 1,
        size: chunkData.length,
        entropy: this.calculateChunkEntropy(chunkData),
        complexity: this.calculateChunkComplexity(chunkData)
      });
      
      currentStart = chunkEnd;
    }
    
    return chunks;
  }

  /**
   * Calculate entropy score for chunk size optimization
   */
  private calculateEntropyScore(entropy: number, size: number): number {
    // Prefer moderate entropy (around 4-6 bits) and reasonable size
    const entropyScore = 1 - Math.abs(entropy - 5) / 5; // Peak at entropy = 5
    const sizeScore = 1 - Math.abs(size - this._baseChunkSize) / this._baseChunkSize;
    
    return (entropyScore * 0.7) + (sizeScore * 0.3);
  }

  /**
   * Check if position is a pattern boundary
   */
  private isPatternBoundary(data: Buffer, position: number): boolean {
    if (position <= 0 || position >= data.length - 1) return false;
    
    const windowSize = Math.min(3, position, data.length - position);
    
    // Check for significant change in local patterns
    const beforeWindow = data.subarray(Math.max(0, position - windowSize), position);
    const afterWindow = data.subarray(position, Math.min(data.length, position + windowSize));
    
    const beforeEntropy = this.calculateChunkEntropy(beforeWindow);
    const afterEntropy = this.calculateChunkEntropy(afterWindow);
    
    // Significant entropy change indicates pattern boundary
    return Math.abs(beforeEntropy - afterEntropy) > 1.5;
  }

  /**
   * Check if position is a natural boundary
   */
  private isNaturalBoundary(data: Buffer, position: number): boolean {
    if (position <= 0 || position >= data.length) return false;
    
    const currentByte = data[position];
    const prevByte = data[position - 1];
    
    // Zero byte boundary
    if (currentByte === 0 || prevByte === 0) return true;
    
    // Large value jump
    if (Math.abs(currentByte - prevByte) > 128) return true;
    
    // Repeated byte sequence end
    if (position >= 2) {
      const prev2Byte = data[position - 2];
      if (prevByte === prev2Byte && currentByte !== prevByte) return true;
    }
    
    return false;
  }

  /**
   * Calculate entropy of a chunk
   */
  private calculateChunkEntropy(chunk: Buffer): number {
    if (chunk.length === 0) return 0;
    
    const frequencies = new Array(256).fill(0);
    for (const byte of chunk) {
      frequencies[byte]++;
    }
    
    let entropy = 0;
    for (const freq of frequencies) {
      if (freq > 0) {
        const p = freq / chunk.length;
        entropy -= p * Math.log2(p);
      }
    }
    
    return entropy;
  }

  /**
   * Calculate complexity of a chunk
   */
  private calculateChunkComplexity(chunk: Buffer): number {
    if (chunk.length < 2) return 0;
    
    let complexity = 0;
    for (let i = 1; i < chunk.length; i++) {
      const diff = Math.abs(chunk[i] - chunk[i - 1]);
      complexity += diff / 255; // Normalize to 0-1
    }
    
    return complexity / (chunk.length - 1);
  }

  /**
   * Analyze chunking effectiveness
   */
  analyzeChunking(chunks: DataChunk[]): ChunkingAnalysis {
    if (chunks.length === 0) {
      return {
        totalChunks: 0,
        averageChunkSize: 0,
        minChunkSize: 0,
        maxChunkSize: 0,
        averageEntropy: 0,
        averageComplexity: 0,
        sizeVariance: 0,
        entropyVariance: 0
      };
    }
    
    const sizes = chunks.map(chunk => chunk.size);
    const entropies = chunks.map(chunk => chunk.entropy);
    const complexities = chunks.map(chunk => chunk.complexity);
    
    const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const avgEntropy = entropies.reduce((sum, entropy) => sum + entropy, 0) / entropies.length;
    const avgComplexity = complexities.reduce((sum, complexity) => sum + complexity, 0) / complexities.length;
    
    const sizeVariance = sizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / sizes.length;
    const entropyVariance = entropies.reduce((sum, entropy) => sum + Math.pow(entropy - avgEntropy, 2), 0) / entropies.length;
    
    return {
      totalChunks: chunks.length,
      averageChunkSize: avgSize,
      minChunkSize: Math.min(...sizes),
      maxChunkSize: Math.max(...sizes),
      averageEntropy: avgEntropy,
      averageComplexity: avgComplexity,
      sizeVariance: sizeVariance,
      entropyVariance: entropyVariance
    };
  }

  /**
   * Optimize chunking strategy for given data
   */
  optimizeStrategy(data: Buffer): ChunkingStrategy {
    if (data.length === 0) return 'fixed-size';
    
    const entropy = this.calculateChunkEntropy(data);
    const complexity = this.calculateChunkComplexity(data);
    
    // Test different strategies and choose the best one
    const strategies: ChunkingStrategy[] = ['fixed-size', 'entropy-based', 'pattern-based', 'boundary-based'];
    let bestStrategy: ChunkingStrategy = 'fixed-size';
    let bestScore = 0;
    
    for (const strategy of strategies) {
      const originalStrategy = this._strategy;
      this._strategy = strategy;
      
      try {
        const chunks = this.chunkData(data);
        const analysis = this.analyzeChunking(chunks);
        
        // Score based on entropy distribution and size consistency
        const entropyScore = Math.min(analysis.averageEntropy / 6, 1); // Prefer moderate entropy
        const consistencyScore = 1 / (1 + analysis.sizeVariance / analysis.averageChunkSize); // Prefer consistent sizes
        const efficiencyScore = analysis.averageChunkSize / this._baseChunkSize; // Prefer reasonable sizes
        
        const totalScore = (entropyScore * 0.4) + (consistencyScore * 0.3) + (efficiencyScore * 0.3);
        
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestStrategy = strategy;
        }
      } catch (error) {
        // Strategy failed, skip it
      }
      
      this._strategy = originalStrategy;
    }
    
    return bestStrategy;
  }

  /**
   * Validate chunking parameters
   */
  private validateParameters(baseChunkSize: number, minChunkSize: number, maxChunkSize: number): void {
    if (minChunkSize < 1) {
      throw new Error('Minimum chunk size must be at least 1');
    }
    
    if (maxChunkSize > 1024) {
      throw new Error('Maximum chunk size cannot exceed 1024');
    }
    
    if (minChunkSize > maxChunkSize) {
      throw new Error('Minimum chunk size cannot be greater than maximum chunk size');
    }
    
    if (baseChunkSize < minChunkSize || baseChunkSize > maxChunkSize) {
      throw new Error('Base chunk size must be between minimum and maximum chunk sizes');
    }
  }

  /**
   * Validate individual chunk size
   */
  private validateChunkSize(size: number): void {
    if (size < 1 || size > 1024) {
      throw new Error('Chunk size must be between 1 and 1024');
    }
  }
}

/**
 * Chunking strategy types
 */
export type ChunkingStrategy = 
  | 'fixed-size'
  | 'entropy-based'
  | 'pattern-based'
  | 'adaptive'
  | 'boundary-based';

/**
 * Data chunk information
 */
export interface DataChunk {
  data: Buffer;
  startIndex: number;
  endIndex: number;
  size: number;
  entropy: number;
  complexity: number;
}

/**
 * Chunking analysis results
 */
export interface ChunkingAnalysis {
  totalChunks: number;
  averageChunkSize: number;
  minChunkSize: number;
  maxChunkSize: number;
  averageEntropy: number;
  averageComplexity: number;
  sizeVariance: number;
  entropyVariance: number;
}