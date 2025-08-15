/**
 * Integration tests for comprehensive error handling and user feedback
 * Tests the new ErrorHandler, ProgressIndicator, and ConfigurationValidator systems
 */

import { ErrorHandler, ErrorCategory, ErrorSeverity } from '../core/ErrorHandler';
import { ProgressIndicator } from '../core/ProgressIndicator';
import { ConfigurationValidator } from '../core/ConfigurationValidator';
import { QuantumConfig } from '../models/QuantumConfig';
import * as fs from 'fs';
import * as path from 'path';

describe('Error Handling and User Feedback Integration', () => {
  beforeEach(() => {
    // Clear error history before each test
    ErrorHandler.clearErrorHistory();
  });

  describe('ErrorHandler', () => {
    it('should create detailed file system errors with recovery suggestions', () => {
      const error = new Error('ENOENT: no such file or directory');
      const detailedError = ErrorHandler.handleFileSystemError(
        'compress',
        'nonexistent-file.txt',
        error
      );

      expect(detailedError.code).toBe('FILE_NOT_FOUND');
      expect(detailedError.category).toBe(ErrorCategory.FILE_SYSTEM);
      expect(detailedError.severity).toBe(ErrorSeverity.HIGH);
      expect(detailedError.userFriendlyMessage).toContain('nonexistent-file.txt');
      expect(detailedError.recoverySuggestions).toHaveLength(3);
      expect(detailedError.recoverySuggestions[0].action).toBe('Check file path');
    });

    it('should create detailed compression errors with quantum-specific guidance', () => {
      const error = new Error('Quantum state memory allocation failed');
      const config = { quantumBitDepth: 16, maxEntanglementLevel: 8 };
      
      const detailedError = ErrorHandler.handleCompressionError(
        'large-file.bin',
        100 * 1024 * 1024, // 100MB
        config,
        error
      );

      expect(detailedError.code).toBe('COMPRESSION_MEMORY_ERROR');
      expect(detailedError.category).toBe(ErrorCategory.COMPRESSION);
      expect(detailedError.recoverySuggestions[0].action).toBe('Reduce quantum bit depth');
      expect(detailedError.recoverySuggestions[0].description).toContain('16');
    });

    it('should format errors for display with user-friendly messages', () => {
      const error = ErrorHandler.createDetailedError(
        'TEST_ERROR',
        'Test error message',
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        { fileName: 'test.txt' }
      );

      const formatted = ErrorHandler.formatError(error, true);
      
      expect(formatted).toContain('❌');
      expect(formatted).toContain('🔧 Suggested Solutions:');
      expect(formatted).toContain('Error Code: TEST_ERROR');
      expect(formatted).toContain('File: test.txt');
    });

    it('should format errors for API responses', () => {
      const error = ErrorHandler.createDetailedError(
        'API_TEST_ERROR',
        'API test error',
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH,
        { operation: 'test' }
      );

      const apiResponse = ErrorHandler.formatErrorForAPI(error);
      
      expect(apiResponse.error.code).toBe('API_TEST_ERROR');
      expect(apiResponse.error.category).toBe(ErrorCategory.NETWORK);
      expect(apiResponse.error.recoverySuggestions).toBeDefined();
      expect(apiResponse.error.timestamp).toBeDefined();
    });

    it('should track error history', () => {
      const error1 = ErrorHandler.createDetailedError('ERROR_1', 'First error', ErrorCategory.VALIDATION, ErrorSeverity.LOW);
      const error2 = ErrorHandler.createDetailedError('ERROR_2', 'Second error', ErrorCategory.COMPRESSION, ErrorSeverity.HIGH);

      const history = ErrorHandler.getErrorHistory();
      expect(history).toHaveLength(2);
      expect(history[0].code).toBe('ERROR_1');
      expect(history[1].code).toBe('ERROR_2');
    });
  });

  describe('ProgressIndicator', () => {
    it('should track progress through compression steps', async () => {
      const progressIndicator = new ProgressIndicator({
        showProgressBar: false,
        logLevel: 'minimal'
      });

      const progressUpdates: any[] = [];
      progressIndicator.onProgress((state) => {
        progressUpdates.push({ ...state });
      });

      progressIndicator.defineSteps(ProgressIndicator.createCompressionSteps());
      progressIndicator.start('Test Compression', 1024);

      // Simulate progress through steps
      progressIndicator.setCurrentStep('initialization', 'Starting compression');
      progressIndicator.updateStepProgress(1.0);

      progressIndicator.setCurrentStep('quantum_state_preparation', 'Converting data');
      progressIndicator.updateStepProgress(0.5);
      progressIndicator.updateStepProgress(1.0);

      progressIndicator.complete('Compression completed');

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].currentStep).toBe('initialization');
      expect(progressUpdates[progressUpdates.length - 1].overallProgress).toBe(1);
    });

    it('should handle errors and warnings during progress', () => {
      const progressIndicator = new ProgressIndicator({
        showProgressBar: false,
        logLevel: 'minimal'
      });

      progressIndicator.defineSteps(ProgressIndicator.createCompressionSteps());
      progressIndicator.start('Test Operation');

      progressIndicator.addWarning('Test warning message');
      progressIndicator.addError('Test error message');

      const state = progressIndicator.getState();
      expect(state.warnings).toContain('Test warning message');
      expect(state.errors).toContain('Test error message');
    });

    it('should calculate time estimates correctly', (done) => {
      const progressIndicator = new ProgressIndicator({
        showProgressBar: false,
        logLevel: 'minimal',
        updateInterval: 50
      });

      progressIndicator.defineSteps([
        { id: 'step1', name: 'Step 1', description: 'First step', weight: 0.5 },
        { id: 'step2', name: 'Step 2', description: 'Second step', weight: 0.5 }
      ]);

      progressIndicator.start('Test Operation');
      progressIndicator.setCurrentStep('step1');
      progressIndicator.updateStepProgress(0.5);

      setTimeout(() => {
        const state = progressIndicator.getState();
        expect(state.elapsedTime).toBeGreaterThan(0);
        expect(state.estimatedTimeRemaining).toBeGreaterThan(0);
        progressIndicator.complete();
        done();
      }, 100);
    });

    it('should abort operations gracefully', () => {
      const progressIndicator = new ProgressIndicator({
        showProgressBar: false,
        logLevel: 'minimal'
      });

      progressIndicator.defineSteps(ProgressIndicator.createCompressionSteps());
      progressIndicator.start('Test Operation');
      progressIndicator.setCurrentStep('initialization');
      
      expect(progressIndicator.isTracking()).toBe(true);
      
      progressIndicator.abort('User cancelled operation');
      
      expect(progressIndicator.isTracking()).toBe(false);
    });
  });

  describe('ConfigurationValidator', () => {
    it('should validate quantum configuration parameters', () => {
      const validConfig = {
        quantumBitDepth: 8,
        maxEntanglementLevel: 4,
        superpositionComplexity: 5,
        interferenceThreshold: 0.5
      };

      const result = ConfigurationValidator.validateConfiguration(validConfig);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid parameter values', () => {
      const invalidConfig = {
        quantumBitDepth: 20, // Too high
        maxEntanglementLevel: 0, // Too low
        superpositionComplexity: -1, // Invalid
        interferenceThreshold: 1.5 // Out of range
      };

      const result = ConfigurationValidator.validateConfiguration(invalidConfig);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.optimizedConfig).toBeDefined();
    });

    it('should provide parameter relationship warnings', () => {
      const config = {
        quantumBitDepth: 4,
        maxEntanglementLevel: 6, // Too high for bit depth
        superpositionComplexity: 8, // Too high for bit depth
        interferenceThreshold: 0.5
      };

      const result = ConfigurationValidator.validateConfiguration(config);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.parameter === 'maxEntanglementLevel')).toBe(true);
      expect(result.warnings.some(w => w.parameter === 'superpositionComplexity')).toBe(true);
    });

    it('should optimize configuration for data characteristics', () => {
      const config = {
        quantumBitDepth: 12,
        maxEntanglementLevel: 6,
        superpositionComplexity: 8,
        interferenceThreshold: 0.3
      };

      const dataCharacteristics = {
        size: 200 * 1024 * 1024, // 200MB - large file
        entropy: 0.9, // High entropy (random data)
        repetitionRate: 0.1, // Low repetition
        dataType: 'binary' as const
      };

      const result = ConfigurationValidator.validateConfiguration(
        config,
        dataCharacteristics
      );

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.type === 'optimization')).toBe(true);
      expect(result.suggestions.some(s => s.type === 'memory')).toBe(true);
    });

    it('should format validation results for display', () => {
      const config = {
        quantumBitDepth: 20, // Invalid
        maxEntanglementLevel: 4,
        superpositionComplexity: 5,
        interferenceThreshold: 0.5
      };

      const result = ConfigurationValidator.validateConfiguration(config);
      const formatted = ConfigurationValidator.formatValidationResult(result, true);

      expect(formatted).toContain('❌ Configuration has issues');
      expect(formatted).toContain('🚫 Errors:');
      expect(formatted).toContain('💡 Suggestions:');
      expect(formatted).toContain('quantumBitDepth');
    });

    it('should provide configuration presets', () => {
      const presets = ConfigurationValidator.getConfigurationPresets();
      
      expect(presets['speed-optimized']).toBeDefined();
      expect(presets['compression-optimized']).toBeDefined();
      expect(presets['balanced']).toBeDefined();
      expect(presets['memory-efficient']).toBeDefined();
      expect(presets['high-quality']).toBeDefined();

      // Validate that presets are actually valid
      Object.values(presets).forEach(preset => {
        const result = ConfigurationValidator.validateConfiguration(preset);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle configuration errors with detailed feedback', () => {
      const invalidConfig = {
        quantumBitDepth: 25,
        maxEntanglementLevel: 10,
        superpositionComplexity: 15,
        interferenceThreshold: 2.0
      };

      const validationResult = ConfigurationValidator.validateConfiguration(invalidConfig);
      
      // Should have errors for all invalid parameters
      expect(validationResult.errors.length).toBe(4);
      
      // Should provide an optimized configuration
      expect(validationResult.optimizedConfig).toBeDefined();
      
      // Optimized config should be valid
      const optimizedValidation = ConfigurationValidator.validateConfiguration(
        validationResult.optimizedConfig!.toObject()
      );
      expect(optimizedValidation.isValid).toBe(true);
    });

    it('should provide contextual error messages for different scenarios', () => {
      // File not found scenario
      const fileError = ErrorHandler.handleFileSystemError(
        'compress',
        'missing-file.txt',
        new Error('ENOENT: no such file or directory')
      );
      expect(fileError.userFriendlyMessage).toContain('missing-file.txt');
      expect(fileError.recoverySuggestions[0].action).toBe('Check file path');

      // Memory error scenario
      const memoryError = ErrorHandler.handleCompressionError(
        'large-file.bin',
        500 * 1024 * 1024,
        { quantumBitDepth: 16 },
        new Error('Cannot allocate memory for quantum states')
      );
      expect(memoryError.recoverySuggestions[0].action).toBe('Reduce quantum bit depth');

      // Network timeout scenario
      const networkError = ErrorHandler.handleNetworkError(
        'upload',
        '/api/compress',
        new Error('Request timeout')
      );
      expect(networkError.recoverySuggestions[0].action).toBe('Check internet connection');
    });

    it('should track progress with error recovery', async () => {
      const progressIndicator = new ProgressIndicator({
        showProgressBar: false,
        logLevel: 'minimal'
      });

      const progressStates: any[] = [];
      progressIndicator.onProgress((state) => {
        progressStates.push({ ...state });
      });

      progressIndicator.defineSteps(ProgressIndicator.createCompressionSteps());
      progressIndicator.start('Test Operation with Errors');

      // Simulate normal progress
      progressIndicator.setCurrentStep('initialization');
      progressIndicator.updateStepProgress(1.0);

      // Simulate warning
      progressIndicator.addWarning('Configuration not optimal for this data type');

      // Simulate error and recovery
      progressIndicator.addError('Temporary quantum state allocation failure');
      progressIndicator.setCurrentStep('quantum_state_preparation', 'Retrying with reduced parameters');
      progressIndicator.updateStepProgress(1.0);

      // Complete successfully
      progressIndicator.complete('Operation completed with warnings');

      expect(progressStates.length).toBeGreaterThan(0);
      expect(progressStates[progressStates.length - 1].warnings).toContain('Configuration not optimal for this data type');
      expect(progressStates[progressStates.length - 1].errors).toContain('Temporary quantum state allocation failure');
    });
  });
});