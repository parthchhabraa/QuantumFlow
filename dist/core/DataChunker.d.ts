/**
 * Advanced data chunking algorithms for optimal quantum state preparation
 * Implements various chunking strategies based on data characteristics
 */
export declare class DataChunker {
    private _strategy;
    private _baseChunkSize;
    private _maxChunkSize;
    private _minChunkSize;
    constructor(strategy?: ChunkingStrategy, baseChunkSize?: number, minChunkSize?: number, maxChunkSize?: number);
    /**
     * Get current chunking strategy
     */
    get strategy(): ChunkingStrategy;
    /**
     * Set chunking strategy
     */
    set strategy(value: ChunkingStrategy);
    /**
     * Get base chunk size
     */
    get baseChunkSize(): number;
    /**
     * Set base chunk size
     */
    set baseChunkSize(value: number);
    /**
     * Get minimum chunk size
     */
    get minChunkSize(): number;
    /**
     * Set minimum chunk size
     */
    set minChunkSize(value: number);
    /**
     * Get maximum chunk size
     */
    get maxChunkSize(): number;
    /**
     * Set maximum chunk size
     */
    set maxChunkSize(value: number);
    /**
     * Chunk data using the selected strategy
     */
    chunkData(data: Buffer): DataChunk[];
    /**
     * Fixed-size chunking (traditional approach)
     */
    private fixedSizeChunking;
    /**
     * Entropy-based chunking (variable size based on information content)
     */
    private entropyBasedChunking;
    /**
     * Pattern-based chunking (break at pattern boundaries)
     */
    private patternBasedChunking;
    /**
     * Adaptive chunking (combines multiple strategies)
     */
    private adaptiveChunking;
    /**
     * Boundary-based chunking (break at natural data boundaries)
     */
    private boundaryBasedChunking;
    /**
     * Calculate entropy score for chunk size optimization
     */
    private calculateEntropyScore;
    /**
     * Check if position is a pattern boundary
     */
    private isPatternBoundary;
    /**
     * Check if position is a natural boundary
     */
    private isNaturalBoundary;
    /**
     * Calculate entropy of a chunk
     */
    private calculateChunkEntropy;
    /**
     * Calculate complexity of a chunk
     */
    private calculateChunkComplexity;
    /**
     * Analyze chunking effectiveness
     */
    analyzeChunking(chunks: DataChunk[]): ChunkingAnalysis;
    /**
     * Optimize chunking strategy for given data
     */
    optimizeStrategy(data: Buffer): ChunkingStrategy;
    /**
     * Validate chunking parameters
     */
    private validateParameters;
    /**
     * Validate individual chunk size
     */
    private validateChunkSize;
}
/**
 * Chunking strategy types
 */
export type ChunkingStrategy = 'fixed-size' | 'entropy-based' | 'pattern-based' | 'adaptive' | 'boundary-based';
/**
 * Data chunk information
 */
export interface DataChunk {
    data: Buffer;
    startIndex: number;
    endIndex: number;
    size: number;
    entropy: number;
    complexity: number;
}
/**
 * Chunking analysis results
 */
export interface ChunkingAnalysis {
    totalChunks: number;
    averageChunkSize: number;
    minChunkSize: number;
    maxChunkSize: number;
    averageEntropy: number;
    averageComplexity: number;
    sizeVariance: number;
    entropyVariance: number;
}
//# sourceMappingURL=DataChunker.d.ts.map