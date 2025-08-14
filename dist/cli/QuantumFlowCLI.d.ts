/**
 * QuantumFlow CLI Interface
 * Command-line interface for quantum compression operations
 */
import { Command } from 'commander';
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
}
export declare class QuantumFlowCLI {
    private program;
    private engine;
    constructor();
    private setupCommands;
    private handleCommand;
    private parseQuantumConfig;
    private compressFiles;
    private decompressFiles;
    private testFiles;
    private listFiles;
    run(argv?: string[]): Promise<void>;
    getProgram(): Command;
}
//# sourceMappingURL=QuantumFlowCLI.d.ts.map