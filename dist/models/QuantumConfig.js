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
        QuantumConfig.validateQuantumBitDepth(value);
        this._quantumBitDepth = value;
        this.validateParameterCombination();
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
        QuantumConfig.validateEntanglementLevel(value);
        this._maxEntanglementLevel = value;
        this.validateParameterCombination();
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
        QuantumConfig.validateSuperpositionComplexity(value);
        this._superpositionComplexity = value;
        this.validateParameterCombination();
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
        QuantumConfig.validateInterferenceThreshold(value);
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
        return new QuantumConfig(8, 4, 6, 0.6, 'binary-optimized');
    }
    /**
     * Create default configuration for image compression
     */
    static forImageCompression() {
        return new QuantumConfig(10, 5, 7, 0.7, 'image-optimized');
    }
    /**
     * Create high-performance configuration (more resource intensive)
     */
    static forHighPerformance() {
        return new QuantumConfig(12, 6, 8, 0.8, 'high-performance');
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
        // Adjust based on data size while respecting validation constraints
        if (dataSize < 1024) { // Small files
            const newBitDepth = Math.max(4, optimized.quantumBitDepth - 2);
            const newComplexity = Math.max(2, optimized.superpositionComplexity - 1);
            // Ensure entanglement level is compatible with new bit depth
            const maxEntanglement = Math.floor(newBitDepth / 2);
            const adjustedEntanglement = Math.min(optimized.maxEntanglementLevel, maxEntanglement);
            optimized = new QuantumConfig(newBitDepth, adjustedEntanglement, Math.min(newComplexity, newBitDepth), optimized.interferenceThreshold, optimized.profileName);
        }
        else if (dataSize > 1024 * 1024) { // Large files
            const newBitDepth = Math.min(12, optimized.quantumBitDepth + 2);
            const newComplexity = Math.min(8, optimized.superpositionComplexity + 1);
            optimized = new QuantumConfig(newBitDepth, optimized.maxEntanglementLevel, Math.min(newComplexity, newBitDepth), optimized.interferenceThreshold, optimized.profileName);
        }
        return optimized;
    }
    /**
     * Validate all parameters are within acceptable bounds
     */
    validateParameters() {
        QuantumConfig.validateQuantumBitDepth(this._quantumBitDepth);
        QuantumConfig.validateEntanglementLevel(this._maxEntanglementLevel);
        QuantumConfig.validateSuperpositionComplexity(this._superpositionComplexity);
        QuantumConfig.validateInterferenceThreshold(this._interferenceThreshold);
        this.validateParameterCombination();
    }
    /**
     * Validate quantum bit depth parameter
     */
    static validateQuantumBitDepth(value) {
        if (!Number.isInteger(value)) {
            throw new Error('Quantum bit depth must be an integer');
        }
        if (value < 2 || value > 16) {
            throw new Error('Quantum bit depth must be between 2 and 16');
        }
    }
    /**
     * Validate entanglement level parameter
     */
    static validateEntanglementLevel(value) {
        if (!Number.isInteger(value)) {
            throw new Error('Maximum entanglement level must be an integer');
        }
        if (value < 1 || value > 8) {
            throw new Error('Maximum entanglement level must be between 1 and 8');
        }
    }
    /**
     * Validate superposition complexity parameter
     */
    static validateSuperpositionComplexity(value) {
        if (!Number.isInteger(value)) {
            throw new Error('Superposition complexity must be an integer');
        }
        if (value < 1 || value > 10) {
            throw new Error('Superposition complexity must be between 1 and 10');
        }
    }
    /**
     * Validate interference threshold parameter
     */
    static validateInterferenceThreshold(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Interference threshold must be a valid number');
        }
        if (value < 0.1 || value > 0.9) {
            throw new Error('Interference threshold must be between 0.1 and 0.9');
        }
    }
    /**
     * Validate parameter combination for computational feasibility
     */
    validateParameterCombination() {
        // Check if the combination would exceed reasonable computational bounds
        const computationalComplexity = this.calculateComputationalComplexity();
        if (computationalComplexity > 10000000) {
            throw new Error('Parameter combination exceeds computational feasibility bounds. ' +
                'Consider reducing quantum bit depth, entanglement level, or superposition complexity.');
        }
        // Validate that entanglement level doesn't exceed what's meaningful for the bit depth
        const maxMeaningfulEntanglement = Math.floor(this._quantumBitDepth / 2);
        if (this._maxEntanglementLevel > maxMeaningfulEntanglement) {
            throw new Error(`Maximum entanglement level (${this._maxEntanglementLevel}) should not exceed ` +
                `half the quantum bit depth (${maxMeaningfulEntanglement} for ${this._quantumBitDepth} bits)`);
        }
        // Validate superposition complexity relative to bit depth
        if (this._superpositionComplexity > this._quantumBitDepth) {
            throw new Error(`Superposition complexity (${this._superpositionComplexity}) should not exceed ` +
                `quantum bit depth (${this._quantumBitDepth})`);
        }
    }
    /**
     * Calculate computational complexity score for parameter validation
     */
    calculateComputationalComplexity() {
        // Exponential growth with bit depth, linear with other parameters
        const bitDepthComplexity = Math.pow(2, this._quantumBitDepth);
        const entanglementComplexity = this._maxEntanglementLevel * 10;
        const superpositionComplexity = this._superpositionComplexity * 5;
        return bitDepthComplexity * entanglementComplexity * superpositionComplexity;
    }
    /**
     * Validate a complete configuration object
     */
    static validateConfiguration(config) {
        const errors = [];
        try {
            if (config.quantumBitDepth !== undefined) {
                QuantumConfig.validateQuantumBitDepth(config.quantumBitDepth);
            }
        }
        catch (error) {
            errors.push(`Quantum bit depth: ${error instanceof Error ? error.message : String(error)}`);
        }
        try {
            if (config.maxEntanglementLevel !== undefined) {
                QuantumConfig.validateEntanglementLevel(config.maxEntanglementLevel);
            }
        }
        catch (error) {
            errors.push(`Entanglement level: ${error instanceof Error ? error.message : String(error)}`);
        }
        try {
            if (config.superpositionComplexity !== undefined) {
                QuantumConfig.validateSuperpositionComplexity(config.superpositionComplexity);
            }
        }
        catch (error) {
            errors.push(`Superposition complexity: ${error instanceof Error ? error.message : String(error)}`);
        }
        try {
            if (config.interferenceThreshold !== undefined) {
                QuantumConfig.validateInterferenceThreshold(config.interferenceThreshold);
            }
        }
        catch (error) {
            errors.push(`Interference threshold: ${error instanceof Error ? error.message : String(error)}`);
        }
        // Validate combination if all required parameters are present
        if (config.quantumBitDepth !== undefined &&
            config.maxEntanglementLevel !== undefined &&
            config.superpositionComplexity !== undefined) {
            try {
                const tempConfig = new QuantumConfig(config.quantumBitDepth, config.maxEntanglementLevel, config.superpositionComplexity, config.interferenceThreshold || 0.5);
                // Constructor will call validateParameterCombination
            }
            catch (error) {
                errors.push(`Parameter combination: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        return errors;
    }
    /**
     * Check if configuration is valid without throwing errors
     */
    static isValidConfiguration(config) {
        return QuantumConfig.validateConfiguration(config).length === 0;
    }
    /**
     * Get suggested parameter ranges for optimization
     */
    static getParameterRanges() {
        return {
            quantumBitDepth: {
                min: 2,
                max: 16,
                recommended: [4, 6, 8, 10, 12]
            },
            maxEntanglementLevel: {
                min: 1,
                max: 8,
                recommended: [2, 3, 4, 5, 6]
            },
            superpositionComplexity: {
                min: 1,
                max: 10,
                recommended: [3, 4, 5, 6, 7]
            },
            interferenceThreshold: {
                min: 0.1,
                max: 0.9,
                recommended: [0.3, 0.4, 0.5, 0.6, 0.7]
            }
        };
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