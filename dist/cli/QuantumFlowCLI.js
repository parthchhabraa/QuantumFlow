"use strict";
/**
 * QuantumFlow CLI Interface
 * Command-line interface for quantum compression operations
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumFlowCLI = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const QuantumCompressionEngine_1 = require("../core/QuantumCompressionEngine");
const QuantumConfig_1 = require("../models/QuantumConfig");
class QuantumFlowCLI {
    constructor() {
        this.program = new commander_1.Command();
        this.engine = new QuantumCompressionEngine_1.QuantumCompressionEngine();
        this.setupCommands();
    }
    setupCommands() {
        this.program
            .name('quantumflow')
            .description('QuantumFlow by eliomatters - Quantum-inspired compression algorithm\n\nLeverages quantum mechanical principles (superposition, entanglement, and quantum interference)\nsimulated on conventional computers to achieve superior compression ratios.')
            .version('1.0.0')
            .usage('[options] <files...>')
            .addHelpText('before', '\nEXAMPLES:')
            .addHelpText('before', '  quantumflow file.txt                    # Compress file.txt to file.txt.qf')
            .addHelpText('before', '  quantumflow -d file.txt.qf              # Decompress file.txt.qf to file.txt')
            .addHelpText('before', '  quantumflow -v -k *.txt                 # Compress all .txt files verbosely, keep originals')
            .addHelpText('before', '  quantumflow --batch --progress *.log    # Batch compress with progress bar')
            .addHelpText('before', '  quantumflow -t file.txt.qf              # Test integrity of compressed file')
            .addHelpText('before', '  quantumflow --list file.txt.qf          # List compressed file information')
            .addHelpText('before', '  quantumflow -r directory/               # Recursively compress directory')
            .addHelpText('before', '  quantumflow --quantum-bit-depth 12 file.txt  # Use 12-qubit simulation')
            .addHelpText('before', '  qf file.txt                             # Use short alias')
            .addHelpText('after', '\nQUANTUM PARAMETERS:')
            .addHelpText('after', '  --quantum-bit-depth: Controls quantum state complexity (2-16, default: 8)')
            .addHelpText('after', '  --max-entanglement-level: Maximum entanglement depth (1-8, default: 4)')
            .addHelpText('after', '  --superposition-complexity: Superposition processing complexity (1-10, default: 5)')
            .addHelpText('after', '  --interference-threshold: Quantum interference threshold (0.1-0.9, default: 0.5)')
            .addHelpText('after', '\nFILE FORMATS:')
            .addHelpText('after', '  Input: Any binary file')
            .addHelpText('after', '  Output: .qf (QuantumFlow compressed format)')
            .addHelpText('after', '\nEXIT CODES:')
            .addHelpText('after', '  0: Success')
            .addHelpText('after', '  1: Error or complete failure')
            .addHelpText('after', '  2: Partial success (some files failed in batch mode)')
            .addHelpText('after', '\nALIASES:')
            .addHelpText('after', '  qf: Short alias for quantumflow command')
            .addHelpText('after', '\nCONFIGURATION:')
            .addHelpText('after', '  Config files: ./quantumflow.config.json, ~/.quantumflow/config.json')
            .addHelpText('after', '  Use --config <file> to specify custom configuration');
        // Main command (default behavior)
        this.program
            .argument('[files...]', 'files to compress/decompress')
            .option('-c, --compress', 'compress files (default behavior)')
            .option('-d, --decompress', 'decompress files (.qf files)')
            .option('-o, --output <file>', 'specify output file name')
            .option('-v, --verbose', 'enable verbose output with detailed statistics')
            .option('-f, --force', 'force overwrite existing output files')
            .option('-k, --keep', 'keep input files after processing (don\'t delete)')
            .option('-l, --level <n>', 'compression level (1-9, affects quantum parameters)', '6')
            .option('-t, --test', 'test compressed file integrity without decompressing')
            .option('--list', 'list compressed file contents and metadata')
            .option('--config <file>', 'load quantum parameters from configuration file')
            .option('--batch', 'enable batch processing mode for multiple files')
            .option('--progress', 'show progress indicators during batch processing')
            .option('-r, --recursive', 'process directories recursively')
            .option('--quantum-bit-depth <n>', 'quantum bit depth simulation (2-16)', '8')
            .option('--max-entanglement-level <n>', 'maximum entanglement level (1-8)', '4')
            .option('--superposition-complexity <n>', 'superposition complexity (1-10)', '5')
            .option('--interference-threshold <n>', 'quantum interference threshold (0.1-0.9)', '0.5')
            .action((files, options) => {
            this.handleCommand(files, options);
        });
        // Dedicated help command
        this.program
            .command('help [command]')
            .description('display help information for command')
            .action((command) => {
            if (command) {
                this.program.help();
            }
            else {
                this.program.help();
            }
        });
        // Version command
        this.program
            .command('version')
            .description('display version information')
            .action(() => {
            console.log(`QuantumFlow v${this.program.version()}`);
            console.log('Quantum-inspired compression algorithm by eliomatters');
            console.log('Built with TypeScript and Node.js');
        });
        // Benchmark command
        this.program
            .command('benchmark')
            .description('run compression benchmarks against standard algorithms')
            .option('--file <path>', 'specific file to benchmark (default: creates test files)')
            .option('--size <bytes>', 'test file size in bytes', '1048576')
            .option('--iterations <n>', 'number of benchmark iterations', '5')
            .action((options) => {
            this.runBenchmark(options);
        });
    }
    async handleCommand(files, options) {
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
            let result;
            if (options.test) {
                result = await this.testFilesBatch(expandedFiles, options);
            }
            else if (options.list) {
                result = await this.listFilesBatch(expandedFiles, options);
            }
            else if (isDecompress) {
                result = await this.decompressFilesBatch(expandedFiles, options, config, batchMode);
            }
            else {
                result = await this.compressFilesBatch(expandedFiles, options, config, batchMode);
            }
            // Exit with appropriate code based on results
            this.handleBatchResults(result, options);
        }
        catch (error) {
            console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            process.exit(1);
        }
    }
    parseQuantumConfig(options) {
        const config = new QuantumConfig_1.QuantumConfig();
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
    async compressFiles(files, options, config) {
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
            fs.writeFileSync(outputFile, compressed.serialize());
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
    async decompressFiles(files, options, config) {
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
                compressed = parsedData;
            }
            catch (error) {
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
    async testFiles(files, options) {
        for (const file of files) {
            if (options.verbose) {
                console.log(`Testing: ${file}`);
            }
            if (!fs.existsSync(file)) {
                console.error(`Error: File not found: ${file}`);
                continue;
            }
            try {
                const compressedData = fs.readFileSync(file);
                const { CompressedQuantumData } = require('../models/CompressedQuantumData');
                const compressed = CompressedQuantumData.deserialize(compressedData);
                // Test decompression without writing to file
                this.engine.decompress(compressed);
                console.log(`${file}: OK`);
            }
            catch (error) {
                console.error(`${file}: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
    async listFiles(files, options) {
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
            }
            catch (error) {
                console.error(`Error reading ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
    async expandFileList(files, options) {
        const expandedFiles = [];
        for (const file of files) {
            if (fs.existsSync(file)) {
                const stat = fs.statSync(file);
                if (stat.isDirectory()) {
                    if (options.recursive) {
                        const dirFiles = await this.getFilesRecursively(file);
                        expandedFiles.push(...dirFiles);
                    }
                    else {
                        console.error(`Error: ${file} is a directory. Use -r for recursive processing.`);
                    }
                }
                else {
                    expandedFiles.push(file);
                }
            }
            else {
                // Handle glob patterns or wildcards if needed
                expandedFiles.push(file);
            }
        }
        return expandedFiles;
    }
    async getFilesRecursively(dir) {
        const files = [];
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
                }
                else {
                    files.push(fullPath);
                }
            }
        }
        catch (error) {
            console.error(`Error reading directory ${dir}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        return files;
    }
    createProgressReporter(total, options) {
        if (!options.progress && !options.verbose) {
            return () => { }; // No-op if progress reporting is disabled
        }
        let lastUpdate = 0;
        const updateInterval = 100; // Update every 100ms
        return (progress) => {
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
                process.stdout.write(`[${bar}] ${percentage}% (${progress.current}/${progress.total}) ` +
                    `ETA: ${eta.toFixed(0)}s - ${path.basename(progress.currentFile)}`);
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
    async compressFilesBatch(files, options, config, batchMode) {
        const result = {
            totalFiles: files.length,
            processedFiles: 0,
            failedFiles: 0,
            totalTime: 0,
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            averageCompressionRatio: 0
        };
        const startTime = Date.now();
        const progress = {
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
            }
            catch (error) {
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
    async decompressFilesBatch(files, options, config, batchMode) {
        const result = {
            totalFiles: files.length,
            processedFiles: 0,
            failedFiles: 0,
            totalTime: 0,
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            averageCompressionRatio: 0
        };
        const startTime = Date.now();
        const progress = {
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
            }
            catch (error) {
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
    async testFilesBatch(files, options) {
        const result = {
            totalFiles: files.length,
            processedFiles: 0,
            failedFiles: 0,
            totalTime: 0,
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            averageCompressionRatio: 0
        };
        const startTime = Date.now();
        const progress = {
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
            }
            catch (error) {
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
    async listFilesBatch(files, options) {
        const result = {
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
            }
            catch (error) {
                result.failedFiles++;
                console.error(`Error reading ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        result.totalTime = Date.now() - startTime;
        return result;
    }
    handleBatchResults(result, options) {
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
        }
        else {
            process.exit(0); // Success
        }
    }
    formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
    async run(argv = process.argv) {
        await this.program.parseAsync(argv);
    }
    async compressFile(file, options, config) {
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
        fs.writeFileSync(outputFile, compressed.serialize());
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
    async decompressFile(file, options, config) {
        if (!fs.existsSync(file)) {
            throw new Error(`File not found: ${file}`);
        }
        const compressedData = fs.readFileSync(file);
        let compressed;
        try {
            const { CompressedQuantumData } = require('../models/CompressedQuantumData');
            compressed = CompressedQuantumData.deserialize(compressedData);
        }
        catch (error) {
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
    async testFile(file, options) {
        if (!fs.existsSync(file)) {
            throw new Error(`File not found: ${file}`);
        }
        const compressedData = fs.readFileSync(file);
        const { CompressedQuantumData } = require('../models/CompressedQuantumData');
        const compressed = CompressedQuantumData.deserialize(compressedData);
        // Test decompression without writing to file
        this.engine.decompress(compressed);
        if (options.verbose) {
            console.log(`${file}: OK`);
        }
    }
    async listFile(file, options) {
        if (!fs.existsSync(file)) {
            throw new Error(`File not found: ${file}`);
        }
        const compressedData = fs.readFileSync(file);
        const { CompressedQuantumData } = require('../models/CompressedQuantumData');
        const compressed = CompressedQuantumData.deserialize(compressedData);
        console.log(`\nFile: ${file}`);
        console.log(`Quantum States: ${compressed.quantumStates.length}`);
        console.log(`Entanglement Pairs: ${compressed.entanglementMap.size}`);
        console.log(`Interference Patterns: ${compressed.interferencePatterns.length}`);
        const stats = compressed.getCompressionStats();
        console.log(`Original Size: ${stats.originalSize} bytes`);
        console.log(`Compressed Size: ${stats.compressedSize} bytes`);
        console.log(`Compression Ratio: ${stats.compressionRatio.toFixed(2)}x`);
        console.log(`Space Saved: ${stats.spaceSavedPercentage.toFixed(1)}%`);
        console.log(`Integrity: ${compressed.verifyIntegrity() ? 'Verified' : 'Failed'}`);
    }
    async runBenchmark(options) {
        console.log('QuantumFlow Compression Benchmark');
        console.log('=================================');
        const testFile = options.file || 'benchmark-test.tmp';
        const fileSize = parseInt(options.size) || 1048576; // 1MB default
        const iterations = parseInt(options.iterations) || 5;
        // Create test file if not provided
        if (!options.file) {
            console.log(`Creating test file (${this.formatBytes(fileSize)})...`);
            const testData = Buffer.alloc(fileSize);
            // Fill with semi-random data for realistic compression testing
            for (let i = 0; i < fileSize; i++) {
                testData[i] = Math.floor(Math.random() * 256);
            }
            require('fs').writeFileSync(testFile, testData);
        }
        console.log(`Running ${iterations} iterations...`);
        console.log('');
        const results = [];
        const config = new QuantumConfig_1.QuantumConfig();
        for (let i = 1; i <= iterations; i++) {
            console.log(`Iteration ${i}/${iterations}:`);
            const inputData = require('fs').readFileSync(testFile);
            const startTime = Date.now();
            try {
                const compressed = this.engine.compress(inputData, config);
                const endTime = Date.now();
                const originalSize = inputData.length;
                const compressedSize = compressed.serialize().length;
                const compressionRatio = ((originalSize - compressedSize) / originalSize * 100);
                const processingTime = endTime - startTime;
                const throughput = (originalSize / 1024 / 1024) / (processingTime / 1000); // MB/s
                results.push({
                    originalSize,
                    compressedSize,
                    compressionRatio,
                    processingTime,
                    throughput
                });
                console.log(`  Compression ratio: ${compressionRatio.toFixed(1)}%`);
                console.log(`  Processing time: ${processingTime}ms`);
                console.log(`  Throughput: ${throughput.toFixed(2)} MB/s`);
                console.log('');
            }
            catch (error) {
                console.error(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                console.log('');
            }
        }
        // Calculate averages
        if (results.length > 0) {
            const avgCompressionRatio = results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length;
            const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;
            const avgThroughput = results.reduce((sum, r) => sum + r.throughput, 0) / results.length;
            console.log('Benchmark Results Summary:');
            console.log('=========================');
            console.log(`Average compression ratio: ${avgCompressionRatio.toFixed(1)}%`);
            console.log(`Average processing time: ${avgProcessingTime.toFixed(0)}ms`);
            console.log(`Average throughput: ${avgThroughput.toFixed(2)} MB/s`);
            console.log(`Test file size: ${this.formatBytes(results[0].originalSize)}`);
            console.log(`Iterations: ${results.length}/${iterations}`);
        }
        // Clean up test file if we created it
        if (!options.file && require('fs').existsSync(testFile)) {
            require('fs').unlinkSync(testFile);
        }
    }
    logFileResult(file, result, operation) {
        const ratio = ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(1);
        console.log(`${operation}: ${file}`);
        console.log(`  Original size: ${result.originalSize} bytes`);
        console.log(`  ${operation === 'compressed' ? 'Compressed' : 'Decompressed'} size: ${result.compressedSize} bytes`);
        console.log(`  ${operation === 'compressed' ? 'Compression' : 'Expansion'} ratio: ${ratio}%`);
        console.log(`  Processing time: ${result.processingTime}ms`);
    }
    getProgram() {
        return this.program;
    }
}
exports.QuantumFlowCLI = QuantumFlowCLI;
//# sourceMappingURL=QuantumFlowCLI.js.map