/**
 * Configuration class for quantum compression parameters
 * Manages quantum simulation settings and validation
 */
export declare class QuantumConfig {
    private _quantumBitDepth;
    private _maxEntanglementLevel;
    private _superpositionComplexity;
    private _interferenceThreshold;
    private _profileName?;
    constructor(quantumBitDepth?: number, maxEntanglementLevel?: number, superpositionComplexity?: number, interferenceThreshold?: number, profileName?: string);
    /**
     * Get quantum bit depth (2-16 qubits simulation)
     */
    get quantumBitDepth(): number;
    /**
     * Set quantum bit depth with validation
     */
    set quantumBitDepth(value: number);
    /**
     * Get maximum entanglement level (1-8 levels)
     */
    get maxEntanglementLevel(): number;
    /**
     * Set maximum entanglement level with validation
     */
    set maxEntanglementLevel(value: number);
    /**
     * Get superposition complexity (1-10 complexity)
     */
    get superpositionComplexity(): number;
    /**
     * Set superposition complexity with validation
     */
    set superpositionComplexity(value: number);
    /**
     * Get interference threshold (0.1-0.9)
     */
    get interferenceThreshold(): number;
    /**
     * Set interference threshold with validation
     */
    set interferenceThreshold(value: number);
    /**
     * Get profile name
     */
    get profileName(): string | undefined;
    /**
     * Set profile name
     */
    set profileName(value: string | undefined);
    /**
     * Create default configuration for text compression
     */
    static forTextCompression(): QuantumConfig;
    /**
     * Create default configuration for binary data compression
     */
    static forBinaryCompression(): QuantumConfig;
    /**
     * Create default configuration for image compression
     */
    static forImageCompression(): QuantumConfig;
    /**
     * Create high-performance configuration (more resource intensive)
     */
    static forHighPerformance(): QuantumConfig;
    /**
     * Create low-resource configuration (faster but less compression)
     */
    static forLowResource(): QuantumConfig;
    /**
     * Create configuration from JSON object
     */
    static fromJSON(json: string): QuantumConfig;
    /**
     * Create configuration from object
     */
    static fromObject(obj: Partial<QuantumConfigData>): QuantumConfig;
    /**
     * Calculate estimated memory usage for this configuration
     */
    calculateMemoryUsage(dataSize: number): number;
    /**
     * Calculate estimated processing time multiplier
     */
    calculateProcessingMultiplier(): number;
    /**
     * Check if configuration is suitable for given data size
     */
    isSuitableForDataSize(dataSize: number, maxMemoryMB?: number): boolean;
    /**
     * Optimize configuration for given data characteristics
     */
    optimizeForData(dataSize: number, dataType: 'text' | 'binary' | 'image' | 'mixed'): QuantumConfig;
    /**
     * Validate all parameters are within acceptable bounds
     */
    validateParameters(): void;
    /**
     * Convert configuration to JSON string
     */
    toJSON(): string;
    /**
     * Convert configuration to plain object
     */
    toObject(): QuantumConfigData;
    /**
     * Create a deep copy of this configuration
     */
    clone(): QuantumConfig;
    /**
     * Check if this configuration equals another
     */
    equals(other: QuantumConfig): boolean;
    /**
     * Get string representation of the configuration
     */
    toString(): string;
}
/**
 * Interface for quantum configuration data
 */
export interface QuantumConfigData {
    quantumBitDepth?: number;
    maxEntanglementLevel?: number;
    superpositionComplexity?: number;
    interferenceThreshold?: number;
    profileName?: string;
}
//# sourceMappingURL=QuantumConfig.d.ts.map