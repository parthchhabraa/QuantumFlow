import { ConfigurationProfileManager, ConfigurationProfile, DataTypeCharacteristics } from '../ConfigurationProfileManager';
import { QuantumConfig } from '../../models/QuantumConfig';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn()
  }
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('ConfigurationProfileManager', () => {
  let manager: ConfigurationProfileManager;
  let testProfilesDir: string;

  beforeEach(() => {
    testProfilesDir = '.test-quantum-profiles';
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock fs.existsSync to return false initially
    mockFs.existsSync.mockReturnValue(false);
    
    // Mock fs.mkdirSync
    mockFs.mkdirSync.mockImplementation(() => undefined);
    
    // Mock fs.readdirSync to return empty array initially
    mockFs.readdirSync.mockReturnValue([]);
    
    // Mock fs.promises methods
    (mockFs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);
    (mockFs.promises.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));
    (mockFs.promises.unlink as jest.Mock).mockResolvedValue(undefined);
    
    manager = new ConfigurationProfileManager(testProfilesDir);
  });

  describe('Profile Management', () => {
    test('should create and save a profile', async () => {
      const config = QuantumConfig.forTextCompression();
      const profile = manager.createProfile(
        'test-profile',
        'Test profile for unit testing',
        config,
        'text'
      );

      expect(profile.name).toBe('test-profile');
      expect(profile.description).toBe('Test profile for unit testing');
      expect(profile.dataType).toBe('text');
      expect(profile.usageCount).toBe(0);
      expect(profile.createdAt).toBeInstanceOf(Date);

      await manager.saveProfile(profile);

      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        path.join(testProfilesDir, 'test-profile.json'),
        expect.stringContaining('"name": "test-profile"')
      );
    });

    test('should load a profile from memory', async () => {
      const config = QuantumConfig.forBinaryCompression();
      const profile = manager.createProfile('memory-profile', 'In memory profile', config, 'binary');
      
      await manager.saveProfile(profile);
      
      const loadedProfile = await manager.loadProfile('memory-profile');
      
      expect(loadedProfile).not.toBeNull();
      expect(loadedProfile!.name).toBe('memory-profile');
      expect(loadedProfile!.dataType).toBe('binary');
    });

    test('should load a profile from disk', async () => {
      const profileData = {
        name: 'disk-profile',
        description: 'Profile from disk',
        config: {
          quantumBitDepth: 8,
          maxEntanglementLevel: 4,
          superpositionComplexity: 5,
          interferenceThreshold: 0.5
        },
        dataType: 'image',
        createdAt: new Date().toISOString(),
        usageCount: 5,
        averageCompressionRatio: 1.3
      };

      (mockFs.promises.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(profileData));

      const loadedProfile = await manager.loadProfile('disk-profile');
      
      expect(loadedProfile).not.toBeNull();
      expect(loadedProfile!.name).toBe('disk-profile');
      expect(loadedProfile!.dataType).toBe('image');
      expect(loadedProfile!.usageCount).toBe(5);
      expect(loadedProfile!.averageCompressionRatio).toBe(1.3);
    });

    test('should return null for non-existent profile', async () => {
      const loadedProfile = await manager.loadProfile('non-existent');
      
      expect(loadedProfile).toBeNull();
    });

    test('should delete a profile', async () => {
      const config = QuantumConfig.forTextCompression();
      const profile = manager.createProfile('delete-me', 'Profile to delete', config, 'text');
      
      await manager.saveProfile(profile);
      
      const deleted = await manager.deleteProfile('delete-me');
      
      expect(deleted).toBe(true);
      expect(mockFs.promises.unlink).toHaveBeenCalledWith(
        path.join(testProfilesDir, 'delete-me.json')
      );
    });

    test('should list profiles sorted by last used', async () => {
      const config1 = QuantumConfig.forTextCompression();
      const config2 = QuantumConfig.forBinaryCompression();
      
      const profile1 = manager.createProfile('profile1', 'First profile', config1, 'text');
      const profile2 = manager.createProfile('profile2', 'Second profile', config2, 'binary');
      
      // Set different last used times before saving
      profile1.lastUsed = new Date('2023-01-01');
      profile2.lastUsed = new Date('2023-01-02');
      
      await manager.saveProfile(profile1);
      
      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await manager.saveProfile(profile2);
      
      const profiles = manager.listProfiles();
      
      expect(profiles).toHaveLength(2);
      // The most recently saved profile should be first
      expect(profiles[0].name).toBe('profile2');
      expect(profiles[1].name).toBe('profile1');
    });

    test('should filter profiles by data type', async () => {
      const textConfig = QuantumConfig.forTextCompression();
      const binaryConfig = QuantumConfig.forBinaryCompression();
      
      const textProfile = manager.createProfile('text-profile', 'Text profile', textConfig, 'text');
      const binaryProfile = manager.createProfile('binary-profile', 'Binary profile', binaryConfig, 'binary');

      await manager.saveProfile(textProfile);
      await manager.saveProfile(binaryProfile);
      
      const textProfiles = manager.getProfilesByDataType('text');
      const binaryProfiles = manager.getProfilesByDataType('binary');
      
      expect(textProfiles).toHaveLength(1);
      expect(textProfiles[0].name).toBe('text-profile');
      expect(binaryProfiles).toHaveLength(1);
      expect(binaryProfiles[0].name).toBe('binary-profile');
    });

    test('should update profile usage statistics', async () => {
      const config = QuantumConfig.forTextCompression();
      const profile = manager.createProfile('usage-profile', 'Usage test profile', config, 'text');

      await manager.saveProfile(profile);
      
      await manager.updateProfileUsage('usage-profile', 1.5, 2.0);
      
      const updatedProfile = await manager.loadProfile('usage-profile');
      
      expect(updatedProfile!.usageCount).toBe(1);
      expect(updatedProfile!.averageCompressionRatio).toBe(1.5);
      expect(updatedProfile!.averageProcessingTime).toBe(2.0);
      expect(updatedProfile!.lastUsed).toBeInstanceOf(Date);
    });

    test('should calculate running averages correctly', async () => {
      const config = QuantumConfig.forTextCompression();
      const profile = manager.createProfile('avg-profile', 'Average test profile', config, 'text');

      await manager.saveProfile(profile);
      
      // First usage
      await manager.updateProfileUsage('avg-profile', 1.5, 2.0);
      let updatedProfile = await manager.loadProfile('avg-profile');
      expect(updatedProfile!.averageCompressionRatio).toBe(1.5);
      expect(updatedProfile!.averageProcessingTime).toBe(2.0);
      
      // Second usage
      await manager.updateProfileUsage('avg-profile', 2.0, 3.0);
      updatedProfile = await manager.loadProfile('avg-profile');
      expect(updatedProfile!.averageCompressionRatio).toBe(1.75); // (1.5 + 2.0) / 2
      expect(updatedProfile!.averageProcessingTime).toBe(2.5); // (2.0 + 3.0) / 2
    });
  });

  describe('Profile Validation', () => {
    test('should reject profile with empty name', async () => {
      const config = QuantumConfig.forTextCompression();
      const profile = manager.createProfile('', 'Empty name profile', config, 'text');

      await expect(manager.saveProfile(profile)).rejects.toThrow('Profile name is required');
    });

    test('should reject profile with invalid name characters', async () => {
      const config = QuantumConfig.forTextCompression();
      const profile = manager.createProfile('invalid@name!', 'Invalid name profile', config, 'text');

      await expect(manager.saveProfile(profile)).rejects.toThrow('Profile name can only contain letters, numbers, underscores, and hyphens');
    });

    test('should reject profile with invalid data type', async () => {
      const config = QuantumConfig.forTextCompression();
      const profile = manager.createProfile('valid-name', 'Valid profile', config, 'invalid' as any);

      await expect(manager.saveProfile(profile)).rejects.toThrow('Invalid data type');
    });

    test('should reject profile with invalid configuration', async () => {
      const profile: ConfigurationProfile = {
        name: 'invalid-config',
        description: 'Profile with invalid config',
        config: {
          quantumBitDepth: 20, // Invalid - too high
          maxEntanglementLevel: 4,
          superpositionComplexity: 5,
          interferenceThreshold: 0.5
        },
        dataType: 'text',
        createdAt: new Date(),
        usageCount: 0
      };

      await expect(manager.saveProfile(profile)).rejects.toThrow('Invalid configuration');
    });
  });

  describe('Parameter Optimization', () => {
    test('should optimize parameters for high entropy data', () => {
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.9,
        repetitionRate: 0.2,
        structuralComplexity: 0.3,
        size: 1024
      };

      const result = manager.optimizeParameters(characteristics, 'binary');

      expect(result.optimizedConfig.quantumBitDepth).toBeLessThan(8); // Should reduce for high entropy
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.reasoning.some(r => r.includes('high entropy'))).toBe(true);
      expect(result.expectedCompressionRatio).toBeGreaterThan(1);
      expect(result.expectedProcessingTime).toBeGreaterThan(0);
    });

    test('should optimize parameters for low entropy, high repetition data', () => {
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.2,
        repetitionRate: 0.8,
        structuralComplexity: 0.4,
        size: 1024
      };

      const result = manager.optimizeParameters(characteristics, 'text');

      expect(result.optimizedConfig.quantumBitDepth).toBeGreaterThan(6); // Should increase for low entropy
      expect(result.optimizedConfig.maxEntanglementLevel).toBeGreaterThan(3); // Should increase for high repetition
      expect(result.reasoning.some(r => r.includes('low entropy'))).toBe(true);
      expect(result.reasoning.some(r => r.includes('high repetition'))).toBe(true);
    });

    test('should optimize parameters for complex structured data', () => {
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.5,
        repetitionRate: 0.5,
        structuralComplexity: 0.9,
        size: 1024
      };

      const result = manager.optimizeParameters(characteristics, 'image');

      expect(result.optimizedConfig.superpositionComplexity).toBeGreaterThan(5); // Should increase for complex structure
      expect(result.reasoning.some(r => r.includes('structural complexity'))).toBe(true);
    });

    test('should apply memory constraints', () => {
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.3,
        repetitionRate: 0.7,
        structuralComplexity: 0.8,
        size: 1024 * 1024 * 100 // 100MB - large enough to trigger memory constraints
      };

      const constraints = {
        maxMemoryMB: 32, // Small memory limit to force constraint application
        prioritizeSpeed: false,
        prioritizeCompression: false
      };

      const result = manager.optimizeParameters(characteristics, 'binary', constraints);

      expect(result.optimizedConfig.isSuitableForDataSize(characteristics.size, constraints.maxMemoryMB)).toBe(true);
      expect(result.reasoning.some(r => r.includes('memory constraints'))).toBe(true);
    });

    test('should prioritize speed when requested', () => {
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.5,
        repetitionRate: 0.5,
        structuralComplexity: 0.5,
        size: 1024
      };

      const constraints = {
        prioritizeSpeed: true
      };

      const result = manager.optimizeParameters(characteristics, 'mixed', constraints);
      const baseResult = manager.optimizeParameters(characteristics, 'mixed');

      expect(result.optimizedConfig.quantumBitDepth).toBeLessThanOrEqual(baseResult.optimizedConfig.quantumBitDepth);
      expect(result.optimizedConfig.superpositionComplexity).toBeLessThanOrEqual(baseResult.optimizedConfig.superpositionComplexity);
      expect(result.reasoning.some(r => r.includes('prioritize processing speed'))).toBe(true);
    });

    test('should prioritize compression when requested', () => {
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.5,
        repetitionRate: 0.5,
        structuralComplexity: 0.5,
        size: 1024
      };

      const constraints = {
        prioritizeCompression: true
      };

      const result = manager.optimizeParameters(characteristics, 'mixed', constraints);
      const baseResult = manager.optimizeParameters(characteristics, 'mixed');

      expect(result.optimizedConfig.quantumBitDepth).toBeGreaterThanOrEqual(baseResult.optimizedConfig.quantumBitDepth);
      expect(result.optimizedConfig.maxEntanglementLevel).toBeGreaterThanOrEqual(baseResult.optimizedConfig.maxEntanglementLevel);
      expect(result.reasoning.some(r => r.includes('prioritize compression ratio'))).toBe(true);
    });

    test('should maintain parameter compatibility during optimization', () => {
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.1, // Very low entropy
        repetitionRate: 0.9, // Very high repetition
        structuralComplexity: 0.9, // Very complex
        size: 1024
      };

      const result = manager.optimizeParameters(characteristics, 'text');

      // Verify the optimized configuration is valid
      expect(() => result.optimizedConfig.validateParameters()).not.toThrow();
      
      // Verify entanglement level doesn't exceed half the bit depth
      expect(result.optimizedConfig.maxEntanglementLevel).toBeLessThanOrEqual(
        Math.floor(result.optimizedConfig.quantumBitDepth / 2)
      );
      
      // Verify superposition complexity doesn't exceed bit depth
      expect(result.optimizedConfig.superpositionComplexity).toBeLessThanOrEqual(
        result.optimizedConfig.quantumBitDepth
      );
    });
  });

  describe('Profile Finding and Suggestions', () => {
    test('should find best profile for given characteristics', async () => {
      // Create test profiles with different performance characteristics
      const config1 = QuantumConfig.forTextCompression();
      const config2 = QuantumConfig.forBinaryCompression();
      
      const profile1 = manager.createProfile('profile1', 'First profile', config1, 'text');
      profile1.usageCount = 10;
      profile1.averageCompressionRatio = 1.8;
      profile1.averageProcessingTime = 2.0;
      
      const profile2 = manager.createProfile('profile2', 'Second profile', config2, 'text');
      profile2.usageCount = 5;
      profile2.averageCompressionRatio = 1.5;
      profile2.averageProcessingTime = 1.5;

      await manager.saveProfile(profile1);
      await manager.saveProfile(profile2);

      const characteristics: DataTypeCharacteristics = {
        entropy: 0.3,
        repetitionRate: 0.7,
        structuralComplexity: 0.4,
        size: 1024
      };

      const bestProfile = manager.findBestProfile(characteristics, 'text');

      expect(bestProfile).not.toBeNull();
      expect(bestProfile!.name).toBe('profile1'); // Should prefer higher compression ratio and usage
    });

    test('should return null when no profiles exist for data type', () => {
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.5,
        repetitionRate: 0.5,
        structuralComplexity: 0.5,
        size: 1024
      };

      const bestProfile = manager.findBestProfile(characteristics, 'image');

      expect(bestProfile).toBeNull();
    });

    test('should provide optimization suggestions', () => {
      const config = new QuantumConfig(12, 6, 8, 0.8); // High complexity config
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.9, // High entropy data
        repetitionRate: 0.1, // Low repetition
        structuralComplexity: 0.2, // Simple structure
        size: 1024
      };

      const suggestions = manager.getOptimizationSuggestions(config, characteristics);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('entropy'))).toBe(true);
    });

    test('should suggest reducing parameters for high entropy data', () => {
      const config = new QuantumConfig(12, 6, 8, 0.8);
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.9,
        repetitionRate: 0.2,
        structuralComplexity: 0.3,
        size: 1024
      };

      const suggestions = manager.getOptimizationSuggestions(config, characteristics);

      expect(suggestions.some(s => s.includes('reducing') || s.includes('reduce'))).toBe(true);
    });

    test('should suggest increasing parameters for structured data', () => {
      const config = new QuantumConfig(4, 2, 3, 0.3); // Low complexity config
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.2, // Low entropy
        repetitionRate: 0.8, // High repetition
        structuralComplexity: 0.9, // Complex structure
        size: 1024
      };

      const suggestions = manager.getOptimizationSuggestions(config, characteristics);

      expect(suggestions.some(s => s.includes('increasing') || s.includes('increase'))).toBe(true);
    });

    test('should warn about memory usage for large data', () => {
      const config = new QuantumConfig(12, 6, 8, 0.8); // High but valid complexity
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.5,
        repetitionRate: 0.5,
        structuralComplexity: 0.5,
        size: 1024 * 1024 * 1000 // 1GB - large enough to trigger memory warning
      };

      const suggestions = manager.getOptimizationSuggestions(config, characteristics);

      expect(suggestions.some(s => s.includes('memory'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle file system errors gracefully during profile loading', async () => {
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      // Should not throw when directory can't be read
      expect(() => new ConfigurationProfileManager('.test-profiles')).not.toThrow();
    });

    test('should handle corrupted profile files gracefully', () => {
      mockFs.readdirSync.mockReturnValue(['corrupted.json'] as any);
      mockFs.readFileSync.mockReturnValue('invalid json content');

      // Should not throw when profile file is corrupted
      expect(() => new ConfigurationProfileManager('.test-profiles')).not.toThrow();
    });

    test('should throw error when updating non-existent profile usage', async () => {
      await expect(manager.updateProfileUsage('non-existent', 1.5, 2.0))
        .rejects.toThrow("Profile 'non-existent' not found");
    });
  });

  describe('Performance Estimation', () => {
    test('should estimate reasonable compression ratios', () => {
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.3,
        repetitionRate: 0.7,
        structuralComplexity: 0.5,
        size: 1024
      };

      const result = manager.optimizeParameters(characteristics, 'text');

      expect(result.expectedCompressionRatio).toBeGreaterThanOrEqual(1.05);
      expect(result.expectedCompressionRatio).toBeLessThanOrEqual(3.0);
    });

    test('should estimate higher compression for structured, repetitive data', () => {
      const structuredCharacteristics: DataTypeCharacteristics = {
        entropy: 0.2,
        repetitionRate: 0.8,
        structuralComplexity: 0.6,
        size: 1024
      };

      const randomCharacteristics: DataTypeCharacteristics = {
        entropy: 0.9,
        repetitionRate: 0.1,
        structuralComplexity: 0.2,
        size: 1024
      };

      const structuredResult = manager.optimizeParameters(structuredCharacteristics, 'text');
      const randomResult = manager.optimizeParameters(randomCharacteristics, 'text');

      expect(structuredResult.expectedCompressionRatio).toBeGreaterThan(randomResult.expectedCompressionRatio);
    });

    test('should estimate processing time based on configuration complexity', () => {
      const characteristics: DataTypeCharacteristics = {
        entropy: 0.5,
        repetitionRate: 0.5,
        structuralComplexity: 0.5,
        size: 1024
      };

      const simpleResult = manager.optimizeParameters(characteristics, 'text', { prioritizeSpeed: true });
      const complexResult = manager.optimizeParameters(characteristics, 'text', { prioritizeCompression: true });

      expect(simpleResult.expectedProcessingTime).toBeLessThan(complexResult.expectedProcessingTime);
    });
  });
});