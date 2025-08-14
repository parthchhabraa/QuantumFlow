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
            .option('--quantum-bit-depth <n>', 'quantum bit depth (2-16)', '8')
            .option('--max-entanglement-level <n>', 'max entanglement level (1-8)', '4')
            .option('--superposition-complexity <n>', 'superposition complexity (1-10)', '5')
            .option('--interference-threshold <n>', 'interference threshold (0.1-0.9)', '0.5')
            .action((files, options) => {
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
    async handleCommand(files, options) {
        try {
            // Validate arguments
            if (files.length === 0) {
                console.error('Error: No input files specified');
                process.exit(1);
            }
            // Parse quantum configuration
            const config = this.parseQuantumConfig(options);
            // Determine operation mode
            const isDecompress = options.decompress || files.some(f => f.endsWith('.qf'));
            if (options.test) {
                await this.testFiles(files, options);
            }
            else if (options.list) {
                await this.listFiles(files, options);
            }
            else if (isDecompress) {
                await this.decompressFiles(files, options, config);
            }
            else {
                await this.compressFiles(files, options, config);
            }
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
                // Create a CompressedQuantumData object from the parsed JSON
                const { CompressedQuantumData } = require('../models/CompressedQuantumData');
                compressed = Object.assign(new CompressedQuantumData(), parsedData);
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
                const compressedData = fs.readFileSync(file, 'utf8');
                const parsedData = JSON.parse(compressedData);
                // Create a CompressedQuantumData object from the parsed JSON
                const { CompressedQuantumData } = require('../models/CompressedQuantumData');
                const compressed = Object.assign(new CompressedQuantumData(), parsedData);
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
    async run(argv = process.argv) {
        await this.program.parseAsync(argv);
    }
    getProgram() {
        return this.program;
    }
}
exports.QuantumFlowCLI = QuantumFlowCLI;
//# sourceMappingURL=QuantumFlowCLI.js.map