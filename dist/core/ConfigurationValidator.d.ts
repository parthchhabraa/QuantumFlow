/**
 * Configuration validation and guidance system for QuantumFlow
 * Provides user-friendly validation with detailed explanations and suggestions
 */
import { QuantumConfig, QuantumConfigData } from '../models/QuantumConfig';
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions: ConfigurationSuggestion[];
    optimizedConfig?: QuantumConfig;
}
export interface ValidationError {
    parameter: string;
    value: any;
    message: string;
    expectedRange: any;
    severity: 'error' | 'warning';
    code: string;
}
export interface ValidationWarning {
    parameter: string;
    value: any;
    message: string;
    recommendation: string;
    impact: 'performance' | 'memory' | 'compression' | 'compatibility';
}
export interface ConfigurationSuggestion {
    type: 'optimization' | 'compatibility' | 'performance' | 'memory';
    title: string;
    description: string;
    currentValue: any;
    suggestedValue: any;
    parameter: string;
    impact: string;
    confidence: number;
}
export interface DataCharacteristics {
    size: number;
    entropy?: number;
    repetitionRate?: number;
    structuralComplexity?: number;
    dataType?: 'text' | 'binary' | 'image' | 'mixed';
}
export interface SystemConstraints {
    maxMemoryMB?: number;
    maxProcessingTime?: number;
    cpuCores?: number;
    prioritizeSpeed?: boolean;
    prioritizeCompression?: boolean;
}
export declare class ConfigurationValidator {
    private static readonly PARAMETER_RANGES;
    /**
     * Validate quantum configuration with detailed feedback
     */
    static validateConfiguration(config: QuantumConfigData, dataCharacteristics?: DataCharacteristics, systemConstraints?: SystemConstraints): ValidationResult;
    /**
     * Validate quantum bit depth parameter
     */
    private static validateQuantumBitDepth;
    /**
     * Validate max entanglement level parameter
     */
    private static validateMaxEntanglementLevel;
    /**
     * Validate superposition complexity parameter
     */
    private static validateSuperpositionComplexity;
    /**
     * Validate interference threshold parameter
     */
    private static validateInterferenceThreshold;
    /**
     * Validate parameter relationships and dependencies
     */
    private static validateParameterRelationships;
    /**
     * Validate configuration against data characteristics
     */
    private static validateForDataCharacteristics;
    /**
     * Validate configuration against system constraints
     */
    private static validateForSystemConstraints;
    /**
     * Generate optimized configuration based on validation results
     */
    private static generateOptimizedConfiguration;
    /**
     * Estimate memory usage for configuration
     */
    private static estimateMemoryUsage;
    /**
     * Format validation result for display
     */
    static formatValidationResult(result: ValidationResult, includeDetails?: boolean): string;
    /**
     * Get parameter documentation
     */
    static getParameterDocumentation(): Record<string, any>;
    /**
     * Get configuration presets for different use cases
     */
    static getConfigurationPresets(): Record<string, QuantumConfigData>;
}
//# sourceMappingURL=ConfigurationValidator.d.ts.map