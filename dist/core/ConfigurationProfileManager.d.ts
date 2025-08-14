import { QuantumConfig, QuantumConfigData } from '../models/QuantumConfig';
/**
 * Configuration profile for quantum compression
 */
export interface ConfigurationProfile {
    name: string;
    description: string;
    config: QuantumConfigData;
    dataType: 'text' | 'binary' | 'image' | 'mixed';
    createdAt: Date;
    lastUsed?: Date;
    usageCount: number;
    averageCompressionRatio?: number;
    averageProcessingTime?: number;
}
/**
 * Data type characteristics for optimization
 */
export interface DataTypeCharacteristics {
    entropy: number;
    repetitionRate: number;
    structuralComplexity: number;
    size: number;
}
/**
 * Optimization result with suggested parameters
 */
export interface OptimizationResult {
    optimizedConfig: QuantumConfig;
    expectedCompressionRatio: number;
    expectedProcessingTime: number;
    confidence: number;
    reasoning: string[];
}
/**
 * Manager for configuration profiles and parameter optimization
 */
export declare class ConfigurationProfileManager {
    private profilesDirectory;
    private profiles;
    constructor(profilesDirectory?: string);
    /**
     * Save a configuration profile
     */
    saveProfile(profile: ConfigurationProfile): Promise<void>;
    /**
     * Load a configuration profile by name
     */
    loadProfile(name: string): Promise<ConfigurationProfile | null>;
    /**
     * Delete a configuration profile
     */
    deleteProfile(name: string): Promise<boolean>;
    /**
     * List all available profiles
     */
    listProfiles(): ConfigurationProfile[];
    /**
     * Get profiles filtered by data type
     */
    getProfilesByDataType(dataType: 'text' | 'binary' | 'image' | 'mixed'): ConfigurationProfile[];
    /**
     * Update profile usage statistics
     */
    updateProfileUsage(name: string, compressionRatio: number, processingTime: number): Promise<void>;
    /**
     * Create a new profile from a QuantumConfig
     */
    createProfile(name: string, description: string, config: QuantumConfig, dataType: 'text' | 'binary' | 'image' | 'mixed'): ConfigurationProfile;
    /**
     * Optimize parameters for given data characteristics
     */
    optimizeParameters(characteristics: DataTypeCharacteristics, dataType: 'text' | 'binary' | 'image' | 'mixed', constraints?: {
        maxMemoryMB?: number;
        maxProcessingTime?: number;
        prioritizeSpeed?: boolean;
        prioritizeCompression?: boolean;
    }): OptimizationResult;
    /**
     * Find the best existing profile for given characteristics
     */
    findBestProfile(characteristics: DataTypeCharacteristics, dataType: 'text' | 'binary' | 'image' | 'mixed'): ConfigurationProfile | null;
    /**
     * Get optimization suggestions for an existing configuration
     */
    getOptimizationSuggestions(currentConfig: QuantumConfig, characteristics: DataTypeCharacteristics): string[];
    /**
     * Ensure profiles directory exists
     */
    private ensureProfilesDirectory;
    /**
     * Load all profiles from disk
     */
    private loadAllProfiles;
    /**
     * Validate a profile before saving
     */
    private validateProfile;
    /**
     * Optimize configuration based on data characteristics
     */
    private optimizeForCharacteristics;
    /**
     * Apply constraints to optimized configuration
     */
    private applyConstraints;
    /**
     * Estimate compression ratio for given configuration and characteristics
     */
    private estimateCompressionRatio;
    /**
     * Estimate processing time multiplier for given configuration and characteristics
     */
    private estimateProcessingTime;
    /**
     * Calculate confidence in optimization based on data characteristics
     */
    private calculateOptimizationConfidence;
    /**
     * Calculate suitability score for a configuration given data characteristics
     */
    private calculateSuitabilityScore;
    /**
     * Calculate performance score for a profile based on historical data
     */
    private calculatePerformanceScore;
}
//# sourceMappingURL=ConfigurationProfileManager.d.ts.map