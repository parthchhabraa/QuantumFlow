"use strict";
/**
 * Optimized Quantum Compression Algorithm
 * Task 13.2: Implement memory usage optimizations for large files and fine-tune quantum simulation parameters
 *
 * This module provides optimized compression strategies based on data characteristics and performance profiling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedQuantumCompression = void 0;
const QuantumCompressionEngine_1 = require("./QuantumCompressionEngine");
const QuantumConfig_1 = require("../models/QuantumConfig");
const CompressedQuantumData_1 = require("../models/CompressedQuantumData");
class OptimizedQuantumCompression {
    constructor() {
        this.engine = new QuantumCompressionEngine_1.QuantumCompressionEngine();
        this.strategies = new Map();
        this.initializeStrategies();
    }
    /**
     * Initialize compression strategies optimized for different scenarios
     */
    initializeStrategies() {
        // Ultra-fast strategy for small files
        this.strategies.set('ultra-fast', {
            name: 'Ultra Fast',
            description: 'Minimal quantum simulation for maximum speed',
            config: new QuantumConfig_1.QuantumConfig(2, 1, 1, 0.9),
            memoryLimit: 10 * 1024 * 1024, // 10MB
            timeLimit: 1000, // 1 second
            applicableDataSizes: { min: 0, max: 1024 }
        });
        // Balanced strategy for medium files
        this.strategies.set('balanced', {
            name: 'Balanced',
            description: 'Balance between compression ratio and performance',
            config: new QuantumConfig_1.QuantumConfig(4, 2, 3, 0.6),
            memoryLimit: 50 * 1024 * 1024, // 50MB
            timeLimit: 10000, // 10 seconds
            applicableDataSizes: { min: 1024, max: 100 * 1024 }
        });
        // Memory-optimized strategy for large files
        this.strategies.set('memory-optimized', {
            name: 'Memory Optimized',
            description: 'Optimized for large files with memory constraints',
            config: new QuantumConfig_1.QuantumConfig(3, 1, 2, 0.8),
            memoryLimit: 100 * 1024 * 1024, // 100MB
            timeLimit: 30000, // 30 seconds
            applicableDataSizes: { min: 100 * 1024, max: 10 * 1024 * 1024 }
        });
        // Streaming strategy for very large files
        this.strategies.set('streaming', {
            name: 'Streaming',
            description: 'Chunk-based processing for very large files',
            config: new QuantumConfig_1.QuantumConfig(2, 1, 1, 0.9),
            memoryLimit: 200 * 1024 * 1024, // 200MB
            timeLimit: 120000, // 2 minutes
            applicableDataSizes: { min: 10 * 1024 * 1024, max: Number.MAX_SAFE_INTEGER }
        });
        // High-compression strategy for structured data
        this.strategies.set('high-compression', {
            name: 'High Compression',
            description: 'Maximum compression for structured data',
            config: new QuantumConfig_1.QuantumConfig(6, 4, 5, 0.3),
            memoryLimit: 200 * 1024 * 1024, // 200MB
            timeLimit: 60000, // 1 minute
            applicableDataSizes: { min: 1024, max: 1024 * 1024 }
        });
    }
    /**
     * Select optimal compression strategy based on data characteristics
     */
    selectOptimalStrategy(data, dataType) {
        const dataSize = data.length;
        // Filter strategies by applicable data size
        const applicableStrategies = Array.from(this.strategies.values()).filter(strategy => dataSize >= strategy.applicableDataSizes.min && dataSize <= strategy.applicableDataSizes.max);
        if (applicableStrategies.length === 0) {
            // Fallback to streaming strategy for very large files
            return this.strategies.get('streaming');
        }
        // Analyze data characteristics
        const entropy = this.calculateDataEntropy(data);
        const repetitionRatio = this.calculateRepetitionRatio(data);
        // Select strategy based on data characteristics
        if (dataType === 'structured' || repetitionRatio > 0.3) {
            // Structured data can benefit from higher compression
            const highCompression = applicableStrategies.find(s => s.name === 'High Compression');
            if (highCompression)
                return highCompression;
        }
        if (entropy < 4 && dataSize < 10 * 1024) {
            // Low entropy small data - use balanced approach
            const balanced = applicableStrategies.find(s => s.name === 'Balanced');
            if (balanced)
                return balanced;
        }
        if (dataSize > 1024 * 1024) {
            // Large files - prioritize memory optimization
            const memoryOptimized = applicableStrategies.find(s => s.name === 'Memory Optimized');
            if (memoryOptimized)
                return memoryOptimized;
        }
        // Default to the first applicable strategy
        return applicableStrategies[0];
    }
    /**
     * Compress data using optimal strategy with performance monitoring
     */
    async compressOptimized(data, dataType) {
        const strategy = this.selectOptimalStrategy(data, dataType);
        console.log(`Using compression strategy: ${strategy.name} for ${data.length} bytes`);
        // Configure engine with selected strategy
        this.engine.config = strategy.config;
        // Monitor memory usage
        const initialMemory = process.memoryUsage();
        const startTime = performance.now();
        try {
            // Set memory and time limits
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Compression timeout')), strategy.timeLimit);
            });
            // Perform compression with timeout
            const compressionPromise = this.performCompression(data, strategy);
            const compressed = await Promise.race([compressionPromise, timeoutPromise]);
            const endTime = performance.now();
            const finalMemory = process.memoryUsage();
            const processingTime = endTime - startTime;
            const memoryUsage = finalMemory.heapUsed - initialMemory.heapUsed;
            // Check if memory limit was exceeded
            if (memoryUsage > strategy.memoryLimit) {
                console.warn(`Memory limit exceeded: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB > ${(strategy.memoryLimit / 1024 / 1024).toFixed(2)}MB`);
            }
            const stats = compressed.getCompressionStats();
            return {
                strategy,
                compressionRatio: stats.compressionRatio,
                processingTime,
                memoryUsage,
                success: true
            };
        }
        catch (error) {
            const endTime = performance.now();
            const finalMemory = process.memoryUsage();
            return {
                strategy,
                compressionRatio: 0,
                processingTime: endTime - startTime,
                memoryUsage: finalMemory.heapUsed - initialMemory.heapUsed,
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            };
        }
        finally {
            // Force memory cleanup
            this.engine.forceMemoryCleanup();
        }
    }
    /**
     * Perform compression with memory monitoring
     */
    async performCompression(data, strategy) {
        // Check if we should use streaming compression for very large files
        if (data.length > 10 * 1024 * 1024) {
            return this.performStreamingCompression(data, strategy);
        }
        // Regular compression
        return this.engine.compress(data, strategy.config);
    }
    /**
     * Perform streaming compression for very large files
     */
    async performStreamingCompression(data, strategy) {
        const chunkSize = Math.min(1024 * 1024, data.length / 10); // 1MB chunks or 1/10th of file
        const chunks = [];
        for (let offset = 0; offset < data.length; offset += chunkSize) {
            const chunk = data.subarray(offset, Math.min(offset + chunkSize, data.length));
            // Compress chunk with simplified config for performance
            const chunkConfig = new QuantumConfig_1.QuantumConfig(Math.min(strategy.config.quantumBitDepth, 3), 1, // Minimal entanglement for chunks
            1, // Minimal superposition for chunks
            0.9 // High threshold for performance
            );
            const compressedChunk = this.engine.compress(chunk, chunkConfig);
            chunks.push(compressedChunk);
            // Force cleanup between chunks
            if (chunks.length % 10 === 0) {
                this.engine.forceMemoryCleanup();
            }
        }
        // Combine chunks into single compressed data structure
        return this.combineCompressedChunks(chunks, data.length);
    }
    /**
     * Combine compressed chunks into a single compressed data structure
     */
    combineCompressedChunks(chunks, originalSize) {
        // Combine all quantum states
        const allStates = chunks.flatMap(chunk => chunk.quantumStates);
        // Combine entanglement maps
        const combinedEntanglementMap = new Map();
        chunks.forEach(chunk => {
            chunk.entanglementMap.forEach((value, key) => {
                combinedEntanglementMap.set(key, value);
            });
        });
        // Combine interference patterns
        const allInterferencePatterns = chunks.flatMap(chunk => chunk.interferencePatterns);
        // Create combined compressed data
        return CompressedQuantumData_1.CompressedQuantumData.create(allStates, Array.from(combinedEntanglementMap.values()), allInterferencePatterns, originalSize, {
            streamingCompression: true,
            chunkCount: chunks.length,
            originalData: [] // Don't store original data for streaming compression
        });
    }
    /**
     * Calculate data entropy for optimization decisions
     */
    calculateDataEntropy(data) {
        const frequency = new Map();
        // Count byte frequencies
        for (let i = 0; i < data.length; i++) {
            const byte = data[i];
            frequency.set(byte, (frequency.get(byte) || 0) + 1);
        }
        // Calculate entropy
        let entropy = 0;
        const dataLength = data.length;
        for (const count of frequency.values()) {
            const probability = count / dataLength;
            entropy -= probability * Math.log2(probability);
        }
        return entropy;
    }
    /**
     * Calculate repetition ratio for pattern detection
     */
    calculateRepetitionRatio(data) {
        if (data.length < 4)
            return 0;
        const patterns = new Map();
        let totalPatterns = 0;
        // Look for 4-byte patterns
        for (let i = 0; i <= data.length - 4; i++) {
            const pattern = data.subarray(i, i + 4).toString('hex');
            patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
            totalPatterns++;
        }
        // Calculate repetition ratio
        let repeatedPatterns = 0;
        for (const count of patterns.values()) {
            if (count > 1) {
                repeatedPatterns += count;
            }
        }
        return totalPatterns > 0 ? repeatedPatterns / totalPatterns : 0;
    }
    /**
     * Get available compression strategies
     */
    getAvailableStrategies() {
        return Array.from(this.strategies.values());
    }
    /**
     * Get performance analysis from the engine
     */
    getPerformanceAnalysis() {
        return this.engine.generatePerformanceAnalysis();
    }
    /**
     * Benchmark all strategies against a dataset
     */
    async benchmarkStrategies(data) {
        const results = [];
        for (const strategy of this.strategies.values()) {
            // Skip strategies not applicable to this data size
            if (data.length < strategy.applicableDataSizes.min || data.length > strategy.applicableDataSizes.max) {
                continue;
            }
            console.log(`Benchmarking strategy: ${strategy.name}`);
            try {
                const result = await this.compressOptimized(data);
                results.push(result);
            }
            catch (error) {
                results.push({
                    strategy,
                    compressionRatio: 0,
                    processingTime: 0,
                    memoryUsage: 0,
                    success: false,
                    errorMessage: error instanceof Error ? error.message : 'Benchmark failed'
                });
            }
            // Clean up between benchmarks
            this.engine.forceMemoryCleanup();
            // Add delay to prevent overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return results.sort((a, b) => {
            // Sort by success first, then by compression ratio
            if (a.success !== b.success)
                return a.success ? -1 : 1;
            return b.compressionRatio - a.compressionRatio;
        });
    }
}
exports.OptimizedQuantumCompression = OptimizedQuantumCompression;
//# sourceMappingURL=OptimizedQuantumCompression.js.map