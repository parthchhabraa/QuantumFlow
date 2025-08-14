/**
 * QuantumFlow CLI Interface
 * Command-line interface for quantum compression operations
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { QuantumCompressionEngine } from '../core/QuantumCompressionEngine';
import { QuantumConfig } from '../models/QuantumConfig';

export interface CLIOptions {
  compress?: boolean;
  decompress?: boolean;
  output?: string;
  verbose?: boolean;
  force?: boolean;
  keep?: boolean;
  level?: number;
  test?: boolean;
  list?: boolean;
  help?: boolean;
  version?: boolean;
  config?: string;
  quantumBitDepth?: number;
  maxEntanglementLevel?: number;
  superpositionComplexity?: number;
  interferenceThreshold?: number;
  batch?: boolean;
  progress?: boolean;
  recursive?: boolean;
}

export interface BatchProgress {
  current: number;
  total: number;
  currentFile: string;
  processed: string[];
  failed: string[];
  startTime: number;
}

export interface BatchResult {
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  totalTime: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  averageCompressionRatio: number;
}

export class QuantumFlowCLI {
  private program: Command;
  private engine: QuantumCompressionEngine;

  constructor() {
    this.program = new Command();
    this.engine = new QuantumCompressionEngine();
    this.setupCommands();
  }

  private setupCommands(): void {
    this.program
      .name('quantumflow')
      .description('QuantumFlow by eliomatters - Quantum-inspired compression algorithm')
      .version('1.0.0');

    // Compression command (default behavior)
    this.program
      .argument('[files...]', 'files to compress/decompress')
      .option('-c, --compress', 'compress files (default)')
      .option('-d, --decompress', 'decompress files')
      .option('-o, --output <file>', 'output file name')
      .option('-v, --verbose', 'verbose output')
      .option('-f, --force', 'force overwrite existing files')
      .option('-k, --keep', 'keep input files after processing')
      .option('-l, --level <n>', 'compression level (1-9)', '6')
      .option('-t, --test', 'test compressed file integrity')
      .option('--list', 'list compressed file contents')
      .option('--config <file>', 'use configuration file')
      .option('--batch', 'enable batch processing mode')
      .option('--progress', 'show progress indicators during batch processing')
      .option('-r, --recursive', 'process directories recursively')
      .option('--quantum-bit-depth <n>', 'quantum bit depth (2-16)', '8')
      .option('--max-entanglement-level <n>', 'max entanglement level (1-8)', '4')
      .option('--superposition-complexity <n>', 'superposition complexity (1-10)', '5')
      .option('--interference-threshold <n>', 'interference threshold (0.1-0.9)', '0.5')
      .action((files: string[], options: CLIOptions) => {
        this.handleCommand(files, options);
      });

    // Help command
    this.program
      .command('help')
      .description('display help information')
      .action(() => {
        this.program.help();
      });
  }

  private async handleCommand(files: string[], options: CLIOptions): Promise<void> {
    try {
      // Validate arguments
      if (files.length === 0) {
        console.error('Error: No input files specified');
        process.exit(1);
      }

      // Expand file list if recursive option is enabled
      const expandedFiles = await this.expandFileList(files, options);
      
      if (expandedFiles.length === 0) {
        console.error('Error: No valid files found');
        process.exit(1);
      }

      // Parse quantum configuration
      const config = this.parseQuantumConfig(options);

      // Determine operation mode
      const isDecompress = options.decompress || expandedFiles.some(f => f.endsWith('.qf'));

      // Enable batch mode for multiple files or when explicitly requested
      const batchMode = options.batch || expandedFiles.length > 1;
      
      let result: BatchResult;

      if (options.test) {
        result = await this.testFilesBatch(expandedFiles, options);
      } else if (options.list) {
        result = await this.listFilesBatch(expandedFiles, options);
      } else if (isDecompress) {
        result = await this.decompressFilesBatch(expandedFiles, options, config, batchMode);
      } else {
        result = await this.compressFilesBatch(expandedFiles, options, config, batchMode);
      }

      // Exit with appropriate code based on results
      this.handleBatchResults(result, options);

    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }

  private parseQuantumConfig(options: CLIOptions): QuantumConfig {
    const config = new QuantumConfig();
    
    if (options.quantumBitDepth !== undefined) {
      const depth = parseInt(options.quantumBitDepth.toString());
      if (depth < 2 || depth > 16) {
        throw new Error('Quantum bit depth must be between 2 and 16');
      }
      config.quantumBitDepth = depth;
    }

    if (options.maxEntanglementLevel !== undefined) {
      const level = parseInt(options.maxEntanglementLevel.toString());
      if (level < 1 || level > 8) {
        throw new Error('Max entanglement level must be between 1 and 8');
      }
      config.maxEntanglementLevel = level;
    }

    if (options.superpositionComplexity !== undefined) {
      const complexity = parseInt(options.superpositionComplexity.toString());
      if (complexity < 1 || complexity > 10) {
        throw new Error('Superposition complexity must be between 1 and 10');
      }
      config.superpositionComplexity = complexity;
    }

    if (options.interferenceThreshold !== undefined) {
      const threshold = parseFloat(options.interferenceThreshold.toString());
      if (threshold < 0.1 || threshold > 0.9) {
        throw new Error('Interference threshold must be between 0.1 and 0.9');
      }
      config.interferenceThreshold = threshold;
    }

    return config;
  }

  private async compressFiles(files: string[], options: CLIOptions, config: QuantumConfig): Promise<void> {
    for (const file of files) {
      if (options.verbose) {
        console.log(`Compressing: ${file}`);
      }

      if (!fs.existsSync(file)) {
        console.error(`Error: File not found: ${file}`);
        continue;
      }

      const inputData = fs.readFileSync(file);
      const outputFile = options.output || `${file}.qf`;

      // Check if output file exists and force flag
      if (fs.existsSync(outputFile) && !options.force) {
        console.error(`Error: Output file exists: ${outputFile}. Use -f to force overwrite.`);
        continue;
      }

      const startTime = Date.now();
      const compressed = this.engine.compress(inputData, config);
      const endTime = Date.now();

      // Write compressed data
      fs.writeFileSync(outputFile, JSON.stringify(compressed));

      // Remove input file if not keeping
      if (!options.keep) {
        fs.unlinkSync(file);
      }

      if (options.verbose) {
        const originalSize = inputData.length;
        const compressedSize = fs.statSync(outputFile).size;
        const ratio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        const time = endTime - startTime;
        
        console.log(`  Original size: ${originalSize} bytes`);
        console.log(`  Compressed size: ${compressedSize} bytes`);
        console.log(`  Compression ratio: ${ratio}%`);
        console.log(`  Processing time: ${time}ms`);
      }
    }
  }

  private async decompressFiles(files: string[], options: CLIOptions, config: QuantumConfig): Promise<void> {
    for (const file of files) {
      if (options.verbose) {
        console.log(`Decompressing: ${file}`);
      }

      if (!fs.existsSync(file)) {
        console.error(`Error: File not found: ${file}`);
        continue;
      }

      const compressedData = fs.readFileSync(file, 'utf8');
      let compressed;
      
      try {
        const parsedData = JSON.parse(compressedData);
        // Create a CompressedQuantumData object from the parsed JSON
        const { CompressedQuantumData } = require('../models/CompressedQuantumData');
        compressed = Object.assign(new CompressedQuantumData(), parsedData);
      } catch (error) {
        console.error(`Error: Invalid compressed file format: ${file}`);
        continue;
      }

      const outputFile = options.output || file.replace(/\.qf$/, '');

      // Check if output file exists and force flag
      if (fs.existsSync(outputFile) && !options.force) {
        console.error(`Error: Output file exists: ${outputFile}. Use -f to force overwrite.`);
        continue;
      }

      const startTime = Date.now();
      const decompressed = this.engine.decompress(compressed);
      const endTime = Date.now();

      // Write decompressed data
      fs.writeFileSync(outputFile, decompressed);

      // Remove input file if not keeping
      if (!options.keep) {
        fs.unlinkSync(file);
      }

      if (options.verbose) {
        const compressedSize = fs.statSync(file).size;
        const decompressedSize = decompressed.length;
        const time = endTime - startTime;
        
        console.log(`  Compressed size: ${compressedSize} bytes`);
        console.log(`  Decompressed size: ${decompressedSize} bytes`);
        console.log(`  Processing time: ${time}ms`);
      }
    }
  }

  private async testFiles(files: string[], options: CLIOptions): Promise<void> {
    for (const file of files) {
      if (options.verbose) {
        console.log(`Testing: ${file}`);
      }

      if (!fs.existsSync(file)) {
        console.error(`Error: File not found: ${file}`);
        continue;
      }

      try {
        const compressedData = fs.readFileSync(file, 'utf8');
        const parsedData = JSON.parse(compressedData);
        
        // Create a CompressedQuantumData object from the parsed JSON
        const { CompressedQuantumData } = require('../models/CompressedQuantumData');
        const compressed = Object.assign(new CompressedQuantumData(), parsedData);
        
        // Test decompression without writing to file
        this.engine.decompress(compressed);
        
        console.log(`${file}: OK`);
      } catch (error) {
        console.error(`${file}: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async listFiles(files: string[], options: CLIOptions): Promise<void> {
    for (const file of files) {
      if (!fs.existsSync(file)) {
        console.error(`Error: File not found: ${file}`);
        continue;
      }

      try {
        const compressedData = fs.readFileSync(file, 'utf8');
        const parsedData = JSON.parse(compressedData);
        
        console.log(`\nFile: ${file}`);
        console.log(`Quantum States: ${parsedData.quantumStates?.length || 0}`);
        console.log(`Entanglement Pairs: ${parsedData.entanglementMap ? Object.keys(parsedData.entanglementMap).length : 0}`);
        console.log(`Interference Patterns: ${parsedData.interferencePatterns?.length || 0}`);
        
        if (parsedData.metadata) {
          console.log(`Original Size: ${parsedData.metadata.originalSize || 'Unknown'} bytes`);
          console.log(`Compression Ratio: ${parsedData.metadata.compressionRatio || 'Unknown'}%`);
          console.log(`Quantum Efficiency: ${parsedData.metadata.quantumEfficiency || 'Unknown'}%`);
        }
      } catch (error) {
        console.error(`Error reading ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async expandFileList(files: string[], options: CLIOptions): Promise<string[]> {
    const expandedFiles: string[] = [];

    for (const file of files) {
      if (fs.existsSync(file)) {
        const stat = fs.statSync(file);
        
        if (stat.isDirectory()) {
          if (options.recursive) {
            const dirFiles = await this.getFilesRecursively(file);
            expandedFiles.push(...dirFiles);
          } else {
            console.error(`Error: ${file} is a directory. Use -r for recursive processing.`);
          }
        } else {
          expandedFiles.push(file);
        }
      } else {
        // Handle glob patterns or wildcards if needed
        expandedFiles.push(file);
      }
    }

    return expandedFiles;
  }

  private async getFilesRecursively(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        
        // Check if path exists before getting stats to avoid infinite recursion
        if (!fs.existsSync(fullPath)) {
          continue;
        }
        
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          const subFiles = await this.getFilesRecursively(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return files;
  }

  private createProgressReporter(total: number, options: CLIOptions): (progress: BatchProgress) => void {
    if (!options.progress && !options.verbose) {
      return () => {}; // No-op if progress reporting is disabled
    }

    let lastUpdate = 0;
    const updateInterval = 100; // Update every 100ms

    return (progress: BatchProgress) => {
      const now = Date.now();
      if (now - lastUpdate < updateInterval && progress.current < progress.total) {
        return; // Throttle updates
      }
      lastUpdate = now;

      const percentage = Math.round((progress.current / progress.total) * 100);
      const elapsed = (now - progress.startTime) / 1000;
      const rate = progress.current / elapsed;
      const eta = progress.current > 0 ? (progress.total - progress.current) / rate : 0;

      if (options.progress) {
        // Clear line and show progress bar
        process.stdout.write('\r\x1b[K');
        const barLength = 30;
        const filled = Math.round((progress.current / progress.total) * barLength);
        const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
        
        process.stdout.write(
          `[${bar}] ${percentage}% (${progress.current}/${progress.total}) ` +
          `ETA: ${eta.toFixed(0)}s - ${path.basename(progress.currentFile)}`
        );
      }

      if (options.verbose && progress.current === progress.total) {
        console.log(`\nBatch processing completed in ${elapsed.toFixed(2)}s`);
        console.log(`Processed: ${progress.processed.length} files`);
        if (progress.failed.length > 0) {
          console.log(`Failed: ${progress.failed.length} files`);
        }
      }
    };
  }

  private async compressFilesBatch(
    files: string[], 
    options: CLIOptions, 
    config: QuantumConfig, 
    batchMode: boolean
  ): Promise<BatchResult> {
    const result: BatchResult = {
      totalFiles: files.length,
      processedFiles: 0,
      failedFiles: 0,
      totalTime: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      averageCompressionRatio: 0
    };

    const startTime = Date.now();
    const progress: BatchProgress = {
      current: 0,
      total: files.length,
      currentFile: '',
      processed: [],
      failed: [],
      startTime
    };

    const reportProgress = this.createProgressReporter(files.length, options);

    if (batchMode && options.verbose) {
      console.log(`Starting batch compression of ${files.length} files...`);
    }

    for (const file of files) {
      progress.currentFile = file;
      reportProgress(progress);

      try {
        const fileResult = await this.compressFile(file, options, config);
        
        result.processedFiles++;
        result.totalOriginalSize += fileResult.originalSize;
        result.totalCompressedSize += fileResult.compressedSize;
        progress.processed.push(file);

        if (options.verbose && !batchMode) {
          this.logFileResult(file, fileResult, 'compressed');
        }
      } catch (error) {
        result.failedFiles++;
        progress.failed.push(file);
        
        if (options.verbose) {
          console.error(`Failed to compress ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      progress.current++;
    }

    result.totalTime = Date.now() - startTime;
    result.averageCompressionRatio = result.totalOriginalSize > 0 
      ? ((result.totalOriginalSize - result.totalCompressedSize) / result.totalOriginalSize) * 100 
      : 0;

    // Final progress update
    reportProgress(progress);
    if (options.progress) {
      console.log(); // New line after progress bar
    }

    return result;
  }

  private async decompressFilesBatch(
    files: string[], 
    options: CLIOptions, 
    config: QuantumConfig, 
    batchMode: boolean
  ): Promise<BatchResult> {
    const result: BatchResult = {
      totalFiles: files.length,
      processedFiles: 0,
      failedFiles: 0,
      totalTime: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      averageCompressionRatio: 0
    };

    const startTime = Date.now();
    const progress: BatchProgress = {
      current: 0,
      total: files.length,
      currentFile: '',
      processed: [],
      failed: [],
      startTime
    };

    const reportProgress = this.createProgressReporter(files.length, options);

    if (batchMode && options.verbose) {
      console.log(`Starting batch decompression of ${files.length} files...`);
    }

    for (const file of files) {
      progress.currentFile = file;
      reportProgress(progress);

      try {
        const fileResult = await this.decompressFile(file, options, config);
        
        result.processedFiles++;
        result.totalCompressedSize += fileResult.compressedSize;
        result.totalOriginalSize += fileResult.originalSize;
        progress.processed.push(file);

        if (options.verbose && !batchMode) {
          this.logFileResult(file, fileResult, 'decompressed');
        }
      } catch (error) {
        result.failedFiles++;
        progress.failed.push(file);
        
        if (options.verbose) {
          console.error(`Failed to decompress ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      progress.current++;
    }

    result.totalTime = Date.now() - startTime;
    result.averageCompressionRatio = result.totalCompressedSize > 0 
      ? ((result.totalOriginalSize - result.totalCompressedSize) / result.totalCompressedSize) * 100 
      : 0;

    // Final progress update
    reportProgress(progress);
    if (options.progress) {
      console.log(); // New line after progress bar
    }

    return result;
  }

  private async testFilesBatch(files: string[], options: CLIOptions): Promise<BatchResult> {
    const result: BatchResult = {
      totalFiles: files.length,
      processedFiles: 0,
      failedFiles: 0,
      totalTime: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      averageCompressionRatio: 0
    };

    const startTime = Date.now();
    const progress: BatchProgress = {
      current: 0,
      total: files.length,
      currentFile: '',
      processed: [],
      failed: [],
      startTime
    };

    const reportProgress = this.createProgressReporter(files.length, options);

    if (options.verbose && files.length > 1) {
      console.log(`Testing ${files.length} files...`);
    }

    for (const file of files) {
      progress.currentFile = file;
      reportProgress(progress);

      try {
        await this.testFile(file, options);
        result.processedFiles++;
        progress.processed.push(file);
        
        if (!options.verbose) {
          console.log(`${file}: OK`);
        }
      } catch (error) {
        result.failedFiles++;
        progress.failed.push(file);
        console.error(`${file}: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      progress.current++;
    }

    result.totalTime = Date.now() - startTime;

    // Final progress update
    reportProgress(progress);
    if (options.progress) {
      console.log(); // New line after progress bar
    }

    return result;
  }

  private async listFilesBatch(files: string[], options: CLIOptions): Promise<BatchResult> {
    const result: BatchResult = {
      totalFiles: files.length,
      processedFiles: 0,
      failedFiles: 0,
      totalTime: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      averageCompressionRatio: 0
    };

    const startTime = Date.now();

    for (const file of files) {
      try {
        await this.listFile(file, options);
        result.processedFiles++;
      } catch (error) {
        result.failedFiles++;
        console.error(`Error reading ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    result.totalTime = Date.now() - startTime;
    return result;
  }

  private handleBatchResults(result: BatchResult, options: CLIOptions): void {
    if (options.verbose && result.totalFiles > 1) {
      console.log('\n--- Batch Processing Summary ---');
      console.log(`Total files: ${result.totalFiles}`);
      console.log(`Processed: ${result.processedFiles}`);
      console.log(`Failed: ${result.failedFiles}`);
      console.log(`Total time: ${(result.totalTime / 1000).toFixed(2)}s`);
      
      if (result.totalOriginalSize > 0) {
        console.log(`Total original size: ${this.formatBytes(result.totalOriginalSize)}`);
        console.log(`Total compressed size: ${this.formatBytes(result.totalCompressedSize)}`);
        console.log(`Average compression ratio: ${result.averageCompressionRatio.toFixed(1)}%`);
      }
    }

    // Exit with appropriate code
    if (result.failedFiles > 0) {
      process.exit(result.processedFiles > 0 ? 2 : 1); // Partial failure or complete failure
    } else {
      process.exit(0); // Success
    }
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  public async run(argv: string[] = process.argv): Promise<void> {
    await this.program.parseAsync(argv);
  }

  private async compressFile(file: string, options: CLIOptions, config: QuantumConfig): Promise<{originalSize: number, compressedSize: number, processingTime: number}> {
    if (!fs.existsSync(file)) {
      throw new Error(`File not found: ${file}`);
    }

    const inputData = fs.readFileSync(file);
    const outputFile = options.output || `${file}.qf`;

    // Check if output file exists and force flag
    if (fs.existsSync(outputFile) && !options.force) {
      throw new Error(`Output file exists: ${outputFile}. Use -f to force overwrite.`);
    }

    const startTime = Date.now();
    const compressed = this.engine.compress(inputData, config);
    const endTime = Date.now();

    // Write compressed data
    fs.writeFileSync(outputFile, JSON.stringify(compressed));

    // Remove input file if not keeping
    if (!options.keep) {
      fs.unlinkSync(file);
    }

    const compressedSize = fs.statSync(outputFile).size;
    
    return {
      originalSize: inputData.length,
      compressedSize,
      processingTime: endTime - startTime
    };
  }

  private async decompressFile(file: string, options: CLIOptions, config: QuantumConfig): Promise<{originalSize: number, compressedSize: number, processingTime: number}> {
    if (!fs.existsSync(file)) {
      throw new Error(`File not found: ${file}`);
    }

    const compressedData = fs.readFileSync(file, 'utf8');
    let compressed;
    
    try {
      const parsedData = JSON.parse(compressedData);
      // Create a CompressedQuantumData object from the parsed JSON
      const { CompressedQuantumData } = require('../models/CompressedQuantumData');
      compressed = Object.assign(new CompressedQuantumData(), parsedData);
    } catch (error) {
      throw new Error(`Invalid compressed file format: ${file}`);
    }

    const outputFile = options.output || file.replace(/\.qf$/, '');

    // Check if output file exists and force flag
    if (fs.existsSync(outputFile) && !options.force) {
      throw new Error(`Output file exists: ${outputFile}. Use -f to force overwrite.`);
    }

    const startTime = Date.now();
    const decompressed = this.engine.decompress(compressed);
    const endTime = Date.now();

    // Write decompressed data
    fs.writeFileSync(outputFile, decompressed);

    // Remove input file if not keeping
    if (!options.keep) {
      fs.unlinkSync(file);
    }

    const compressedSize = fs.statSync(file).size;
    
    return {
      originalSize: decompressed.length,
      compressedSize,
      processingTime: endTime - startTime
    };
  }

  private async testFile(file: string, options: CLIOptions): Promise<void> {
    if (!fs.existsSync(file)) {
      throw new Error(`File not found: ${file}`);
    }

    const compressedData = fs.readFileSync(file, 'utf8');
    const parsedData = JSON.parse(compressedData);
    
    // Create a CompressedQuantumData object from the parsed JSON
    const { CompressedQuantumData } = require('../models/CompressedQuantumData');
    const compressed = Object.assign(new CompressedQuantumData(), parsedData);
    
    // Test decompression without writing to file
    this.engine.decompress(compressed);
    
    if (options.verbose) {
      console.log(`${file}: OK`);
    }
  }

  private async listFile(file: string, options: CLIOptions): Promise<void> {
    if (!fs.existsSync(file)) {
      throw new Error(`File not found: ${file}`);
    }

    const compressedData = fs.readFileSync(file, 'utf8');
    const parsedData = JSON.parse(compressedData);
    
    console.log(`\nFile: ${file}`);
    console.log(`Quantum States: ${parsedData.quantumStates?.length || 0}`);
    console.log(`Entanglement Pairs: ${parsedData.entanglementMap ? Object.keys(parsedData.entanglementMap).length : 0}`);
    console.log(`Interference Patterns: ${parsedData.interferencePatterns?.length || 0}`);
    
    if (parsedData.metadata) {
      console.log(`Original Size: ${parsedData.metadata.originalSize || 'Unknown'} bytes`);
      console.log(`Compression Ratio: ${parsedData.metadata.compressionRatio || 'Unknown'}%`);
      console.log(`Quantum Efficiency: ${parsedData.metadata.quantumEfficiency || 'Unknown'}%`);
    }
  }

  private logFileResult(file: string, result: {originalSize: number, compressedSize: number, processingTime: number}, operation: string): void {
    const ratio = ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(1);
    
    console.log(`${operation}: ${file}`);
    console.log(`  Original size: ${result.originalSize} bytes`);
    console.log(`  ${operation === 'compressed' ? 'Compressed' : 'Decompressed'} size: ${result.compressedSize} bytes`);
    console.log(`  ${operation === 'compressed' ? 'Compression' : 'Expansion'} ratio: ${ratio}%`);
    console.log(`  Processing time: ${result.processingTime}ms`);
  }

  public getProgram(): Command {
    return this.program;
  }
}