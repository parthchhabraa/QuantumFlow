/**
 * Progress tracking middleware for API endpoints
 * Provides real-time progress updates for long-running operations
 */
import { Request, Response, NextFunction } from 'express';
import { ProgressState } from '../../core/ProgressIndicator';
export interface ProgressRequest extends Request {
    progressTracker?: ProgressTracker;
}
export interface ProgressUpdate {
    operationId: string;
    progress: ProgressState;
    timestamp: Date;
}
export declare class ProgressTracker {
    private progressIndicator;
    private operationId;
    private res;
    private updateInterval;
    private isActive;
    constructor(operationId: string, res: Response, operationName: string, totalBytes?: number);
    /**
     * Start progress tracking for compression
     */
    startCompression(totalBytes?: number): void;
    /**
     * Start progress tracking for decompression
     */
    startDecompression(totalBytes?: number): void;
    /**
     * Update current step
     */
    setCurrentStep(stepId: string, operation?: string): void;
    /**
     * Update step progress
     */
    updateStepProgress(progress: number, processedBytes?: number): void;
    /**
     * Add error to progress
     */
    addError(error: string): void;
    /**
     * Add warning to progress
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
     * Send progress update to client
     */
    private sendProgressUpdate;
    /**
     * Get current progress state
     */
    getState(): ProgressState;
    /**
     * Check if tracking is active
     */
    isTracking(): boolean;
}
/**
 * Middleware to set up progress tracking for requests
 */
export declare const progressTrackingMiddleware: (req: ProgressRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to handle progress tracking cleanup
 */
export declare const progressCleanupMiddleware: (req: ProgressRequest, res: Response, next: NextFunction) => void;
/**
 * Create a progress tracker for a specific operation
 */
export declare const createProgressTracker: (operationId: string, res: Response, operationName: string, totalBytes?: number) => ProgressTracker;
/**
 * Simulate progress for demonstration purposes
 */
export declare const simulateProgress: (tracker: ProgressTracker, operation: "compression" | "decompression", duration?: number) => Promise<void>;
//# sourceMappingURL=progressTracker.d.ts.map