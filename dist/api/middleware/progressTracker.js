"use strict";
/**
 * Progress tracking middleware for API endpoints
 * Provides real-time progress updates for long-running operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateProgress = exports.createProgressTracker = exports.progressCleanupMiddleware = exports.progressTrackingMiddleware = exports.ProgressTracker = void 0;
const ProgressIndicator_1 = require("../../core/ProgressIndicator");
class ProgressTracker {
    constructor(operationId, res, operationName, totalBytes) {
        this.updateInterval = null;
        this.isActive = false;
        this.operationId = operationId;
        this.res = res;
        this.progressIndicator = new ProgressIndicator_1.ProgressIndicator({
            showProgressBar: false, // API doesn't need console output
            showPercentage: true,
            showTimeEstimate: true,
            showThroughput: true,
            updateInterval: 1000, // Update every second for API
            logLevel: 'minimal'
        });
        // Set up progress callback
        this.progressIndicator.onProgress((state) => {
            this.sendProgressUpdate(state);
        });
    }
    /**
     * Start progress tracking for compression
     */
    startCompression(totalBytes) {
        this.progressIndicator.defineSteps(ProgressIndicator_1.ProgressIndicator.createCompressionSteps());
        this.progressIndicator.start('Compression', totalBytes);
        this.isActive = true;
        // Send initial progress update
        this.sendProgressUpdate(this.progressIndicator.getState());
    }
    /**
     * Start progress tracking for decompression
     */
    startDecompression(totalBytes) {
        this.progressIndicator.defineSteps(ProgressIndicator_1.ProgressIndicator.createDecompressionSteps());
        this.progressIndicator.start('Decompression', totalBytes);
        this.isActive = true;
        // Send initial progress update
        this.sendProgressUpdate(this.progressIndicator.getState());
    }
    /**
     * Update current step
     */
    setCurrentStep(stepId, operation) {
        if (this.isActive) {
            this.progressIndicator.setCurrentStep(stepId, operation);
        }
    }
    /**
     * Update step progress
     */
    updateStepProgress(progress, processedBytes) {
        if (this.isActive) {
            this.progressIndicator.updateStepProgress(progress, processedBytes);
        }
    }
    /**
     * Add error to progress
     */
    addError(error) {
        if (this.isActive) {
            this.progressIndicator.addError(error);
        }
    }
    /**
     * Add warning to progress
     */
    addWarning(warning) {
        if (this.isActive) {
            this.progressIndicator.addWarning(warning);
        }
    }
    /**
     * Complete the operation
     */
    complete(message) {
        if (this.isActive) {
            this.progressIndicator.complete(message);
            this.isActive = false;
            // Send final progress update
            this.sendProgressUpdate(this.progressIndicator.getState());
        }
    }
    /**
     * Abort the operation
     */
    abort(reason) {
        if (this.isActive) {
            this.progressIndicator.abort(reason);
            this.isActive = false;
            // Send final progress update
            this.sendProgressUpdate(this.progressIndicator.getState());
        }
    }
    /**
     * Send progress update to client
     */
    sendProgressUpdate(state) {
        if (!this.res.headersSent) {
            const update = {
                operationId: this.operationId,
                progress: state,
                timestamp: new Date()
            };
            // Send Server-Sent Events if client supports it
            if (this.res.get('Accept')?.includes('text/event-stream')) {
                this.res.write(`data: ${JSON.stringify(update)}\n\n`);
            }
        }
    }
    /**
     * Get current progress state
     */
    getState() {
        return this.progressIndicator.getState();
    }
    /**
     * Check if tracking is active
     */
    isTracking() {
        return this.isActive;
    }
}
exports.ProgressTracker = ProgressTracker;
/**
 * Middleware to set up progress tracking for requests
 */
const progressTrackingMiddleware = (req, res, next) => {
    // Generate unique operation ID
    const operationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Add operation ID to response headers
    res.set('X-Operation-ID', operationId);
    // Create progress tracker if client requests it
    const trackProgress = req.headers['x-track-progress'] === 'true' ||
        req.query.trackProgress === 'true';
    if (trackProgress) {
        // Set up Server-Sent Events if requested
        if (req.headers.accept?.includes('text/event-stream')) {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });
            // Send initial connection message
            res.write(`data: ${JSON.stringify({
                type: 'connection',
                operationId,
                message: 'Progress tracking started'
            })}\n\n`);
        }
        // Create progress tracker
        req.progressTracker = new ProgressTracker(operationId, res, req.path);
    }
    next();
};
exports.progressTrackingMiddleware = progressTrackingMiddleware;
/**
 * Middleware to handle progress tracking cleanup
 */
const progressCleanupMiddleware = (req, res, next) => {
    // Clean up progress tracker on response finish
    res.on('finish', () => {
        if (req.progressTracker && req.progressTracker.isTracking()) {
            req.progressTracker.complete();
        }
    });
    // Clean up on client disconnect
    res.on('close', () => {
        if (req.progressTracker && req.progressTracker.isTracking()) {
            req.progressTracker.abort('Client disconnected');
        }
    });
    next();
};
exports.progressCleanupMiddleware = progressCleanupMiddleware;
/**
 * Create a progress tracker for a specific operation
 */
const createProgressTracker = (operationId, res, operationName, totalBytes) => {
    return new ProgressTracker(operationId, res, operationName, totalBytes);
};
exports.createProgressTracker = createProgressTracker;
/**
 * Simulate progress for demonstration purposes
 */
const simulateProgress = async (tracker, operation, duration = 5000) => {
    return new Promise((resolve) => {
        if (operation === 'compression') {
            tracker.startCompression();
        }
        else {
            tracker.startDecompression();
        }
        const steps = operation === 'compression'
            ? ProgressIndicator_1.ProgressIndicator.createCompressionSteps()
            : ProgressIndicator_1.ProgressIndicator.createDecompressionSteps();
        let currentStepIndex = 0;
        const stepDuration = duration / steps.length;
        const processStep = () => {
            if (currentStepIndex >= steps.length) {
                tracker.complete(`${operation} completed successfully`);
                resolve();
                return;
            }
            const step = steps[currentStepIndex];
            tracker.setCurrentStep(step.id, step.description);
            // Simulate step progress
            let stepProgress = 0;
            const progressInterval = setInterval(() => {
                stepProgress += 0.1;
                tracker.updateStepProgress(Math.min(1, stepProgress));
                if (stepProgress >= 1) {
                    clearInterval(progressInterval);
                    currentStepIndex++;
                    setTimeout(processStep, 100);
                }
            }, stepDuration / 10);
        };
        processStep();
    });
};
exports.simulateProgress = simulateProgress;
//# sourceMappingURL=progressTracker.js.map