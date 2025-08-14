import { Complex } from '../math/Complex';
import { QuantumMath } from '../math/QuantumMath';
import { QuantumStateVector } from './QuantumStateVector';

/**
 * Represents a quantum superposition state combining multiple quantum states
 * Used for parallel pattern analysis in the compression algorithm
 */
export class SuperpositionState {
  private _combinedAmplitudes: Complex[];
  private _probabilityDistribution: number[];
  private _coherenceTime: number;
  private _constituentStates: QuantumStateVector[];
  private _weights: number[];

  constructor(
    combinedAmplitudes: Complex[],
    constituentStates: QuantumStateVector[],
    weights: number[],
    coherenceTime: number = 1.0
  ) {
    if (combinedAmplitudes.length === 0) {
      throw new Error('SuperpositionState must have at least one amplitude');
    }

    if (constituentStates.length === 0) {
      throw new Error('SuperpositionState must have at least one constituent state');
    }

    if (weights.length !== constituentStates.length) {
      throw new Error('Weights array must match constituent states array length');
    }

    this._combinedAmplitudes = [...combinedAmplitudes];
    this._constituentStates = constituentStates.map(state => state.clone());
    this._weights = [...weights];
    this._coherenceTime = coherenceTime;

    // Calculate probability distribution
    this._probabilityDistribution = this.calculateProbabilityDistribution();

    // Validate the superposition state
    this.validateSuperposition();
  }

  /**
   * Get the combined amplitudes (read-only)
   */
  get combinedAmplitudes(): readonly Complex[] {
    return this._combinedAmplitudes;
  }

  /**
   * Get the probability distribution (read-only)
   */
  get probabilityDistribution(): readonly number[] {
    return this._probabilityDistribution;
  }

  /**
   * Get the coherence time
   */
  get coherenceTime(): number {
    return this._coherenceTime;
  }

  /**
   * Get the constituent states (read-only)
   */
  get constituentStates(): readonly QuantumStateVector[] {
    return this._constituentStates;
  }

  /**
   * Get the weights (read-only)
   */
  get weights(): readonly number[] {
    return this._weights;
  }

  /**
   * Create a superposition state from multiple quantum states
   */
  static fromQuantumStates(
    states: QuantumStateVector[],
    weights?: number[],
    coherenceTime: number = 1.0
  ): SuperpositionState {
    if (states.length === 0) {
      throw new Error('Cannot create superposition from empty states array');
    }

    // Use equal weights if none provided
    const actualWeights = weights || new Array(states.length).fill(1 / states.length);
    
    // Normalize weights to sum to 1
    const weightSum = actualWeights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = actualWeights.map(w => w / weightSum);

    // Create the superposition using QuantumStateVector's method
    const superpositionVector = QuantumStateVector.createSuperposition(states, normalizedWeights);
    
    return new SuperpositionState(
      [...superpositionVector.amplitudes],
      states,
      normalizedWeights,
      coherenceTime
    );
  }

  /**
   * Create a superposition from classical data patterns
   */
  static fromDataPatterns(
    dataPatterns: Buffer[],
    weights?: number[],
    coherenceTime: number = 1.0
  ): SuperpositionState {
    if (dataPatterns.length === 0) {
      throw new Error('Cannot create superposition from empty data patterns');
    }

    // Convert data patterns to quantum states
    const quantumStates = dataPatterns.map(pattern => 
      QuantumStateVector.fromBytes(pattern)
    );

    return SuperpositionState.fromQuantumStates(quantumStates, weights, coherenceTime);
  }

  /**
   * Analyze probability amplitudes to find dominant patterns
   */
  analyzeProbabilityAmplitudes(): PatternProbability[] {
    const patterns: PatternProbability[] = [];

    for (let i = 0; i < this._combinedAmplitudes.length; i++) {
      const amplitude = this._combinedAmplitudes[i];
      const probability = QuantumMath.probabilityFromAmplitude(amplitude);
      
      patterns.push({
        index: i,
        amplitude: amplitude,
        probability: probability,
        phase: amplitude.phase(),
        magnitude: amplitude.magnitude()
      });
    }

    // Sort by probability (highest first)
    return patterns.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Get the dominant patterns above a threshold
   */
  getDominantPatterns(threshold: number = 0.1): PatternProbability[] {
    const allPatterns = this.analyzeProbabilityAmplitudes();
    return allPatterns.filter(pattern => pattern.probability >= threshold);
  }

  /**
   * Calculate the entropy of the superposition state
   */
  calculateEntropy(): number {
    return QuantumMath.calculateEntropy(this._probabilityDistribution);
  }

  /**
   * Apply decoherence to simulate quantum state degradation
   */
  applyDecoherence(timeStep: number): SuperpositionState {
    const newCoherenceTime = Math.max(0, this._coherenceTime - timeStep);
    const decoherenceFactor = newCoherenceTime / this._coherenceTime;

    // Apply decoherence to amplitudes
    const decoherentAmplitudes = this._combinedAmplitudes.map(amp => 
      amp.scale(Math.sqrt(decoherenceFactor))
    );

    // Add random phase noise due to decoherence
    const noisyAmplitudes = decoherentAmplitudes.map(amp => {
      const phaseNoise = (Math.random() - 0.5) * (1 - decoherenceFactor) * Math.PI;
      return amp.multiply(Complex.fromPolar(1, phaseNoise));
    });

    return new SuperpositionState(
      noisyAmplitudes,
      this._constituentStates,
      this._weights,
      newCoherenceTime
    );
  }

  /**
   * Measure the superposition state (collapse to classical state)
   */
  measure(): { stateIndex: number; probability: number; collapsedState: QuantumStateVector } {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (let i = 0; i < this._constituentStates.length; i++) {
      cumulativeProbability += this._weights[i];
      
      if (random <= cumulativeProbability) {
        return {
          stateIndex: i,
          probability: this._weights[i],
          collapsedState: this._constituentStates[i].clone()
        };
      }
    }

    // Fallback to last state (shouldn't happen with proper probabilities)
    const lastIndex = this._constituentStates.length - 1;
    return {
      stateIndex: lastIndex,
      probability: this._weights[lastIndex],
      collapsedState: this._constituentStates[lastIndex].clone()
    };
  }

  /**
   * Check if the superposition is still coherent
   */
  isCoherent(threshold: number = 0.1): boolean {
    return this._coherenceTime > threshold;
  }

  /**
   * Calculate the total probability (should be 1 for valid superposition)
   */
  getTotalProbability(): number {
    return this._probabilityDistribution.reduce((sum, p) => sum + p, 0);
  }

  /**
   * Create a deep copy of this superposition state
   */
  clone(): SuperpositionState {
    const amplitudesCopy = this._combinedAmplitudes.map(amp => 
      new Complex(amp.real, amp.imaginary)
    );
    
    return new SuperpositionState(
      amplitudesCopy,
      this._constituentStates,
      this._weights,
      this._coherenceTime
    );
  }

  /**
   * Get string representation of the superposition state
   */
  toString(): string {
    const entropy = this.calculateEntropy().toFixed(4);
    const coherence = this._coherenceTime.toFixed(4);
    const stateCount = this._constituentStates.length;
    
    return `SuperpositionState(states: ${stateCount}, entropy: ${entropy}, coherence: ${coherence})`;
  }

  /**
   * Calculate probability distribution from combined amplitudes
   */
  private calculateProbabilityDistribution(): number[] {
    return this._combinedAmplitudes.map(amp => QuantumMath.probabilityFromAmplitude(amp));
  }

  /**
   * Validate the superposition state
   */
  private validateSuperposition(): void {
    // Check coherence time
    if (this._coherenceTime < 0) {
      throw new Error('Coherence time cannot be negative');
    }

    // Check weights sum to approximately 1
    const weightSum = this._weights.reduce((sum, w) => sum + w, 0);
    if (Math.abs(weightSum - 1) > 1e-10) {
      throw new Error('Weights must sum to 1');
    }

    // Check all weights are non-negative
    if (this._weights.some(w => w < 0)) {
      throw new Error('All weights must be non-negative');
    }
  }
}

/**
 * Interface for pattern probability analysis
 */
export interface PatternProbability {
  index: number;
  amplitude: Complex;
  probability: number;
  phase: number;
  magnitude: number;
}