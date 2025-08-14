import { QuantumStateVector } from '../models/QuantumStateVector';
import { SuperpositionState, PatternProbability } from '../models/SuperpositionState';
import { Complex } from '../math/Complex';
import { QuantumMath } from '../math/QuantumMath';

/**
 * Advanced pattern recognition system for quantum compression
 * Identifies and analyzes patterns in quantum states for optimal compression
 */
export class PatternRecognizer {
  private _minPatternLength: number;
  private _maxPatternLength: number;
  private _similarityThreshold: number;
  private _frequencyThreshold: number;
  private _complexityWeight: number;

  constructor(
    minPatternLength: number = 2,
    maxPatternLength: number = 16,
    similarityThreshold: number = 0.8,
    frequencyThreshold: number = 2,
    complexityWeight: number = 0.3
  ) {
    this.validateParameters(minPatternLength, maxPatternLength, similarityThreshold, frequencyThreshold, complexityWeight);
    
    this._minPatternLength = minPatternLength;
    this._maxPatternLength = maxPatternLength;
    this._similarityThreshold = similarityThreshold;
    this._frequencyThreshold = frequencyThreshold;
    this._complexityWeight = complexityWeight;
  }

  /**
   * Get minimum pattern length
   */
  get minPatternLength(): number {
    return this._minPatternLength;
  }

  /**
   * Set minimum pattern length
   */
  set minPatternLength(value: number) {
    if (value < 1 || value > this._maxPatternLength) {
      throw new Error('Minimum pattern length must be between 1 and maximum pattern length');
    }
    this._minPatternLength = value;
  }

  /**
   * Get maximum pattern length
   */
  get maxPatternLength(): number {
    return this._maxPatternLength;
  }

  /**
   * Set maximum pattern length
   */
  set maxPatternLength(value: number) {
    if (value < this._minPatternLength || value > 64) {
      throw new Error('Maximum pattern length must be between minimum pattern length and 64');
    }
    this._maxPatternLength = value;
  }

  /**
   * Get similarity threshold
   */
  get similarityThreshold(): number {
    return this._similarityThreshold;
  }

  /**
   * Set similarity threshold
   */
  set similarityThreshold(value: number) {
    if (value < 0 || value > 1) {
      throw new Error('Similarity threshold must be between 0 and 1');
    }
    this._similarityThreshold = value;
  }

  /**
   * Get frequency threshold
   */
  get frequencyThreshold(): number {
    return this._frequencyThreshold;
  }

  /**
   * Set frequency threshold
   */
  set frequencyThreshold(value: number) {
    if (value < 1) {
      throw new Error('Frequency threshold must be at least 1');
    }
    this._frequencyThreshold = value;
  }

  /**
   * Get complexity weight
   */
  get complexityWeight(): number {
    return this._complexityWeight;
  }

  /**
   * Set complexity weight
   */
  set complexityWeight(value: number) {
    if (value < 0 || value > 1) {
      throw new Error('Complexity weight must be between 0 and 1');
    }
    this._complexityWeight = value;
  }

  /**
   * Recognize patterns in quantum states
   */
  recognizePatterns(states: QuantumStateVector[]): RecognizedPattern[] {
    if (states.length === 0) {
      return [];
    }

    const patterns: RecognizedPattern[] = [];
    const amplitudeSequences = this.extractAmplitudeSequences(states);
    
    // Find repeating patterns in amplitude sequences
    for (let length = this._minPatternLength; length <= this._maxPatternLength; length++) {
      const lengthPatterns = this.findPatternsOfLength(amplitudeSequences, length);
      patterns.push(...lengthPatterns);
    }

    // Filter and rank patterns
    const filteredPatterns = this.filterPatternsByFrequency(patterns);
    const rankedPatterns = this.rankPatterns(filteredPatterns);

    return rankedPatterns;
  }

  /**
   * Analyze probability distributions in quantum states
   */
  analyzeProbabilityDistributions(states: QuantumStateVector[]): ProbabilityAnalysis {
    if (states.length === 0) {
      return {
        averageEntropy: 0,
        entropyVariance: 0,
        probabilityDistributions: [],
        dominantProbabilities: [],
        correlationMatrix: [],
        informationContent: 0,
        compressionPotential: 0
      };
    }

    const distributions = states.map(state => state.getProbabilityDistribution());
    const entropies = distributions.map(dist => QuantumMath.calculateEntropy(dist));
    
    const averageEntropy = entropies.reduce((sum, entropy) => sum + entropy, 0) / entropies.length;
    const entropyVariance = entropies.reduce((sum, entropy) => 
      sum + Math.pow(entropy - averageEntropy, 2), 0
    ) / entropies.length;

    const dominantProbabilities = this.findDominantProbabilities(distributions);
    const correlationMatrix = this.calculateCorrelationMatrix(distributions);
    const informationContent = this.calculateInformationContent(distributions);
    const compressionPotential = this.estimateCompressionPotential(distributions, entropies);

    return {
      averageEntropy,
      entropyVariance,
      probabilityDistributions: distributions,
      dominantProbabilities,
      correlationMatrix,
      informationContent,
      compressionPotential
    };
  }

  /**
   * Identify high-probability quantum states
   */
  identifyHighProbabilityStates(
    superposition: SuperpositionState,
    threshold: number = 0.1
  ): HighProbabilityState[] {
    const patterns = superposition.analyzeProbabilityAmplitudes();
    
    return patterns
      .filter(pattern => pattern.probability >= threshold)
      .map(pattern => ({
        stateIndex: pattern.index,
        amplitude: pattern.amplitude,
        probability: pattern.probability,
        phase: pattern.phase,
        magnitude: pattern.magnitude,
        significance: this.calculateStateSignificance(pattern),
        compressionValue: this.calculateCompressionValue(pattern)
      }))
      .sort((a, b) => b.significance - a.significance);
  }

  /**
   * Detect quantum interference patterns
   */
  detectInterferencePatterns(states: QuantumStateVector[]): InterferencePattern[] {
    if (states.length < 2) {
      return [];
    }

    const patterns: InterferencePattern[] = [];
    
    // Analyze pairs of states for interference
    for (let i = 0; i < states.length - 1; i++) {
      for (let j = i + 1; j < states.length; j++) {
        const interference = this.analyzeStatePairInterference(states[i], states[j]);
        if (interference) {
          patterns.push(interference);
        }
      }
    }

    // Sort by interference strength
    return patterns.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Calculate pattern compression efficiency
   */
  calculatePatternCompressionEfficiency(patterns: RecognizedPattern[]): CompressionEfficiency {
    if (patterns.length === 0) {
      return {
        totalPatterns: 0,
        averageFrequency: 0,
        compressionRatio: 1,
        spaceSavings: 0,
        efficiencyScore: 0
      };
    }

    const totalFrequency = patterns.reduce((sum, pattern) => sum + pattern.frequency, 0);
    const averageFrequency = totalFrequency / patterns.length;
    
    // Calculate potential space savings
    let spaceSavings = 0;
    for (const pattern of patterns) {
      const originalSize = pattern.length * pattern.frequency;
      const compressedSize = pattern.length + pattern.frequency; // Pattern + references
      spaceSavings += Math.max(0, originalSize - compressedSize);
    }

    const totalOriginalSize = patterns.reduce((sum, pattern) => 
      sum + (pattern.length * pattern.frequency), 0
    );
    
    const compressionRatio = totalOriginalSize > 0 ? totalOriginalSize / (totalOriginalSize - spaceSavings) : 1;
    const efficiencyScore = this.calculateEfficiencyScore(patterns);

    return {
      totalPatterns: patterns.length,
      averageFrequency,
      compressionRatio,
      spaceSavings,
      efficiencyScore
    };
  }

  /**
   * Optimize patterns for compression
   */
  optimizePatternsForCompression(patterns: RecognizedPattern[]): OptimizedPattern[] {
    if (patterns.length === 0) {
      return [];
    }

    // Group similar patterns
    const patternGroups = this.groupSimilarPatterns(patterns);
    
    // Optimize each group
    const optimizedPatterns: OptimizedPattern[] = [];
    
    for (const group of patternGroups) {
      const optimized = this.optimizePatternGroup(group);
      optimizedPatterns.push(optimized);
    }

    // Sort by compression value
    return optimizedPatterns.sort((a, b) => b.compressionValue - a.compressionValue);
  }

  /**
   * Extract amplitude sequences from quantum states
   */
  private extractAmplitudeSequences(states: QuantumStateVector[]): Complex[][] {
    return states.map(state => Array.from(state.amplitudes));
  }

  /**
   * Find patterns of specific length
   */
  private findPatternsOfLength(sequences: Complex[][], length: number): RecognizedPattern[] {
    const patternMap = new Map<string, RecognizedPattern>();
    
    for (let seqIndex = 0; seqIndex < sequences.length; seqIndex++) {
      const sequence = sequences[seqIndex];
      
      for (let i = 0; i <= sequence.length - length; i++) {
        const pattern = sequence.slice(i, i + length);
        const patternKey = this.generatePatternKey(pattern);
        
        if (patternMap.has(patternKey)) {
          const existing = patternMap.get(patternKey)!;
          existing.frequency++;
          existing.positions.push({ sequenceIndex: seqIndex, startIndex: i });
        } else {
          patternMap.set(patternKey, {
            id: patternKey,
            amplitudes: pattern,
            length: length,
            frequency: 1,
            positions: [{ sequenceIndex: seqIndex, startIndex: i }],
            similarity: 1.0,
            complexity: this.calculatePatternComplexity(pattern),
            significance: 0 // Will be calculated later
          });
        }
      }
    }
    
    // Calculate significance for each pattern
    const patterns = Array.from(patternMap.values());
    patterns.forEach(pattern => {
      pattern.significance = this.calculatePatternSignificance(pattern);
    });
    
    return patterns;
  }

  /**
   * Filter patterns by frequency threshold
   */
  private filterPatternsByFrequency(patterns: RecognizedPattern[]): RecognizedPattern[] {
    return patterns.filter(pattern => pattern.frequency >= this._frequencyThreshold);
  }

  /**
   * Rank patterns by significance
   */
  private rankPatterns(patterns: RecognizedPattern[]): RecognizedPattern[] {
    return patterns.sort((a, b) => b.significance - a.significance);
  }

  /**
   * Generate unique key for pattern
   */
  private generatePatternKey(amplitudes: Complex[]): string {
    return amplitudes
      .map(amp => `${Math.round(amp.real * 1000)}_${Math.round(amp.imaginary * 1000)}`)
      .join('|');
  }

  /**
   * Calculate pattern complexity
   */
  private calculatePatternComplexity(amplitudes: Complex[]): number {
    if (amplitudes.length < 2) return 0;
    
    let complexity = 0;
    for (let i = 1; i < amplitudes.length; i++) {
      const diff = amplitudes[i].subtract(amplitudes[i - 1]).magnitude();
      complexity += diff;
    }
    
    return complexity / (amplitudes.length - 1);
  }

  /**
   * Calculate pattern significance
   */
  private calculatePatternSignificance(pattern: RecognizedPattern): number {
    const frequencyScore = Math.log(pattern.frequency + 1);
    const lengthScore = pattern.length / this._maxPatternLength;
    const complexityScore = (1 - pattern.complexity) * this._complexityWeight;
    
    return (frequencyScore * 0.5) + (lengthScore * 0.3) + (complexityScore * 0.2);
  }

  /**
   * Find dominant probabilities across distributions
   */
  private findDominantProbabilities(distributions: number[][]): DominantProbability[] {
    const probabilityMap = new Map<number, DominantProbability>();
    
    distributions.forEach((dist, distIndex) => {
      dist.forEach((prob, probIndex) => {
        if (prob > 0.1) { // Only consider significant probabilities
          const key = Math.round(prob * 1000) / 1000; // Round for grouping
          
          if (probabilityMap.has(key)) {
            const existing = probabilityMap.get(key)!;
            existing.frequency++;
            existing.positions.push({ distributionIndex: distIndex, probabilityIndex: probIndex });
          } else {
            probabilityMap.set(key, {
              value: key,
              frequency: 1,
              positions: [{ distributionIndex: distIndex, probabilityIndex: probIndex }],
              significance: prob
            });
          }
        }
      });
    });
    
    return Array.from(probabilityMap.values())
      .sort((a, b) => b.significance - a.significance);
  }

  /**
   * Calculate correlation matrix between probability distributions
   */
  private calculateCorrelationMatrix(distributions: number[][]): number[][] {
    const n = distributions.length;
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1;
        } else {
          matrix[i][j] = this.calculateDistributionCorrelation(distributions[i], distributions[j]);
        }
      }
    }
    
    return matrix;
  }

  /**
   * Calculate correlation between two probability distributions
   */
  private calculateDistributionCorrelation(dist1: number[], dist2: number[]): number {
    const minLength = Math.min(dist1.length, dist2.length);
    if (minLength === 0) return 0;
    
    let correlation = 0;
    for (let i = 0; i < minLength; i++) {
      correlation += dist1[i] * dist2[i];
    }
    
    return correlation / minLength;
  }

  /**
   * Calculate total information content
   */
  private calculateInformationContent(distributions: number[][]): number {
    return distributions.reduce((total, dist) => {
      const entropy = QuantumMath.calculateEntropy(dist);
      return total + entropy * dist.length;
    }, 0);
  }

  /**
   * Estimate compression potential
   */
  private estimateCompressionPotential(distributions: number[][], entropies: number[]): number {
    const maxEntropy = Math.log2(256); // Maximum entropy for byte data
    const averageEntropy = entropies.reduce((sum, e) => sum + e, 0) / entropies.length;
    
    return 1 - (averageEntropy / maxEntropy);
  }

  /**
   * Calculate state significance
   */
  private calculateStateSignificance(pattern: PatternProbability): number {
    return pattern.probability * pattern.magnitude;
  }

  /**
   * Calculate compression value for a state
   */
  private calculateCompressionValue(pattern: PatternProbability): number {
    return pattern.probability * Math.log(pattern.magnitude + 1);
  }

  /**
   * Analyze interference between two states
   */
  private analyzeStatePairInterference(state1: QuantumStateVector, state2: QuantumStateVector): InterferencePattern | null {
    const correlation = state1.calculateCorrelation(state2);
    
    if (correlation < 0.3) return null; // Not enough correlation for meaningful interference
    
    const minLength = Math.min(state1.amplitudes.length, state2.amplitudes.length);
    const constructiveInterference = QuantumMath.applyInterference(
      Array.from(state1.amplitudes.slice(0, minLength)),
      Array.from(state2.amplitudes.slice(0, minLength)),
      'constructive'
    );
    
    const destructiveInterference = QuantumMath.applyInterference(
      Array.from(state1.amplitudes.slice(0, minLength)),
      Array.from(state2.amplitudes.slice(0, minLength)),
      'destructive'
    );
    
    const constructiveStrength = constructiveInterference.reduce(
      (sum, amp) => sum + amp.magnitudeSquared(), 0
    ) / constructiveInterference.length;
    
    const destructiveStrength = destructiveInterference.reduce(
      (sum, amp) => sum + amp.magnitudeSquared(), 0
    ) / destructiveInterference.length;
    
    return {
      type: constructiveStrength > destructiveStrength ? 'constructive' : 'destructive',
      strength: Math.max(constructiveStrength, destructiveStrength),
      correlation: correlation,
      amplitudeIndices: Array.from({length: minLength}, (_, i) => i)
    };
  }

  /**
   * Calculate efficiency score for patterns
   */
  private calculateEfficiencyScore(patterns: RecognizedPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const totalSignificance = patterns.reduce((sum, pattern) => sum + pattern.significance, 0);
    const averageSignificance = totalSignificance / patterns.length;
    const frequencyScore = patterns.reduce((sum, pattern) => sum + Math.log(pattern.frequency + 1), 0) / patterns.length;
    
    return (averageSignificance * 0.6) + (frequencyScore * 0.4);
  }

  /**
   * Group similar patterns together
   */
  private groupSimilarPatterns(patterns: RecognizedPattern[]): RecognizedPattern[][] {
    const groups: RecognizedPattern[][] = [];
    const used = new Set<string>();
    
    for (const pattern of patterns) {
      if (used.has(pattern.id)) continue;
      
      const group = [pattern];
      used.add(pattern.id);
      
      // Find similar patterns
      for (const other of patterns) {
        if (used.has(other.id)) continue;
        
        const similarity = this.calculatePatternSimilarity(pattern, other);
        if (similarity >= this._similarityThreshold) {
          group.push(other);
          used.add(other.id);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  }

  /**
   * Calculate similarity between two patterns
   */
  private calculatePatternSimilarity(pattern1: RecognizedPattern, pattern2: RecognizedPattern): number {
    if (pattern1.length !== pattern2.length) return 0;
    
    let similarity = 0;
    const minLength = Math.min(pattern1.amplitudes.length, pattern2.amplitudes.length);
    
    for (let i = 0; i < minLength; i++) {
      const amp1 = pattern1.amplitudes[i];
      const amp2 = pattern2.amplitudes[i];
      const diff = amp1.subtract(amp2).magnitude();
      similarity += 1 - Math.min(1, diff);
    }
    
    return similarity / minLength;
  }

  /**
   * Optimize a group of similar patterns
   */
  private optimizePatternGroup(group: RecognizedPattern[]): OptimizedPattern {
    const totalFrequency = group.reduce((sum, pattern) => sum + pattern.frequency, 0);
    const averageComplexity = group.reduce((sum, pattern) => sum + pattern.complexity, 0) / group.length;
    const totalSignificance = group.reduce((sum, pattern) => sum + pattern.significance, 0);
    
    // Use the most frequent pattern as the representative
    const representative = group.reduce((best, current) => 
      current.frequency > best.frequency ? current : best
    );
    
    const compressionValue = this.calculateGroupCompressionValue(group);
    
    return {
      id: `optimized_${representative.id}`,
      representativePattern: representative,
      groupSize: group.length,
      totalFrequency,
      averageComplexity,
      totalSignificance,
      compressionValue,
      patterns: group
    };
  }

  /**
   * Calculate compression value for a pattern group
   */
  private calculateGroupCompressionValue(group: RecognizedPattern[]): number {
    const totalOriginalSize = group.reduce((sum, pattern) => 
      sum + (pattern.length * pattern.frequency), 0
    );
    
    const compressedSize = group[0].length + group.reduce((sum, pattern) => sum + pattern.frequency, 0);
    
    return totalOriginalSize > compressedSize ? (totalOriginalSize - compressedSize) / totalOriginalSize : 0;
  }

  /**
   * Validate constructor parameters
   */
  private validateParameters(
    minPatternLength: number,
    maxPatternLength: number,
    similarityThreshold: number,
    frequencyThreshold: number,
    complexityWeight: number
  ): void {
    if (minPatternLength < 1 || minPatternLength > maxPatternLength) {
      throw new Error('Minimum pattern length must be between 1 and maximum pattern length');
    }
    
    if (maxPatternLength < minPatternLength || maxPatternLength > 64) {
      throw new Error('Maximum pattern length must be between minimum pattern length and 64');
    }
    
    if (similarityThreshold < 0 || similarityThreshold > 1) {
      throw new Error('Similarity threshold must be between 0 and 1');
    }
    
    if (frequencyThreshold < 1) {
      throw new Error('Frequency threshold must be at least 1');
    }
    
    if (complexityWeight < 0 || complexityWeight > 1) {
      throw new Error('Complexity weight must be between 0 and 1');
    }
  }
}

/**
 * Recognized pattern in quantum states
 */
export interface RecognizedPattern {
  id: string;
  amplitudes: Complex[];
  length: number;
  frequency: number;
  positions: PatternPosition[];
  similarity: number;
  complexity: number;
  significance: number;
}

/**
 * Position of a pattern occurrence
 */
export interface PatternPosition {
  sequenceIndex: number;
  startIndex: number;
}

/**
 * Probability analysis results
 */
export interface ProbabilityAnalysis {
  averageEntropy: number;
  entropyVariance: number;
  probabilityDistributions: number[][];
  dominantProbabilities: DominantProbability[];
  correlationMatrix: number[][];
  informationContent: number;
  compressionPotential: number;
}

/**
 * Dominant probability information
 */
export interface DominantProbability {
  value: number;
  frequency: number;
  positions: ProbabilityPosition[];
  significance: number;
}

/**
 * Position of a probability value
 */
export interface ProbabilityPosition {
  distributionIndex: number;
  probabilityIndex: number;
}

/**
 * High probability quantum state
 */
export interface HighProbabilityState {
  stateIndex: number;
  amplitude: Complex;
  probability: number;
  phase: number;
  magnitude: number;
  significance: number;
  compressionValue: number;
}

/**
 * Quantum interference pattern
 */
export interface InterferencePattern {
  type: 'constructive' | 'destructive';
  strength: number;
  correlation: number;
  amplitudeIndices: number[];
}

/**
 * Compression efficiency metrics
 */
export interface CompressionEfficiency {
  totalPatterns: number;
  averageFrequency: number;
  compressionRatio: number;
  spaceSavings: number;
  efficiencyScore: number;
}

/**
 * Optimized pattern group
 */
export interface OptimizedPattern {
  id: string;
  representativePattern: RecognizedPattern;
  groupSize: number;
  totalFrequency: number;
  averageComplexity: number;
  totalSignificance: number;
  compressionValue: number;
  patterns: RecognizedPattern[];
}