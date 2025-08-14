/**
 * Unit tests for QuantumFlow CLI Batch Processing and Progress Reporting
 */

import { QuantumFlowCLI, CLIOptions, BatchResult, BatchProgress } from '../QuantumFlowCLI';
import { QuantumConfig } from '../../models/QuantumConfig';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock QuantumCompressionEngine
jest.mock('../../core/QuantumCompressionEngine', () => ({
  QuantumCompressionEngine: jest.fn().mockImplementation(() => ({
    compress: jest.fn().mockReturnValue({
      quantumStates: [],
      entanglementMap: new Map(),
      interferencePatterns: [],
      metadata: {
        originalSize: 1000,
        compressionRatio: 25.5,
        quantumEfficiency: 85.2
      },
      checksum: 'test-checksum'
    }),
    decompress: jest.fn().mockReturnValue(Buffer.from('test data'))
  }))
}));

// Mock CompressedQuantumData
jest.mock('../../models/CompressedQuantumData', () => ({
  CompressedQuantumData: jest.fn().mockImplementation(() => ({}))
}));

describe('QuantumFlowCLI Batch Processing', () => {
  let cli: QuantumFlowCLI;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;
  let processStdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    cli = new QuantumFlowCLI();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
    processStdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
    processStdoutSpy.mockRestore();
  });

  describe('File List Expansion', () => {
    it('should expand single file correctly', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as any);

      const expandedFiles = await (cli as any).expandFileList(['test.txt'], {});
      
      expect(expandedFiles).toEqual(['test.txt']);
    });

    it('should handle directory without recursive flag', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);

      const expandedFiles = await (cli as any).expandFileList(['testdir'], {});
      
      expect(expandedFiles).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error: testdir is a directory. Use -r for recursive processing.'
      );
    });

    it('should expand directory recursively when flag is set', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockImplementation((filePath: any) => {
        if (filePath === 'testdir') {
          return { isDirectory: () => true } as any;
        }
        return { isDirectory: () => false } as any;
      });
      mockFs.readdirSync.mockReturnValue(['file1.txt', 'file2.txt'] as any);

      const expandedFiles = await (cli as any).expandFileList(['testdir'], { recursive: true });
      
      expect(expandedFiles).toContain(path.join('testdir', 'file1.txt'));
      expect(expandedFiles).toContain(path.join('testdir', 'file2.txt'));
    });

    it('should handle nested directories recursively', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        if (pathStr === 'testdir' || pathStr.endsWith('subdir')) {
          return { isDirectory: () => true } as any;
        }
        return { isDirectory: () => false } as any;
      });
      mockFs.readdirSync.mockImplementation((dirPath: any) => {
        const pathStr = dirPath.toString();
        if (pathStr === 'testdir') {
          return ['subdir', 'file1.txt'] as any;
        } else if (pathStr.endsWith('subdir')) {
          return ['file2.txt'] as any;
        }
        return [] as any;
      });

      const expandedFiles = await (cli as any).expandFileList(['testdir'], { recursive: true });
      
      expect(expandedFiles).toContain(path.join('testdir', 'file1.txt'));
      expect(expandedFiles).toContain(path.join('testdir', 'subdir', 'file2.txt'));
    });

    it('should handle non-existent files', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const expandedFiles = await (cli as any).expandFileList(['nonexistent.txt'], {});
      
      expect(expandedFiles).toEqual(['nonexistent.txt']); // Still includes for error handling later
    });
  });

  describe('Progress Reporting', () => {
    it('should create no-op progress reporter when progress is disabled', () => {
      const reporter = (cli as any).createProgressReporter(10, { progress: false, verbose: false });
      
      // Should not throw and should be a function
      expect(typeof reporter).toBe('function');
      
      // Should not write to stdout when called
      reporter({ current: 5, total: 10, currentFile: 'test.txt', processed: [], failed: [], startTime: Date.now() });
      expect(processStdoutSpy).not.toHaveBeenCalled();
    });

    it('should create progress reporter with progress bar when enabled', () => {
      const reporter = (cli as any).createProgressReporter(10, { progress: true });
      const startTime = Date.now() - 1000; // Ensure enough time has passed for update
      
      reporter({ 
        current: 5, 
        total: 10, 
        currentFile: 'test.txt', 
        processed: [], 
        failed: [], 
        startTime 
      });
      
      expect(processStdoutSpy).toHaveBeenCalledTimes(2); // Clear line + progress bar
      
      // First call clears the line
      expect(processStdoutSpy.mock.calls[0][0]).toBe('\r\x1b[K');
      
      // Second call contains the progress bar
      const progressOutput = processStdoutSpy.mock.calls[1][0];
      expect(progressOutput).toContain('[');
      expect(progressOutput).toContain('50%');
      expect(progressOutput).toContain('test.txt');
    });

    it('should show completion message in verbose mode', () => {
      const reporter = (cli as any).createProgressReporter(2, { verbose: true });
      const startTime = Date.now();
      
      reporter({ 
        current: 2, 
        total: 2, 
        currentFile: 'test.txt', 
        processed: ['file1.txt', 'file2.txt'], 
        failed: [], 
        startTime 
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Batch processing completed'));
      expect(consoleSpy).toHaveBeenCalledWith('Processed: 2 files');
    });

    it('should show failed files count when there are failures', () => {
      const reporter = (cli as any).createProgressReporter(3, { verbose: true });
      const startTime = Date.now();
      
      reporter({ 
        current: 3, 
        total: 3, 
        currentFile: 'test.txt', 
        processed: ['file1.txt'], 
        failed: ['file2.txt', 'file3.txt'], 
        startTime 
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed: 2 files');
    });

    it('should throttle progress updates', () => {
      const reporter = (cli as any).createProgressReporter(100, { progress: true });
      const startTime = Date.now();
      
      // Call reporter multiple times quickly
      for (let i = 1; i <= 10; i++) {
        reporter({ 
          current: i, 
          total: 100, 
          currentFile: `test${i}.txt`, 
          processed: [], 
          failed: [], 
          startTime 
        });
      }
      
      // Should have throttled some updates
      expect(processStdoutSpy.mock.calls.length).toBeLessThan(10);
    });
  });

  describe('Batch Compression', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(Buffer.from('test data'));
      mockFs.statSync.mockReturnValue({ size: 500 } as any);
      mockFs.writeFileSync.mockImplementation();
      mockFs.unlinkSync.mockImplementation();
    });

    it('should process multiple files in batch mode', async () => {
      const files = ['file1.txt', 'file2.txt', 'file3.txt'];
      const options: CLIOptions = { verbose: true };
      const config = new QuantumConfig();

      // Mock the compressFile method to return expected results
      const compressFileSpy = jest.spyOn(cli as any, 'compressFile').mockResolvedValue({
        originalSize: 1000,
        compressedSize: 750,
        processingTime: 100
      });

      const result = await (cli as any).compressFilesBatch(files, options, config, true);

      expect(result.totalFiles).toBe(3);
      expect(result.processedFiles).toBe(3);
      expect(result.failedFiles).toBe(0);
      expect(result.totalOriginalSize).toBe(3000); // 3 * 1000
      expect(result.totalCompressedSize).toBe(2250); // 3 * 750
      expect(result.averageCompressionRatio).toBe(25); // (3000-2250)/3000 * 100
      expect(compressFileSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle file processing failures gracefully', async () => {
      const files = ['file1.txt', 'missing.txt', 'file3.txt'];
      const options: CLIOptions = { verbose: true };
      const config = new QuantumConfig();

      // Mock compressFile to succeed for some files and fail for others
      const compressFileSpy = jest.spyOn(cli as any, 'compressFile').mockImplementation((...args: any[]) => {
        const [file] = args;
        if (file === 'missing.txt') {
          return Promise.reject(new Error('File not found'));
        }
        return Promise.resolve({
          originalSize: 1000,
          compressedSize: 750,
          processingTime: 100
        });
      });

      const result = await (cli as any).compressFilesBatch(files, options, config, true);

      expect(result.totalFiles).toBe(3);
      expect(result.processedFiles).toBe(2);
      expect(result.failedFiles).toBe(1);
      expect(compressFileSpy).toHaveBeenCalledTimes(3);
    });

    it('should show batch processing start message in verbose mode', async () => {
      const files = ['file1.txt', 'file2.txt'];
      const options: CLIOptions = { verbose: true };
      const config = new QuantumConfig();

      // Mock compressFile to avoid actual processing
      jest.spyOn(cli as any, 'compressFile').mockResolvedValue({
        originalSize: 1000,
        compressedSize: 750,
        processingTime: 100
      });

      await (cli as any).compressFilesBatch(files, options, config, true);

      expect(consoleSpy).toHaveBeenCalledWith('Starting batch compression of 2 files...');
    });

    it('should calculate compression statistics correctly', async () => {
      const files = ['file1.txt', 'file2.txt'];
      const options: CLIOptions = {};
      const config = new QuantumConfig();

      // Mock compressFile to return specific sizes
      jest.spyOn(cli as any, 'compressFile').mockResolvedValue({
        originalSize: 1000,
        compressedSize: 750,
        processingTime: 100
      });

      const result = await (cli as any).compressFilesBatch(files, options, config, true);

      expect(result.totalOriginalSize).toBe(2000); // 2 * 1000
      expect(result.totalCompressedSize).toBe(1500); // 2 * 750
      expect(result.averageCompressionRatio).toBe(25); // (2000-1500)/2000 * 100
    });
  });

  describe('Batch Decompression', () => {
    beforeEach(() => {
      const compressedData = JSON.stringify({
        quantumStates: [],
        entanglementMap: {},
        interferencePatterns: [],
        metadata: { originalSize: 1000 },
        checksum: 'test'
      });

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(compressedData);
      mockFs.statSync.mockReturnValue({ size: 750 } as any);
      mockFs.writeFileSync.mockImplementation();
      mockFs.unlinkSync.mockImplementation();
    });

    it('should process multiple compressed files', async () => {
      const files = ['file1.qf', 'file2.qf'];
      const options: CLIOptions = { verbose: true };
      const config = new QuantumConfig();

      // Mock decompressFile method
      jest.spyOn(cli as any, 'decompressFile').mockResolvedValue({
        originalSize: 1000,
        compressedSize: 750,
        processingTime: 100
      });

      const result = await (cli as any).decompressFilesBatch(files, options, config, true);

      expect(result.totalFiles).toBe(2);
      expect(result.processedFiles).toBe(2);
      expect(result.failedFiles).toBe(0);
    });

    it('should handle invalid compressed file format', async () => {
      const files = ['valid.qf', 'invalid.qf'];
      const options: CLIOptions = { verbose: true };
      const config = new QuantumConfig();

      // Mock decompressFile to fail for invalid files
      jest.spyOn(cli as any, 'decompressFile').mockImplementation((...args: any[]) => {
        const [file] = args;
        if (file.includes('invalid')) {
          return Promise.reject(new Error('Invalid compressed file format'));
        }
        return Promise.resolve({
          originalSize: 1000,
          compressedSize: 750,
          processingTime: 100
        });
      });

      const result = await (cli as any).decompressFilesBatch(files, options, config, true);

      expect(result.processedFiles).toBe(1);
      expect(result.failedFiles).toBe(1);
    });
  });

  describe('Batch Testing', () => {
    beforeEach(() => {
      const compressedData = JSON.stringify({
        quantumStates: [],
        entanglementMap: {},
        interferencePatterns: [],
        metadata: { originalSize: 1000 },
        checksum: 'test'
      });

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(compressedData);
    });

    it('should test multiple files and report results', async () => {
      const files = ['file1.qf', 'file2.qf'];
      const options: CLIOptions = {};

      const result = await (cli as any).testFilesBatch(files, options);

      expect(result.totalFiles).toBe(2);
      expect(result.processedFiles).toBe(2);
      expect(result.failedFiles).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('file1.qf: OK');
      expect(consoleSpy).toHaveBeenCalledWith('file2.qf: OK');
    });

    it('should handle test failures', async () => {
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('corrupt')) {
          return 'invalid json';
        }
        return JSON.stringify({
          quantumStates: [],
          entanglementMap: {},
          interferencePatterns: [],
          metadata: { originalSize: 1000 },
          checksum: 'test'
        });
      });

      const files = ['valid.qf', 'corrupt.qf'];
      const options: CLIOptions = {};

      const result = await (cli as any).testFilesBatch(files, options);

      expect(result.processedFiles).toBe(1);
      expect(result.failedFiles).toBe(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('corrupt.qf: FAILED'));
    });
  });

  describe('Exit Code Handling', () => {
    it('should exit with code 0 on complete success', () => {
      const result: BatchResult = {
        totalFiles: 3,
        processedFiles: 3,
        failedFiles: 0,
        totalTime: 1000,
        totalOriginalSize: 3000,
        totalCompressedSize: 2000,
        averageCompressionRatio: 33.3
      };

      (cli as any).handleBatchResults(result, { verbose: true });

      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should exit with code 2 on partial failure', () => {
      const result: BatchResult = {
        totalFiles: 3,
        processedFiles: 2,
        failedFiles: 1,
        totalTime: 1000,
        totalOriginalSize: 2000,
        totalCompressedSize: 1500,
        averageCompressionRatio: 25.0
      };

      (cli as any).handleBatchResults(result, { verbose: true });

      expect(processExitSpy).toHaveBeenCalledWith(2);
    });

    it('should exit with code 1 on complete failure', () => {
      const result: BatchResult = {
        totalFiles: 3,
        processedFiles: 0,
        failedFiles: 3,
        totalTime: 1000,
        totalOriginalSize: 0,
        totalCompressedSize: 0,
        averageCompressionRatio: 0
      };

      (cli as any).handleBatchResults(result, { verbose: false });

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should show batch summary in verbose mode', () => {
      const result: BatchResult = {
        totalFiles: 5,
        processedFiles: 4,
        failedFiles: 1,
        totalTime: 2500,
        totalOriginalSize: 5000,
        totalCompressedSize: 3500,
        averageCompressionRatio: 30.0
      };

      (cli as any).handleBatchResults(result, { verbose: true });

      expect(consoleSpy).toHaveBeenCalledWith('\n--- Batch Processing Summary ---');
      expect(consoleSpy).toHaveBeenCalledWith('Total files: 5');
      expect(consoleSpy).toHaveBeenCalledWith('Processed: 4');
      expect(consoleSpy).toHaveBeenCalledWith('Failed: 1');
      expect(consoleSpy).toHaveBeenCalledWith('Total time: 2.50s');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Total original size:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Total compressed size:'));
      expect(consoleSpy).toHaveBeenCalledWith('Average compression ratio: 30.0%');
    });
  });

  describe('Utility Functions', () => {
    it('should format bytes correctly', () => {
      expect((cli as any).formatBytes(500)).toBe('500.0 B');
      expect((cli as any).formatBytes(1536)).toBe('1.5 KB');
      expect((cli as any).formatBytes(1048576)).toBe('1.0 MB');
      expect((cli as any).formatBytes(1073741824)).toBe('1.0 GB');
    });

    it('should log file results correctly', () => {
      const result = {
        originalSize: 1000,
        compressedSize: 750,
        processingTime: 150
      };

      (cli as any).logFileResult('test.txt', result, 'compressed');

      expect(consoleSpy).toHaveBeenCalledWith('compressed: test.txt');
      expect(consoleSpy).toHaveBeenCalledWith('  Original size: 1000 bytes');
      expect(consoleSpy).toHaveBeenCalledWith('  Compressed size: 750 bytes');
      expect(consoleSpy).toHaveBeenCalledWith('  Compression ratio: 25.0%');
      expect(consoleSpy).toHaveBeenCalledWith('  Processing time: 150ms');
    });
  });

  describe('Integration with Command Line Options', () => {
    it('should enable batch mode for multiple files', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as any);
      mockFs.readFileSync.mockReturnValue(Buffer.from('test'));
      mockFs.writeFileSync.mockImplementation();

      const handleCommandSpy = jest.spyOn(cli as any, 'handleCommand').mockImplementation(
        async (...args: any[]) => {
          const [files, options] = args;
          expect(files.length).toBeGreaterThan(1);
          // Batch mode should be enabled automatically for multiple files
        }
      );

      await cli.run(['node', 'quantumflow', 'file1.txt', 'file2.txt', 'file3.txt']);

      expect(handleCommandSpy).toHaveBeenCalled();
    });

    it('should respect explicit batch flag', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false } as any);
      mockFs.readFileSync.mockReturnValue(Buffer.from('test'));
      mockFs.writeFileSync.mockImplementation();

      const handleCommandSpy = jest.spyOn(cli as any, 'handleCommand').mockImplementation(
        async (...args: any[]) => {
          const [files, options] = args;
          expect(options.batch).toBe(true);
        }
      );

      await cli.run(['node', 'quantumflow', '--batch', 'file1.txt']);

      expect(handleCommandSpy).toHaveBeenCalled();
    });

    it('should handle progress flag correctly', async () => {
      const program = cli.getProgram();
      
      expect(program.options.find(opt => opt.long === '--progress')).toBeDefined();
      expect(program.options.find(opt => opt.long === '--batch')).toBeDefined();
      expect(program.options.find(opt => opt.short === '-r')).toBeDefined();
    });
  });
});