/**
 * Large Scale Performance Tests
 * Task 12.2: Add performance benchmarking and quantum simulation validation
 * 
 * This test suite covers scalability tests for very large files (1GB+).
 * These tests are separated because they take significant time and resources.
 * 
 * To run these tests specifically:
 * npm test -- --testNamePattern="Large Scale Performance"
 * 
 * Requirements: 3.1, 3.2, 5.4
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { QuantumCompressionEngine } from '../core/QuantumCompressionEngine';
import { QuantumConfig } from '../models/QuantumConfig';

interface LargeScaleMetrics {
  fileSize: number;
  compressionTime: number;
  decompressionTime: number;
  peakMemoryUsage: number;
  compressionRatio: number;
  throughputMBps: number;
  quantumStatesGenerated: number;
  entanglementPairsFound: number;
}

describe('Large Scale Performance Tests', () => {
  let engine: QuantumCompressionEngine;
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quantumflow-largescale-'));
    engine = new QuantumCompressionEngine();
    
    // Set longer timeout for large file tests
    jest.setTimeout(300000); // 5 minutes
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Multi-Megabyte File Handling', () => {
    const largeSizes = [
      { name: '10MB', size: 10 * 1024 * 1024 },
      { name: '50MB', size: 50 * 1024 * 1024 },
      { name: '100MB', size: 100 * 1024 * 1024 }
    ];

    largeSizes.forEach(({ name, size }) => {
      it(`should handle ${name} files with reasonable performance`, async () => {
        console.log(`\nStarting ${name} performance test...`);
        
        // Generate large test data with patterns that benefit from quantum compression
        const testData = generateLargeTestData(size, 'structured-repetitive');
        
        const initialMemory = process.memoryUsage();
        console.log(`Initial memory: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        
        // Compression phase
        const compressionStart = performance.now();
        const compressed = engine.compress(testData);
        const compressionTime = performance.now() - compressionStart;
        
        const afterCompressionMemory = process.memoryUsage();
        console.log(`After compression memory: ${(afterCompressionMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        
        // Decompression phase
        const decompressionStart = performance.now();
        const decompressed = engine.decompress(compressed);
        const decompressionTime = performance.now() - decompressionStart;
        
        const afterDecompressionMemory = process.memoryUsage();
        console.log(`After decompression memory: ${(afterDecompressionMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        
        // Verify correctness
        expect(decompressed.length).toBe(testData.length);
        
        // For very large files, we'll do a checksum comparison instead of full buffer comparison
        // to avoid memory issues in the test
        const originalChecksum = calculateSimpleChecksum(testData);
        const decompressedChecksum = calculateSimpleChecksum(decompressed);
        expect(decompressedChecksum).toBe(originalChecksum);
        
        const stats = compressed.getCompressionStats();
        const peakMemory = Math.max(afterCompressionMemory.heapUsed, afterDecompressionMemory.heapUsed);
        const throughputMBps = (size / compressionTime) * 1000 / 1024 / 1024;
        
        const metrics: LargeScaleMetrics = {
          fileSize: size,
          compressionTime,
          decompressionTime,
          peakMemoryUsage: peakMemory - initialMemory.heapUsed,
          compressionRatio: stats.compressionRatio,
          throughputMBps,
          quantumStatesGenerated: compressed.quantumStates.length,
          entanglementPairsFound: compressed.entanglementMap.size
        };
        
        console.log(`\n${name} Performance Results:`);
        console.log(`  Compression time: ${(compressionTime / 1000).toFixed(2)} seconds`);
        console.log(`  Decompression time: ${(decompressionTime / 1000).toFixed(2)} seconds`);
        console.log(`  Peak memory usage: ${(metrics.peakMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Compression ratio: ${metrics.compressionRatio.toFixed(2)}%`);
        console.log(`  Throughput: ${throughputMBps.toFixed(2)} MB/s`);
        console.log(`  Quantum states: ${metrics.quantumStatesGenerated}`);
        console.log(`  Entanglement pairs: ${metrics.entanglementPairsFound}`);
        
        // Performance expectations for large files
        expect(compressionTime).toBeLessThan(120000); // 2 minutes max
        expect(decompressionTime).toBeLessThan(60000); // 1 minute max
        expect(throughputMBps).toBeGreaterThan(0.1); // At least 0.1 MB/s
        
        // Memory usage should be reasonable (not more than 5x the file size)
        expect(metrics.peakMemoryUsage).toBeLessThan(size * 5);
        
        // Should achieve some compression
        expect(metrics.compressionRatio).toBeGreaterThan(0);
        
        // Should generate quantum states
        expect(metrics.quantumStatesGenerated).toBeGreaterThan(0);
      });
    });
  });

  describe('Gigabyte Scale Testing', () => {
    // Note: These tests are very resource intensive and should only be run
    // in environments with sufficient memory and time
    const gigabyteSizes = [
      { name: '1GB', size: 1024 * 1024 * 1024, skip: process.env.SKIP_LARGE_TESTS === 'true' }
    ];

    gigabyteSizes.forEach(({ name, size, skip }) => {
      const testFn = skip ? it.skip : it;
      
      testFn(`should handle ${name} files with quantum compression`, async () => {
        console.log(`\nStarting ${name} performance test (this may take several minutes)...`);
        
        // Use streaming approach for very large files to manage memory
        const testFilePath = path.join(tempDir, 'large-test-file.bin');
        const compressedFilePath = path.join(tempDir, 'large-test-file.qf');
        
        // Generate large file on disk
        console.log('Generating large test file...');
        await generateLargeFileOnDisk(testFilePath, size, 'mixed-patterns');
        
        const initialMemory = process.memoryUsage();
        console.log(`Initial memory: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        
        // Read and compress in chunks to manage memory
        const chunkSize = 10 * 1024 * 1024; // 10MB chunks
        const chunks: Buffer[] = [];
        const compressedChunks: any[] = [];
        
        const compressionStart = performance.now();
        
        // Process file in chunks
        const fileHandle = fs.openSync(testFilePath, 'r');
        let bytesRead = 0;
        
        try {
          while (bytesRead < size) {
            const remainingBytes = size - bytesRead;
            const currentChunkSize = Math.min(chunkSize, remainingBytes);
            const chunk = Buffer.alloc(currentChunkSize);
            
            fs.readSync(fileHandle, chunk, 0, currentChunkSize, bytesRead);
            
            // Compress chunk
            const compressedChunk = engine.compress(chunk);
            compressedChunks.push(compressedChunk);
            
            bytesRead += currentChunkSize;
            
            if (bytesRead % (100 * 1024 * 1024) === 0) {
              console.log(`Processed ${(bytesRead / 1024 / 1024).toFixed(0)} MB...`);
            }
          }
        } finally {
          fs.closeSync(fileHandle);
        }
        
        const compressionTime = performance.now() - compressionStart;
        const afterCompressionMemory = process.memoryUsage();
        
        console.log(`Compression completed in ${(compressionTime / 1000).toFixed(2)} seconds`);
        console.log(`Memory after compression: ${(afterCompressionMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        
        // Decompression phase
        const decompressionStart = performance.now();
        const decompressedFilePath = path.join(tempDir, 'large-test-file-decompressed.bin');
        const decompressedHandle = fs.openSync(decompressedFilePath, 'w');
        
        try {
          for (let i = 0; i < compressedChunks.length; i++) {
            const decompressedChunk = engine.decompress(compressedChunks[i]);
            fs.writeSync(decompressedHandle, decompressedChunk);
            
            if ((i + 1) % 10 === 0) {
              console.log(`Decompressed ${i + 1}/${compressedChunks.length} chunks...`);
            }
          }
        } finally {
          fs.closeSync(decompressedHandle);
        }
        
        const decompressionTime = performance.now() - decompressionStart;
        const afterDecompressionMemory = process.memoryUsage();
        
        console.log(`Decompression completed in ${(decompressionTime / 1000).toFixed(2)} seconds`);
        
        // Verify file integrity
        const originalStats = fs.statSync(testFilePath);
        const decompressedStats = fs.statSync(decompressedFilePath);
        
        expect(decompressedStats.size).toBe(originalStats.size);
        
        // Calculate checksums for verification
        const originalChecksum = await calculateFileChecksum(testFilePath);
        const decompressedChecksum = await calculateFileChecksum(decompressedFilePath);
        
        expect(decompressedChecksum).toBe(originalChecksum);
        
        // Calculate overall metrics
        const totalCompressionRatio = calculateOverallCompressionRatio(compressedChunks, size);
        const peakMemory = Math.max(afterCompressionMemory.heapUsed, afterDecompressionMemory.heapUsed);
        const throughputMBps = (size / compressionTime) * 1000 / 1024 / 1024;
        
        const totalQuantumStates = compressedChunks.reduce((sum, chunk) => sum + chunk.quantumStates.length, 0);
        const totalEntanglementPairs = compressedChunks.reduce((sum, chunk) => sum + chunk.entanglementMap.size, 0);
        
        console.log(`\n${name} Performance Results:`);
        console.log(`  Total compression time: ${(compressionTime / 1000).toFixed(2)} seconds`);
        console.log(`  Total decompression time: ${(decompressionTime / 1000).toFixed(2)} seconds`);
        console.log(`  Peak memory usage: ${(peakMemory / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Overall compression ratio: ${totalCompressionRatio.toFixed(2)}%`);
        console.log(`  Average throughput: ${throughputMBps.toFixed(2)} MB/s`);
        console.log(`  Total quantum states: ${totalQuantumStates}`);
        console.log(`  Total entanglement pairs: ${totalEntanglementPairs}`);
        
        // Performance expectations for gigabyte files
        expect(compressionTime).toBeLessThan(600000); // 10 minutes max
        expect(decompressionTime).toBeLessThan(300000); // 5 minutes max
        expect(throughputMBps).toBeGreaterThan(0.05); // At least 0.05 MB/s
        
        // Memory usage should be reasonable for chunked processing
        const memoryUsage = peakMemory - initialMemory.heapUsed;
        expect(memoryUsage).toBeLessThan(500 * 1024 * 1024); // Less than 500MB peak memory
        
        // Should achieve some compression
        expect(totalCompressionRatio).toBeGreaterThan(0);
        
        // Clean up large files
        [testFilePath, compressedFilePath, decompressedFilePath].forEach(filePath => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      });
    });
  });

  describe('Memory Stress Testing', () => {
    it('should handle memory pressure gracefully', async () => {
      // Create multiple large datasets to stress memory
      const datasets: Buffer[] = [];
      const datasetSize = 5 * 1024 * 1024; // 5MB each
      const numDatasets = 10;
      
      console.log(`Creating ${numDatasets} datasets of ${datasetSize / 1024 / 1024}MB each...`);
      
      for (let i = 0; i < numDatasets; i++) {
        datasets.push(generateLargeTestData(datasetSize, 'random'));
      }
      
      const initialMemory = process.memoryUsage();
      const compressionTimes: number[] = [];
      const memoryUsages: number[] = [];
      
      // Compress all datasets
      for (let i = 0; i < datasets.length; i++) {
        const startTime = performance.now();
        const memoryBefore = process.memoryUsage().heapUsed;
        
        const compressed = engine.compress(datasets[i]);
        const decompressed = engine.decompress(compressed);
        
        const endTime = performance.now();
        const memoryAfter = process.memoryUsage().heapUsed;
        
        // Verify correctness
        expect(decompressed.length).toBe(datasets[i].length);
        
        compressionTimes.push(endTime - startTime);
        memoryUsages.push(memoryAfter - memoryBefore);
        
        console.log(`Dataset ${i + 1}/${numDatasets}: ${(endTime - startTime).toFixed(2)}ms, ${((memoryAfter - memoryBefore) / 1024 / 1024).toFixed(2)}MB`);
      }
      
      const avgTime = compressionTimes.reduce((sum, time) => sum + time, 0) / compressionTimes.length;
      const avgMemory = memoryUsages.reduce((sum, mem) => sum + mem, 0) / memoryUsages.length;
      const maxTime = Math.max(...compressionTimes);
      const maxMemory = Math.max(...memoryUsages);
      
      console.log(`\nMemory Stress Test Results:`);
      console.log(`  Average time per dataset: ${avgTime.toFixed(2)}ms`);
      console.log(`  Maximum time per dataset: ${maxTime.toFixed(2)}ms`);
      console.log(`  Average memory per dataset: ${(avgMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Maximum memory per dataset: ${(maxMemory / 1024 / 1024).toFixed(2)}MB`);
      
      // Performance should remain consistent under memory pressure
      expect(maxTime).toBeLessThan(avgTime * 2); // Max time shouldn't be more than 2x average
      expect(avgTime).toBeLessThan(10000); // Average should be under 10 seconds
      
      // Memory usage should be reasonable
      expect(avgMemory).toBeLessThan(datasetSize * 5); // Not more than 5x the dataset size
    });
  });

  describe('Long-Running Stability Tests', () => {
    it('should maintain performance over extended operation', async () => {
      const testData = generateLargeTestData(1024 * 1024, 'structured'); // 1MB
      const iterations = 50;
      
      const performanceMetrics: Array<{
        iteration: number;
        compressionTime: number;
        decompressionTime: number;
        memoryUsage: number;
        compressionRatio: number;
      }> = [];
      
      console.log(`Running ${iterations} iterations of 1MB compression/decompression...`);
      
      for (let i = 0; i < iterations; i++) {
        const memoryBefore = process.memoryUsage().heapUsed;
        
        const compressionStart = performance.now();
        const compressed = engine.compress(testData);
        const compressionTime = performance.now() - compressionStart;
        
        const decompressionStart = performance.now();
        const decompressed = engine.decompress(compressed);
        const decompressionTime = performance.now() - decompressionStart;
        
        const memoryAfter = process.memoryUsage().heapUsed;
        
        // Verify correctness
        expect(decompressed.length).toBe(testData.length);
        
        const stats = compressed.getCompressionStats();
        
        performanceMetrics.push({
          iteration: i + 1,
          compressionTime,
          decompressionTime,
          memoryUsage: memoryAfter - memoryBefore,
          compressionRatio: stats.compressionRatio
        });
        
        if ((i + 1) % 10 === 0) {
          console.log(`Completed ${i + 1}/${iterations} iterations`);
        }
      }
      
      // Analyze performance stability
      const compressionTimes = performanceMetrics.map(m => m.compressionTime);
      const decompressionTimes = performanceMetrics.map(m => m.decompressionTime);
      const memoryUsages = performanceMetrics.map(m => m.memoryUsage);
      
      const avgCompressionTime = compressionTimes.reduce((sum, time) => sum + time, 0) / iterations;
      const avgDecompressionTime = decompressionTimes.reduce((sum, time) => sum + time, 0) / iterations;
      const avgMemoryUsage = memoryUsages.reduce((sum, mem) => sum + mem, 0) / iterations;
      
      const compressionTimeVariance = calculateVariance(compressionTimes);
      const decompressionTimeVariance = calculateVariance(decompressionTimes);
      const memoryVariance = calculateVariance(memoryUsages);
      
      console.log(`\nLong-Running Stability Results:`);
      console.log(`  Average compression time: ${avgCompressionTime.toFixed(2)}ms (variance: ${compressionTimeVariance.toFixed(2)})`);
      console.log(`  Average decompression time: ${avgDecompressionTime.toFixed(2)}ms (variance: ${decompressionTimeVariance.toFixed(2)})`);
      console.log(`  Average memory usage: ${(avgMemoryUsage / 1024 / 1024).toFixed(2)}MB (variance: ${(memoryVariance / 1024 / 1024).toFixed(2)})`);
      
      // Performance should be stable (low variance)
      const compressionTimeStdDev = Math.sqrt(compressionTimeVariance);
      const decompressionTimeStdDev = Math.sqrt(decompressionTimeVariance);
      
      expect(compressionTimeStdDev).toBeLessThan(avgCompressionTime * 0.5); // StdDev < 50% of mean
      expect(decompressionTimeStdDev).toBeLessThan(avgDecompressionTime * 0.5); // StdDev < 50% of mean
      
      // No significant performance degradation over time
      const firstHalfAvg = compressionTimes.slice(0, iterations / 2).reduce((sum, time) => sum + time, 0) / (iterations / 2);
      const secondHalfAvg = compressionTimes.slice(iterations / 2).reduce((sum, time) => sum + time, 0) / (iterations / 2);
      
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 1.5); // Second half shouldn't be more than 50% slower
    });
  });

  // Helper functions
  function generateLargeTestData(size: number, type: 'structured-repetitive' | 'mixed-patterns' | 'random'): Buffer {
    const data = Buffer.alloc(size);
    
    switch (type) {
      case 'structured-repetitive':
        // Create data with repeating patterns that should compress well
        const pattern = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < size; i++) {
          data[i] = pattern.charCodeAt(i % pattern.length);
        }
        break;
      
      case 'mixed-patterns':
        // Mix of structured and random data
        for (let i = 0; i < size; i++) {
          if (i % 1000 < 500) {
            // Structured section
            data[i] = 0x41 + (i % 26); // A-Z
          } else if (i % 1000 < 750) {
            // Repetitive section
            data[i] = 0xAA;
          } else {
            // Random section
            data[i] = Math.floor(Math.random() * 256);
          }
        }
        break;
      
      case 'random':
        // Completely random data (hardest to compress)
        for (let i = 0; i < size; i++) {
          data[i] = Math.floor(Math.random() * 256);
        }
        break;
    }
    
    return data;
  }

  async function generateLargeFileOnDisk(filePath: string, size: number, type: 'mixed-patterns'): Promise<void> {
    const writeStream = fs.createWriteStream(filePath);
    const chunkSize = 1024 * 1024; // 1MB chunks
    let bytesWritten = 0;
    
    return new Promise((resolve, reject) => {
      const writeNextChunk = () => {
        const remainingBytes = size - bytesWritten;
        const currentChunkSize = Math.min(chunkSize, remainingBytes);
        
        if (currentChunkSize <= 0) {
          writeStream.end();
          resolve();
          return;
        }
        
        const chunk = generateLargeTestData(currentChunkSize, type);
        writeStream.write(chunk, (error) => {
          if (error) {
            reject(error);
            return;
          }
          
          bytesWritten += currentChunkSize;
          setImmediate(writeNextChunk);
        });
      };
      
      writeNextChunk();
    });
  }

  function calculateSimpleChecksum(data: Buffer): number {
    let checksum = 0;
    for (let i = 0; i < data.length; i++) {
      checksum = (checksum + data[i]) % 0xFFFFFFFF;
    }
    return checksum;
  }

  async function calculateFileChecksum(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath);
      let checksum = 0;
      
      readStream.on('data', (chunk: Buffer) => {
        for (let i = 0; i < chunk.length; i++) {
          checksum = (checksum + chunk[i]) % 0xFFFFFFFF;
        }
      });
      
      readStream.on('end', () => {
        resolve(checksum);
      });
      
      readStream.on('error', reject);
    });
  }

  function calculateOverallCompressionRatio(compressedChunks: any[], originalSize: number): number {
    const totalCompressedSize = compressedChunks.reduce((sum, chunk) => {
      const stats = chunk.getCompressionStats();
      return sum + stats.compressedSize;
    }, 0);
    
    return ((originalSize - totalCompressedSize) / originalSize) * 100;
  }

  function calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }
});