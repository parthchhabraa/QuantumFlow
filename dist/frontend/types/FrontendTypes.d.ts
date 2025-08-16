export interface FrontendQuantumMetrics {
    compressionRatio: number;
    processingTime: number;
    quantumEfficiency: number;
    originalSize: number;
    compressedSize: number;
    spaceSaved: number;
    entanglementPairs: number;
    superpositionStates: number;
    interferencePatterns: number;
}
export interface FrontendQuantumConfig {
    quantumBitDepth: number;
    maxEntanglementLevel: number;
    superpositionComplexity: number;
    interferenceThreshold: number;
}
export interface ProgressState {
    phase: string;
    progress: number;
    message: string;
}
export interface DecompressionResult {
    originalFileName: string;
    compressedSize: number;
    decompressedSize: number;
    decompressionTime: number;
    quantumIntegrity: number;
    entanglementPairsRestored: number;
    superpositionStatesCollapsed: number;
    interferencePatternsMapped: number;
    timestamp: number;
}
//# sourceMappingURL=FrontendTypes.d.ts.map