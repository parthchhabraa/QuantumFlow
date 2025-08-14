import { QuantumStateVector } from '../models/QuantumStateVector';
import { SuperpositionState } from '../models/SuperpositionState';
import { Complex } from '../math/Complex';
/**
 * Implements quantum error correction codes for data integrity
 * Provides error detection, correction, and recovery mechanisms
 */
export declare class QuantumErrorCorrection {
    private _decoherenceSimulator;
    private _errorThreshold;
    private _correctionThreshold;
    private _maxCorrectionAttempts;
    constructor(errorThreshold?: number, correctionThreshold?: number, maxCorrectionAttempts?: number);
    /**
     * Get current error threshold
     */
    get errorThreshold(): number;
    /**
     * Set error threshold
     */
    set errorThreshold(threshold: number);
    /**
     * Encode quantum state with error correction redundancy
     */
    encodeWithErrorCorrection(state: QuantumStateVector): EncodedQuantumState;
    /**
     * Decode and correct errors in encoded quantum state
     */
    decodeWithErrorCorrection(encoded: EncodedQuantumState): ErrorCorrectionResult;
    /**
     * Verify quantum state integrity using multiple methods
     */
    verifyIntegrity(state: QuantumStateVector, reference?: QuantumStateVector): IntegrityVerificationResult;
    /**
     * Apply quantum error correction to a superposition state
     */
    correctSuperpositionErrors(superposition: SuperpositionState, originalSuperposition?: SuperpositionState): SuperpositionCorrectionResult;
    /**
     * Create repetition code for error correction
     */
    private createRepetitionCode;
    /**
     * Create parity code for error detection
     */
    private createParityCode;
    /**
     * Create Hamming code for error correction
     */
    private createHammingCode;
    /**
     * Generate syndrome bits for error detection
     */
    private generateSyndromes;
    /**
     * Calculate quantum checksum for integrity verification
     */
    private calculateQuantumChecksum;
    /**
     * Attempt to correct errors in quantum state
     */
    private attemptErrorCorrection;
    /**
     * Correct individual quantum error
     */
    private correctIndividualError;
    /**
     * Correct amplitude error using redundant codes
     */
    private correctAmplitudeError;
    /**
     * Correct phase error using reference phases
     */
    private correctPhaseError;
    /**
     * Correct normalization error
     */
    private correctNormalizationError;
    /**
     * Correct entanglement error
     */
    private correctEntanglementError;
    /**
     * Apply fallback correction methods
     */
    private applyFallbackCorrection;
    /**
     * Apply partial correction using available redundancy
     */
    private applyPartialCorrection;
    /**
     * Perform majority voting on complex amplitudes
     */
    private majorityVote;
    /**
     * Check normalization integrity
     */
    private checkNormalization;
    /**
     * Check amplitude consistency
     */
    private checkAmplitudeConsistency;
    /**
     * Check phase coherence
     */
    private checkPhaseCoherence;
    /**
     * Check entanglement integrity
     */
    private checkEntanglementIntegrity;
    /**
     * Check fidelity against reference state
     */
    private checkFidelity;
    /**
     * Calculate fidelity between two quantum states
     */
    private calculateFidelity;
    /**
     * Get recommended action based on integrity checks
     */
    private getRecommendedAction;
    /**
     * Attempt graceful degradation when quantum simulation fails
     * Falls back to classical compression methods
     */
    attemptGracefulDegradation(originalData: Buffer, failureReason: string, fallbackOptions?: GracefulDegradationOptions): GracefulDegradationResult;
    /**
     * Generate quantum-inspired checksum for data integrity verification
     */
    generateQuantumChecksum(data: Buffer, options?: QuantumChecksumOptions): QuantumChecksum;
    /**
     * Verify quantum checksum against data
     */
    verifyQuantumChecksum(data: Buffer, expectedChecksum: QuantumChecksum): QuantumChecksumVerification;
    /**
     * Select appropriate fallback strategy based on failure analysis
     */
    private selectFallbackStrategy;
    /**
     * Apply selected fallback strategy
     */
    private applyFallbackStrategy;
    /**
     * Apply simple classical compression (gzip-like)
     */
    private applySimpleClassicalCompression;
    /**
     * Apply chunked classical compression for large data
     */
    private applyChunkedClassicalCompression;
    /**
     * Apply hybrid compression (partial quantum + classical)
     */
    private applyHybridCompression;
    /**
     * Apply classical compression with quantum metadata preservation
     */
    private applyClassicalWithQuantumMetadata;
    /**
     * Apply fast classical compression prioritizing speed over ratio
     */
    private applyFastClassicalCompression;
    /**
     * Convert data to quantum-like representation for checksum calculation
     */
    private convertToQuantumRepresentation;
    /**
     * Calculate quantum-inspired hash
     */
    private calculateQuantumHash;
    /**
     * Calculate phase checksum
     */
    private calculatePhaseChecksum;
    /**
     * Calculate probability checksum
     */
    private calculateProbabilityChecksum;
    /**
     * Combine multiple checksums into final checksum
     */
    private combineChecksums;
    /**
     * Calculate checksum metadata
     */
    private calculateChecksumMetadata;
    /**
     * Calculate quantum complexity of representation
     */
    private calculateQuantumComplexity;
    /**
     * Verify phase checksum component
     */
    private verifyPhaseChecksum;
    /**
     * Verify probability checksum component
     */
    private verifyProbabilityChecksum;
    /**
     * Calculate integrity score from verification results
     */
    private calculateIntegrityScore;
    /**
     * Analyze corruption patterns
     */
    private analyzeCorruption;
    /**
     * Get integrity recommendation based on analysis
     */
    private getIntegrityRecommendation;
    /**
     * Get recommended action for fallback result
     */
    private getRecommendedFallbackAction;
    private runLengthEncode;
    private runLengthDecode;
    private fastDuplicateRemoval;
    private combineChunks;
    private applySimplifiedQuantumCompression;
    private generateQuantumMetadata;
    private calculateDataEntropy;
    private identifyDataPattern;
    private calculateVariance;
    private calculateAmplitudeVariance;
    private calculateChecksumDifference;
}
/**
 * Encoded quantum state with error correction redundancy
 */
export interface EncodedQuantumState {
    originalState: QuantumStateVector;
    repetitionCode: QuantumStateVector[];
    parityCode: Complex[];
    hammingCode: HammingCode;
    syndromes: Complex[];
    checksum: string;
    encodingTimestamp: number;
}
/**
 * Hamming code structure
 */
export interface HammingCode {
    matrix: Complex[][];
    syndromes: Complex[];
    parityBits: number;
}
/**
 * Error correction result
 */
export interface ErrorCorrectionResult {
    correctedState: QuantumStateVector;
    correctionAttempts: CorrectionAttempt[];
    totalErrorsDetected: number;
    totalErrorsCorrected: number;
    correctionSuccess: boolean;
    finalFidelity: number;
}
/**
 * Individual correction attempt
 */
export interface CorrectionAttempt {
    attemptNumber: number;
    errorsDetected: number;
    errorsCorrected: number;
    correctedState: QuantumStateVector;
    success: boolean;
    fidelityImprovement: number;
    processingTime: number;
    errorMessage?: string;
}
/**
 * Integrity verification result
 */
export interface IntegrityVerificationResult {
    checks: IntegrityCheck[];
    integrityScore: number;
    isIntact: boolean;
    recommendedAction: string;
}
/**
 * Individual integrity check
 */
export interface IntegrityCheck {
    name: string;
    passed: boolean;
    score: number;
    details: string;
}
/**
 * Superposition error correction result
 */
export interface SuperpositionCorrectionResult {
    correctedSuperposition: SuperpositionState;
    constituentResults: ErrorCorrectionResult[];
    totalErrorsDetected: number;
    totalErrorsCorrected: number;
    averageFidelity: number;
    correctionSuccess: boolean;
}
/**
 * Options for graceful degradation
 */
export interface GracefulDegradationOptions {
    prioritizeSpeed?: boolean;
    chunkSize?: number;
    maxMemoryUsage?: number;
    fallbackStrategies?: FallbackStrategy[];
    preserveMetadata?: boolean;
}
/**
 * Result of graceful degradation attempt
 */
export interface GracefulDegradationResult {
    success: boolean;
    fallbackStrategy: FallbackStrategy;
    compressedData: Buffer;
    compressionRatio: number;
    processingTime: number;
    originalFailureReason: string;
    fallbackMetrics: FallbackMetrics;
    integrityVerified: boolean;
    recommendedAction: string;
    errorMessage?: string;
}
/**
 * Available fallback strategies
 */
export type FallbackStrategy = 'simple-classical' | 'chunked-classical' | 'hybrid-compression' | 'classical-with-quantum-metadata' | 'fast-classical' | 'none';
/**
 * Result of applying a fallback strategy
 */
export interface FallbackStrategyResult {
    success: boolean;
    compressedData: Buffer;
    compressionRatio: number;
    metrics: FallbackMetrics;
    integrityVerified: boolean;
    errorMessage?: string;
}
/**
 * Metrics for fallback operations
 */
export interface FallbackMetrics {
    errorCount: number;
    recoveredBytes: number;
    integrityScore: number;
}
/**
 * Options for quantum checksum generation
 */
export interface QuantumChecksumOptions {
    algorithm?: string;
    includePhaseInfo?: boolean;
    includeProbabilityDistribution?: boolean;
    checksumLength?: number;
}
/**
 * Quantum checksum structure
 */
export interface QuantumChecksum {
    checksum: string;
    algorithm: string;
    timestamp: number;
    dataSize: number;
    metadata: any;
    verificationData: {
        phaseChecksum?: string;
        probabilityChecksum?: string;
        quantumComplexity: number;
    };
}
/**
 * Result of quantum checksum verification
 */
export interface QuantumChecksumVerification {
    isValid: boolean;
    integrityScore: number;
    checksumMatch: boolean;
    phaseMatch: boolean;
    probabilityMatch: boolean;
    corruptionDetected: boolean;
    corruptionAnalysis: CorruptionAnalysis;
    verificationTime: number;
    recommendedAction: string;
    errorMessage?: string;
}
/**
 * Analysis of data corruption
 */
export interface CorruptionAnalysis {
    corruptionType: string;
    severity: number;
    affectedRegions: number[];
    estimatedDataLoss: number;
}
//# sourceMappingURL=QuantumErrorCorrection.d.ts.map