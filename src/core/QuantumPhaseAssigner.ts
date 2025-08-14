import { QuantumMath } from '../math/QuantumMath';

/**
 * Advanced quantum phase assignment algorithms
 * Implements sophisticated phase calculation strategies for optimal quantum representation
 */
export class QuantumPhaseAssigner {
  private _strategy: PhaseAssignmentStrategy;
  private _adaptiveThreshold: number;

  constructor(
    strategy: PhaseAssignmentStrategy = 'entropy-based',
    adaptiveThreshold: number = 0.5
  ) {
    this._strategy = strategy;
    this._adaptiveThreshold = adaptiveThreshold;
  }

  /**
   * Get current phase assignment strategy
   */
  get strategy(): PhaseAssignmentStrategy {
    return this._strategy;
  }

  /**
   * Set phase assignment strategy
   */
  set strategy(value: PhaseAssignmentStrategy) {
    this._strategy = value;
  }

  /**
   * Get adaptive threshold
   */
  get adaptiveThreshold(): number {
    return this._adaptiveThreshold;
  }

  /**
   * Set adaptive threshold
   */
  set adaptiveThreshold(value: number) {
    if (value < 0 || value > 1) {
      throw new Error('Adaptive threshold must be between 0 and 1');
    }
    this._adaptiveThreshold = value;
  }

  /**
   * Calculate quantum phase for a data chunk using the selected strategy
   */
  calculatePhase(chunk: Buffer, context?: PhaseContext): number {
    switch (this._strategy) {
      case 'entropy-based':
        return this.calculateEntropyBasedPhase(chunk);
      case 'frequency-based':
        return this.calculateFrequencyBasedPhase(chunk);
      case 'pattern-based':
        return this.calculatePatternBasedPhase(chunk);
      case 'adaptive':
        return this.calculateAdaptivePhase(chunk, context);
      case 'correlation-based':
        return this.calculateCorrelationBasedPhase(chunk, context);
      default:
        return this.calculateEntropyBasedPhase(chunk);
    }
  }

  /**
   * Calculate phase based on data entropy
   */
  private calculateEntropyBasedPhase(chunk: Buffer): number {
    if (chunk.length === 0) return 0;

    const frequencies = new Array(256).fill(0);
    for (const byte of chunk) {
      frequencies[byte]++;
    }

    const probabilities = frequencies.map(freq => freq / chunk.length);
    const entropy = QuantumMath.calculateEntropy(probabilities);

    // Map entropy (0-8 bits) to phase (0-2π)
    return (entropy / 8) * 2 * Math.PI;
  }

  /**
   * Calculate phase based on byte frequency distribution
   */
  private calculateFrequencyBasedPhase(chunk: Buffer): number {
    if (chunk.length === 0) return 0;

    const frequencies = new Array(256).fill(0);
    for (const byte of chunk) {
      frequencies[byte]++;
    }

    // Find the most frequent byte
    const maxFrequency = Math.max(...frequencies);
    const maxFreqIndex = frequencies.indexOf(maxFrequency);

    // Calculate phase based on dominant frequency
    const dominanceRatio = maxFrequency / chunk.length;
    const basePhase = QuantumMath.calculateQuantumPhase(maxFreqIndex);

    // Modulate phase based on dominance
    return basePhase * (1 - dominanceRatio) + (dominanceRatio * Math.PI);
  }

  /**
   * Calculate phase based on data patterns
   */
  private calculatePatternBasedPhase(chunk: Buffer): number {
    if (chunk.length < 2) return this.calculateEntropyBasedPhase(chunk);

    let patternScore = 0;
    let transitions = 0;

    // Analyze byte transitions
    for (let i = 1; i < chunk.length; i++) {
      const diff = Math.abs(chunk[i] - chunk[i - 1]);
      patternScore += diff;
      if (diff > 0) transitions++;
    }

    // Calculate average transition magnitude
    const avgTransition = patternScore / (chunk.length - 1);
    const transitionRate = transitions / (chunk.length - 1);

    // Combine transition magnitude and rate for phase
    const normalizedTransition = avgTransition / 255; // Normalize to 0-1
    const phase = (normalizedTransition * transitionRate) * 2 * Math.PI;

    return phase;
  }

  /**
   * Calculate adaptive phase based on chunk characteristics
   */
  private calculateAdaptivePhase(chunk: Buffer, context?: PhaseContext): number {
    if (chunk.length === 0) return 0;

    // Calculate multiple phase candidates
    const entropyPhase = this.calculateEntropyBasedPhase(chunk);
    const frequencyPhase = this.calculateFrequencyBasedPhase(chunk);
    const patternPhase = this.calculatePatternBasedPhase(chunk);

    // Analyze chunk characteristics
    const entropy = this.calculateChunkEntropy(chunk);
    const uniformity = this.calculateUniformity(chunk);
    const complexity = this.calculateComplexity(chunk);

    // Weight phases based on characteristics
    let weights = [0.33, 0.33, 0.34]; // Default equal weights

    if (entropy > 6) {
      // High entropy: favor entropy-based phase
      weights = [0.6, 0.2, 0.2];
    } else if (uniformity > 0.8) {
      // High uniformity: favor frequency-based phase
      weights = [0.2, 0.6, 0.2];
    } else if (complexity > this._adaptiveThreshold) {
      // High complexity: favor pattern-based phase
      weights = [0.2, 0.2, 0.6];
    }

    // Calculate weighted average phase
    const weightedPhase = 
      (entropyPhase * weights[0]) +
      (frequencyPhase * weights[1]) +
      (patternPhase * weights[2]);

    return weightedPhase % (2 * Math.PI);
  }

  /**
   * Calculate correlation-based phase using context
   */
  private calculateCorrelationBasedPhase(chunk: Buffer, context?: PhaseContext): number {
    if (!context || !context.previousChunks || context.previousChunks.length === 0) {
      return this.calculateEntropyBasedPhase(chunk);
    }

    // Calculate correlation with previous chunks
    let maxCorrelation = 0;
    let correlatedPhase = 0;

    for (const prevChunk of context.previousChunks) {
      const correlation = this.calculateChunkCorrelation(chunk, prevChunk.data);
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        correlatedPhase = prevChunk.phase;
      }
    }

    // If high correlation found, use related phase
    if (maxCorrelation > 0.7) {
      const basePhase = this.calculateEntropyBasedPhase(chunk);
      // Blend correlated phase with entropy phase
      return (correlatedPhase * maxCorrelation) + (basePhase * (1 - maxCorrelation));
    }

    return this.calculateEntropyBasedPhase(chunk);
  }

  /**
   * Calculate entropy of a chunk
   */
  private calculateChunkEntropy(chunk: Buffer): number {
    const frequencies = new Array(256).fill(0);
    for (const byte of chunk) {
      frequencies[byte]++;
    }

    const probabilities = frequencies.map(freq => freq / chunk.length);
    return QuantumMath.calculateEntropy(probabilities);
  }

  /**
   * Calculate uniformity of byte distribution
   */
  private calculateUniformity(chunk: Buffer): number {
    const frequencies = new Array(256).fill(0);
    for (const byte of chunk) {
      frequencies[byte]++;
    }

    const nonZeroFreqs = frequencies.filter(freq => freq > 0);
    if (nonZeroFreqs.length <= 1) return 1;

    // Calculate coefficient of variation
    const mean = nonZeroFreqs.reduce((sum, freq) => sum + freq, 0) / nonZeroFreqs.length;
    const variance = nonZeroFreqs.reduce((sum, freq) => sum + Math.pow(freq - mean, 2), 0) / nonZeroFreqs.length;
    const stdDev = Math.sqrt(variance);

    // Return inverse of coefficient of variation (higher = more uniform)
    return mean > 0 ? 1 / (1 + stdDev / mean) : 0;
  }

  /**
   * Calculate complexity based on local patterns
   */
  private calculateComplexity(chunk: Buffer): number {
    if (chunk.length < 2) return 0;

    let complexity = 0;
    const windowSize = Math.min(4, chunk.length);

    for (let i = 0; i <= chunk.length - windowSize; i++) {
      const window = chunk.subarray(i, i + windowSize);
      const windowEntropy = this.calculateChunkEntropy(window);
      complexity += windowEntropy;
    }

    return complexity / (chunk.length - windowSize + 1);
  }

  /**
   * Calculate correlation between two chunks
   */
  private calculateChunkCorrelation(chunk1: Buffer, chunk2: Buffer): number {
    const minLength = Math.min(chunk1.length, chunk2.length);
    if (minLength === 0) return 0;

    let correlation = 0;
    for (let i = 0; i < minLength; i++) {
      const similarity = 1 - Math.abs(chunk1[i] - chunk2[i]) / 255;
      correlation += similarity;
    }

    return correlation / minLength;
  }

  /**
   * Optimize phase assignment strategy for given data
   */
  optimizeStrategy(data: Buffer): PhaseAssignmentStrategy {
    if (data.length === 0) return 'entropy-based';

    const entropy = this.calculateChunkEntropy(data);
    const uniformity = this.calculateUniformity(data);
    const complexity = this.calculateComplexity(data);

    // Choose strategy based on data characteristics
    if (entropy > 7) {
      return 'entropy-based'; // High entropy data
    } else if (uniformity > 0.8) {
      return 'frequency-based'; // Uniform data
    } else if (complexity > 0.6) {
      return 'pattern-based'; // Complex patterns
    } else {
      return 'adaptive'; // Mixed characteristics
    }
  }

  /**
   * Create phase context for correlation-based assignment
   */
  createPhaseContext(previousChunks: ChunkPhaseInfo[] = []): PhaseContext {
    return {
      previousChunks: [...previousChunks],
      timestamp: Date.now()
    };
  }

  /**
   * Update phase context with new chunk information
   */
  updatePhaseContext(context: PhaseContext, chunk: Buffer, phase: number): PhaseContext {
    const updatedContext = { ...context };
    
    updatedContext.previousChunks.push({
      data: Buffer.from(chunk),
      phase: phase,
      timestamp: Date.now()
    });

    // Keep only recent chunks (limit memory usage)
    const maxChunks = 10;
    if (updatedContext.previousChunks.length > maxChunks) {
      updatedContext.previousChunks = updatedContext.previousChunks.slice(-maxChunks);
    }

    return updatedContext;
  }
}

/**
 * Phase assignment strategy types
 */
export type PhaseAssignmentStrategy = 
  | 'entropy-based'
  | 'frequency-based' 
  | 'pattern-based'
  | 'adaptive'
  | 'correlation-based';

/**
 * Context for phase assignment
 */
export interface PhaseContext {
  previousChunks: ChunkPhaseInfo[];
  timestamp: number;
}

/**
 * Information about a chunk and its assigned phase
 */
export interface ChunkPhaseInfo {
  data: Buffer;
  phase: number;
  timestamp: number;
}