import { QuantumStateVector } from '../models/QuantumStateVector';
import { SuperpositionState } from '../models/SuperpositionState';
/**
 * Simulates quantum decoherence effects on quantum states
 * Tracks coherence time degradation and applies realistic quantum noise
 */
export declare class QuantumDecoherenceSimulator {
    private _baseCoherenceTime;
    private _decoherenceRate;
    private _environmentalNoise;
    private _temperatureEffect;
    constructor(baseCoherenceTime?: number, decoherenceRate?: number, environmentalNoise?: number, temperatureEffect?: number);
    /**
     * Get current base coherence time
     */
    get baseCoherenceTime(): number;
    /**
     * Get current decoherence rate
     */
    get decoherenceRate(): number;
    /**
     * Calculate remaining coherence time for a quantum state
     */
    calculateCoherenceTime(state: QuantumStateVector, elapsedTime?: number, environmentalFactors?: EnvironmentalFactors): number;
    /**
     * Apply decoherence effects to a quantum state vector
     */
    applyDecoherence(state: QuantumStateVector, timeStep: number, environmentalFactors?: EnvironmentalFactors): DecoherenceResult;
    /**
     * Apply decoherence to a superposition state
     */
    applySuperpositionDecoherence(superposition: SuperpositionState, timeStep: number, environmentalFactors?: EnvironmentalFactors): SuperpositionDecoherenceResult;
    /**
     * Detect quantum errors in a state
     */
    detectQuantumErrors(originalState: QuantumStateVector, currentState: QuantumStateVector, errorThreshold?: number): QuantumErrorDetection;
    /**
     * Simulate quantum state evolution over time
     */
    simulateTimeEvolution(initialState: QuantumStateVector, totalTime: number, timeSteps?: number, environmentalFactors?: EnvironmentalFactors): TimeEvolutionResult;
    /**
     * Apply amplitude damping to quantum amplitudes
     */
    private applyAmplitudeDamping;
    /**
     * Apply phase damping (dephasing) to quantum amplitudes
     */
    private applyPhaseDamping;
    /**
     * Add environmental noise to quantum amplitudes
     */
    private addEnvironmentalNoise;
    /**
     * Calculate phase noise due to decoherence
     */
    private calculatePhaseNoise;
    /**
     * Calculate state complexity factor
     */
    private calculateStateComplexity;
    /**
     * Calculate fidelity between two quantum states
     */
    calculateFidelity(state1: QuantumStateVector, state2: QuantumStateVector): number;
    /**
     * Calculate entropy increase due to decoherence
     */
    private calculateEntropyIncrease;
    /**
     * Detect amplitude errors between states
     */
    private detectAmplitudeErrors;
    /**
     * Detect phase errors between states
     */
    private detectPhaseErrors;
    /**
     * Detect normalization errors
     */
    private detectNormalizationError;
    /**
     * Detect entanglement corruption
     */
    private detectEntanglementCorruption;
    /**
     * Calculate overall error severity
     */
    private calculateErrorSeverity;
    /**
     * Calculate coherence lifetime from coherence time series
     */
    private calculateCoherenceLifetime;
    /**
     * Generate Gaussian noise using Box-Muller transform
     */
    private generateGaussianNoise;
}
/**
 * Environmental factors affecting quantum decoherence
 */
export interface EnvironmentalFactors {
    temperature?: number;
    magneticField?: number;
    vibration?: number;
    radiation?: number;
}
/**
 * Result of applying decoherence to a quantum state
 */
export interface DecoherenceResult {
    decoherentState: QuantumStateVector;
    remainingCoherence: number;
    decoherenceFactor: number;
    fidelity: number;
    entropyIncrease: number;
    isCoherent: boolean;
}
/**
 * Result of applying decoherence to a superposition state
 */
export interface SuperpositionDecoherenceResult {
    decoherentSuperposition: SuperpositionState;
    constituentResults: DecoherenceResult[];
    averageCoherence: number;
    averageFidelity: number;
    isCoherent: boolean;
}
/**
 * Quantum error detection result
 */
export interface QuantumErrorDetection {
    errors: QuantumError[];
    errorCount: number;
    errorSeverity: number;
    isCorrupted: boolean;
    fidelity: number;
}
/**
 * Individual quantum error
 */
export interface QuantumError {
    type: 'amplitude' | 'phase' | 'normalization' | 'entanglement';
    index: number;
    severity: number;
    description: string;
}
/**
 * Time evolution simulation result
 */
export interface TimeEvolutionResult {
    evolution: QuantumStateVector[];
    coherenceTimes: number[];
    fidelities: number[];
    finalState: QuantumStateVector;
    totalDecoherence: number;
    coherenceLifetime: number;
}
//# sourceMappingURL=QuantumDecoherenceSimulator.d.ts.map