/**
 * Performance Profiler for Quantum Compression Engine
 * Task 13.2: Profile and optimize critical performance bottlenecks
 *
 * This profiler identifies performance bottlenecks and provides optimization recommendations
 */
export interface PerformanceProfile {
    operation: string;
    startTime: number;
    endTime: number;
    duration: number;
    memoryBefore: NodeJS.MemoryUsage;
    memoryAfter: NodeJS.MemoryUsage;
    memoryDelta: number;
    metadata?: any;
}
export interface BottleneckAnalysis {
    operation: string;
    totalTime: number;
    averageTime: number;
    callCount: number;
    memoryImpact: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
}
export interface OptimizationSuggestion {
    category: 'memory' | 'cpu' | 'algorithm' | 'configuration';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    expectedImprovement: string;
    implementation: string;
}
export declare class PerformanceProfiler {
    private profiles;
    private activeOperations;
    private enabled;
    /**
     * Enable or disable profiling
     */
    setEnabled(enabled: boolean): void;
    /**
     * Start profiling an operation
     */
    startOperation(operationId: string, metadata?: any): void;
    /**
     * End profiling an operation
     */
    endOperation(operationId: string): PerformanceProfile | null;
    /**
     * Get all profiles for an operation
     */
    getProfiles(operationId: string): PerformanceProfile[];
    /**
     * Get all operation IDs
     */
    getOperationIds(): string[];
    /**
     * Analyze bottlenecks across all operations
     */
    analyzeBottlenecks(): BottleneckAnalysis[];
    /**
     * Generate optimization suggestions based on profiling data
     */
    generateOptimizationSuggestions(): OptimizationSuggestion[];
    /**
     * Generate a comprehensive performance report
     */
    generateReport(): string;
    /**
     * Clear all profiling data
     */
    clear(): void;
    /**
     * Get memory usage statistics
     */
    getMemoryStats(): {
        current: NodeJS.MemoryUsage;
        peak: number;
        average: number;
    };
}
//# sourceMappingURL=PerformanceProfiler.d.ts.map