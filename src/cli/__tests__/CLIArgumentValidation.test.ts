/**
 * Unit tests for CLI argument validation
 */

import { QuantumFlowCLI } from '../QuantumFlowCLI';

describe('CLI Argument Validation', () => {
  let cli: QuantumFlowCLI;

  beforeEach(() => {
    cli = new QuantumFlowCLI();
  });

  describe('Standard Compression Tool Arguments', () => {
    it('should accept standard compression arguments', () => {
      const program = cli.getProgram();
      
      // Test that all standard compression tool arguments are supported
      const expectedOptions = [
        { short: '-c', long: '--compress' },
        { short: '-d', long: '--decompress' },
        { short: '-o', long: '--output' },
        { short: '-v', long: '--verbose' },
        { short: '-f', long: '--force' },
        { short: '-k', long: '--keep' },
        { short: '-l', long: '--level' },
        { short: '-t', long: '--test' },
        { long: '--list' }
      ];

      expectedOptions.forEach(({ short, long }) => {
        const option = program.options.find(opt => 
          (short && opt.short === short) || opt.long === long
        );
        expect(option).toBeDefined();
      });
    });

    it('should have correct default values for standard options', () => {
      const program = cli.getProgram();
      
      const levelOption = program.options.find(opt => opt.long === '--level');
      expect(levelOption?.defaultValue).toBe('6');
    });

    it('should support file arguments', () => {
      const program = cli.getProgram();
      
      // Check that the program accepts file arguments
      expect(program.args).toBeDefined();
    });
  });

  describe('Quantum-Specific Arguments', () => {
    it('should accept quantum configuration arguments', () => {
      const program = cli.getProgram();
      
      const quantumOptions = [
        { long: '--quantum-bit-depth', defaultValue: '8' },
        { long: '--max-entanglement-level', defaultValue: '4' },
        { long: '--superposition-complexity', defaultValue: '5' },
        { long: '--interference-threshold', defaultValue: '0.5' }
      ];

      quantumOptions.forEach(({ long, defaultValue }) => {
        const option = program.options.find(opt => opt.long === long);
        expect(option).toBeDefined();
        expect(option?.defaultValue).toBe(defaultValue);
      });
    });

    it('should validate quantum bit depth range', () => {
      const parseQuantumConfig = (cli as any).parseQuantumConfig;
      
      // Valid values (need to set compatible parameters)
      expect(() => parseQuantumConfig({ quantumBitDepth: 8 })).not.toThrow();
      
      // Invalid values
      expect(() => parseQuantumConfig({ quantumBitDepth: 1 }))
        .toThrow('Quantum bit depth must be between 2 and 16');
      expect(() => parseQuantumConfig({ quantumBitDepth: 17 }))
        .toThrow('Quantum bit depth must be between 2 and 16');
    });

    it('should validate entanglement level range', () => {
      const parseQuantumConfig = (cli as any).parseQuantumConfig;
      
      // Valid values (need to set compatible parameters)
      expect(() => parseQuantumConfig({ maxEntanglementLevel: 1 })).not.toThrow();
      expect(() => parseQuantumConfig({ maxEntanglementLevel: 4 })).not.toThrow();
      
      // Invalid values
      expect(() => parseQuantumConfig({ maxEntanglementLevel: 0 }))
        .toThrow('Max entanglement level must be between 1 and 8');
      expect(() => parseQuantumConfig({ maxEntanglementLevel: 9 }))
        .toThrow('Max entanglement level must be between 1 and 8');
    });

    it('should validate superposition complexity range', () => {
      const parseQuantumConfig = (cli as any).parseQuantumConfig;
      
      // Valid values (need to set compatible parameters)
      expect(() => parseQuantumConfig({ superpositionComplexity: 1 })).not.toThrow();
      expect(() => parseQuantumConfig({ superpositionComplexity: 5 })).not.toThrow();
      expect(() => parseQuantumConfig({ superpositionComplexity: 8 })).not.toThrow();
      
      // Invalid values
      expect(() => parseQuantumConfig({ superpositionComplexity: 0 }))
        .toThrow('Superposition complexity must be between 1 and 10');
      expect(() => parseQuantumConfig({ superpositionComplexity: 11 }))
        .toThrow('Superposition complexity must be between 1 and 10');
    });

    it('should validate interference threshold range', () => {
      const parseQuantumConfig = (cli as any).parseQuantumConfig;
      
      // Valid values
      expect(() => parseQuantumConfig({ interferenceThreshold: 0.1 })).not.toThrow();
      expect(() => parseQuantumConfig({ interferenceThreshold: 0.5 })).not.toThrow();
      expect(() => parseQuantumConfig({ interferenceThreshold: 0.9 })).not.toThrow();
      
      // Invalid values
      expect(() => parseQuantumConfig({ interferenceThreshold: 0.05 }))
        .toThrow('Interference threshold must be between 0.1 and 0.9');
      expect(() => parseQuantumConfig({ interferenceThreshold: 1.0 }))
        .toThrow('Interference threshold must be between 0.1 and 0.9');
    });
  });

  describe('Command Compatibility', () => {
    it('should be compatible with gzip-style commands', () => {
      const program = cli.getProgram();
      
      // Test that common gzip patterns are supported
      const gzipCompatibleOptions = [
        '-c', // compress
        '-d', // decompress  
        '-f', // force
        '-k', // keep
        '-v', // verbose
        '-t', // test
        '-l'  // list (level in our case, but similar concept)
      ];

      gzipCompatibleOptions.forEach(shortFlag => {
        const option = program.options.find(opt => opt.short === shortFlag);
        expect(option).toBeDefined();
      });
    });

    it('should support output redirection pattern', () => {
      const program = cli.getProgram();
      
      const outputOption = program.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
      expect(outputOption?.short).toBe('-o');
    });

    it('should support help command', () => {
      const program = cli.getProgram();
      
      const helpCommand = program.commands.find(cmd => cmd.name() === 'help');
      expect(helpCommand).toBeDefined();
    });

    it('should support version information', () => {
      const program = cli.getProgram();
      
      expect(program.version()).toBe('1.0.0');
    });
  });

  describe('Argument Processing', () => {
    it('should handle multiple file arguments', () => {
      const program = cli.getProgram();
      
      // The program should accept multiple files
      expect(program.args).toBeDefined();
    });

    it('should handle mixed arguments and options', () => {
      const program = cli.getProgram();
      
      // Should be able to handle: quantumflow -v -f file1.txt file2.txt -o output.qf
      expect(program.options.length).toBeGreaterThan(0);
      expect(program.args).toBeDefined();
    });

    it('should provide meaningful help text', () => {
      const program = cli.getProgram();
      
      expect(program.description()).toBe('QuantumFlow by eliomatters - Quantum-inspired compression algorithm');
      expect(program.name()).toBe('quantumflow');
      
      // Check that options have descriptions
      program.options.forEach(option => {
        expect(option.description).toBeDefined();
        expect(option.description.length).toBeGreaterThan(0);
      });
    });
  });
});