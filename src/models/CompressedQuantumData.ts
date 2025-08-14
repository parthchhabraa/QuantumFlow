import { QuantumStateVector } from './QuantumStateVector';
import { EntanglementPair } from './EntanglementPair';
import { QuantumMath } from '../math/QuantumMath';

/**
 * Represents compressed quantum data with all necessary information for decompression
 * Contains quantum states, entanglement information, interference patterns, and metadata
 */
export class CompressedQuantumData {
  private _quantumStates: QuantumStateVector[];
  private _entanglementMap: Map<string, EntanglementPair>;
  private _interferencePatterns: InterferencePattern[];
  private _metadata: QuantumMetadata;
  private _checksum: string;

  constructor(
    quantumStates: QuantumStateVector[],
    entanglementMap: Map<string, EntanglementPair>,
    interferencePatterns: InterferencePattern[],
    metadata: QuantumMetadata,
    checksum?: string
  ) {
    this._quantumStates = quantumStates.map(state => state.clone());
    this._entanglementMap = new Map(entanglementMap);
    this._interferencePatterns = [...interferencePatterns];
    this._metadata = { ...metadata };
    this._checksum = checksum || this.calculateChecksum();

    this.validateData();
  }

  /**
   * Get quantum states (read-only)
   */
  get quantumStates(): readonly QuantumStateVector[] {
    return this._quantumStates;
  }

  /**
   * Get entanglement map (read-only)
   */
  get entanglementMap(): ReadonlyMap<string, EntanglementPair> {
    return this._entanglementMap;
  }

  /**
   * Get interference patterns (read-only)
   */
  get interferencePatterns(): readonly InterferencePattern[] {
    return this._interferencePatterns;
  }

  /**
   * Get metadata (read-only)
   */
  get metadata(): Readonly<QuantumMetadata> {
    return this._metadata;
  }

  /**
   * Get checksum
   */
  get checksum(): string {
    return this._checksum;
  }

  /**
   * Create compressed quantum data from compression process
   */
  static create(
    quantumStates: QuantumStateVector[],
    entanglementPairs: EntanglementPair[],
    interferencePatterns: InterferencePattern[],
    originalSize: number,
    compressionConfig: any
  ): CompressedQuantumData {
    // Create entanglement map
    const entanglementMap = new Map<string, EntanglementPair>();
    entanglementPairs.forEach(pair => {
      entanglementMap.set(pair.entanglementId, pair);
    });

    // Create metadata
    const metadata: QuantumMetadata = {
      originalSize,
      compressedSize: 0, // Will be calculated
      compressionRatio: 0, // Will be calculated
      quantumStateCount: quantumStates.length,
      entanglementCount: entanglementPairs.length,
      interferencePatternCount: interferencePatterns.length,
      compressionTimestamp: Date.now(),
      quantumFlowVersion: '1.0.0',
      compressionConfig
    };

    const compressed = new CompressedQuantumData(
      quantumStates,
      entanglementMap,
      interferencePatterns,
      metadata
    );

    // Update calculated metadata
    compressed._metadata.compressedSize = compressed.calculateCompressedSize();
    compressed._metadata.compressionRatio = compressed._metadata.originalSize / compressed._metadata.compressedSize;

    return compressed;
  }

  /**
   * Serialize compressed data to Buffer for storage
   */
  serialize(): Buffer {
    const serializedData = {
      version: '1.0.0',
      quantumStates: this.serializeQuantumStates(),
      entanglementMap: this.serializeEntanglementMap(),
      interferencePatterns: this._interferencePatterns,
      metadata: this._metadata,
      checksum: this._checksum
    };

    const jsonString = JSON.stringify(serializedData);
    return Buffer.from(jsonString, 'utf8');
  }

  /**
   * Deserialize compressed data from Buffer
   */
  static deserialize(buffer: Buffer): CompressedQuantumData {
    try {
      const jsonString = buffer.toString('utf8');
      const data = JSON.parse(jsonString);

      // Validate version compatibility
      if (data.version !== '1.0.0') {
        throw new Error(`Unsupported QuantumFlow version: ${data.version}`);
      }

      // Deserialize quantum states
      const quantumStates = CompressedQuantumData.deserializeQuantumStates(data.quantumStates);

      // Deserialize entanglement map
      const entanglementMap = CompressedQuantumData.deserializeEntanglementMap(data.entanglementMap);

      return new CompressedQuantumData(
        quantumStates,
        entanglementMap,
        data.interferencePatterns,
        data.metadata,
        data.checksum
      );
    } catch (error) {
      throw new Error(`Failed to deserialize compressed quantum data: ${error}`);
    }
  }

  /**
   * Verify data integrity using checksum
   */
  verifyIntegrity(): boolean {
    const calculatedChecksum = this.calculateChecksum();
    return calculatedChecksum === this._checksum;
  }

  /**
   * Get compression statistics
   */
  getCompressionStats(): CompressionStats {
    return {
      originalSize: this._metadata.originalSize,
      compressedSize: this._metadata.compressedSize,
      compressionRatio: this._metadata.compressionRatio,
      spaceSaved: this._metadata.originalSize - this._metadata.compressedSize,
      spaceSavedPercentage: ((this._metadata.originalSize - this._metadata.compressedSize) / this._metadata.originalSize) * 100,
      quantumStateCount: this._metadata.quantumStateCount,
      entanglementCount: this._metadata.entanglementCount,
      interferencePatternCount: this._metadata.interferencePatternCount
    };
  }

  /**
   * Get entanglement pairs as array
   */
  getEntanglementPairs(): EntanglementPair[] {
    return Array.from(this._entanglementMap.values());
  }

  /**
   * Find entanglement pair by ID
   */
  findEntanglementPair(id: string): EntanglementPair | undefined {
    return this._entanglementMap.get(id);
  }

  /**
   * Get quantum states with specific entanglement ID
   */
  getEntangledStates(entanglementId: string): QuantumStateVector[] {
    return this._quantumStates.filter(state => state.entanglementId === entanglementId);
  }

  /**
   * Calculate estimated decompression time
   */
  estimateDecompressionTime(): number {
    // Base time for quantum state processing
    const baseTime = this._metadata.quantumStateCount * 10; // ms per state
    
    // Additional time for entanglement processing
    const entanglementTime = this._metadata.entanglementCount * 5; // ms per pair
    
    // Additional time for interference pattern processing
    const interferenceTime = this._metadata.interferencePatternCount * 2; // ms per pattern
    
    return baseTime + entanglementTime + interferenceTime;
  }

  /**
   * Create a deep copy of this compressed data
   */
  clone(): CompressedQuantumData {
    return new CompressedQuantumData(
      this._quantumStates,
      this._entanglementMap,
      this._interferencePatterns,
      this._metadata
    );
  }

  /**
   * Get string representation
   */
  toString(): string {
    const stats = this.getCompressionStats();
    return `CompressedQuantumData(${stats.originalSize}B → ${stats.compressedSize}B, ${stats.compressionRatio.toFixed(2)}x compression)`;
  }

  /**
   * Calculate compressed data size
   */
  private calculateCompressedSize(): number {
    // Estimate size based on quantum states and metadata
    const stateSize = this._quantumStates.length * 64; // Estimated bytes per state
    const entanglementSize = this._entanglementMap.size * 32; // Estimated bytes per pair
    const interferenceSize = this._interferencePatterns.length * 16; // Estimated bytes per pattern
    const metadataSize = 256; // Estimated metadata size
    
    return stateSize + entanglementSize + interferenceSize + metadataSize;
  }

  /**
   * Calculate checksum for data integrity
   */
  private calculateChecksum(): string {
    // Create a hash of all quantum data
    const stateHashes = this._quantumStates.map(state => {
      const bytes = state.toBytes();
      return QuantumMath.quantumHash(bytes);
    });

    const entanglementHashes = Array.from(this._entanglementMap.values()).map(pair => {
      const combinedBytes = Buffer.concat([
        pair.stateA.toBytes(),
        pair.stateB.toBytes(),
        pair.sharedInformation
      ]);
      return QuantumMath.quantumHash(combinedBytes);
    });

    const allHashes = [...stateHashes, ...entanglementHashes];
    const combinedHash = allHashes.join('');
    
    return QuantumMath.quantumHash(Buffer.from(combinedHash));
  }

  /**
   * Serialize quantum states to JSON-compatible format
   */
  private serializeQuantumStates(): any[] {
    return this._quantumStates.map(state => ({
      amplitudes: state.amplitudes.map(amp => ({
        real: amp.real,
        imaginary: amp.imaginary
      })),
      phase: state.phase,
      entanglementId: state.entanglementId
    }));
  }

  /**
   * Serialize entanglement map to JSON-compatible format
   */
  private serializeEntanglementMap(): any[] {
    return Array.from(this._entanglementMap.entries()).map(([id, pair]) => ({
      id,
      stateA: this.serializeQuantumState(pair.stateA),
      stateB: this.serializeQuantumState(pair.stateB),
      correlationStrength: pair.correlationStrength,
      sharedInformation: Array.from(pair.sharedInformation)
    }));
  }

  /**
   * Serialize a single quantum state
   */
  private serializeQuantumState(state: QuantumStateVector): any {
    return {
      amplitudes: state.amplitudes.map(amp => ({
        real: amp.real,
        imaginary: amp.imaginary
      })),
      phase: state.phase,
      entanglementId: state.entanglementId
    };
  }

  /**
   * Deserialize quantum states from JSON format
   */
  private static deserializeQuantumStates(data: any[]): QuantumStateVector[] {
    return data.map(stateData => {
      const amplitudes = stateData.amplitudes.map((amp: any) => 
        new (require('../math/Complex').Complex)(amp.real, amp.imaginary)
      );
      
      const state = new QuantumStateVector(amplitudes, stateData.phase);
      if (stateData.entanglementId) {
        state.setEntanglementId(stateData.entanglementId);
      }
      
      return state;
    });
  }

  /**
   * Deserialize entanglement map from JSON format
   */
  private static deserializeEntanglementMap(data: any[]): Map<string, EntanglementPair> {
    const map = new Map<string, EntanglementPair>();
    
    data.forEach(pairData => {
      const stateA = this.deserializeQuantumState(pairData.stateA);
      const stateB = this.deserializeQuantumState(pairData.stateB);
      const sharedInfo = Buffer.from(pairData.sharedInformation);
      
      const pair = new EntanglementPair(stateA, stateB, sharedInfo);
      map.set(pairData.id, pair);
    });
    
    return map;
  }

  /**
   * Deserialize a single quantum state
   */
  private static deserializeQuantumState(data: any): QuantumStateVector {
    const amplitudes = data.amplitudes.map((amp: any) => 
      new (require('../math/Complex').Complex)(amp.real, amp.imaginary)
    );
    
    const state = new QuantumStateVector(amplitudes, data.phase);
    if (data.entanglementId) {
      state.setEntanglementId(data.entanglementId);
    }
    
    return state;
  }

  /**
   * Validate compressed data integrity
   */
  private validateData(): void {
    if (this._quantumStates.length === 0) {
      throw new Error('CompressedQuantumData must contain at least one quantum state');
    }

    if (this._metadata.originalSize <= 0) {
      throw new Error('Original size must be positive');
    }

    if (!this.verifyIntegrity()) {
      throw new Error('Compressed data checksum verification failed');
    }
  }
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