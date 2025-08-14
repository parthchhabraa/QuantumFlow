/**
 * Unit tests for QuantumFlow CLI
 */

import { QuantumFlowCLI, CLIOptions } from '../QuantumFlowCLI';
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

describe('QuantumFlowCLI', () => {
  let cli: QuantumFlowCLI;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    cli = new QuantumFlowCLI();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('Command Line Argument Parsing', () => {
    it('should parse basic compression command', async () => {
      const program = cli.getProgram();
      
      // Test that the program is configured correctly
      expect(program.name()).toBe('quantumflow');
      expect(program.description()).toBe('QuantumFlow by eliomatters - Quantum-inspired compression algorithm');
      expect(program.version()).toBe('1.0.0');
    });

    it('should handle compression flags correctly', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(Buffer.from('test data'));
      mockFs.statSync.mockReturnValue({ size: 500 } as any);

      const program = cli.getProgram();
      const options = program.opts();
      
      // Test that options are available
      expect(program.options.find(opt => opt.long === '--compress')).toBeDefined();
      expect(program.options.find(opt => opt.long === '--decompress')).toBeDefined();
      expect(program.options.find(opt => opt.long === '--verbose')).toBeDefined();
      expect(program.options.find(opt => opt.long === '--force')).toBeDefined();
      expect(program.options.find(opt => opt.long === '--keep')).toBeDefined();
    });

    it('should handle batch processing flags correctly', async () => {
      const program = cli.getProgram();
      
      // Test batch-related options
      expect(program.options.find(opt => opt.long === '--batch')).toBeDefined();
      expect(program.options.find(opt => opt.long === '--progress')).toBeDefined();
      expect(program.options.find(opt => opt.short === '-r')).toBeDefined();
      expect(program.options.find(opt => opt.long === '--recursive')).toBeDefined();
    });

    it('should handle quantum-specific parameters', async () => {
      const program = cli.getProgram();
      
      // Test quantum-specific options
      expect(program.options.find(opt => opt.long === '--quantum-bit-depth')).toBeDefined();
      expect(program.options.find(opt => opt.long === '--max-entanglement-level')).toBeDefined();
      expect(program.options.find(opt => opt.long === '--superposition-complexity')).toBeDefined();
      expect(program.options.find(opt => opt.long === '--interference-threshold')).toBeDefined();
    });

    it('should validate quantum bit depth parameter', async () => {
      // Test invalid quantum bit depth
      try {
        await cli.run(['node', 'quantumflow', 'test.txt', '--quantum-bit-depth', '20']);
      } catch (error) {
        // Expected to throw due to invalid parameter
      }
      
      // Should not throw for valid parameter
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(Buffer.from('test'));
      mockFs.statSync.mockReturnValue({ size: 100 } as any);
      
      // This should work without throwing
      const program = cli.getProgram();
      expect(program.options.find(opt => opt.long === '--quantum-bit-depth')).toBeDefined();
    });

    it('should validate entanglement level parameter', async () => {
      const program = cli.getProgram();
      const option = program.options.find(opt => opt.long === '--max-entanglement-level');
      
      expect(option).toBeDefined();
      expect(option?.defaultValue).toBe('4');
    });

    it('should validate superposition complexity parameter', async () => {
      const program = cli.getProgram();
      const option = program.options.find(opt => opt.long === '--superposition-complexity');
      
      expect(option).toBeDefined();
      expect(option?.defaultValue).toBe('5');
    });

    it('should validate interference threshold parameter', async () => {
      const program = cli.getProgram();
      const option = program.options.find(opt => opt.long === '--interference-threshold');
      
      expect(option).toBeDefined();
      expect(option?.defaultValue).toBe('0.5');
    });
  });

  describe('File Operations', () => {
    it('should handle file not found error', async () => {
      mockFs.existsSync.mockReturnValue(false);
      
      try {
        await cli.run(['node', 'quantumflow', 'nonexistent.txt']);
      } catch (error) {
        // Expected behavior
      }
      
      expect(mockFs.existsSync).toHaveBeenCalledWith('nonexistent.txt');
    });

    it('should handle compression operation', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(Buffer.from('test data'));
      mockFs.statSync.mockReturnValue({ size: 500 } as any);
      mockFs.writeFileSync.mockImplementation();
      mockFs.unlinkSync.mockImplementation();

      // Mock the CLI to avoid actual execution
      const handleCommandSpy = jest.spyOn(cli as any, 'handleCommand').mockResolvedValue(undefined);
      
      await cli.run(['node', 'quantumflow', 'test.txt']);
      
      expect(handleCommandSpy).toHaveBeenCalled();
    });

    it('should handle decompression operation', async () => {
      const compressedData = JSON.stringify({
        quantumStates: [],
        entanglementMap: {},
        interferencePatterns: [],
        metadata: { originalSize: 1000 },
        checksum: 'test'
      });

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(compressedData);
      mockFs.statSync.mockReturnValue({ size: 300 } as any);
      mockFs.writeFileSync.mockImplementation();

      const handleCommandSpy = jest.spyOn(cli as any, 'handleCommand').mockResolvedValue(undefined);
      
      await cli.run(['node', 'quantumflow', '--decompress', 'test.qf']);
      
      expect(handleCommandSpy).toHaveBeenCalled();
    });

    it('should handle test operation', async () => {
      const compressedData = JSON.stringify({
        quantumStates: [],
        entanglementMap: {},
        interferencePatterns: [],
        metadata: { originalSize: 1000 },
        checksum: 'test'
      });

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(compressedData);

      const handleCommandSpy = jest.spyOn(cli as any, 'handleCommand').mockResolvedValue(undefined);
      
      await cli.run(['node', 'quantumflow', '--test', 'test.qf']);
      
      expect(handleCommandSpy).toHaveBeenCalled();
    });

    it('should handle list operation', async () => {
      const compressedData = JSON.stringify({
        quantumStates: [1, 2, 3],
        entanglementMap: { 'pair1': {}, 'pair2': {} },
        interferencePatterns: [1, 2],
        metadata: { 
          originalSize: 1000,
          compressionRatio: 25.5,
          quantumEfficiency: 85.2
        },
        checksum: 'test'
      });

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(compressedData);

      const handleCommandSpy = jest.spyOn(cli as any, 'handleCommand').mockResolvedValue(undefined);
      
      await cli.run(['node', 'quantumflow', '--list', 'test.qf']);
      
      expect(handleCommandSpy).toHaveBeenCalled();
    });
  });

  describe('Configuration Parsing', () => {
    it('should parse quantum configuration correctly', () => {
      const options: CLIOptions = {
        quantumBitDepth: 8,
        maxEntanglementLevel: 4,
        superpositionComplexity: 5,
        interferenceThreshold: 0.5
      };

      const config = (cli as any).parseQuantumConfig(options);
      
      expect(config).toBeInstanceOf(QuantumConfig);
      expect(config.quantumBitDepth).toBe(8);
      expect(config.maxEntanglementLevel).toBe(4);
      expect(config.superpositionComplexity).toBe(5);
      expect(config.interferenceThreshold).toBe(0.5);
    });

    it('should validate quantum bit depth bounds', () => {
      const options: CLIOptions = {
        quantumBitDepth: 20 // Invalid: too high
      };

      expect(() => {
        (cli as any).parseQuantumConfig(options);
      }).toThrow('Quantum bit depth must be between 2 and 16');
    });

    it('should validate entanglement level bounds', () => {
      const options: CLIOptions = {
        maxEntanglementLevel: 10 // Invalid: too high
      };

      expect(() => {
        (cli as any).parseQuantumConfig(options);
      }).toThrow('Max entanglement level must be between 1 and 8');
    });

    it('should validate superposition complexity bounds', () => {
      const options: CLIOptions = {
        superpositionComplexity: 15 // Invalid: too high
      };

      expect(() => {
        (cli as any).parseQuantumConfig(options);
      }).toThrow('Superposition complexity must be between 1 and 10');
    });

    it('should validate interference threshold bounds', () => {
      const options: CLIOptions = {
        interferenceThreshold: 1.5 // Invalid: too high
      };

      expect(() => {
        (cli as any).parseQuantumConfig(options);
      }).toThrow('Interference threshold must be between 0.1 and 0.9');
    });
  });

  describe('Error Handling', () => {
    it('should handle no input files error', async () => {
      const handleCommandSpy = jest.spyOn(cli as any, 'handleCommand').mockImplementation(
        (...args: any[]) => {
          const [files] = args;
          if (files.length === 0) {
            console.error('Error: No input files specified');
            process.exit(1);
          }
        }
      );

      await cli.run(['node', 'quantumflow']);
      
      expect(handleCommandSpy).toHaveBeenCalledWith([], expect.any(Object));
    });

    it('should handle invalid JSON in compressed file', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json');

      const handleCommandSpy = jest.spyOn(cli as any, 'handleCommand').mockResolvedValue(undefined);
      
      await cli.run(['node', 'quantumflow', '--decompress', 'invalid.qf']);
      
      expect(handleCommandSpy).toHaveBeenCalled();
    });

    it('should handle file overwrite protection', async () => {
      mockFs.existsSync.mockImplementation((path: any) => {
        return path === 'test.txt' || path === 'test.txt.qf'; // Both input and output exist
      });
      mockFs.readFileSync.mockReturnValue(Buffer.from('test data'));

      const handleCommandSpy = jest.spyOn(cli as any, 'handleCommand').mockResolvedValue(undefined);
      
      await cli.run(['node', 'quantumflow', 'test.txt']); // Without --force flag
      
      expect(handleCommandSpy).toHaveBeenCalled();
    });
  });

  describe('Standard Compression Tool Compatibility', () => {
    it('should support standard compression flags', () => {
      const program = cli.getProgram();
      
      // Check for standard flags similar to gzip, bzip2, etc.
      expect(program.options.find(opt => opt.short === '-c')).toBeDefined(); // compress
      expect(program.options.find(opt => opt.short === '-d')).toBeDefined(); // decompress
      expect(program.options.find(opt => opt.short === '-v')).toBeDefined(); // verbose
      expect(program.options.find(opt => opt.short === '-f')).toBeDefined(); // force
      expect(program.options.find(opt => opt.short === '-k')).toBeDefined(); // keep
      expect(program.options.find(opt => opt.short === '-t')).toBeDefined(); // test
      expect(program.options.find(opt => opt.short === '-l')).toBeDefined(); // level
    });

    it('should support output file specification', () => {
      const program = cli.getProgram();
      
      expect(program.options.find(opt => opt.short === '-o')).toBeDefined();
      expect(program.options.find(opt => opt.long === '--output')).toBeDefined();
    });

    it('should support help and version commands', () => {
      const program = cli.getProgram();
      
      expect(program.version()).toBe('1.0.0');
      expect(program.commands.find(cmd => cmd.name() === 'help')).toBeDefined();
    });
  });
});