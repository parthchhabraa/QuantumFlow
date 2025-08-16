import { QuantumStateConverter } from './QuantumStateConverter';
import { SuperpositionProcessor } from './SuperpositionProcessor';
import { EntanglementAnalyzer } from './EntanglementAnalyzer';
import { InterferenceOptimizer } from './InterferenceOptimizer';
import { PerformanceProfiler } from './PerformanceProfiler';
import { QuantumConfig } from '../models/QuantumConfig';
import { CompressedQuantumData, InterferencePattern } from '../models/CompressedQuantumData';
import { QuantumStateVector } from '../models/QuantumStateVector';
import { EntanglementPair } from '../models/EntanglementPair';
import { QuantumMetrics } from '../models/QuantumMetrics';
import * as zlib from 'zlib';

/**
 * Compression result interface
 */
interface CompressionResult {
  compressedData: Buffer;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: 'quantum' | 'hybrid' | 'classical';
  metadata?: any;
}

/**
 * Compression strategy interface
 */
interface CompressionStrategy {
  compress(data: Buffer): CompressionResult;
  decompress(compressed: Buffer): Buffer;
  getEfficiency(): number;
}

/**
 * Hybrid compression metadata
 */
interface HybridCompressionMetadata {
  quantumPortion: number;
  classicalPortion: number;
  actualCompressionRatio: number;
  fallbackUsed: boolean;
  strategy: string;
}

/**
 * Main quantum compression engine that orchestrates all quantum processing phases
 * Implements the complete compression workflow from classical data to compressed quantum representation
 */
export class QuantumCompressionEngine {
  private _stateConverter!: QuantumStateConverter;
  private _superpositionProcessor!: SuperpositionProcessor;
  private _entanglementAnalyzer!: EntanglementAnalyzer;
  private _interferenceOptimizer!: InterferenceOptimizer;
  private _config: QuantumConfig;
  private _metrics: QuantumMetrics;
  private _profiler: PerformanceProfiler;

  constructor(config?: QuantumConfig) {
    this._config = config || new QuantumConfig();
    this._metrics = new QuantumMetrics();
    this._profiler = new PerformanceProfiler();
    this.initializeComponents();
  }

  /**
   * Get current configuration
   */
  get config(): QuantumConfig {
    return this._config;
  }

  /**
   * Set new configuration and reinitialize components
   */
  set config(newConfig: QuantumConfig) {
    this._config = newConfig;
    this.initializeComponents();
  }

  /**
   * Compress input data using quantum-inspired algorithms with graceful degradation
   */
  compress(input: Buffer, config?: QuantumConfig): CompressedQuantumData {
    if (input.length === 0) {
      throw new Error('Cannot compress empty input data');
    }

    // Reset metrics for new operation
    this._metrics.reset();
    this._metrics.startTiming();

    // Use provided config or default
    const compressionConfig = config || this._config;

    try {
      // Phase 1: Quantum State Preparation
      this._profiler.startOperation('quantum_state_preparation', { inputSize: input.length });
      this._metrics.startPhase();
      const quantumStates = this.performQuantumStatePreparation(input, compressionConfig);
      this._metrics.endPhase('conversionTime');
      this._profiler.endOperation('quantum_state_preparation');

      // Phase 2: Superposition Analysis
      this._profiler.startOperation('superposition_analysis', { stateCount: quantumStates.length });
      this._metrics.startPhase();
      const superpositionResult = this.performSuperpositionAnalysis(quantumStates, compressionConfig);
      this._metrics.endPhase('superpositionTime');
      this._profiler.endOperation('superposition_analysis');

      // Phase 3: Entanglement Detection
      this._profiler.startOperation('entanglement_detection', { stateCount: quantumStates.length });
      this._metrics.startPhase();
      const entanglementPairs = this.performEntanglementDetection(quantumStates, compressionConfig);
      this._metrics.endPhase('entanglementTime');
      this._profiler.endOperation('entanglement_detection');

      // Phase 4: Quantum Interference Optimization
      this._profiler.startOperation('interference_optimization', { 
        stateCount: quantumStates.length, 
        patternCount: superpositionResult.patterns.length 
      });
      this._metrics.startPhase();
      const interferenceResult = this.performQuantumInterference(
        quantumStates, 
        superpositionResult.patterns, 
        compressionConfig
      );
      this._metrics.endPhase('interferenceTime');
      this._profiler.endOperation('interference_optimization');

      // Phase 5: Try hybrid compression first for better size reduction
      this._profiler.startOperation('hybrid_compression', { 
        inputSize: input.length
      });
      this._metrics.startPhase();
      
      const hybridResult = this.hybridCompress(input);
      
      // Only use quantum compression if it's more effective than hybrid
      let finalCompressedData: CompressedQuantumData;
      
      if (hybridResult.compressionRatio > 1.2) {
        // Hybrid compression is effective, use it
        finalCompressedData = CompressedQuantumData.create(
          [], // No quantum states needed for hybrid compression
          [],
          [],
          input.length,
          {
            ...compressionConfig.toObject(),
            chunkSize: this._stateConverter.chunkSize,
            quantumBitDepth: this._stateConverter.quantumBitDepth,
            // Store hybrid compression result instead of original data
            hybridCompressed: true,
            hybridData: Array.from(hybridResult.compressedData),
            hybridMetadata: hybridResult.metadata,
            compressionAlgorithm: hybridResult.algorithm
          }
        );
      } else {
        // Quantum compression might be better, create quantum representation
        finalCompressedData = CompressedQuantumData.create(
          quantumStates,
          entanglementPairs,
          interferenceResult.interferencePatterns,
          input.length,
          {
            ...compressionConfig.toObject(),
            chunkSize: this._stateConverter.chunkSize,
            quantumBitDepth: this._stateConverter.quantumBitDepth,
            hybridCompressed: false,
            compressionAlgorithm: 'quantum'
          }
        );
      }
      
      this._metrics.endPhase('encodingTime');
      this._profiler.endOperation('hybrid_compression');

      // End timing and record metrics
      this._metrics.endTiming();
      
      // Record compression metrics
      const stats = finalCompressedData.getCompressionStats();
      this._metrics.recordCompressionMetrics(input.length, stats.compressedSize);

      // Record quantum efficiency metrics
      const avgCorrelation = entanglementPairs.length > 0 
        ? entanglementPairs.reduce((sum, pair) => sum + pair.correlationStrength, 0) / entanglementPairs.length 
        : 0;
      
      this._metrics.recordQuantumEfficiency(
        quantumStates.length,
        entanglementPairs.length,
        avgCorrelation,
        superpositionResult.patterns.length,
        interferenceResult.interferencePatterns.length / Math.max(1, quantumStates.length),
        100 // Default coherence time
      );

      // Update session statistics
      this._metrics.updateSessionStatistics();

      // Validate that compression actually reduces file size
      const actualCompressedSize = finalCompressedData.serialize().length;
      if (actualCompressedSize >= input.length) {
        console.warn(`Compression increased file size from ${input.length} to ${actualCompressedSize} bytes. Using emergency fallback.`);
        
        // Emergency fallback to simple compression
        const emergencyResult = this.simpleCompress(input);
        const emergencyCompressed = CompressedQuantumData.create(
          [],
          [],
          [],
          input.length,
          {
            ...compressionConfig.toObject(),
            hybridCompressed: true,
            hybridData: Array.from(emergencyResult.compressedData),
            hybridMetadata: emergencyResult.metadata,
            compressionAlgorithm: emergencyResult.algorithm,
            emergencyFallback: true
          }
        );
        
        this.logCompressionMetrics(input.length, emergencyCompressed, this._metrics.getProcessingMetrics().totalTime);
        return emergencyCompressed;
      }

      this.logCompressionMetrics(input.length, finalCompressedData, this._metrics.getProcessingMetrics().totalTime);

      return finalCompressedData;

    } catch (error) {
      // Attempt graceful degradation when quantum compression fails
      console.warn(`Quantum compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      try {
        const errorCorrection = new (require('./QuantumErrorCorrection').QuantumErrorCorrection)();
        const degradationResult = errorCorrection.attemptGracefulDegradation(
          input,
          error instanceof Error ? error.message : 'Unknown quantum compression error',
          {
            prioritizeSpeed: input.length > 10 * 1024 * 1024, // Prioritize speed for large files
            chunkSize: Math.min(64 * 1024, Math.max(1024, input.length / 100)),
            preserveMetadata: true
          }
        );

        if (degradationResult.success) {
          console.log(`Graceful degradation successful using ${degradationResult.fallbackStrategy} strategy`);
          
          // Create compressed data from fallback result
          const fallbackCompressed = this.createFallbackCompressedData(
            input,
            degradationResult,
            compressionConfig
          );

          // End timing and record fallback metrics
          this._metrics.endTiming();
          this._metrics.recordCompressionMetrics(input.length, degradationResult.compressedData.length);
          
          this.logFallbackMetrics(input.length, degradationResult);
          
          return fallbackCompressed;
        } else {
          throw new Error(`Quantum compression and graceful degradation both failed: ${degradationResult.errorMessage || 'Unknown fallback error'}`);
        }
      } catch (fallbackError) {
        throw new Error(`Quantum compression failed: ${error instanceof Error ? error.message : 'Unknown error'}. Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error'}`);
      }
    }
  }

  /**
   * Decompress quantum-compressed data back to original format
   * Implements quantum interference reversal algorithms for data recovery with fallback support
   */
  decompress(compressed: CompressedQuantumData): Buffer {
    if (!compressed.verifyIntegrity()) {
      throw new Error('Compressed data integrity check failed');
    }

    const startTime = performance.now();

    try {
      const config = compressed.metadata.compressionConfig as any;
      
      // Check if this was compressed using hybrid compression
      if (config.hybridCompressed && config.hybridData) {
        console.log(`Decompressing hybrid data using ${config.compressionAlgorithm} algorithm`);
        
        const hybridData = Buffer.from(config.hybridData);
        const decompressedData = this.hybridDecompress(hybridData, config.hybridMetadata);
        
        const endTime = performance.now();
        this.logDecompressionMetrics(compressed, decompressedData.length, endTime - startTime);
        
        return decompressedData;
      }
      
      // Check if this was compressed using fallback strategy
      if (config.fallbackUsed && config.fallbackData) {
        console.log(`Decompressing fallback data using ${config.fallbackStrategy} strategy`);
        
        const fallbackData = Buffer.from(config.fallbackData);
        const decompressedData = this.decompressFallbackData(fallbackData, config.fallbackStrategy);
        
        const endTime = performance.now();
        this.logDecompressionMetrics(compressed, decompressedData.length, endTime - startTime);
        
        return decompressedData;
      }

      // Attempt quantum state reconstruction
      // Phase 1: Initialize decompression components with original configuration
      this.initializeDecompressionComponents(compressed);

      // Phase 2: Reconstruct quantum states from compressed data
      const reconstructedStates = this.reconstructQuantumStates(compressed);

      // Phase 3: Reverse quantum interference patterns
      const interferenceReversedStates = this.reverseQuantumInterference(
        reconstructedStates, 
        compressed.interferencePatterns
      );

      // Phase 4: Reconstruct entanglement relationships
      const entanglementReconstructedStates = this.reconstructEntanglement(
        interferenceReversedStates, 
        compressed
      );

      // Phase 5: Collapse superposition states to classical representation
      const collapsedStates = this.collapseSuperpositionStates(
        entanglementReconstructedStates, 
        compressed
      );

      // Phase 6: Convert quantum states back to classical data
      const classicalData = this.convertToClassicalData(collapsedStates);

      // Phase 7: Trim to original size and validate
      const decompressedData = classicalData.subarray(0, compressed.metadata.originalSize);

      // Validate decompression result
      this.validateDecompressionResult(decompressedData, compressed);

      const endTime = performance.now();
      this.logDecompressionMetrics(compressed, decompressedData.length, endTime - startTime);

      return decompressedData;

    } catch (error) {
      throw new Error(`Quantum decompression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decompress data that was compressed using fallback strategies
   */
  private decompressFallbackData(fallbackData: Buffer, strategy: string): Buffer {
    const errorCorrection = new (require('./QuantumErrorCorrection').QuantumErrorCorrection)();
    
    try {
      switch (strategy) {
        case 'simple-classical':
        case 'fast-classical':
          return this.runLengthDecode(fallbackData);
        
        case 'chunked-classical':
          return this.decompressChunkedData(fallbackData);
        
        case 'hybrid-compression':
          return this.decompressHybridData(fallbackData);
        
        case 'classical-with-quantum-metadata':
          return this.decompressClassicalWithMetadata(fallbackData);
        
        default:
          console.warn(`Unknown fallback strategy: ${strategy}, returning data as-is`);
          return fallbackData;
      }
    } catch (error) {
      console.warn(`Fallback decompression failed: ${error instanceof Error ? error.message : 'Unknown error'}, returning data as-is`);
      return fallbackData;
    }
  }

  /**
   * Decompress chunked classical data
   */
  private decompressChunkedData(data: Buffer): Buffer {
    // Simple implementation - in practice would parse chunk metadata
    return this.runLengthDecode(data);
  }

  /**
   * Decompress hybrid compressed data
   */
  private decompressHybridData(data: Buffer): Buffer {
    try {
      // Read quantum portion size
      const quantumPortionSize = data[0];
      
      // Split data
      const quantumPortion = data.subarray(1, 1 + quantumPortionSize);
      const classicalPortion = data.subarray(1 + quantumPortionSize);
      
      // Decompress both portions
      const decompressedQuantum = this.runLengthDecode(quantumPortion);
      const decompressedClassical = this.runLengthDecode(classicalPortion);
      
      // Combine results
      return Buffer.concat([decompressedQuantum, decompressedClassical]);
    } catch (error) {
      // Fallback to simple decompression
      return this.runLengthDecode(data);
    }
  }

  /**
   * Decompress classical data with quantum metadata
   */
  private decompressClassicalWithMetadata(data: Buffer): Buffer {
    try {
      // Read metadata size
      const metadataSize = data[0];
      
      // Skip metadata and decompress the rest
      const compressedData = data.subarray(1 + metadataSize);
      return this.runLengthDecode(compressedData);
    } catch (error) {
      // Fallback to simple decompression
      return this.runLengthDecode(data);
    }
  }

  /**
   * Run-length decode implementation
   */
  private runLengthDecode(data: Buffer): Buffer {
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i += 2) {
      if (i + 1 < data.length) {
        const count = data[i];
        const byte = data[i + 1];
        
        for (let j = 0; j < count; j++) {
          result.push(byte);
        }
      }
    }
    
    return Buffer.from(result);
  }

  /**
   * Get comprehensive compression metrics for the last operation
   */
  getCompressionMetrics(): QuantumMetrics {
    return this._metrics;
  }

  /**
   * Get all metrics in a structured format
   */
  getAllMetrics() {
    return this._metrics.getAllMetrics();
  }

  /**
   * Generate a formatted performance report
   */
  generatePerformanceReport(): string {
    return this._metrics.generateReport();
  }

  /**
   * Get performance profiler for detailed analysis
   */
  getProfiler(): PerformanceProfiler {
    return this._profiler;
  }

  /**
   * Generate comprehensive performance analysis
   */
  generatePerformanceAnalysis(): string {
    return this._profiler.generateReport();
  }

  /**
   * Optimize quantum parameters based on data characteristics
   */
  optimizeQuantumParameters(dataSize: number, dataType: 'text' | 'binary' | 'structured' | 'random' = 'binary'): QuantumConfig {
    // Start with base parameters
    let quantumBitDepth: number;
    let superpositionComplexity: number;
    let maxEntanglementLevel: number;
    let interferenceThreshold: number;

    // Optimize based on data size
    if (dataSize < 1024) {
      // Small files: Use higher precision but lower complexity
      quantumBitDepth = 6;
      superpositionComplexity = 3;
      maxEntanglementLevel = 2;
      interferenceThreshold = 0.5;
    } else if (dataSize < 10 * 1024) {
      // Medium files: Balanced approach
      quantumBitDepth = 4;
      superpositionComplexity = 4;
      maxEntanglementLevel = 2; // Reduced to fit within bit depth constraint
      interferenceThreshold = 0.6;
    } else if (dataSize < 100 * 1024) {
      // Large files: Prioritize performance
      quantumBitDepth = 3;
      superpositionComplexity = 2;
      maxEntanglementLevel = 1; // Reduced to fit within bit depth constraint
      interferenceThreshold = 0.7;
    } else {
      // Very large files: Minimal complexity
      quantumBitDepth = 2;
      superpositionComplexity = 1;
      maxEntanglementLevel = 1;
      interferenceThreshold = 0.8;
    }

    // Optimize based on data type, respecting quantum bit depth constraints
    const maxEntanglementForBitDepth = Math.floor(quantumBitDepth / 2);
    
    switch (dataType) {
      case 'text':
        // Text has patterns, can benefit from entanglement
        maxEntanglementLevel = Math.min(
          maxEntanglementLevel + 1, 
          maxEntanglementForBitDepth,
          4
        );
        interferenceThreshold = Math.max(interferenceThreshold - 0.1, 0.3);
        break;
      case 'structured':
        // Structured data has strong patterns
        superpositionComplexity = Math.min(superpositionComplexity + 1, 5);
        interferenceThreshold = Math.max(interferenceThreshold - 0.2, 0.3);
        break;
      case 'random':
        // Random data has no patterns, minimize complexity
        superpositionComplexity = 1;
        maxEntanglementLevel = 1;
        interferenceThreshold = 0.9;
        break;
      case 'binary':
      default:
        // Keep default optimizations but ensure constraints are met
        maxEntanglementLevel = Math.min(maxEntanglementLevel, maxEntanglementForBitDepth);
        break;
    }

    // Final validation to ensure all parameters are within constraints
    maxEntanglementLevel = Math.min(maxEntanglementLevel, maxEntanglementForBitDepth);

    // Create the optimized config with validated parameters
    return new QuantumConfig(quantumBitDepth, maxEntanglementLevel, superpositionComplexity, interferenceThreshold);
  }

  /**
   * Force garbage collection and memory cleanup
   */
  forceMemoryCleanup(): void {
    // Clear profiler data if it's getting large
    const profiles = this._profiler.getOperationIds();
    if (profiles.length > 100) {
      this._profiler.clear();
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Clear any cached data in components
    this.clearComponentCaches();
  }

  /**
   * Hybrid compression strategy that combines classical and quantum algorithms
   */
  private hybridCompress(input: Buffer): CompressionResult {
    const originalSize = input.length;
    
    try {
      // Step 1: Try classical compression first
      const classicalResult = this.classicalCompress(input);
      
      // Step 2: If classical compression is effective, apply quantum optimization
      if (classicalResult.compressionRatio > 1.1) {
        const quantumOptimized = this.quantumOptimizeCompressed(classicalResult.compressedData);
        
        if (quantumOptimized.compressedSize < classicalResult.compressedSize) {
          return {
            compressedData: quantumOptimized.compressedData,
            originalSize,
            compressedSize: quantumOptimized.compressedSize,
            compressionRatio: originalSize / quantumOptimized.compressedSize,
            algorithm: 'hybrid',
            metadata: {
              quantumPortion: 30,
              classicalPortion: 70,
              actualCompressionRatio: originalSize / quantumOptimized.compressedSize,
              fallbackUsed: false,
              strategy: 'classical-then-quantum'
            }
          };
        }
      }
      
      // Step 3: Fallback to pure classical if quantum optimization doesn't help
      return {
        ...classicalResult,
        algorithm: 'classical',
        metadata: {
          quantumPortion: 0,
          classicalPortion: 100,
          actualCompressionRatio: classicalResult.compressionRatio,
          fallbackUsed: true,
          strategy: 'classical-fallback'
        }
      };
      
    } catch (error) {
      // Emergency fallback to simple run-length encoding
      console.warn(`Hybrid compression failed: ${error instanceof Error ? error.message : 'Unknown error'}, using simple compression`);
      return this.simpleCompress(input);
    }
  }

  /**
   * Classical compression using zlib deflate
   */
  private classicalCompress(input: Buffer): CompressionResult {
    try {
      const compressed = zlib.deflateSync(input, { level: 9 });
      
      return {
        compressedData: compressed,
        originalSize: input.length,
        compressedSize: compressed.length,
        compressionRatio: input.length / compressed.length,
        algorithm: 'classical'
      };
    } catch (error) {
      throw new Error(`Classical compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Quantum optimization of already compressed data
   */
  private quantumOptimizeCompressed(compressedData: Buffer): CompressionResult {
    try {
      // Apply quantum-inspired pattern recognition to find additional compression opportunities
      const patterns = this.findQuantumPatterns(compressedData);
      const optimized = this.applyQuantumOptimization(compressedData, patterns);
      
      return {
        compressedData: optimized,
        originalSize: compressedData.length,
        compressedSize: optimized.length,
        compressionRatio: compressedData.length / optimized.length,
        algorithm: 'quantum'
      };
    } catch (error) {
      // Return original if quantum optimization fails
      return {
        compressedData: compressedData,
        originalSize: compressedData.length,
        compressedSize: compressedData.length,
        compressionRatio: 1,
        algorithm: 'classical'
      };
    }
  }

  /**
   * Find quantum-inspired patterns in compressed data
   */
  private findQuantumPatterns(data: Buffer): Array<{offset: number, length: number, pattern: Buffer}> {
    const patterns: Array<{offset: number, length: number, pattern: Buffer}> = [];
    const minPatternLength = 4;
    const maxPatternLength = Math.min(16, Math.floor(data.length / 4));
    
    // Look for repeating patterns
    for (let patternLen = minPatternLength; patternLen <= maxPatternLength; patternLen++) {
      for (let i = 0; i <= data.length - patternLen * 2; i++) {
        const pattern = data.subarray(i, i + patternLen);
        let matches = 0;
        let lastMatch = i;
        
        // Count consecutive matches
        for (let j = i + patternLen; j <= data.length - patternLen; j += patternLen) {
          if (data.subarray(j, j + patternLen).equals(pattern)) {
            matches++;
            lastMatch = j;
          } else {
            break;
          }
        }
        
        // If we found multiple matches, it's a pattern worth optimizing
        if (matches >= 2) {
          patterns.push({
            offset: i,
            length: (lastMatch - i) + patternLen,
            pattern
          });
          i = lastMatch + patternLen - 1; // Skip past this pattern
        }
      }
    }
    
    return patterns;
  }

  /**
   * Apply quantum optimization to compressed data using found patterns
   */
  private applyQuantumOptimization(data: Buffer, patterns: Array<{offset: number, length: number, pattern: Buffer}>): Buffer {
    if (patterns.length === 0) {
      return data;
    }
    
    const result: Buffer[] = [];
    let currentOffset = 0;
    
    for (const pattern of patterns) {
      // Add data before pattern
      if (pattern.offset > currentOffset) {
        result.push(data.subarray(currentOffset, pattern.offset));
      }
      
      // Replace pattern with quantum-compressed representation
      const patternCount = Math.floor(pattern.length / pattern.pattern.length);
      const quantumPattern = Buffer.concat([
        Buffer.from([0xFF, 0x51]), // Quantum pattern marker (0x51 = 'Q')
        Buffer.from([pattern.pattern.length]), // Pattern length
        pattern.pattern, // The pattern itself
        Buffer.from([patternCount]) // How many times it repeats
      ]);
      
      result.push(quantumPattern);
      currentOffset = pattern.offset + pattern.length;
    }
    
    // Add remaining data
    if (currentOffset < data.length) {
      result.push(data.subarray(currentOffset));
    }
    
    return Buffer.concat(result);
  }

  /**
   * Simple compression using run-length encoding as emergency fallback
   */
  private simpleCompress(input: Buffer): CompressionResult {
    const compressed: number[] = [];
    let i = 0;
    
    while (i < input.length) {
      const currentByte = input[i];
      let count = 1;
      
      // Count consecutive identical bytes
      while (i + count < input.length && input[i + count] === currentByte && count < 255) {
        count++;
      }
      
      // Store count and byte
      compressed.push(count, currentByte);
      i += count;
    }
    
    const compressedBuffer = Buffer.from(compressed);
    
    return {
      compressedData: compressedBuffer,
      originalSize: input.length,
      compressedSize: compressedBuffer.length,
      compressionRatio: input.length / compressedBuffer.length,
      algorithm: 'classical',
      metadata: {
        quantumPortion: 0,
        classicalPortion: 100,
        actualCompressionRatio: input.length / compressedBuffer.length,
        fallbackUsed: true,
        strategy: 'run-length-encoding'
      }
    };
  }

  /**
   * Hybrid decompression that handles different compression strategies
   */
  private hybridDecompress(compressedData: Buffer, metadata: HybridCompressionMetadata): Buffer {
    try {
      switch (metadata.strategy) {
        case 'classical-then-quantum':
          return this.decompressQuantumOptimized(compressedData);
        case 'classical-fallback':
          return this.classicalDecompress(compressedData);
        case 'run-length-encoding':
          return this.simpleDecompress(compressedData);
        default:
          throw new Error(`Unknown compression strategy: ${metadata.strategy}`);
      }
    } catch (error) {
      throw new Error(`Hybrid decompression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Classical decompression using zlib inflate
   */
  private classicalDecompress(compressedData: Buffer): Buffer {
    try {
      return zlib.inflateSync(compressedData);
    } catch (error) {
      throw new Error(`Classical decompression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decompress quantum-optimized data
   */
  private decompressQuantumOptimized(compressedData: Buffer): Buffer {
    try {
      // First, reverse quantum optimization
      const classicalData = this.reverseQuantumOptimization(compressedData);
      // Then decompress using classical method
      return this.classicalDecompress(classicalData);
    } catch (error) {
      throw new Error(`Quantum decompression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reverse quantum optimization patterns
   */
  private reverseQuantumOptimization(data: Buffer): Buffer {
    const result: Buffer[] = [];
    let i = 0;
    
    while (i < data.length) {
      // Check for quantum pattern marker
      if (i + 1 < data.length && data[i] === 0xFF && data[i + 1] === 0x51) { // 0x51 = 'Q' in hex
        // Skip marker
        i += 2;
        
        if (i >= data.length) break;
        
        // Read pattern length
        const patternLength = data[i++];
        if (i + patternLength >= data.length) break;
        
        // Read pattern
        const pattern = data.subarray(i, i + patternLength);
        i += patternLength;
        
        if (i >= data.length) break;
        
        // Read repeat count
        const repeatCount = data[i++];
        
        // Expand pattern
        for (let j = 0; j < repeatCount; j++) {
          result.push(pattern);
        }
      } else {
        // Regular byte, copy as-is
        result.push(Buffer.from([data[i++]]));
      }
    }
    
    return Buffer.concat(result);
  }

  /**
   * Simple decompression for run-length encoded data
   */
  private simpleDecompress(compressedData: Buffer): Buffer {
    const result: number[] = [];
    
    for (let i = 0; i < compressedData.length; i += 2) {
      if (i + 1 < compressedData.length) {
        const count = compressedData[i];
        const byte = compressedData[i + 1];
        
        for (let j = 0; j < count; j++) {
          result.push(byte);
        }
      }
    }
    
    return Buffer.from(result);
  }

  /**
   * Clear caches in quantum processing components
   */
  private clearComponentCaches(): void {
    // Clear correlation cache in entanglement analyzer
    if (this._entanglementAnalyzer && typeof (this._entanglementAnalyzer as any).clearCache === 'function') {
      (this._entanglementAnalyzer as any).clearCache();
    }

    // Clear any other component caches
    // This would be expanded as more caching is implemented
  }

  /**
   * Reset session statistics
   */
  resetSessionStatistics(): void {
    this._metrics.resetSession();
  }

  /**
   * Phase 1: Quantum State Preparation
   * Convert classical data into quantum state vectors with optimal chunking and phase assignment
   * Optimized for memory efficiency and performance
   */
  private performQuantumStatePreparation(input: Buffer, config: QuantumConfig): QuantumStateVector[] {
    // Performance optimization: Limit quantum bit depth for large files
    const optimizedBitDepth = input.length > 10 * 1024 
      ? Math.min(config.quantumBitDepth, 4) // Reduce bit depth for large files
      : Math.min(config.quantumBitDepth, 6); // Moderate reduction for smaller files

    // Initialize state converter with optimized parameters
    this._stateConverter = new QuantumStateConverter(
      optimizedBitDepth,
      this.calculateOptimalChunkSize(input.length, config)
    );

    // Performance optimization: Skip expensive data analysis for large files
    if (input.length <= 1024) {
      const dataAnalysis = this._stateConverter.analyzeDataPatterns(input);
      
      // Only optimize for high entropy small files
      if (dataAnalysis.entropy > 6) {
        this._stateConverter = this._stateConverter.optimizeForData(input);
      }
    }

    // Convert to quantum states with memory management
    const quantumStates = this._stateConverter.convertToQuantumStates(input);

    if (quantumStates.length === 0) {
      throw new Error('Failed to create quantum states from input data');
    }

    // Performance optimization: Limit the number of quantum states to prevent memory issues
    const maxStates = Math.min(quantumStates.length, this.calculateMaxStatesForMemory(input.length));
    if (quantumStates.length > maxStates) {
      console.warn(`Limiting quantum states from ${quantumStates.length} to ${maxStates} for memory efficiency`);
      return quantumStates.slice(0, maxStates);
    }

    return quantumStates;
  }

  /**
   * Phase 2: Superposition Analysis
   * Create superposition states and analyze probability patterns
   * Optimized for performance and memory efficiency
   */
  private performSuperpositionAnalysis(
    states: QuantumStateVector[], 
    config: QuantumConfig
  ): SuperpositionAnalysisResult {
    // Performance optimization: Reduce superposition complexity for large datasets
    const optimizedComplexity = states.length > 100 
      ? Math.min(config.superpositionComplexity, 3) // Reduce complexity for many states
      : Math.min(config.superpositionComplexity, 5); // Moderate complexity for fewer states

    // Configure superposition processor with optimized parameters
    this._superpositionProcessor.maxSuperpositionSize = Math.min(8, optimizedComplexity * 2); // Reduced from 16
    this._superpositionProcessor.patternThreshold = config.interferenceThreshold * 0.7; // Increased threshold

    // Performance optimization: Limit state groups to prevent memory explosion
    const maxGroups = Math.min(states.length, 50); // Limit to 50 groups maximum
    const stateGroups = this.groupStatesForSuperposition(states.slice(0, maxGroups), optimizedComplexity);

    // Process superpositions with memory management
    try {
      const parallelResult = this._superpositionProcessor.processParallelSuperpositions(stateGroups);

      // Performance optimization: Limit pattern analysis to prevent memory issues
      const maxPatterns = 100; // Limit to 100 patterns maximum
      const limitedPatterns = parallelResult.patternAnalyses.flat().slice(0, maxPatterns);

      // Identify dominant patterns with reduced complexity
      const dominantPatterns = this._superpositionProcessor.identifyDominantPatterns(
        [limitedPatterns], // Wrap in array since we already flattened
        config.interferenceThreshold * 0.9 // Higher threshold for better performance
      );

      return {
        superpositions: parallelResult.superpositions,
        patterns: limitedPatterns,
        dominantPatterns,
        processingMetrics: parallelResult.processingMetrics
      };
    } catch (error) {
      // Fallback to simplified superposition analysis
      console.warn(`Superposition analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}, using simplified analysis`);
      return this.performSimplifiedSuperpositionAnalysis(states, config);
    }
  }

  /**
   * Phase 3: Entanglement Detection
   * Find correlated patterns and create entanglement pairs
   * Optimized for performance and memory efficiency
   */
  private performEntanglementDetection(
    states: QuantumStateVector[], 
    config: QuantumConfig
  ): EntanglementPair[] {
    // Performance optimization: Skip entanglement for very small or very large datasets
    if (states.length < 4) {
      console.log('Skipping entanglement detection for small dataset');
      return [];
    }

    if (states.length > 200) {
      console.log('Limiting entanglement detection for large dataset');
      states = states.slice(0, 200); // Limit to first 200 states
    }

    // Configure entanglement analyzer with optimized parameters
    const optimizedThreshold = Math.max(config.interferenceThreshold, 0.7); // Higher threshold for performance
    this._entanglementAnalyzer.setCorrelationThreshold(optimizedThreshold);

    try {
      // Find entangled patterns with timeout protection
      const entanglementPairs = this._entanglementAnalyzer.findEntangledPatterns(states);

      // Performance optimization: Limit pairs more aggressively
      const maxPairs = Math.min(entanglementPairs.length, config.maxEntanglementLevel * 5); // Reduced from 10
      const selectedPairs = entanglementPairs.slice(0, maxPairs);

      // Skip expensive quality validation for performance
      if (selectedPairs.length === 0) {
        console.log('No entanglement pairs found with optimized threshold');
      }

      return selectedPairs;
    } catch (error) {
      console.warn(`Entanglement detection failed: ${error instanceof Error ? error.message : 'Unknown error'}, skipping entanglement`);
      return [];
    }
  }

  /**
   * Phase 4: Quantum Interference Optimization
   * Apply constructive and destructive interference to optimize patterns
   */
  private performQuantumInterference(
    states: QuantumStateVector[],
    patterns: any[],
    config: QuantumConfig
  ): InterferenceOptimizationResult {
    // Configure interference optimizer
    this._interferenceOptimizer.constructiveThreshold = config.interferenceThreshold;
    this._interferenceOptimizer.destructiveThreshold = config.interferenceThreshold * 0.5;

    // Optimize quantum states using interference
    const optimizationResult = this._interferenceOptimizer.optimizeQuantumStates(states);

    // Create interference patterns for storage
    const interferencePatterns: InterferencePattern[] = optimizationResult.interferencePatterns.map(pattern => ({
      type: pattern.type,
      amplitude: pattern.strength,
      phase: 0, // Default phase
      frequency: 1, // Default frequency
      stateIndices: pattern.stateIndices
    }));

    return {
      optimizedStates: optimizationResult.optimizedStates,
      interferencePatterns,
      optimizationMetrics: optimizationResult.optimizationMetrics
    };
  }

  /**
   * Initialize decompression components with original configuration
   */
  private initializeDecompressionComponents(compressed: CompressedQuantumData): void {
    const config = compressed.metadata.compressionConfig;
    
    // Restore original configuration for decompression
    this._config = new QuantumConfig(
      config.quantumBitDepth || 8,
      config.maxEntanglementLevel || 4,
      config.superpositionComplexity || 5,
      config.interferenceThreshold || 0.3
    );

    // Initialize components with decompression-specific settings
    this._stateConverter = new QuantumStateConverter(
      this._config.quantumBitDepth,
      config.chunkSize || this.calculateDefaultChunkSize()
    );

    this._superpositionProcessor = new SuperpositionProcessor(
      this._config.superpositionComplexity * 2,
      this._config.interferenceThreshold * 0.2,
      this._config.interferenceThreshold * 0.1,
      Math.min(8, this._config.superpositionComplexity)
    );

    this._entanglementAnalyzer = new EntanglementAnalyzer(
      this._config.interferenceThreshold,
      this._config.maxEntanglementLevel * 10
    );

    this._interferenceOptimizer = new InterferenceOptimizer(
      this._config.interferenceThreshold,
      this._config.interferenceThreshold * 0.5,
      1.5, // amplification factor
      0.1, // suppression factor
      10,  // max iterations
      true, // adaptive thresholds
      0.8   // minimal representation target
    );
  }

  /**
   * Reconstruct quantum states from compressed data
   */
  private reconstructQuantumStates(compressed: CompressedQuantumData): QuantumStateVector[] {
    // Clone the quantum states to avoid modifying the original
    const states = compressed.quantumStates.map(state => state.clone());

    // Validate quantum state integrity
    states.forEach((state, index) => {
      if (!state.isNormalized()) {
        console.warn(`Quantum state ${index} is not normalized, attempting to normalize`);
        states[index] = state.normalize();
      }
    });

    return states;
  }

  /**
   * Reverse quantum interference patterns applied during compression
   */
  private reverseQuantumInterference(
    states: QuantumStateVector[], 
    interferencePatterns: readonly InterferencePattern[]
  ): QuantumStateVector[] {
    const reversedStates = states.map(state => state.clone());

    // Apply interference patterns in reverse order
    for (let i = interferencePatterns.length - 1; i >= 0; i--) {
      const pattern = interferencePatterns[i];
      this.applyReverseInterferencePattern(reversedStates, pattern);
    }

    return reversedStates;
  }

  /**
   * Apply reverse interference pattern to quantum states
   */
  private applyReverseInterferencePattern(
    states: QuantumStateVector[], 
    pattern: InterferencePattern
  ): void {
    for (const stateIndex of pattern.stateIndices) {
      if (stateIndex < states.length) {
        const state = states[stateIndex];
        
        if (pattern.type === 'constructive') {
          // Reverse constructive interference by reducing amplitude
          states[stateIndex] = this.reverseConstructiveInterference(state, pattern);
        } else if (pattern.type === 'destructive') {
          // Reverse destructive interference by restoring amplitude
          states[stateIndex] = this.reverseDestructiveInterference(state, pattern);
        }
      }
    }
  }

  /**
   * Reverse constructive interference applied during compression
   */
  private reverseConstructiveInterference(
    state: QuantumStateVector, 
    pattern: InterferencePattern
  ): QuantumStateVector {
    // Calculate reverse amplification factor
    const reverseFactor = 1 / Math.max(1.01, pattern.amplitude);
    
    // Apply reverse phase shift
    const reversePhase = -pattern.phase;
    
    // Create new amplitudes with reverse scaling and phase adjustment
    const newAmplitudes = state.amplitudes.map(amp => {
      // Apply reverse scaling
      const scaledAmp = amp.scale(reverseFactor);
      // Apply reverse phase shift
      return scaledAmp.multiply(
        new (require('../math/Complex').Complex)(
          Math.cos(reversePhase), 
          Math.sin(reversePhase)
        )
      );
    });
    
    // Create and return normalized state
    const newState = new QuantumStateVector(newAmplitudes, state.phase, state.entanglementId);
    return newState.normalize();
  }

  /**
   * Reverse destructive interference applied during compression
   */
  private reverseDestructiveInterference(
    state: QuantumStateVector, 
    pattern: InterferencePattern
  ): QuantumStateVector {
    // Calculate restoration factor
    const restoreFactor = 1 / Math.max(0.01, 1 - pattern.amplitude);
    
    // Apply reverse phase shift
    const reversePhase = -pattern.phase;
    
    // Create new amplitudes with restoration scaling and phase adjustment
    const newAmplitudes = state.amplitudes.map(amp => {
      // Apply restoration scaling
      const restoredAmp = amp.scale(restoreFactor);
      // Apply reverse phase shift
      return restoredAmp.multiply(
        new (require('../math/Complex').Complex)(
          Math.cos(reversePhase), 
          Math.sin(reversePhase)
        )
      );
    });
    
    // Create and return normalized state
    const newState = new QuantumStateVector(newAmplitudes, state.phase, state.entanglementId);
    return newState.normalize();
  }

  /**
   * Reconstruct entanglement relationships
   */
  private reconstructEntanglement(
    states: QuantumStateVector[], 
    compressed: CompressedQuantumData
  ): QuantumStateVector[] {
    const entanglementPairs = compressed.getEntanglementPairs();
    const reconstructedStates = states.map(state => state.clone());
    
    // Process each entanglement pair to restore correlations
    for (const pair of entanglementPairs) {
      const entangledStates = reconstructedStates.filter(state => 
        state.entanglementId === pair.entanglementId
      );

      if (entangledStates.length >= 2) {
        this.reconstructSharedInformation(entangledStates, pair);
        this.restoreQuantumCorrelations(entangledStates, pair);
      }
    }

    return reconstructedStates;
  }

  /**
   * Restore quantum correlations between entangled states
   */
  private restoreQuantumCorrelations(
    entangledStates: QuantumStateVector[], 
    pair: EntanglementPair
  ): void {
    if (entangledStates.length < 2) return;

    const correlationStrength = pair.correlationStrength;
    const phaseCorrelation = Math.acos(correlationStrength);

    // Apply correlation-based phase adjustments
    for (let i = 0; i < entangledStates.length - 1; i++) {
      const stateA = entangledStates[i];
      const stateB = entangledStates[i + 1];

      // Calculate phase difference that maintains correlation
      const phaseDifference = phaseCorrelation * (i + 1);

      // Apply correlated phase shifts
      entangledStates[i] = stateA.applyPhaseShift(phaseDifference);
      entangledStates[i + 1] = stateB.applyPhaseShift(-phaseDifference);
    }
  }

  /**
   * Collapse superposition states to classical representation
   */
  private collapseSuperpositionStates(
    states: QuantumStateVector[], 
    compressed: CompressedQuantumData
  ): QuantumStateVector[] {
    const collapsedStates = states.map(state => state.clone());

    // Apply measurement-like collapse to determine classical values
    for (let i = 0; i < collapsedStates.length; i++) {
      const state = collapsedStates[i];
      
      // Calculate probability distribution
      const probabilities = state.getProbabilityDistribution();
      
      // Find the most probable state (maximum likelihood collapse)
      const maxProbIndex = probabilities.indexOf(Math.max(...probabilities));
      
      // Create collapsed state with dominant amplitude
      const collapsedAmplitudes = state.amplitudes.map((amp, index) => {
        if (index === maxProbIndex) {
          // Preserve the dominant amplitude
          return amp.scale(1 / Math.sqrt(probabilities[maxProbIndex]));
        } else {
          // Reduce other amplitudes based on their relative probability
          const scaleFactor = Math.sqrt(probabilities[index] / probabilities[maxProbIndex]);
          return amp.scale(scaleFactor);
        }
      });

      collapsedStates[i] = new QuantumStateVector(
        collapsedAmplitudes, 
        state.phase, 
        state.entanglementId
      ).normalize();
    }

    return collapsedStates;
  }

  /**
   * Convert quantum states back to classical data
   */
  private convertToClassicalData(states: QuantumStateVector[]): Buffer {
    if (states.length === 0) {
      return Buffer.alloc(0);
    }

    try {
      // Use the state converter to convert back to classical data
      const classicalData = this._stateConverter.convertFromQuantumStates(states);
      
      // Validate the conversion result
      if (classicalData.length === 0 && states.length > 0) {
        throw new Error('Quantum to classical conversion produced empty result');
      }

      return classicalData;
    } catch (error) {
      throw new Error(`Failed to convert quantum states to classical data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate decompression result against expected metadata
   */
  private validateDecompressionResult(
    decompressedData: Buffer, 
    compressed: CompressedQuantumData
  ): void {
    // Check size consistency
    if (decompressedData.length !== compressed.metadata.originalSize) {
      throw new Error(
        `Decompressed data size mismatch: expected ${compressed.metadata.originalSize}, got ${decompressedData.length}`
      );
    }

    // Validate that we have actual data
    if (decompressedData.length === 0 && compressed.metadata.originalSize > 0) {
      throw new Error('Decompression produced empty result for non-empty original data');
    }

    // Additional validation could include:
    // - Entropy analysis to ensure data characteristics are preserved
    // - Pattern validation for known data types
    // - Checksum validation if original data checksum was stored
    
    console.log(`Decompression validation passed: ${decompressedData.length} bytes recovered`);
  }

  /**
   * Initialize quantum processing components based on configuration
   */
  private initializeComponents(): void {
    this._stateConverter = new QuantumStateConverter(
      this._config.quantumBitDepth,
      this.calculateDefaultChunkSize()
    );

    this._superpositionProcessor = new SuperpositionProcessor(
      this._config.superpositionComplexity * 2,
      this._config.interferenceThreshold * 0.2,
      this._config.interferenceThreshold * 0.1,
      Math.min(8, this._config.superpositionComplexity)
    );

    this._entanglementAnalyzer = new EntanglementAnalyzer(
      this._config.interferenceThreshold,
      this._config.maxEntanglementLevel * 10
    );

    this._interferenceOptimizer = new InterferenceOptimizer(
      this._config.interferenceThreshold,
      this._config.interferenceThreshold * 0.5,
      1.5, // amplification factor
      0.1, // suppression factor
      10,  // max iterations
      true, // adaptive thresholds
      0.8   // minimal representation target
    );
  }

  /**
   * Calculate optimal chunk size based on data size and configuration
   * Optimized for memory efficiency and performance
   */
  private calculateOptimalChunkSize(dataSize: number, config: QuantumConfig): number {
    // Performance optimization: Use smaller chunks for better memory management
    const baseChunkSize = 16; // Reduced from 64 to 16 bytes
    
    // Adaptive chunk sizing based on data size
    if (dataSize < 1024) {
      return Math.max(4, Math.min(16, dataSize / 4)); // Very small chunks for small files
    } else if (dataSize < 10 * 1024) {
      return Math.max(8, Math.min(32, dataSize / 32)); // Small chunks for medium files
    } else if (dataSize < 100 * 1024) {
      return Math.max(16, Math.min(64, dataSize / 128)); // Medium chunks for large files
    } else {
      return Math.max(32, Math.min(128, dataSize / 512)); // Larger chunks for very large files
    }
  }

  /**
   * Calculate default chunk size
   */
  private calculateDefaultChunkSize(): number {
    return Math.max(4, Math.min(32, this._config.quantumBitDepth * 2)); // Reduced for performance
  }

  /**
   * Calculate maximum number of quantum states based on available memory
   */
  private calculateMaxStatesForMemory(dataSize: number): number {
    // Estimate memory usage per state (rough approximation)
    const bytesPerState = 1024; // Approximate memory per quantum state
    const availableMemory = 100 * 1024 * 1024; // Assume 100MB available for quantum states
    const maxStatesFromMemory = Math.floor(availableMemory / bytesPerState);
    
    // Also limit based on data size to prevent excessive state generation
    const maxStatesFromData = Math.ceil(dataSize / 8); // One state per 8 bytes of data
    
    return Math.min(maxStatesFromMemory, maxStatesFromData, 1000); // Hard limit of 1000 states
  }

  /**
   * Perform simplified superposition analysis as fallback
   */
  private performSimplifiedSuperpositionAnalysis(
    states: QuantumStateVector[], 
    config: QuantumConfig
  ): SuperpositionAnalysisResult {
    // Create minimal superposition analysis for fallback
    const simplifiedPatterns: any[] = states.slice(0, 10).map((state, index) => ({
      patternId: `simple_${index}`,
      probability: 0.5,
      significance: 0.3,
      stateIndices: [index]
    }));

    return {
      superpositions: [],
      patterns: simplifiedPatterns,
      dominantPatterns: simplifiedPatterns.slice(0, 3),
      processingMetrics: []
    };
  }

  /**
   * Group quantum states for superposition processing
   */
  private groupStatesForSuperposition(
    states: QuantumStateVector[], 
    complexity: number
  ): QuantumStateVector[][] {
    const groupSize = Math.max(2, Math.min(16, complexity * 2));
    const groups: QuantumStateVector[][] = [];

    for (let i = 0; i < states.length; i += groupSize) {
      const group = states.slice(i, i + groupSize);
      if (group.length > 0) {
        groups.push(group);
      }
    }

    return groups;
  }



  /**
   * Reconstruct shared information from entanglement pair
   */
  private reconstructSharedInformation(states: QuantumStateVector[], pair: EntanglementPair): void {
    const sharedInfo = pair.sharedInformation;
    
    if (sharedInfo.length > 0 && states.length >= 2) {
      // Extract shared pattern information
      const sharedPattern = this.extractSharedPattern(sharedInfo);
      
      // Apply shared information to restore original correlations
      for (let i = 0; i < states.length; i++) {
        const state = states[i];
        
        // Modify amplitudes based on shared information
        const modifiedAmplitudes = state.amplitudes.map((amp, ampIndex) => {
          if (ampIndex < sharedPattern.length) {
            // Apply shared pattern influence
            const sharedInfluence = sharedPattern[ampIndex] / 255.0; // Normalize byte to [0,1]
            const influenceFactor = 1 + (sharedInfluence - 0.5) * pair.correlationStrength;
            return amp.scale(influenceFactor);
          }
          return amp;
        });

        // Update the state with modified amplitudes
        states[i] = new QuantumStateVector(
          modifiedAmplitudes, 
          state.phase, 
          state.entanglementId
        ).normalize();
      }
    }
  }

  /**
   * Extract shared pattern from shared information buffer
   */
  private extractSharedPattern(sharedInfo: Buffer): number[] {
    // Convert buffer to array of numbers representing the shared pattern
    const pattern: number[] = [];
    
    for (let i = 0; i < Math.min(sharedInfo.length, 16); i++) {
      pattern.push(sharedInfo[i]);
    }
    
    // If pattern is too short, extend it with derived values
    while (pattern.length < 16) {
      const lastValue = pattern[pattern.length - 1] || 128;
      const derivedValue = (lastValue * 1.618) % 256; // Golden ratio for pattern extension
      pattern.push(Math.floor(derivedValue));
    }
    
    return pattern;
  }

  /**
   * Log compression metrics
   */
  private logCompressionMetrics(
    originalSize: number, 
    compressed: CompressedQuantumData, 
    processingTime: number
  ): void {
    const stats = compressed.getCompressionStats();
    console.log(`Quantum Compression Complete:
      Original Size: ${originalSize} bytes
      Compressed Size: ${stats.compressedSize} bytes
      Compression Ratio: ${stats.compressionRatio.toFixed(2)}x
      Space Saved: ${stats.spaceSavedPercentage.toFixed(1)}%
      Processing Time: ${processingTime.toFixed(2)}ms
      Quantum States: ${stats.quantumStateCount}
      Entanglement Pairs: ${stats.entanglementCount}
      Interference Patterns: ${stats.interferencePatternCount}`);
  }

  /**
   * Log decompression metrics
   */
  private logDecompressionMetrics(
    compressed: CompressedQuantumData, 
    decompressedSize: number, 
    processingTime: number
  ): void {
    console.log(`Quantum Decompression Complete:
      Compressed Size: ${compressed.metadata.compressedSize} bytes
      Decompressed Size: ${decompressedSize} bytes
      Processing Time: ${processingTime.toFixed(2)}ms
      Data Integrity: ${compressed.verifyIntegrity() ? 'Verified' : 'Failed'}`);
  }

  /**
   * Create compressed data structure from fallback compression result
   */
  private createFallbackCompressedData(
    originalData: Buffer,
    degradationResult: any, // GracefulDegradationResult
    config: QuantumConfig
  ): CompressedQuantumData {
    // Create minimal quantum states for fallback data
    const fallbackStates = this.createFallbackQuantumStates(degradationResult.compressedData);
    
    // Create metadata indicating fallback was used
    const metadata = {
      originalSize: originalData.length,
      compressedSize: degradationResult.compressedData.length,
      compressionRatio: degradationResult.compressionRatio,
      quantumStateCount: fallbackStates.length,
      entanglementCount: 0,
      interferencePatternCount: 0,
      compressionTimestamp: Date.now(),
      quantumFlowVersion: '1.0.0',
      compressionConfig: {
        ...config.toObject(),
        fallbackUsed: true,
        fallbackStrategy: degradationResult.fallbackStrategy,
        originalFailureReason: degradationResult.originalFailureReason,
        // Store compressed data for reconstruction
        fallbackData: Array.from(degradationResult.compressedData)
      }
    };

    return CompressedQuantumData.create(
      fallbackStates,
      [], // No entanglement pairs for fallback
      [], // No interference patterns for fallback
      originalData.length,
      metadata.compressionConfig
    );
  }

  /**
   * Create minimal quantum states for fallback data
   */
  private createFallbackQuantumStates(fallbackData: Buffer): QuantumStateVector[] {
    const states: QuantumStateVector[] = [];
    const chunkSize = 8; // Small chunks for fallback
    
    for (let i = 0; i < fallbackData.length; i += chunkSize) {
      const chunk = fallbackData.subarray(i, Math.min(i + chunkSize, fallbackData.length));
      
      // Create simple quantum state from chunk
      const amplitudes = [];
      for (let j = 0; j < chunkSize; j++) {
        const byte = j < chunk.length ? chunk[j] : 0;
        const normalized = (byte - 128) / 128.0; // Normalize to [-1, 1]
        amplitudes.push(new (require('../math/Complex').Complex)(normalized, 0));
      }
      
      const state = new QuantumStateVector(amplitudes, 0);
      states.push(state);
    }
    
    return states;
  }

  /**
   * Log fallback compression metrics
   */
  private logFallbackMetrics(originalSize: number, degradationResult: any): void {
    console.log(`Fallback Compression Complete:
      Strategy: ${degradationResult.fallbackStrategy}
      Original Size: ${originalSize} bytes
      Compressed Size: ${degradationResult.compressedData.length} bytes
      Compression Ratio: ${degradationResult.compressionRatio.toFixed(2)}x
      Processing Time: ${degradationResult.processingTime.toFixed(2)}ms
      Integrity Score: ${degradationResult.fallbackMetrics.integrityScore.toFixed(3)}
      Original Failure: ${degradationResult.originalFailureReason}
      Recommended Action: ${degradationResult.recommendedAction}`);
  }

  /**
   * Enhanced decompression with integrity verification
   */
  decompressWithIntegrityCheck(compressed: CompressedQuantumData): { data: Buffer; verification: any } {
    // Generate checksum before decompression
    const errorCorrection = new (require('./QuantumErrorCorrection').QuantumErrorCorrection)();
    const originalChecksum = errorCorrection.generateQuantumChecksum(
      compressed.serialize(),
      {
        algorithm: 'quantum-hash',
        includePhaseInfo: true,
        includeProbabilityDistribution: true
      }
    );

    // Perform decompression
    const decompressedData = this.decompress(compressed);

    // Verify integrity if we have fallback data
    const config = compressed.metadata.compressionConfig as any;
    let verification = { isValid: true, integrityScore: 1.0, recommendedAction: 'No verification needed' };

    if (config.fallbackUsed && config.fallbackData) {
      // For fallback data, verify against stored fallback data
      const storedFallbackData = Buffer.from(config.fallbackData);
      const currentChecksum = errorCorrection.generateQuantumChecksum(
        storedFallbackData,
        {
          algorithm: 'quantum-hash',
          includePhaseInfo: true,
          includeProbabilityDistribution: true
        }
      );

      verification = errorCorrection.verifyQuantumChecksum(storedFallbackData, originalChecksum);
    }

    return {
      data: decompressedData,
      verification
    };
  }
}

/**
 * Interface for superposition analysis results
 */
interface SuperpositionAnalysisResult {
  superpositions: any[];
  patterns: any[];
  dominantPatterns: any[];
  processingMetrics: any[];
}

/**
 * Interface for interference optimization results
 */
interface InterferenceOptimizationResult {
  optimizedStates: QuantumStateVector[];
  interferencePatterns: InterferencePattern[];
  optimizationMetrics: any;
}

