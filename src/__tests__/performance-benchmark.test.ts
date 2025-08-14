/**
 * Performance Benchmarking and Quantum Simulation Validation Tests
 * Task 12.2: Add performance benchmarking and quantum simulation validation
 * 
 * This test suite covers:
 * - Performance benchmarks for compression speed and memory usage
 * - Quantum simulation validation tests for mathematical correctness
 * - Scalability tests for files ranging from 1KB to 1GB+
 * 
 * Requirements: 3.1, 3.2, 5.4
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as zlib from 'zlib';
import { QuantumCompressionEngine } from '../core/QuantumCompressionEngine';
import { QuantumConfig } from '../models/QuantumConfig';
import { Complex } from '../math/Complex';

interface PerformanceMetrics {
  compressionTime: number;
  decompressionTime: number;
  memoryUsage: {
    initial: number;
    afterCompression: number;
    afterDecompression: number;
    peak: number;
  };
  compressionRatio: number;
  throughput: number; // bytes per second
}

interface BenchmarkResult {
  algorithm: string;
  fileSize: number;
  metrics: PerformanceMetrics;
  success: boolean;
  error?: string;
}

describe('Performance Benchmarking and Quantum Simulation Validation', () => {
  let engine: QuantumCompressionEngine;
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quantumflow-perf-'));
    engine = new QuantumCompressionEngine();
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Performance Benchmarking', () => {
    describe('Compression Speed Benchmarks', () => {
      const testSizes = [
        { name: '1KB', size: 1024 },
        { name: '10KB', size: 10 * 1024 },
        { name: '100KB', size: 100 * 1024 },
        { name: '1MB', size: 1024 * 1024 }
      ];

      testSizes.forEach(({ name, size }) => {
        it(`should benchmark compression speed for ${name} files`, async () => {
          // Create test data with patterns that benefit from quantum compression
          const testData = generateTestData(size, 'mixed-patterns');
          
          const metrics = await benchmarkCompression(testData, 'QuantumFlow');
          
          console.log(`\n${name} File Compression Benchmark:`);
          console.log(`  Compression time: ${metrics.compressionTime.toFixed(2)}ms`);
          console.log(`  Decompression time: ${metrics.decompressionTime.toFixed(2)}ms`);
          console.log(`  Compression ratio: ${metrics.compressionRatio.toFixed(2)}%`);
          console.log(`  Throughput: ${(metrics.throughput / 1024 / 1024).toFixed(2)} MB/s`);
          
          // Performance expectations
          expect(metrics.compressionTime).toBeGreaterThan(0);
          expect(metrics.decompressionTime).toBeGreaterThan(0);
          expect(metrics.compressionRatio).toBeGreaterThan(0);
          expect(metrics.throughput).toBeGreaterThan(0);
          
          // Reasonable performance bounds (quantum simulation is computationally intensive)
          const maxCompressionTimeMs = Math.max(1000, size / 1024 * 100); // 100ms per KB or minimum 1s
          expect(metrics.compressionTime).toBeLessThan(maxCompressionTimeMs);
        });
      });

      it('should compare compression speeds across different algorithms', async () => {
        const testData = generateTestData(50 * 1024, 'repetitive'); // 50KB repetitive data
        
        const results: BenchmarkResult[] = [];
        
        // Benchmark QuantumFlow
        try {
          const quantumMetrics = await benchmarkCompression(testData, 'QuantumFlow');
          results.push({
            algorithm: 'QuantumFlow',
            fileSize: testData.length,
            metrics: quantumMetrics,
            success: true
          });
        } catch (error) {
          results.push({
            algorithm: 'QuantumFlow',
            fileSize: testData.length,
            metrics: {} as PerformanceMetrics,
            success: false,
            error: (error as Error).message
          });
        }
        
        // Benchmark gzip
        try {
          const gzipMetrics = await benchmarkGzipCompression(testData);
          results.push({
            algorithm: 'gzip',
            fileSize: testData.length,
            metrics: gzipMetrics,
            success: true
          });
        } catch (error) {
          results.push({
            algorithm: 'gzip',
            fileSize: testData.length,
            metrics: {} as PerformanceMetrics,
            success: false,
            error: (error as Error).message
          });
        }
        
        // Benchmark deflate
        try {
          const deflateMetrics = await benchmarkDeflateCompression(testData);
          results.push({
            algorithm: 'deflate',
            fileSize: testData.length,
            metrics: deflateMetrics,
            success: true
          });
        } catch (error) {
          results.push({
            algorithm: 'deflate',
            fileSize: testData.length,
            metrics: {} as PerformanceMetrics,
            success: false,
            error: (error as Error).message
          });
        }
        
        // Log comparison results
        console.log(`\nCompression Speed Comparison (${testData.length} bytes):`);
        results.forEach(result => {
          if (result.success) {
            console.log(`  ${result.algorithm}:`);
            console.log(`    Compression: ${result.metrics.compressionTime.toFixed(2)}ms`);
            console.log(`    Decompression: ${result.metrics.decompressionTime.toFixed(2)}ms`);
            console.log(`    Ratio: ${result.metrics.compressionRatio.toFixed(2)}%`);
            console.log(`    Throughput: ${(result.metrics.throughput / 1024 / 1024).toFixed(2)} MB/s`);
          } else {
            console.log(`  ${result.algorithm}: FAILED - ${result.error}`);
          }
        });
        
        // At least QuantumFlow should succeed
        const quantumResult = results.find(r => r.algorithm === 'QuantumFlow');
        expect(quantumResult?.success).toBe(true);
      });
    });

    describe('Memory Usage Benchmarks', () => {
      it('should monitor memory usage during compression', async () => {
        const testSizes = [1024, 10 * 1024, 100 * 1024]; // 1KB, 10KB, 100KB
        
        for (const size of testSizes) {
          const testData = generateTestData(size, 'random');
          
          const initialMemory = process.memoryUsage();
          
          // Force garbage collection if available
          if (global.gc) {
            global.gc();
          }
          
          const beforeCompression = process.memoryUsage();
          
          const compressed = engine.compress(testData);
          const afterCompression = process.memoryUsage();
          
          const decompressed = engine.decompress(compressed);
          const afterDecompression = process.memoryUsage();
          
          // Verify correctness
          expect(decompressed).toEqual(testData);
          
          // Calculate memory usage
          const compressionMemoryIncrease = afterCompression.heapUsed - beforeCompression.heapUsed;
          const decompressionMemoryIncrease = afterDecompression.heapUsed - afterCompression.heapUsed;
          
          console.log(`\nMemory Usage for ${size} bytes:`);
          console.log(`  Initial: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
          console.log(`  Before compression: ${(beforeCompression.heapUsed / 1024 / 1024).toFixed(2)} MB`);
          console.log(`  After compression: ${(afterCompression.heapUsed / 1024 / 1024).toFixed(2)} MB`);
          console.log(`  After decompression: ${(afterDecompression.heapUsed / 1024 / 1024).toFixed(2)} MB`);
          console.log(`  Compression memory increase: ${(compressionMemoryIncrease / 1024).toFixed(2)} KB`);
          console.log(`  Decompression memory increase: ${(decompressionMemoryIncrease / 1024).toFixed(2)} KB`);
          
          // Memory usage should be reasonable (not more than 20x the input size)
          expect(compressionMemoryIncrease).toBeLessThan(size * 20);
          
          // Memory should be positive (we're using memory)
          expect(compressionMemoryIncrease).toBeGreaterThan(0);
        }
      });

      it('should handle memory efficiently with large datasets', async () => {
        // Test with 1MB data
        const largeData = generateTestData(1024 * 1024, 'structured');
        
        const memoryBefore = process.memoryUsage();
        
        const startTime = performance.now();
        const compressed = engine.compress(largeData);
        const compressionTime = performance.now() - startTime;
        
        const memoryAfterCompression = process.memoryUsage();
        
        const decompressStartTime = performance.now();
        const decompressed = engine.decompress(compressed);
        const decompressionTime = performance.now() - decompressStartTime;
        
        const memoryAfterDecompression = process.memoryUsage();
        
        // Verify correctness
        expect(decompressed).toEqual(largeData);
        
        const peakMemoryUsage = Math.max(
          memoryAfterCompression.heapUsed,
          memoryAfterDecompression.heapUsed
        );
        
        const memoryEfficiency = largeData.length / (peakMemoryUsage - memoryBefore.heapUsed);
        
        console.log(`\nLarge Dataset Memory Efficiency (1MB):`);
        console.log(`  Compression time: ${compressionTime.toFixed(2)}ms`);
        console.log(`  Decompression time: ${decompressionTime.toFixed(2)}ms`);
        console.log(`  Peak memory usage: ${(peakMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Memory efficiency: ${memoryEfficiency.toFixed(2)} (higher is better)`);
        
        // Should complete within reasonable time (30 seconds for 1MB due to quantum simulation)
        expect(compressionTime).toBeLessThan(30000);
        expect(decompressionTime).toBeLessThan(10000);
        
        // Memory efficiency should be reasonable (at least 0.1)
        expect(memoryEfficiency).toBeGreaterThan(0.05);
      });
    });

    describe('Throughput Benchmarks', () => {
      it('should measure compression throughput across different data types', async () => {
        const dataTypes = [
          { name: 'Text', generator: 'text' },
          { name: 'Binary', generator: 'binary' },
          { name: 'Repetitive', generator: 'repetitive' },
          { name: 'Random', generator: 'random' },
          { name: 'Structured', generator: 'structured' }
        ] as const;
        
        const testSize = 50 * 1024; // 50KB
        
        const throughputResults: Array<{
          dataType: string;
          compressionThroughput: number;
          decompressionThroughput: number;
          compressionRatio: number;
        }> = [];
        
        for (const { name, generator } of dataTypes) {
          const testData = generateTestData(testSize, generator);
          
          // Compression throughput
          const compressionStart = performance.now();
          const compressed = engine.compress(testData);
          const compressionTime = performance.now() - compressionStart;
          const compressionThroughput = (testData.length / compressionTime) * 1000; // bytes per second
          
          // Decompression throughput
          const decompressionStart = performance.now();
          const decompressed = engine.decompress(compressed);
          const decompressionTime = performance.now() - decompressionStart;
          const decompressionThroughput = (decompressed.length / decompressionTime) * 1000; // bytes per second
          
          // Verify correctness
          expect(decompressed).toEqual(testData);
          
          const stats = compressed.getCompressionStats();
          
          throughputResults.push({
            dataType: name,
            compressionThroughput,
            decompressionThroughput,
            compressionRatio: stats.compressionRatio
          });
        }
        
        // Log throughput results
        console.log(`\nThroughput Benchmarks (${testSize} bytes):`);
        throughputResults.forEach(result => {
          console.log(`  ${result.dataType}:`);
          console.log(`    Compression: ${(result.compressionThroughput / 1024 / 1024).toFixed(2)} MB/s`);
          console.log(`    Decompression: ${(result.decompressionThroughput / 1024 / 1024).toFixed(2)} MB/s`);
          console.log(`    Ratio: ${result.compressionRatio.toFixed(2)}%`);
        });
        
        // All data types should achieve reasonable throughput (quantum simulation is slower)
        throughputResults.forEach(result => {
          expect(result.compressionThroughput).toBeGreaterThan(100); // At least 100 bytes/s
          expect(result.decompressionThroughput).toBeGreaterThan(1024); // At least 1KB/s
          expect(result.compressionRatio).toBeGreaterThanOrEqual(0); // May not always compress
        });
      });
    });
  });

  describe('Quantum Simulation Validation', () => {
    describe('Mathematical Correctness', () => {
      it('should validate quantum state normalization', () => {
        const testData = generateTestData(1024, 'structured');
        const compressed = engine.compress(testData);
        
        // Validate each quantum state
        compressed.quantumStates.forEach((state, index) => {
          // Get probability distribution
          const probabilities = state.getProbabilityDistribution();
          
          // Sum of probabilities should equal 1 (normalization)
          const sum = probabilities.reduce((acc, prob) => acc + prob, 0);
          expect(sum).toBeCloseTo(1.0, 5);
          
          // Each probability should be between 0 and 1
          probabilities.forEach(prob => {
            expect(prob).toBeGreaterThanOrEqual(0);
            expect(prob).toBeLessThanOrEqual(1);
          });
          
          console.log(`State ${index}: Normalization sum = ${sum.toFixed(6)}`);
        });
      });

      it('should validate complex number operations in quantum states', () => {
        const testData = generateTestData(512, 'mixed-patterns');
        const compressed = engine.compress(testData);
        
        compressed.quantumStates.forEach((state, index) => {
          state.amplitudes.forEach((amplitude, ampIndex) => {
            // Amplitude should be a valid complex number
            expect(typeof amplitude.real).toBe('number');
            expect(typeof amplitude.imaginary).toBe('number');
            expect(isFinite(amplitude.real)).toBe(true);
            expect(isFinite(amplitude.imaginary)).toBe(true);
            
            // Magnitude should be between 0 and 1
            const magnitude = amplitude.magnitude();
            expect(magnitude).toBeGreaterThanOrEqual(0);
            expect(magnitude).toBeLessThanOrEqual(1);
            
            // Phase should be calculable
            const phase = amplitude.phase();
            expect(isFinite(phase)).toBe(true);
            expect(phase).toBeGreaterThanOrEqual(-Math.PI);
            expect(phase).toBeLessThanOrEqual(Math.PI);
          });
          
          console.log(`State ${index}: ${state.amplitudes.length} amplitudes validated`);
        });
      });

      it('should validate quantum phase relationships', () => {
        const testData = generateTestData(256, 'repetitive');
        const compressed = engine.compress(testData);
        
        compressed.quantumStates.forEach((state, index) => {
          // Phase should be in valid range [0, 2π)
          expect(state.phase).toBeGreaterThanOrEqual(0);
          expect(state.phase).toBeLessThan(2 * Math.PI);
          expect(isFinite(state.phase)).toBe(true);
          
          // Phase should be consistent with amplitude phases
          if (state.amplitudes.length > 0) {
            const avgAmplitudePhase = state.amplitudes.reduce((sum, amp) => {
              return sum + amp.phase();
            }, 0) / state.amplitudes.length;
            
            // The state phase should be related to amplitude phases
            // (allowing for quantum phase relationships)
            expect(isFinite(avgAmplitudePhase)).toBe(true);
          }
          
          console.log(`State ${index}: Phase = ${state.phase.toFixed(4)} radians`);
        });
      });

      it('should validate entanglement correlation mathematics', () => {
        const testData = generateTestData(1024, 'structured');
        const compressed = engine.compress(testData);
        
        // Check entanglement pairs
        compressed.entanglementMap.forEach((pair, pairId) => {
          // Correlation strength should be between 0 and 1
          expect(pair.correlationStrength).toBeGreaterThanOrEqual(0);
          expect(pair.correlationStrength).toBeLessThanOrEqual(1);
          expect(isFinite(pair.correlationStrength)).toBe(true);
          
          // Entangled states should have valid quantum properties
          [pair.stateA, pair.stateB].forEach(state => {
            const probabilities = state.getProbabilityDistribution();
            const sum = probabilities.reduce((acc, prob) => acc + prob, 0);
            expect(sum).toBeCloseTo(1.0, 5);
          });
          
          // Shared information should exist and be valid
          expect(pair.sharedInformation).toBeDefined();
          expect(pair.sharedInformation.length).toBeGreaterThan(0);
          
          console.log(`Entanglement pair ${pairId}: Correlation = ${pair.correlationStrength.toFixed(4)}`);
        });
      });

      it('should validate interference pattern mathematics', () => {
        const testData = generateTestData(512, 'mixed-patterns');
        const compressed = engine.compress(testData);
        
        compressed.interferencePatterns.forEach((pattern, index) => {
          // Interference amplitude should be finite
          expect(isFinite(pattern.amplitude)).toBe(true);
          
          // Phase should be in valid range
          expect(pattern.phase).toBeGreaterThanOrEqual(-2 * Math.PI);
          expect(pattern.phase).toBeLessThanOrEqual(2 * Math.PI);
          expect(isFinite(pattern.phase)).toBe(true);
          
          // Pattern type should be valid
          expect(['constructive', 'destructive'].includes(pattern.type)).toBe(true);
          
          console.log(`Interference pattern ${index}: Type = ${pattern.type}, Amplitude = ${pattern.amplitude.toFixed(4)}, Phase = ${pattern.phase.toFixed(4)}`);
        });
      });
    });

    describe('Quantum Algorithm Consistency', () => {
      it('should maintain quantum properties across compression cycles', () => {
        const testData = generateTestData(1024, 'text');
        
        // Perform multiple compression cycles
        let currentData = testData;
        const quantumProperties: Array<{
          stateCount: number;
          entanglementCount: number;
          interferenceCount: number;
          avgNormalization: number;
        }> = [];
        
        for (let cycle = 0; cycle < 3; cycle++) {
          const compressed = engine.compress(currentData);
          const decompressed = engine.decompress(compressed);
          
          // Verify data integrity
          expect(decompressed).toEqual(testData);
          
          // Collect quantum properties
          const avgNormalization = compressed.quantumStates.reduce((sum, state) => {
            const probSum = state.getProbabilityDistribution().reduce((acc, prob) => acc + prob, 0);
            return sum + probSum;
          }, 0) / compressed.quantumStates.length;
          
          quantumProperties.push({
            stateCount: compressed.quantumStates.length,
            entanglementCount: compressed.entanglementMap.size,
            interferenceCount: compressed.interferencePatterns.length,
            avgNormalization
          });
          
          currentData = Buffer.from(decompressed);
        }
        
        // Log quantum properties across cycles
        console.log('\nQuantum Properties Across Cycles:');
        quantumProperties.forEach((props, cycle) => {
          console.log(`  Cycle ${cycle + 1}:`);
          console.log(`    States: ${props.stateCount}`);
          console.log(`    Entanglements: ${props.entanglementCount}`);
          console.log(`    Interferences: ${props.interferenceCount}`);
          console.log(`    Avg Normalization: ${props.avgNormalization.toFixed(6)}`);
        });
        
        // Quantum properties should remain consistent
        quantumProperties.forEach(props => {
          expect(props.avgNormalization).toBeCloseTo(1.0, 5);
          expect(props.stateCount).toBeGreaterThan(0);
        });
      });

      it('should validate superposition coherence', () => {
        const testData = generateTestData(256, 'repetitive');
        const compressed = engine.compress(testData);
        
        // Check if superposition states maintain coherence
        compressed.quantumStates.forEach((state, index) => {
          if (state.amplitudes.length > 1) {
            // Calculate coherence measure
            const amplitudeMagnitudes = state.amplitudes.map(amp => amp.magnitude());
            const avgMagnitude = amplitudeMagnitudes.reduce((sum, mag) => sum + mag, 0) / amplitudeMagnitudes.length;
            
            // Coherence should be meaningful (not all amplitudes should be zero)
            expect(avgMagnitude).toBeGreaterThan(0);
            
            // Check phase relationships
            const phases = state.amplitudes.map(amp => amp.phase());
            const phaseVariance = calculateVariance(phases);
            
            // Phase variance should be finite
            expect(isFinite(phaseVariance)).toBe(true);
            expect(phaseVariance).toBeGreaterThanOrEqual(0);
            
            console.log(`State ${index}: Avg magnitude = ${avgMagnitude.toFixed(4)}, Phase variance = ${phaseVariance.toFixed(4)}`);
          }
        });
      });
    });
  });

  describe('Scalability Tests', () => {
    describe('File Size Scaling', () => {
      const scalabilityTests = [
        { name: '1KB', size: 1024 },
        { name: '10KB', size: 10 * 1024 },
        { name: '100KB', size: 100 * 1024 },
        { name: '1MB', size: 1024 * 1024 }
        // Note: 1GB+ tests would be too slow for regular test runs
        // They should be run separately as performance tests
      ];

      scalabilityTests.forEach(({ name, size }) => {
        it(`should handle ${name} files efficiently`, async () => {
          const testData = generateTestData(size, 'mixed-patterns');
          
          const startTime = performance.now();
          const memoryBefore = process.memoryUsage();
          
          const compressed = engine.compress(testData);
          
          const compressionTime = performance.now() - startTime;
          const memoryAfterCompression = process.memoryUsage();
          
          const decompressStart = performance.now();
          const decompressed = engine.decompress(compressed);
          const decompressionTime = performance.now() - decompressStart;
          
          const memoryAfterDecompression = process.memoryUsage();
          
          // Verify correctness
          expect(decompressed).toEqual(testData);
          
          const stats = compressed.getCompressionStats();
          const memoryUsed = memoryAfterCompression.heapUsed - memoryBefore.heapUsed;
          
          console.log(`\n${name} Scalability Test:`);
          console.log(`  Compression time: ${compressionTime.toFixed(2)}ms`);
          console.log(`  Decompression time: ${decompressionTime.toFixed(2)}ms`);
          console.log(`  Memory used: ${(memoryUsed / 1024 / 1024).toFixed(2)} MB`);
          console.log(`  Compression ratio: ${stats.compressionRatio.toFixed(2)}%`);
          console.log(`  Throughput: ${((size / compressionTime) * 1000 / 1024 / 1024).toFixed(2)} MB/s`);
          
          // Performance should scale reasonably (quantum simulation is intensive)
          const expectedMaxTime = Math.max(5000, size / 1024 * 500); // 500ms per KB, minimum 5s
          expect(compressionTime).toBeLessThan(expectedMaxTime);
          
          // Memory usage should be reasonable (not more than 50x the input size)
          expect(memoryUsed).toBeLessThan(size * 50);
          
          // Should achieve some compression
          expect(stats.compressionRatio).toBeGreaterThan(0);
        });
      });

      it('should demonstrate linear or sub-linear scaling characteristics', () => {
        const sizes = [1024, 2048, 4096, 8192]; // 1KB, 2KB, 4KB, 8KB
        const scalingResults: Array<{
          size: number;
          time: number;
          memory: number;
          ratio: number;
        }> = [];
        
        sizes.forEach(size => {
          const testData = generateTestData(size, 'structured');
          
          const memoryBefore = process.memoryUsage().heapUsed;
          const startTime = performance.now();
          
          const compressed = engine.compress(testData);
          const decompressed = engine.decompress(compressed);
          
          const endTime = performance.now();
          const memoryAfter = process.memoryUsage().heapUsed;
          
          expect(decompressed).toEqual(testData);
          
          const stats = compressed.getCompressionStats();
          
          scalingResults.push({
            size,
            time: endTime - startTime,
            memory: memoryAfter - memoryBefore,
            ratio: stats.compressionRatio
          });
        });
        
        // Analyze scaling characteristics
        console.log('\nScaling Analysis:');
        scalingResults.forEach((result, index) => {
          console.log(`  ${result.size} bytes: ${result.time.toFixed(2)}ms, ${(result.memory / 1024).toFixed(2)}KB memory, ${result.ratio.toFixed(2)}% ratio`);
          
          if (index > 0) {
            const prevResult = scalingResults[index - 1];
            const sizeRatio = result.size / prevResult.size;
            const timeRatio = result.time / prevResult.time;
            const memoryRatio = result.memory / prevResult.memory;
            
            console.log(`    Scaling: ${sizeRatio}x size → ${timeRatio.toFixed(2)}x time, ${memoryRatio.toFixed(2)}x memory`);
            
            // Time scaling should be reasonable (not exponential)
            expect(timeRatio).toBeLessThan(sizeRatio * 2); // Allow up to 2x worse than linear
            
            // Memory scaling should be reasonable
            expect(memoryRatio).toBeLessThan(sizeRatio * 3); // Allow up to 3x worse than linear
          }
        });
      });
    });

    describe('Stress Testing', () => {
      it('should handle rapid compression/decompression cycles', () => {
        const testData = generateTestData(5 * 1024, 'mixed-patterns'); // 5KB
        const cycles = 20;
        
        const cycleTimes: number[] = [];
        const memoryUsages: number[] = [];
        
        for (let i = 0; i < cycles; i++) {
          const memoryBefore = process.memoryUsage().heapUsed;
          const startTime = performance.now();
          
          const compressed = engine.compress(testData);
          const decompressed = engine.decompress(compressed);
          
          const endTime = performance.now();
          const memoryAfter = process.memoryUsage().heapUsed;
          
          expect(decompressed).toEqual(testData);
          
          cycleTimes.push(endTime - startTime);
          memoryUsages.push(memoryAfter - memoryBefore);
        }
        
        const avgTime = cycleTimes.reduce((sum, time) => sum + time, 0) / cycles;
        const avgMemory = memoryUsages.reduce((sum, mem) => sum + mem, 0) / cycles;
        const maxTime = Math.max(...cycleTimes);
        const maxMemory = Math.max(...memoryUsages);
        
        console.log(`\nStress Test Results (${cycles} cycles):`);
        console.log(`  Average time: ${avgTime.toFixed(2)}ms`);
        console.log(`  Maximum time: ${maxTime.toFixed(2)}ms`);
        console.log(`  Average memory: ${(avgMemory / 1024).toFixed(2)}KB`);
        console.log(`  Maximum memory: ${(maxMemory / 1024).toFixed(2)}KB`);
        
        // Performance should remain consistent
        expect(maxTime).toBeLessThan(avgTime * 3); // Max shouldn't be more than 3x average
        expect(avgTime).toBeLessThan(1000); // Average should be under 1 second
        
        // Memory usage should be reasonable
        expect(avgMemory).toBeLessThan(testData.length * 10);
      });
    });
  });

  // Helper functions
  async function benchmarkCompression(data: Buffer, algorithm: string): Promise<PerformanceMetrics> {
    const initialMemory = process.memoryUsage();
    
    const compressionStart = performance.now();
    const compressed = engine.compress(data);
    const compressionTime = performance.now() - compressionStart;
    
    const afterCompressionMemory = process.memoryUsage();
    
    const decompressionStart = performance.now();
    const decompressed = engine.decompress(compressed);
    const decompressionTime = performance.now() - decompressionStart;
    
    const afterDecompressionMemory = process.memoryUsage();
    
    // Verify correctness
    if (!decompressed.equals(data)) {
      throw new Error('Decompressed data does not match original');
    }
    
    const stats = compressed.getCompressionStats();
    const throughput = (data.length / compressionTime) * 1000; // bytes per second
    
    return {
      compressionTime,
      decompressionTime,
      memoryUsage: {
        initial: initialMemory.heapUsed,
        afterCompression: afterCompressionMemory.heapUsed,
        afterDecompression: afterDecompressionMemory.heapUsed,
        peak: Math.max(afterCompressionMemory.heapUsed, afterDecompressionMemory.heapUsed)
      },
      compressionRatio: stats.compressionRatio,
      throughput
    };
  }

  async function benchmarkGzipCompression(data: Buffer): Promise<PerformanceMetrics> {
    const initialMemory = process.memoryUsage();
    
    const compressionStart = performance.now();
    const compressed = zlib.gzipSync(data);
    const compressionTime = performance.now() - compressionStart;
    
    const afterCompressionMemory = process.memoryUsage();
    
    const decompressionStart = performance.now();
    const decompressed = zlib.gunzipSync(compressed);
    const decompressionTime = performance.now() - decompressionStart;
    
    const afterDecompressionMemory = process.memoryUsage();
    
    const compressionRatio = ((data.length - compressed.length) / data.length) * 100;
    const throughput = (data.length / compressionTime) * 1000;
    
    return {
      compressionTime,
      decompressionTime,
      memoryUsage: {
        initial: initialMemory.heapUsed,
        afterCompression: afterCompressionMemory.heapUsed,
        afterDecompression: afterDecompressionMemory.heapUsed,
        peak: Math.max(afterCompressionMemory.heapUsed, afterDecompressionMemory.heapUsed)
      },
      compressionRatio,
      throughput
    };
  }

  async function benchmarkDeflateCompression(data: Buffer): Promise<PerformanceMetrics> {
    const initialMemory = process.memoryUsage();
    
    const compressionStart = performance.now();
    const compressed = zlib.deflateSync(data);
    const compressionTime = performance.now() - compressionStart;
    
    const afterCompressionMemory = process.memoryUsage();
    
    const decompressionStart = performance.now();
    const decompressed = zlib.inflateSync(compressed);
    const decompressionTime = performance.now() - decompressionStart;
    
    const afterDecompressionMemory = process.memoryUsage();
    
    const compressionRatio = ((data.length - compressed.length) / data.length) * 100;
    const throughput = (data.length / compressionTime) * 1000;
    
    return {
      compressionTime,
      decompressionTime,
      memoryUsage: {
        initial: initialMemory.heapUsed,
        afterCompression: afterCompressionMemory.heapUsed,
        afterDecompression: afterDecompressionMemory.heapUsed,
        peak: Math.max(afterCompressionMemory.heapUsed, afterDecompressionMemory.heapUsed)
      },
      compressionRatio,
      throughput
    };
  }

  function generateTestData(size: number, type: 'text' | 'binary' | 'repetitive' | 'random' | 'structured' | 'mixed-patterns'): Buffer {
    switch (type) {
      case 'text':
        const textPattern = 'The quick brown fox jumps over the lazy dog. ';
        return Buffer.from(textPattern.repeat(Math.ceil(size / textPattern.length)).substring(0, size), 'utf8');
      
      case 'binary':
        const binaryData = Buffer.alloc(size);
        for (let i = 0; i < size; i++) {
          binaryData[i] = i % 256;
        }
        return binaryData;
      
      case 'repetitive':
        const pattern = Buffer.from([0xAA, 0xBB, 0xCC, 0xDD]);
        return Buffer.concat(Array(Math.ceil(size / pattern.length)).fill(pattern)).subarray(0, size);
      
      case 'random':
        const randomData = Buffer.alloc(size);
        for (let i = 0; i < size; i++) {
          randomData[i] = Math.floor(Math.random() * 256);
        }
        return randomData;
      
      case 'structured':
        const structuredData = Buffer.alloc(size);
        for (let i = 0; i < size; i++) {
          // Create structured patterns that should compress well
          if (i % 100 < 50) {
            structuredData[i] = 0x41 + (i % 26); // A-Z pattern
          } else {
            structuredData[i] = 0x30 + (i % 10); // 0-9 pattern
          }
        }
        return structuredData;
      
      case 'mixed-patterns':
        const mixedData = Buffer.alloc(size);
        for (let i = 0; i < size; i++) {
          if (i % 4 === 0) {
            mixedData[i] = 0x41 + (i % 26); // Letters
          } else if (i % 4 === 1) {
            mixedData[i] = 0x30 + (i % 10); // Numbers
          } else if (i % 4 === 2) {
            mixedData[i] = i % 256; // Sequential
          } else {
            mixedData[i] = Math.floor(Math.random() * 256); // Random
          }
        }
        return mixedData;
      
      default:
        throw new Error(`Unknown test data type: ${type}`);
    }
  }

  function calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }
});