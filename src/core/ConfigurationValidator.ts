/**
 * Configuration validation and guidance system for QuantumFlow
 * Provides user-friendly validation with detailed explanations and suggestions
 */

import { QuantumConfig, QuantumConfigData } from '../models/QuantumConfig';
import { ErrorHandler, ErrorCategory, ErrorSeverity } from './ErrorHandler';

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
  confidence: number; // 0-1
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

export class ConfigurationValidator {
  private static readonly PARAMETER_RANGES = {
    quantumBitDepth: {
      min: 2,
      max: 16,
      recommended: [4, 6, 8, 10, 12],
      default: 8,
      description: 'Controls quantum state complexity and memory usage'
    },
    maxEntanglementLevel: {
      min: 1,
      max: 8,
      recommended: [2, 3, 4, 5],
      default: 4,
      description: 'Maximum depth of quantum entanglement relationships'
    },
    superpositionComplexity: {
      min: 1,
      max: 10,
      recommended: [3, 4, 5, 6],
      default: 5,
      description: 'Complexity of quantum superposition processing'
    },
    interferenceThreshold: {
      min: 0.1,
      max: 0.9,
      recommended: [0.3, 0.4, 0.5, 0.6],
      default: 0.5,
      description: 'Threshold for quantum interference optimization'
    }
  };

  /**
   * Validate quantum configuration with detailed feedback
   */
  static validateConfiguration(
    config: QuantumConfigData,
    dataCharacteristics?: DataCharacteristics,
    systemConstraints?: SystemConstraints
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ConfigurationSuggestion[] = [];

    // Provide defaults for undefined values
    const safeConfig = {
      quantumBitDepth: config.quantumBitDepth ?? 8,
      maxEntanglementLevel: config.maxEntanglementLevel ?? 4,
      superpositionComplexity: config.superpositionComplexity ?? 5,
      interferenceThreshold: config.interferenceThreshold ?? 0.5,
      profileName: config.profileName ?? 'default'
    };

    // Validate individual parameters
    this.validateQuantumBitDepth(safeConfig.quantumBitDepth, errors, warnings, suggestions);
    this.validateMaxEntanglementLevel(safeConfig.maxEntanglementLevel, errors, warnings, suggestions);
    this.validateSuperpositionComplexity(safeConfig.superpositionComplexity, errors, warnings, suggestions);
    this.validateInterferenceThreshold(safeConfig.interferenceThreshold, errors, warnings, suggestions);

    // Validate parameter relationships
    this.validateParameterRelationships(safeConfig, errors, warnings, suggestions);

    // Validate against data characteristics
    if (dataCharacteristics) {
      this.validateForDataCharacteristics(safeConfig, dataCharacteristics, warnings, suggestions);
    }

    // Validate against system constraints
    if (systemConstraints) {
      this.validateForSystemConstraints(safeConfig, systemConstraints, warnings, suggestions);
    }

    // Generate optimized configuration if there are issues
    let optimizedConfig: QuantumConfig | undefined;
    if (errors.length > 0 || warnings.length > 0) {
      optimizedConfig = this.generateOptimizedConfiguration(
        safeConfig,
        dataCharacteristics,
        systemConstraints,
        errors,
        warnings
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      optimizedConfig
    };
  }

  /**
   * Validate quantum bit depth parameter
   */
  private static validateQuantumBitDepth(
    value: number,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ConfigurationSuggestion[]
  ): void {
    const range = this.PARAMETER_RANGES.quantumBitDepth;

    if (value < range.min || value > range.max) {
      errors.push({
        parameter: 'quantumBitDepth',
        value,
        message: `Quantum bit depth must be between ${range.min} and ${range.max}`,
        expectedRange: range,
        severity: 'error',
        code: 'INVALID_QUANTUM_BIT_DEPTH'
      });

      suggestions.push({
        type: 'compatibility',
        title: 'Fix quantum bit depth',
        description: 'Use a valid quantum bit depth value',
        currentValue: value,
        suggestedValue: range.default,
        parameter: 'quantumBitDepth',
        impact: 'Required for operation',
        confidence: 1.0
      });
    } else if (!range.recommended.includes(value)) {
      warnings.push({
        parameter: 'quantumBitDepth',
        value,
        message: `Quantum bit depth ${value} is valid but not optimal`,
        recommendation: `Consider using recommended values: ${range.recommended.join(', ')}`,
        impact: 'performance'
      });

      const closestRecommended = range.recommended.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );

      suggestions.push({
        type: 'optimization',
        title: 'Optimize quantum bit depth',
        description: 'Use a recommended value for better performance',
        currentValue: value,
        suggestedValue: closestRecommended,
        parameter: 'quantumBitDepth',
        impact: 'Improved processing efficiency',
        confidence: 0.8
      });
    }

    // Memory usage warnings
    if (value > 12) {
      warnings.push({
        parameter: 'quantumBitDepth',
        value,
        message: 'High quantum bit depth may cause excessive memory usage',
        recommendation: 'Consider reducing to 8-12 for large files',
        impact: 'memory'
      });

      suggestions.push({
        type: 'memory',
        title: 'Reduce memory usage',
        description: 'Lower quantum bit depth to reduce memory consumption',
        currentValue: value,
        suggestedValue: 10,
        parameter: 'quantumBitDepth',
        impact: 'Reduced memory usage, slightly lower compression',
        confidence: 0.7
      });
    }
  }

  /**
   * Validate max entanglement level parameter
   */
  private static validateMaxEntanglementLevel(
    value: number,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ConfigurationSuggestion[]
  ): void {
    const range = this.PARAMETER_RANGES.maxEntanglementLevel;

    if (value < range.min || value > range.max) {
      errors.push({
        parameter: 'maxEntanglementLevel',
        value,
        message: `Max entanglement level must be between ${range.min} and ${range.max}`,
        expectedRange: range,
        severity: 'error',
        code: 'INVALID_ENTANGLEMENT_LEVEL'
      });

      suggestions.push({
        type: 'compatibility',
        title: 'Fix entanglement level',
        description: 'Use a valid entanglement level value',
        currentValue: value,
        suggestedValue: range.default,
        parameter: 'maxEntanglementLevel',
        impact: 'Required for operation',
        confidence: 1.0
      });
    }
  }

  /**
   * Validate superposition complexity parameter
   */
  private static validateSuperpositionComplexity(
    value: number,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ConfigurationSuggestion[]
  ): void {
    const range = this.PARAMETER_RANGES.superpositionComplexity;

    if (value < range.min || value > range.max) {
      errors.push({
        parameter: 'superpositionComplexity',
        value,
        message: `Superposition complexity must be between ${range.min} and ${range.max}`,
        expectedRange: range,
        severity: 'error',
        code: 'INVALID_SUPERPOSITION_COMPLEXITY'
      });

      suggestions.push({
        type: 'compatibility',
        title: 'Fix superposition complexity',
        description: 'Use a valid superposition complexity value',
        currentValue: value,
        suggestedValue: range.default,
        parameter: 'superpositionComplexity',
        impact: 'Required for operation',
        confidence: 1.0
      });
    }
  }

  /**
   * Validate interference threshold parameter
   */
  private static validateInterferenceThreshold(
    value: number,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ConfigurationSuggestion[]
  ): void {
    const range = this.PARAMETER_RANGES.interferenceThreshold;

    if (value < range.min || value > range.max) {
      errors.push({
        parameter: 'interferenceThreshold',
        value,
        message: `Interference threshold must be between ${range.min} and ${range.max}`,
        expectedRange: range,
        severity: 'error',
        code: 'INVALID_INTERFERENCE_THRESHOLD'
      });

      suggestions.push({
        type: 'compatibility',
        title: 'Fix interference threshold',
        description: 'Use a valid interference threshold value',
        currentValue: value,
        suggestedValue: range.default,
        parameter: 'interferenceThreshold',
        impact: 'Required for operation',
        confidence: 1.0
      });
    }
  }

  /**
   * Validate parameter relationships and dependencies
   */
  private static validateParameterRelationships(
    config: Required<QuantumConfigData>,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ConfigurationSuggestion[]
  ): void {
    // Entanglement level should not exceed quantum bit depth / 2
    const maxMeaningfulEntanglement = Math.floor(config.quantumBitDepth / 2);
    if (config.maxEntanglementLevel > maxMeaningfulEntanglement) {
      warnings.push({
        parameter: 'maxEntanglementLevel',
        value: config.maxEntanglementLevel,
        message: `Entanglement level ${config.maxEntanglementLevel} may be too high for quantum bit depth ${config.quantumBitDepth}`,
        recommendation: `Consider reducing to ${maxMeaningfulEntanglement} or increasing quantum bit depth`,
        impact: 'performance'
      });

      suggestions.push({
        type: 'optimization',
        title: 'Balance entanglement and bit depth',
        description: 'Adjust entanglement level to match quantum bit depth',
        currentValue: config.maxEntanglementLevel,
        suggestedValue: maxMeaningfulEntanglement,
        parameter: 'maxEntanglementLevel',
        impact: 'Better quantum state utilization',
        confidence: 0.9
      });
    }

    // Superposition complexity should not exceed quantum bit depth
    if (config.superpositionComplexity > config.quantumBitDepth) {
      warnings.push({
        parameter: 'superpositionComplexity',
        value: config.superpositionComplexity,
        message: `Superposition complexity ${config.superpositionComplexity} exceeds quantum bit depth ${config.quantumBitDepth}`,
        recommendation: `Reduce to ${config.quantumBitDepth} or increase quantum bit depth`,
        impact: 'performance'
      });

      suggestions.push({
        type: 'optimization',
        title: 'Balance superposition and bit depth',
        description: 'Adjust superposition complexity to not exceed quantum bit depth',
        currentValue: config.superpositionComplexity,
        suggestedValue: config.quantumBitDepth,
        parameter: 'superpositionComplexity',
        impact: 'Prevent unnecessary complexity',
        confidence: 0.9
      });
    }

    // High interference threshold with high complexity may be inefficient
    if (config.interferenceThreshold > 0.7 && config.superpositionComplexity > 7) {
      warnings.push({
        parameter: 'interferenceThreshold',
        value: config.interferenceThreshold,
        message: 'High interference threshold with high superposition complexity may reduce effectiveness',
        recommendation: 'Consider lowering interference threshold to 0.5-0.6',
        impact: 'compression'
      });

      suggestions.push({
        type: 'optimization',
        title: 'Optimize interference settings',
        description: 'Balance interference threshold with superposition complexity',
        currentValue: config.interferenceThreshold,
        suggestedValue: 0.6,
        parameter: 'interferenceThreshold',
        impact: 'Better compression efficiency',
        confidence: 0.7
      });
    }
  }

  /**
   * Validate configuration against data characteristics
   */
  private static validateForDataCharacteristics(
    config: Required<QuantumConfigData>,
    characteristics: DataCharacteristics,
    warnings: ValidationWarning[],
    suggestions: ConfigurationSuggestion[]
  ): void {
    // High entropy data with high quantum bit depth
    if (characteristics.entropy && characteristics.entropy > 0.8 && config.quantumBitDepth > 8) {
      warnings.push({
        parameter: 'quantumBitDepth',
        value: config.quantumBitDepth,
        message: 'High entropy data may not benefit from high quantum bit depth',
        recommendation: 'Consider reducing quantum bit depth to 6-8 for random data',
        impact: 'performance'
      });

      suggestions.push({
        type: 'optimization',
        title: 'Optimize for high entropy data',
        description: 'Reduce quantum bit depth for better performance with random data',
        currentValue: config.quantumBitDepth,
        suggestedValue: 6,
        parameter: 'quantumBitDepth',
        impact: 'Faster processing with minimal compression loss',
        confidence: 0.8
      });
    }

    // Low repetition rate with high entanglement level
    if (characteristics.repetitionRate && characteristics.repetitionRate < 0.3 && config.maxEntanglementLevel > 4) {
      warnings.push({
        parameter: 'maxEntanglementLevel',
        value: config.maxEntanglementLevel,
        message: 'Low repetition rate data may not benefit from high entanglement levels',
        recommendation: 'Consider reducing entanglement level to 2-3',
        impact: 'performance'
      });

      suggestions.push({
        type: 'optimization',
        title: 'Optimize for low repetition data',
        description: 'Reduce entanglement level for data with few repetitive patterns',
        currentValue: config.maxEntanglementLevel,
        suggestedValue: 3,
        parameter: 'maxEntanglementLevel',
        impact: 'Improved processing speed',
        confidence: 0.7
      });
    }

    // Large file size warnings
    if (characteristics.size > 100 * 1024 * 1024) { // 100MB
      if (config.quantumBitDepth > 8) {
        warnings.push({
          parameter: 'quantumBitDepth',
          value: config.quantumBitDepth,
          message: 'High quantum bit depth may cause memory issues with large files',
          recommendation: 'Consider reducing to 6-8 for files over 100MB',
          impact: 'memory'
        });

        suggestions.push({
          type: 'memory',
          title: 'Optimize for large files',
          description: 'Reduce quantum parameters to handle large files efficiently',
          currentValue: config.quantumBitDepth,
          suggestedValue: 6,
          parameter: 'quantumBitDepth',
          impact: 'Prevent memory exhaustion',
          confidence: 0.9
        });
      }
    }
  }

  /**
   * Validate configuration against system constraints
   */
  private static validateForSystemConstraints(
    config: Required<QuantumConfigData>,
    constraints: SystemConstraints,
    warnings: ValidationWarning[],
    suggestions: ConfigurationSuggestion[]
  ): void {
    // Memory constraints
    if (constraints.maxMemoryMB) {
      const estimatedMemoryMB = this.estimateMemoryUsage(config);
      if (estimatedMemoryMB > constraints.maxMemoryMB) {
        warnings.push({
          parameter: 'quantumBitDepth',
          value: config.quantumBitDepth,
          message: `Configuration may exceed memory limit (estimated ${estimatedMemoryMB}MB > ${constraints.maxMemoryMB}MB)`,
          recommendation: 'Reduce quantum parameters to fit memory constraints',
          impact: 'memory'
        });

        suggestions.push({
          type: 'memory',
          title: 'Reduce memory usage',
          description: 'Lower quantum parameters to fit within memory constraints',
          currentValue: config.quantumBitDepth,
          suggestedValue: Math.max(2, config.quantumBitDepth - 2),
          parameter: 'quantumBitDepth',
          impact: 'Fit within memory limits',
          confidence: 0.8
        });
      }
    }

    // Performance constraints
    if (constraints.prioritizeSpeed) {
      if (config.quantumBitDepth > 6 || config.superpositionComplexity > 4) {
        suggestions.push({
          type: 'performance',
          title: 'Optimize for speed',
          description: 'Reduce complexity parameters to prioritize processing speed',
          currentValue: config.quantumBitDepth,
          suggestedValue: 4,
          parameter: 'quantumBitDepth',
          impact: 'Faster processing with acceptable compression',
          confidence: 0.8
        });
      }
    }

    if (constraints.prioritizeCompression) {
      if (config.quantumBitDepth < 8 || config.maxEntanglementLevel < 4) {
        suggestions.push({
          type: 'optimization',
          title: 'Optimize for compression',
          description: 'Increase complexity parameters to prioritize compression ratio',
          currentValue: config.quantumBitDepth,
          suggestedValue: Math.min(12, config.quantumBitDepth + 2),
          parameter: 'quantumBitDepth',
          impact: 'Better compression with longer processing time',
          confidence: 0.7
        });
      }
    }
  }

  /**
   * Generate optimized configuration based on validation results
   */
  private static generateOptimizedConfiguration(
    config: Required<QuantumConfigData>,
    dataCharacteristics?: DataCharacteristics,
    systemConstraints?: SystemConstraints,
    errors?: ValidationError[],
    warnings?: ValidationWarning[]
  ): QuantumConfig {
    let optimized = { ...config };

    // Fix errors first
    if (errors) {
      errors.forEach(error => {
        const range = this.PARAMETER_RANGES[error.parameter as keyof typeof this.PARAMETER_RANGES];
        if (range) {
          (optimized as any)[error.parameter] = range.default;
        }
      });
    }

    // Apply optimizations based on data characteristics
    if (dataCharacteristics) {
      if (dataCharacteristics.entropy && dataCharacteristics.entropy > 0.8) {
        optimized.quantumBitDepth = Math.min(optimized.quantumBitDepth, 6);
      }

      if (dataCharacteristics.repetitionRate && dataCharacteristics.repetitionRate < 0.3) {
        optimized.maxEntanglementLevel = Math.min(optimized.maxEntanglementLevel, 3);
      }

      if (dataCharacteristics.size > 100 * 1024 * 1024) {
        optimized.quantumBitDepth = Math.min(optimized.quantumBitDepth, 6);
        optimized.superpositionComplexity = Math.min(optimized.superpositionComplexity, 4);
      }
    }

    // Apply system constraints
    if (systemConstraints) {
      if (systemConstraints.prioritizeSpeed) {
        optimized.quantumBitDepth = Math.min(optimized.quantumBitDepth, 4);
        optimized.superpositionComplexity = Math.min(optimized.superpositionComplexity, 3);
      }

      if (systemConstraints.maxMemoryMB) {
        while (this.estimateMemoryUsage(optimized) > systemConstraints.maxMemoryMB && optimized.quantumBitDepth > 2) {
          optimized.quantumBitDepth = Math.max(2, optimized.quantumBitDepth - 1);
          optimized.maxEntanglementLevel = Math.min(optimized.maxEntanglementLevel, Math.floor(optimized.quantumBitDepth / 2));
        }
      }
    }

    // Ensure parameter relationships are valid
    optimized.maxEntanglementLevel = Math.min(optimized.maxEntanglementLevel, Math.floor(optimized.quantumBitDepth / 2));
    optimized.superpositionComplexity = Math.min(optimized.superpositionComplexity, optimized.quantumBitDepth);

    return new QuantumConfig(
      optimized.quantumBitDepth,
      optimized.maxEntanglementLevel,
      optimized.superpositionComplexity,
      optimized.interferenceThreshold
    );
  }

  /**
   * Estimate memory usage for configuration
   */
  private static estimateMemoryUsage(config: Required<QuantumConfigData>): number {
    // Rough estimation based on quantum parameters
    const baseMemoryMB = 10;
    const bitDepthFactor = Math.pow(2, config.quantumBitDepth - 4);
    const complexityFactor = config.superpositionComplexity / 5;
    const entanglementFactor = config.maxEntanglementLevel / 4;

    return Math.round(baseMemoryMB * bitDepthFactor * complexityFactor * entanglementFactor);
  }

  /**
   * Format validation result for display
   */
  static formatValidationResult(result: ValidationResult, includeDetails: boolean = true): string {
    let output = '';

    if (result.isValid) {
      output += '✅ Configuration is valid\n';
    } else {
      output += '❌ Configuration has issues\n';
    }

    // Show errors
    if (result.errors.length > 0) {
      output += '\n🚫 Errors:\n';
      result.errors.forEach((error, index) => {
        output += `${index + 1}. ${error.parameter}: ${error.message}\n`;
        if (includeDetails && error.expectedRange) {
          output += `   Expected: ${error.expectedRange.min}-${error.expectedRange.max}\n`;
          output += `   Current: ${error.value}\n`;
        }
      });
    }

    // Show warnings
    if (result.warnings.length > 0) {
      output += '\n⚠️  Warnings:\n';
      result.warnings.forEach((warning, index) => {
        output += `${index + 1}. ${warning.parameter}: ${warning.message}\n`;
        if (includeDetails) {
          output += `   Recommendation: ${warning.recommendation}\n`;
          output += `   Impact: ${warning.impact}\n`;
        }
      });
    }

    // Show suggestions
    if (result.suggestions.length > 0) {
      output += '\n💡 Suggestions:\n';
      result.suggestions.slice(0, 3).forEach((suggestion, index) => {
        output += `${index + 1}. ${suggestion.title}\n`;
        output += `   ${suggestion.description}\n`;
        output += `   Change ${suggestion.parameter}: ${suggestion.currentValue} → ${suggestion.suggestedValue}\n`;
        output += `   Impact: ${suggestion.impact}\n`;
      });
    }

    return output;
  }

  /**
   * Get parameter documentation
   */
  static getParameterDocumentation(): Record<string, any> {
    return this.PARAMETER_RANGES;
  }

  /**
   * Get configuration presets for different use cases
   */
  static getConfigurationPresets(): Record<string, QuantumConfigData> {
    return {
      'speed-optimized': {
        quantumBitDepth: 4,
        maxEntanglementLevel: 2,
        superpositionComplexity: 3,
        interferenceThreshold: 0.6
      },
      'compression-optimized': {
        quantumBitDepth: 10,
        maxEntanglementLevel: 4,
        superpositionComplexity: 6,
        interferenceThreshold: 0.4
      },
      'balanced': {
        quantumBitDepth: 6,
        maxEntanglementLevel: 3,
        superpositionComplexity: 4,
        interferenceThreshold: 0.5
      },
      'memory-efficient': {
        quantumBitDepth: 4,
        maxEntanglementLevel: 2,
        superpositionComplexity: 3,
        interferenceThreshold: 0.7
      },
      'high-quality': {
        quantumBitDepth: 12,
        maxEntanglementLevel: 5,
        superpositionComplexity: 7,
        interferenceThreshold: 0.3
      }
    };
  }
}