/**
 * Progress indicator system for long-running QuantumFlow operations
 * Provides real-time feedback and estimated completion times
 */
export interface ProgressStep {
    id: string;
    name: string;
    description: string;
    weight: number;
    estimatedDuration?: number;
}
export interface ProgressState {
    currentStep: string;
    stepProgress: number;
    overallProgress: number;
    startTime: number;
    elapsedTime: number;
    estimatedTimeRemaining: number;
    currentOperation: string;
    processedBytes?: number;
    totalBytes?: number;
    throughput?: number;
    memoryUsage?: number;
    errors: string[];
    warnings: string[];
}
export interface ProgressOptions {
    showProgressBar: boolean;
    showPercentage: boolean;
    showTimeEstimate: boolean;
    showThroughput: boolean;
    showMemoryUsage: boolean;
    updateInterval: number;
    barWidth: number;
    useColors: boolean;
    logLevel: 'minimal' | 'normal' | 'verbose';
}
export declare class ProgressIndicator {
    private steps;
    private state;
    private options;
    private updateTimer?;
    private lastUpdateTime;
    private callbacks;
    private isActive;
    constructor(options?: Partial<ProgressOptions>);
    /**
     * Define the steps for the operation
     */
    defineSteps(steps: ProgressStep[]): void;
    /**
     * Start progress tracking
     */
    start(operationName: string, totalBytes?: number): void;
    /**
     * Update current step
     */
    setCurrentStep(stepId: string, operation?: string): void;
    /**
     * Update progress for current step
     */
    updateStepProgress(progress: number, processedBytes?: number): void;
    /**
     * Add an error message
     */
    addError(error: string): void;
    /**
     * Add a warning message
     */
    addWarning(warning: string): void;
    /**
     * Complete the operation
     */
    complete(message?: string): void;
    /**
     * Abort the operation
     */
    abort(reason?: string): void;
    /**
     * Add progress callback
     */
    onProgress(callback: (state: ProgressState) => void): void;
    /**
     * Remove progress callback
     */
    removeCallback(callback: (state: ProgressState) => void): void;
    /**
     * Get current progress state
     */
    getState(): ProgressState;
    /**
     * Check if progress tracking is active
     */
    isTracking(): boolean;
    /**
     * Update overall progress based on step progress
     */
    private updateOverallProgress;
    /**
     * Update time estimates
     */
    private updateTimeEstimates;
    /**
     * Update throughput calculation
     */
    private updateThroughput;
    /**
     * Update memory usage
     */
    private updateMemoryUsage;
    /**
     * Update display
     */
    private updateDisplay;
    /**
     * Render progress bar
     */
    private renderProgressBar;
    /**
     * Notify all callbacks
     */
    private notifyCallbacks;
    /**
     * Format duration in human-readable format
     */
    private formatDuration;
    /**
     * Format bytes in human-readable format
     */
    private formatBytes;
    /**
     * Create default compression steps
     */
    static createCompressionSteps(): ProgressStep[];
    /**
     * Create default decompression steps
     */
    static createDecompressionSteps(): ProgressStep[];
}
//# sourceMappingURL=ProgressIndicator.d.ts.map