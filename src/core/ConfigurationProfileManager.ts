import { QuantumConfig, QuantumConfigData } from '../models/QuantumConfig';
import * as fs from 'fs';
import * as path from 'path';

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
  entropy: number; // 0-1, higher means more random
  repetitionRate: number; // 0-1, higher means more repetitive patterns
  structuralComplexity: number; // 0-1, higher means more complex structure
  size: number; // File size in bytes
}

/**
 * Optimization result with suggested parameters
 */
export interface OptimizationResult {
  optimizedConfig: QuantumConfig;
  expectedCompressionRatio: number;
  expectedProcessingTime: number;
  confidence: number; // 0-1, confidence in the optimization
  reasoning: string[];
}

/**
 * Manager for configuration profiles and parameter optimization
 */
export class ConfigurationProfileManager {
  private profilesDirectory: string;
  private profiles: Map<string, ConfigurationProfile> = new Map();

  constructor(profilesDirectory: string = '.quantum-profiles') {
    this.profilesDirectory = profilesDirectory;
    this.ensureProfilesDirectory();
    this.loadAllProfiles();
  }

  /**
   * Save a configuration profile
   */
  async saveProfile(profile: ConfigurationProfile): Promise<void> {
    // Validate profile
    this.validateProfile(profile);

    // Update profile metadata
    profile.lastUsed = new Date();
    
    // Save to memory
    this.profiles.set(profile.name, profile);

    // Save to disk
    const profilePath = path.join(this.profilesDirectory, `${profile.name}.json`);
    const profileData = {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      lastUsed: profile.lastUsed?.toISOString()
    };

    await fs.promises.writeFile(profilePath, JSON.stringify(profileData, null, 2));
  }

  /**
   * Load a configuration profile by name
   */
  async loadProfile(name: string): Promise<ConfigurationProfile | null> {
    // Try memory first
    if (this.profiles.has(name)) {
      return this.profiles.get(name)!;
    }

    // Try loading from disk
    const profilePath = path.join(this.profilesDirectory, `${name}.json`);
    
    try {
      const profileData = await fs.promises.readFile(profilePath, 'utf-8');
      const parsed = JSON.parse(profileData);
      
      const profile: ConfigurationProfile = {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        lastUsed: parsed.lastUsed ? new Date(parsed.lastUsed) : undefined
      };

      this.profiles.set(name, profile);
      return profile;
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete a configuration profile
   */
  async deleteProfile(name: string): Promise<boolean> {
    // Remove from memory
    const existed = this.profiles.delete(name);

    // Remove from disk
    const profilePath = path.join(this.profilesDirectory, `${name}.json`);
    
    try {
      await fs.promises.unlink(profilePath);
      return true;
    } catch (error) {
      return existed; // Return true if it existed in memory even if file deletion failed
    }
  }

  /**
   * List all available profiles
   */
  listProfiles(): ConfigurationProfile[] {
    return Array.from(this.profiles.values()).sort((a, b) => 
      (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)
    );
  }

  /**
   * Get profiles filtered by data type
   */
  getProfilesByDataType(dataType: 'text' | 'binary' | 'image' | 'mixed'): ConfigurationProfile[] {
    return this.listProfiles().filter(profile => profile.dataType === dataType);
  }

  /**
   * Update profile usage statistics
   */
  async updateProfileUsage(
    name: string, 
    compressionRatio: number, 
    processingTime: number
  ): Promise<void> {
    const profile = await this.loadProfile(name);
    if (!profile) {
      throw new Error(`Profile '${name}' not found`);
    }

    profile.usageCount++;
    profile.lastUsed = new Date();

    // Update running averages
    if (profile.averageCompressionRatio === undefined) {
      profile.averageCompressionRatio = compressionRatio;
    } else {
      profile.averageCompressionRatio = 
        (profile.averageCompressionRatio * (profile.usageCount - 1) + compressionRatio) / profile.usageCount;
    }

    if (profile.averageProcessingTime === undefined) {
      profile.averageProcessingTime = processingTime;
    } else {
      profile.averageProcessingTime = 
        (profile.averageProcessingTime * (profile.usageCount - 1) + processingTime) / profile.usageCount;
    }

    await this.saveProfile(profile);
  }

  /**
   * Create a new profile from a QuantumConfig
   */
  createProfile(
    name: string,
    description: string,
    config: QuantumConfig,
    dataType: 'text' | 'binary' | 'image' | 'mixed'
  ): ConfigurationProfile {
    return {
      name,
      description,
      config: config.toObject(),
      dataType,
      createdAt: new Date(),
      usageCount: 0
    };
  }

  /**
   * Optimize parameters for given data characteristics
   */
  optimizeParameters(
    characteristics: DataTypeCharacteristics,
    dataType: 'text' | 'binary' | 'image' | 'mixed',
    constraints?: {
      maxMemoryMB?: number;
      maxProcessingTime?: number;
      prioritizeSpeed?: boolean;
      prioritizeCompression?: boolean;
    }
  ): OptimizationResult {
    const reasoning: string[] = [];
    let baseConfig: QuantumConfig;

    // Start with data type specific configuration
    switch (dataType) {
      case 'text':
        baseConfig = QuantumConfig.forTextCompression();
        reasoning.push('Started with text-optimized base configuration');
        break;
      case 'binary':
        baseConfig = QuantumConfig.forBinaryCompression();
        reasoning.push('Started with binary-optimized base configuration');
        break;
      case 'image':
        baseConfig = QuantumConfig.forImageCompression();
        reasoning.push('Started with image-optimized base configuration');
        break;
      default:
        baseConfig = new QuantumConfig();
        reasoning.push('Started with default configuration for mixed data');
    }

    // Optimize based on data characteristics
    let optimizedConfig = this.optimizeForCharacteristics(baseConfig, characteristics, reasoning);

    // Apply constraints
    if (constraints) {
      optimizedConfig = this.applyConstraints(optimizedConfig, characteristics, constraints, reasoning);
    }

    // Calculate expected performance
    const expectedCompressionRatio = this.estimateCompressionRatio(optimizedConfig, characteristics);
    const expectedProcessingTime = this.estimateProcessingTime(optimizedConfig, characteristics);
    const confidence = this.calculateOptimizationConfidence(characteristics, optimizedConfig);

    return {
      optimizedConfig,
      expectedCompressionRatio,
      expectedProcessingTime,
      confidence,
      reasoning
    };
  }

  /**
   * Find the best existing profile for given characteristics
   */
  findBestProfile(
    characteristics: DataTypeCharacteristics,
    dataType: 'text' | 'binary' | 'image' | 'mixed'
  ): ConfigurationProfile | null {
    const candidates = this.getProfilesByDataType(dataType);
    
    if (candidates.length === 0) {
      return null;
    }

    // Score profiles based on historical performance and suitability
    const scoredProfiles = candidates.map(profile => {
      const config = QuantumConfig.fromObject(profile.config);
      const suitabilityScore = this.calculateSuitabilityScore(config, characteristics);
      const performanceScore = this.calculatePerformanceScore(profile);
      const usageScore = Math.log(profile.usageCount + 1) / 10; // Logarithmic usage bonus
      
      return {
        profile,
        totalScore: suitabilityScore * 0.5 + performanceScore * 0.3 + usageScore * 0.2
      };
    });

    // Return the highest scoring profile
    scoredProfiles.sort((a, b) => b.totalScore - a.totalScore);
    return scoredProfiles[0].profile;
  }

  /**
   * Get optimization suggestions for an existing configuration
   */
  getOptimizationSuggestions(
    currentConfig: QuantumConfig,
    characteristics: DataTypeCharacteristics
  ): string[] {
    const suggestions: string[] = [];
    
    // Check if configuration is suitable for data size
    if (!currentConfig.isSuitableForDataSize(characteristics.size)) {
      suggestions.push('Current configuration may use excessive memory for this data size');
    }

    // Analyze entropy vs quantum bit depth
    if (characteristics.entropy > 0.8 && currentConfig.quantumBitDepth > 8) {
      suggestions.push('High entropy data may not benefit from high quantum bit depth - consider reducing to 6-8 bits');
    } else if (characteristics.entropy < 0.3 && currentConfig.quantumBitDepth < 8) {
      suggestions.push('Low entropy data could benefit from higher quantum bit depth for better compression');
    }

    // Analyze repetition rate vs entanglement level
    if (characteristics.repetitionRate > 0.7 && currentConfig.maxEntanglementLevel < 4) {
      suggestions.push('High repetition rate suggests increasing entanglement level could improve compression');
    } else if (characteristics.repetitionRate < 0.3 && currentConfig.maxEntanglementLevel > 4) {
      suggestions.push('Low repetition rate suggests reducing entanglement level could improve performance');
    }

    // Analyze structural complexity vs superposition complexity
    if (characteristics.structuralComplexity > 0.8 && currentConfig.superpositionComplexity < 6) {
      suggestions.push('Complex data structure suggests increasing superposition complexity');
    } else if (characteristics.structuralComplexity < 0.3 && currentConfig.superpositionComplexity > 4) {
      suggestions.push('Simple data structure suggests reducing superposition complexity for better performance');
    }

    return suggestions;
  }

  /**
   * Ensure profiles directory exists
   */
  private ensureProfilesDirectory(): void {
    if (!fs.existsSync(this.profilesDirectory)) {
      fs.mkdirSync(this.profilesDirectory, { recursive: true });
    }
  }

  /**
   * Load all profiles from disk
   */
  private loadAllProfiles(): void {
    try {
      const files = fs.readdirSync(this.profilesDirectory);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const profilePath = path.join(this.profilesDirectory, file);
          try {
            const profileData = fs.readFileSync(profilePath, 'utf-8');
            const parsed = JSON.parse(profileData);
            
            const profile: ConfigurationProfile = {
              ...parsed,
              createdAt: new Date(parsed.createdAt),
              lastUsed: parsed.lastUsed ? new Date(parsed.lastUsed) : undefined
            };

            this.profiles.set(profile.name, profile);
          } catch (error) {
            console.warn(`Failed to load profile ${file}:`, error);
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read - that's okay
    }
  }

  /**
   * Validate a profile before saving
   */
  private validateProfile(profile: ConfigurationProfile): void {
    if (!profile.name || profile.name.trim().length === 0) {
      throw new Error('Profile name is required');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(profile.name)) {
      throw new Error('Profile name can only contain letters, numbers, underscores, and hyphens');
    }

    if (!profile.config) {
      throw new Error('Profile configuration is required');
    }

    // Validate the quantum configuration
    const errors = QuantumConfig.validateConfiguration(profile.config);
    if (errors.length > 0) {
      throw new Error(`Invalid configuration: ${errors.join(', ')}`);
    }

    if (!['text', 'binary', 'image', 'mixed'].includes(profile.dataType)) {
      throw new Error('Invalid data type. Must be one of: text, binary, image, mixed');
    }
  }

  /**
   * Optimize configuration based on data characteristics
   */
  private optimizeForCharacteristics(
    baseConfig: QuantumConfig,
    characteristics: DataTypeCharacteristics,
    reasoning: string[]
  ): QuantumConfig {
    let quantumBitDepth = baseConfig.quantumBitDepth;
    let maxEntanglementLevel = baseConfig.maxEntanglementLevel;
    let superpositionComplexity = baseConfig.superpositionComplexity;
    let interferenceThreshold = baseConfig.interferenceThreshold;

    // Optimize quantum bit depth based on entropy
    if (characteristics.entropy > 0.8) {
      quantumBitDepth = Math.max(4, quantumBitDepth - 2);
      reasoning.push('Reduced quantum bit depth due to high entropy (random data)');
    } else if (characteristics.entropy < 0.3) {
      quantumBitDepth = Math.min(12, quantumBitDepth + 2);
      reasoning.push('Increased quantum bit depth due to low entropy (structured data)');
    }

    // Optimize entanglement level based on repetition rate
    if (characteristics.repetitionRate > 0.7) {
      maxEntanglementLevel = Math.min(6, maxEntanglementLevel + 1);
      reasoning.push('Increased entanglement level due to high repetition rate');
    } else if (characteristics.repetitionRate < 0.3) {
      maxEntanglementLevel = Math.max(2, maxEntanglementLevel - 1);
      reasoning.push('Reduced entanglement level due to low repetition rate');
    }

    // Optimize superposition complexity based on structural complexity
    if (characteristics.structuralComplexity > 0.8) {
      superpositionComplexity = Math.min(8, superpositionComplexity + 1);
      reasoning.push('Increased superposition complexity due to high structural complexity');
    } else if (characteristics.structuralComplexity < 0.3) {
      superpositionComplexity = Math.max(3, superpositionComplexity - 1);
      reasoning.push('Reduced superposition complexity due to low structural complexity');
    }

    // Adjust interference threshold based on data characteristics
    if (characteristics.entropy > 0.7 && characteristics.repetitionRate < 0.3) {
      interferenceThreshold = Math.max(0.3, interferenceThreshold - 0.1);
      reasoning.push('Reduced interference threshold for high-entropy, low-repetition data');
    } else if (characteristics.entropy < 0.4 && characteristics.repetitionRate > 0.6) {
      interferenceThreshold = Math.min(0.8, interferenceThreshold + 0.1);
      reasoning.push('Increased interference threshold for low-entropy, high-repetition data');
    }

    // Ensure entanglement level is compatible with quantum bit depth
    const maxMeaningfulEntanglement = Math.floor(quantumBitDepth / 2);
    if (maxEntanglementLevel > maxMeaningfulEntanglement) {
      maxEntanglementLevel = maxMeaningfulEntanglement;
      reasoning.push(`Adjusted entanglement level to be compatible with quantum bit depth`);
    }

    // Ensure superposition complexity doesn't exceed quantum bit depth
    if (superpositionComplexity > quantumBitDepth) {
      superpositionComplexity = quantumBitDepth;
      reasoning.push(`Adjusted superposition complexity to not exceed quantum bit depth`);
    }

    return new QuantumConfig(
      quantumBitDepth,
      maxEntanglementLevel,
      superpositionComplexity,
      interferenceThreshold,
      baseConfig.profileName
    );
  }

  /**
   * Apply constraints to optimized configuration
   */
  private applyConstraints(
    config: QuantumConfig,
    characteristics: DataTypeCharacteristics,
    constraints: NonNullable<Parameters<ConfigurationProfileManager['optimizeParameters']>[2]>,
    reasoning: string[]
  ): QuantumConfig {
    let quantumBitDepth = config.quantumBitDepth;
    let maxEntanglementLevel = config.maxEntanglementLevel;
    let superpositionComplexity = config.superpositionComplexity;
    let interferenceThreshold = config.interferenceThreshold;

    // Apply memory constraints
    if (constraints.maxMemoryMB) {
      const tempConfig = new QuantumConfig(quantumBitDepth, maxEntanglementLevel, superpositionComplexity, interferenceThreshold);
      while (!tempConfig.isSuitableForDataSize(characteristics.size, constraints.maxMemoryMB)) {
        if (quantumBitDepth > 4) {
          quantumBitDepth = quantumBitDepth - 1;
          reasoning.push('Reduced quantum bit depth to meet memory constraints');
        } else if (superpositionComplexity > 2) {
          superpositionComplexity = superpositionComplexity - 1;
          reasoning.push('Reduced superposition complexity to meet memory constraints');
        } else {
          break; // Can't reduce further
        }
        
        // Ensure entanglement level is compatible with new bit depth
        const maxMeaningfulEntanglement = Math.floor(quantumBitDepth / 2);
        if (maxEntanglementLevel > maxMeaningfulEntanglement) {
          maxEntanglementLevel = maxMeaningfulEntanglement;
        }
        
        // Ensure superposition complexity doesn't exceed bit depth
        if (superpositionComplexity > quantumBitDepth) {
          superpositionComplexity = quantumBitDepth;
        }
        
        // Update temp config for next iteration
        try {
          tempConfig.quantumBitDepth = quantumBitDepth;
          tempConfig.maxEntanglementLevel = maxEntanglementLevel;
          tempConfig.superpositionComplexity = superpositionComplexity;
        } catch (error) {
          break; // Can't create valid config
        }
      }
    }

    // Apply processing time constraints by prioritizing speed or compression
    if (constraints.prioritizeSpeed) {
      quantumBitDepth = Math.max(4, quantumBitDepth - 1);
      superpositionComplexity = Math.max(2, superpositionComplexity - 1);
      
      // Ensure entanglement level is compatible
      const maxMeaningfulEntanglement = Math.floor(quantumBitDepth / 2);
      if (maxEntanglementLevel > maxMeaningfulEntanglement) {
        maxEntanglementLevel = maxMeaningfulEntanglement;
      }
      
      // Ensure superposition complexity doesn't exceed bit depth
      if (superpositionComplexity > quantumBitDepth) {
        superpositionComplexity = quantumBitDepth;
      }
      
      reasoning.push('Reduced complexity parameters to prioritize processing speed');
    } else if (constraints.prioritizeCompression) {
      quantumBitDepth = Math.min(12, quantumBitDepth + 1);
      
      // Increase entanglement level but keep it compatible
      const maxMeaningfulEntanglement = Math.floor(quantumBitDepth / 2);
      maxEntanglementLevel = Math.min(6, Math.min(maxEntanglementLevel + 1, maxMeaningfulEntanglement));
      
      reasoning.push('Increased complexity parameters to prioritize compression ratio');
    }

    return new QuantumConfig(quantumBitDepth, maxEntanglementLevel, superpositionComplexity, interferenceThreshold, config.profileName);
  }

  /**
   * Estimate compression ratio for given configuration and characteristics
   */
  private estimateCompressionRatio(
    config: QuantumConfig,
    characteristics: DataTypeCharacteristics
  ): number {
    // Base compression ratio estimation
    let baseRatio = 1.2; // 20% compression baseline

    // Quantum bit depth contribution
    const bitDepthFactor = Math.log2(config.quantumBitDepth) / 4;
    baseRatio += bitDepthFactor * 0.3;

    // Entanglement contribution (better for repetitive data)
    const entanglementFactor = config.maxEntanglementLevel / 8;
    baseRatio += entanglementFactor * characteristics.repetitionRate * 0.4;

    // Superposition contribution (better for structured data)
    const superpositionFactor = config.superpositionComplexity / 10;
    baseRatio += superpositionFactor * (1 - characteristics.entropy) * 0.3;

    // Interference threshold contribution
    const interferenceFactor = config.interferenceThreshold;
    baseRatio += interferenceFactor * 0.2;

    // Penalty for high entropy data
    if (characteristics.entropy > 0.8) {
      baseRatio *= 0.8; // 20% penalty for random data
    }

    return Math.max(1.05, Math.min(3.0, baseRatio)); // Clamp between 5% and 200% compression
  }

  /**
   * Estimate processing time multiplier for given configuration and characteristics
   */
  private estimateProcessingTime(
    config: QuantumConfig,
    characteristics: DataTypeCharacteristics
  ): number {
    const baseTime = config.calculateProcessingMultiplier();
    
    // Adjust based on data characteristics
    let adjustedTime = baseTime;

    // High entropy data takes longer to process
    if (characteristics.entropy > 0.7) {
      adjustedTime *= 1.3;
    }

    // Complex structures take longer
    if (characteristics.structuralComplexity > 0.7) {
      adjustedTime *= 1.2;
    }

    // Large files have some overhead
    if (characteristics.size > 1024 * 1024) {
      adjustedTime *= 1.1;
    }

    return adjustedTime;
  }

  /**
   * Calculate confidence in optimization based on data characteristics
   */
  private calculateOptimizationConfidence(
    characteristics: DataTypeCharacteristics,
    config: QuantumConfig
  ): number {
    let confidence = 0.7; // Base confidence

    // Higher confidence for well-understood data patterns
    if (characteristics.entropy < 0.5 && characteristics.repetitionRate > 0.5) {
      confidence += 0.2; // Structured, repetitive data is easier to optimize
    }

    // Lower confidence for random data
    if (characteristics.entropy > 0.8) {
      confidence -= 0.2;
    }

    // Higher confidence if configuration is within optimal ranges
    const ranges = QuantumConfig.getParameterRanges();
    if (ranges.quantumBitDepth.recommended.includes(config.quantumBitDepth)) {
      confidence += 0.05;
    }
    if (ranges.maxEntanglementLevel.recommended.includes(config.maxEntanglementLevel)) {
      confidence += 0.05;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Calculate suitability score for a configuration given data characteristics
   */
  private calculateSuitabilityScore(
    config: QuantumConfig,
    characteristics: DataTypeCharacteristics
  ): number {
    let score = 0.5; // Base score

    // Score based on entropy vs quantum bit depth alignment
    const entropyOptimalBitDepth = 4 + (1 - characteristics.entropy) * 8;
    const bitDepthDiff = Math.abs(config.quantumBitDepth - entropyOptimalBitDepth);
    score += Math.max(0, (8 - bitDepthDiff) / 8) * 0.3;

    // Score based on repetition rate vs entanglement level alignment
    const repetitionOptimalEntanglement = 1 + characteristics.repetitionRate * 5;
    const entanglementDiff = Math.abs(config.maxEntanglementLevel - repetitionOptimalEntanglement);
    score += Math.max(0, (5 - entanglementDiff) / 5) * 0.3;

    // Score based on memory suitability
    if (config.isSuitableForDataSize(characteristics.size)) {
      score += 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate performance score for a profile based on historical data
   */
  private calculatePerformanceScore(profile: ConfigurationProfile): number {
    let score = 0.5; // Base score

    // Score based on compression ratio
    if (profile.averageCompressionRatio !== undefined) {
      score += Math.min(0.3, (profile.averageCompressionRatio - 1) * 0.3);
    }

    // Score based on processing time (lower is better)
    if (profile.averageProcessingTime !== undefined) {
      const timeScore = Math.max(0, 1 - profile.averageProcessingTime / 10);
      score += timeScore * 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }
}