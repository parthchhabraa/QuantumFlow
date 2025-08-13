import { QuantumStateVector } from './QuantumStateVector';
import { EntanglementPair } from './EntanglementPair';
/**
 * Represents compressed quantum data with all necessary information for decompression
 * Contains quantum states, entanglement information, interference patterns, and metadata
 */
export declare class CompressedQuantumData {
    private _quantumStates;
    private _entanglementMap;
    private _interferencePatterns;
    private _metadata;
    private _checksum;
    constructor(quantumStates: QuantumStateVector[], entanglementMap: Map<string, EntanglementPair>, interferencePatterns: InterferencePattern[], metadata: QuantumMetadata, checksum?: string);
    /**
     * Get quantum states (read-only)
     */
    get quantumStates(): readonly QuantumStateVector[];
    /**
     * Get entanglement map (read-only)
     */
    get entanglementMap(): ReadonlyMap<string, EntanglementPair>;
    /**
     * Get interference patterns (read-only)
     */
    get interferencePatterns(): readonly InterferencePattern[];
    /**
     * Get metadata (read-only)
     */
    get metadata(): Readonly<QuantumMetadata>;
    /**
     * Get checksum
     */
    get checksum(): string;
    /**
     * Create compressed quantum data from compression process
     */
    static create(quantumStates: QuantumStateVector[], entanglementPairs: EntanglementPair[], interferencePatterns: InterferencePattern[], originalSize: number, compressionConfig: any): CompressedQuantumData;
    /**
     * Serialize compressed data to Buffer for storage
     */
    serialize(): Buffer;
    /**
     * Deserialize compressed data from Buffer
     */
    static deserialize(buffer: Buffer): CompressedQuantumData;
    /**
     * Verify data integrity using checksum
     */
    verifyIntegrity(): boolean;
    /**
     * Get compression statistics
     */
    getCompressionStats(): CompressionStats;
    /**
     * Get entanglement pairs as array
     */
    getEntanglementPairs(): EntanglementPair[];
    /**
     * Find entanglement pair by ID
     */
    findEntanglementPair(id: string): EntanglementPair | undefined;
    /**
     * Get quantum states with specific entanglement ID
     */
    getEntangledStates(entanglementId: string): QuantumStateVector[];
    /**
     * Calculate estimated decompression time
     */
    estimateDecompressionTime(): number;
    /**
     * Create a deep copy of this compressed data
     */
    clone(): CompressedQuantumData;
    /**
     * Get string representation
     */
    toString(): string;
    /**
     * Calculate compressed data size
     */
    private calculateCompressedSize;
    /**
     * Calculate checksum for data integrity
     */
    private calculateChecksum;
    /**
     * Serialize quantum states to JSON-compatible format
     */
    private serializeQuantumStates;
    /**
     * Serialize entanglement map to JSON-compatible format
     */
    private serializeEntanglementMap;
    /**
     * Serialize a single quantum state
     */
    private serializeQuantumState;
    /**
     * Deserialize quantum states from JSON format
     */
    private static deserializeQuantumStates;
    /**
     * Deserialize entanglement map from JSON format
     */
    private static deserializeEntanglementMap;
    /**
     * Deserialize a single quantum state
     */
    private static deserializeQuantumState;
    /**
     * Validate compressed data integrity
     */
    private validateData;
}
/**
 * Interface for interference patterns
 */
export interface InterferencePattern {
    type: 'constructive' | 'destructive';
    amplitude: number;
    phase: number;
    frequency: number;
    stateIndices: number[];
}
/**
 * Interface for quantum metadata
 */
export interface QuantumMetadata {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    quantumStateCount: number;
    entanglementCount: number;
    interferencePatternCount: number;
    compressionTimestamp: number;
    quantumFlowVersion: string;
    compressionConfig: any;
}
/**
 * Interface for compression statistics
 */
export interface CompressionStats {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    spaceSaved: number;
    spaceSavedPercentage: number;
    quantumStateCount: number;
    entanglementCount: number;
    interferencePatternCount: number;
}
//# sourceMappingURL=CompressedQuantumData.d.ts.map