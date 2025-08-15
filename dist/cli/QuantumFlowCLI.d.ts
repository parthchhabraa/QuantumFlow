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
    private expandFileList;
    private getFilesRecursively;
    private createProgressReporter;
    private compressFilesBatch;
    private decompressFilesBatch;
    private testFilesBatch;
    private listFilesBatch;
    private handleBatchResults;
    private formatBytes;
    run(argv?: string[]): Promise<void>;
    private compressFile;
    private decompressFile;
    private testFile;
    private listFile;
    private runBenchmark;
    private logFileResult;
    getProgram(): Command;
}
//# sourceMappingURL=QuantumFlowCLI.d.ts.map