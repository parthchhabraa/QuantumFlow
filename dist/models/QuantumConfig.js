"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumConfig = void 0;
/**
 * Configuration class for quantum compression parameters
 * Manages quantum simulation settings and validation
 */
class QuantumConfig {
    constructor(quantumBitDepth = 8, maxEntanglementLevel = 4, superpositionComplexity = 5, interferenceThreshold = 0.5, profileName) {
        this._quantumBitDepth = quantumBitDepth;
        this._maxEntanglementLevel = maxEntanglementLevel;
        this._superpositionComplexity = superpositionComplexity;
        this._interferenceThreshold = interferenceThreshold;
        this._profileName = profileName;
        this.validateParameters();
    }
    /**
     * Get quantum bit depth (2-16 qubits simulation)
     */
    get quantumBitDepth() {
        return this._quantumBitDepth;
    }
    /**
     * Set quantum bit depth with validation
     */
    set quantumBitDepth(value) {
        if (value < 2 || value > 16) {
            throw new Error('Quantum bit depth must be between 2 and 16');
        }
        this._quantumBitDepth = value;
    }
    /**
     * Get maximum entanglement level (1-8 levels)
     */
    get maxEntanglementLevel() {
        return this._maxEntanglementLevel;
    }
    /**
     * Set maximum entanglement level with validation
     */
    set maxEntanglementLevel(value) {
        if (value < 1 || value > 8) {
            throw new Error('Maximum entanglement level must be between 1 and 8');
        }
        this._maxEntanglementLevel = value;
    }
    /**
     * Get superposition complexity (1-10 complexity)
     */
    get superpositionComplexity() {
        return this._superpositionComplexity;
    }
    /**
     * Set superposition complexity with validation
     */
    set superpositionComplexity(value) {
        if (value < 1 || value > 10) {
            throw new Error('Superposition complexity must be between 1 and 10');
        }
        this._superpositionComplexity = value;
    }
    /**
     * Get interference threshold (0.1-0.9)
     */
    get interferenceThreshold() {
        return this._interferenceThreshold;
    }
    /**
     * Set interference threshold with validation
     */
    set interferenceThreshold(value) {
        if (value < 0.1 || value > 0.9) {
            throw new Error('Interference threshold must be between 0.1 and 0.9');
        }
        this._interferenceThreshold = value;
    }
    /**
     * Get profile name
     */
    get profileName() {
        return this._profileName;
    }
    /**
     * Set profile name
     */
    set profileName(value) {
        this._profileName = value;
    }
    /**
     * Create default configuration for text compression
     */
    static forTextCompression() {
        return new QuantumConfig(6, 3, 4, 0.4, 'text-optimized');
    }
    /**
     * Create default configuration for binary data compression
     */
    static forBinaryCompression() {
        return new QuantumConfig(8, 5, 6, 0.6, 'binary-optimized');
    }
    /**
     * Create default configuration for image compression
     */
    static forImageCompression() {
        return new QuantumConfig(10, 6, 7, 0.7, 'image-optimized');
    }
    /**
     * Create high-performance configuration (more resource intensive)
     */
    static forHighPerformance() {
        return new QuantumConfig(12, 8, 9, 0.8, 'high-performance');
    }
    /**
     * Create low-resource configuration (faster but less compression)
     */
    static forLowResource() {
        return new QuantumConfig(4, 2, 3, 0.3, 'low-resource');
    }
    /**
     * Create configuration from JSON object
     */
    static fromJSON(json) {
        try {
            const data = JSON.parse(json);
            return new QuantumConfig(data.quantumBitDepth, data.maxEntanglementLevel, data.superpositionComplexity, data.interferenceThreshold, data.profileName);
        }
        catch (error) {
            throw new Error(`Invalid JSON configuration: ${error}`);
        }
    }
    /**
     * Create configuration from object
     */
    static fromObject(obj) {
        return new QuantumConfig(obj.quantumBitDepth, obj.maxEntanglementLevel, obj.superpositionComplexity, obj.interferenceThreshold, obj.profileName);
    }
    /**
     * Calculate estimated memory usage for this configuration
     */
    calculateMemoryUsage(dataSize) {
        // Estimate memory usage based on quantum parameters
        const stateVectorSize = Math.pow(2, this._quantumBitDepth) * 16; // Complex numbers
        const superpositionMemory = stateVectorSize * this._superpositionComplexity;
        const entanglementMemory = dataSize * this._maxEntanglementLevel * 0.1;
        return superpositionMemory + entanglementMemory;
    }
    /**
     * Calculate estimated processing time multiplier
     */
    calculateProcessingMultiplier() {
        // Higher complexity = longer processing time
        const bitDepthFactor = Math.pow(2, this._quantumBitDepth - 8); // Exponential with bit depth
        const complexityFactor = this._superpositionComplexity / 5; // Linear with complexity
        const entanglementFactor = this._maxEntanglementLevel / 4; // Linear with entanglement
        return bitDepthFactor * complexityFactor * entanglementFactor;
    }
    /**
     * Check if configuration is suitable for given data size
     */
    isSuitableForDataSize(dataSize, maxMemoryMB = 512) {
        const estimatedMemory = this.calculateMemoryUsage(dataSize);
        const maxMemoryBytes = maxMemoryMB * 1024 * 1024;
        return estimatedMemory <= maxMemoryBytes;
    }
    /**
     * Optimize configuration for given data characteristics
     */
    optimizeForData(dataSize, dataType) {
        let optimized;
        // Start with type-specific defaults
        switch (dataType) {
            case 'text':
                optimized = QuantumConfig.forTextCompression();
                break;
            case 'binary':
                optimized = QuantumConfig.forBinaryCompression();
                break;
            case 'image':
                optimized = QuantumConfig.forImageCompression();
                break;
            default:
                optimized = new QuantumConfig();
        }
        // Adjust based on data size
        if (dataSize < 1024) { // Small files
            optimized.quantumBitDepth = Math.max(4, optimized.quantumBitDepth - 2);
            optimized.superpositionComplexity = Math.max(2, optimized.superpositionComplexity - 1);
        }
        else if (dataSize > 1024 * 1024) { // Large files
            optimized.quantumBitDepth = Math.min(12, optimized.quantumBitDepth + 2);
            optimized.superpositionComplexity = Math.min(8, optimized.superpositionComplexity + 1);
        }
        return optimized;
    }
    /**
     * Validate all parameters are within acceptable bounds
     */
    validateParameters() {
        if (this._quantumBitDepth < 2 || this._quantumBitDepth > 16) {
            throw new Error('Quantum bit depth must be between 2 and 16');
        }
        if (this._maxEntanglementLevel < 1 || this._maxEntanglementLevel > 8) {
            throw new Error('Maximum entanglement level must be between 1 and 8');
        }
        if (this._superpositionComplexity < 1 || this._superpositionComplexity > 10) {
            throw new Error('Superposition complexity must be between 1 and 10');
        }
        if (this._interferenceThreshold < 0.1 || this._interferenceThreshold > 0.9) {
            throw new Error('Interference threshold must be between 0.1 and 0.9');
        }
    }
    /**
     * Convert configuration to JSON string
     */
    toJSON() {
        return JSON.stringify({
            quantumBitDepth: this._quantumBitDepth,
            maxEntanglementLevel: this._maxEntanglementLevel,
            superpositionComplexity: this._superpositionComplexity,
            interferenceThreshold: this._interferenceThreshold,
            profileName: this._profileName
        }, null, 2);
    }
    /**
     * Convert configuration to plain object
     */
    toObject() {
        return {
            quantumBitDepth: this._quantumBitDepth,
            maxEntanglementLevel: this._maxEntanglementLevel,
            superpositionComplexity: this._superpositionComplexity,
            interferenceThreshold: this._interferenceThreshold,
            profileName: this._profileName
        };
    }
    /**
     * Create a deep copy of this configuration
     */
    clone() {
        return new QuantumConfig(this._quantumBitDepth, this._maxEntanglementLevel, this._superpositionComplexity, this._interferenceThreshold, this._profileName);
    }
    /**
     * Check if this configuration equals another
     */
    equals(other) {
        return (this._quantumBitDepth === other._quantumBitDepth &&
            this._maxEntanglementLevel === other._maxEntanglementLevel &&
            this._superpositionComplexity === other._superpositionComplexity &&
            this._interferenceThreshold === other._interferenceThreshold &&
            this._profileName === other._profileName);
    }
    /**
     * Get string representation of the configuration
     */
    toString() {
        const profile = this._profileName ? ` (${this._profileName})` : '';
        return `QuantumConfig${profile}: bits=${this._quantumBitDepth}, entanglement=${this._maxEntanglementLevel}, complexity=${this._superpositionComplexity}, threshold=${this._interferenceThreshold}`;
    }
}
exports.QuantumConfig = QuantumConfig;
//# sourceMappingURL=QuantumConfig.js.map