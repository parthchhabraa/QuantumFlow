/**
 * Progress tracking middleware for API endpoints
 * Provides real-time progress updates for long-running operations
 */

import { Request, Response, NextFunction } from 'express';
import { ProgressIndicator, ProgressState } from '../../core/ProgressIndicator';

export interface ProgressRequest extends Request {
  progressTracker?: ProgressTracker;
}

export interface ProgressUpdate {
  operationId: string;
  progress: ProgressState;
  timestamp: Date;
}

export class ProgressTracker {
  private progressIndicator: ProgressIndicator;
  private operationId: string;
  private res: Response;
  private updateInterval: NodeJS.Timeout | null = null;
  private isActive: boolean = false;

  constructor(operationId: string, res: Response, operationName: string, totalBytes?: number) {
    this.operationId = operationId;
    this.res = res;
    
    this.progressIndicator = new ProgressIndicator({
      showProgressBar: false, // API doesn't need console output
      showPercentage: true,
      showTimeEstimate: true,
      showThroughput: true,
      updateInterval: 1000, // Update every second for API
      logLevel: 'minimal'
    });

    // Set up progress callback
    this.progressIndicator.onProgress((state: ProgressState) => {
      this.sendProgressUpdate(state);
    });
  }

  /**
   * Start progress tracking for compression
   */
  startCompression(totalBytes?: number): void {
    this.progressIndicator.defineSteps(ProgressIndicator.createCompressionSteps());
    this.progressIndicator.start('Compression', totalBytes);
    this.isActive = true;
    
    // Send initial progress update
    this.sendProgressUpdate(this.progressIndicator.getState());
  }

  /**
   * Start progress tracking for decompression
   */
  startDecompression(totalBytes?: number): void {
    this.progressIndicator.defineSteps(ProgressIndicator.createDecompressionSteps());
    this.progressIndicator.start('Decompression', totalBytes);
    this.isActive = true;
    
    // Send initial progress update
    this.sendProgressUpdate(this.progressIndicator.getState());
  }

  /**
   * Update current step
   */
  setCurrentStep(stepId: string, operation?: string): void {
    if (this.isActive) {
      this.progressIndicator.setCurrentStep(stepId, operation);
    }
  }

  /**
   * Update step progress
   */
  updateStepProgress(progress: number, processedBytes?: number): void {
    if (this.isActive) {
      this.progressIndicator.updateStepProgress(progress, processedBytes);
    }
  }

  /**
   * Add error to progress
   */
  addError(error: string): void {
    if (this.isActive) {
      this.progressIndicator.addError(error);
    }
  }

  /**
   * Add warning to progress
   */
  addWarning(warning: string): void {
    if (this.isActive) {
      this.progressIndicator.addWarning(warning);
    }
  }

  /**
   * Complete the operation
   */
  complete(message?: string): void {
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
  abort(reason?: string): void {
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
  private sendProgressUpdate(state: ProgressState): void {
    if (!this.res.headersSent) {
      const update: ProgressUpdate = {
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
  getState(): ProgressState {
    return this.progressIndicator.getState();
  }

  /**
   * Check if tracking is active
   */
  isTracking(): boolean {
    return this.isActive;
  }
}

/**
 * Middleware to set up progress tracking for requests
 */
export const progressTrackingMiddleware = (
  req: ProgressRequest,
  res: Response,
  next: NextFunction
): void => {
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
    req.progressTracker = new ProgressTracker(
      operationId,
      res,
      req.path
    );
  }
  
  next();
};

/**
 * Middleware to handle progress tracking cleanup
 */
export const progressCleanupMiddleware = (
  req: ProgressRequest,
  res: Response,
  next: NextFunction
): void => {
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

/**
 * Create a progress tracker for a specific operation
 */
export const createProgressTracker = (
  operationId: string,
  res: Response,
  operationName: string,
  totalBytes?: number
): ProgressTracker => {
  return new ProgressTracker(operationId, res, operationName, totalBytes);
};

/**
 * Simulate progress for demonstration purposes
 */
export const simulateProgress = async (
  tracker: ProgressTracker,
  operation: 'compression' | 'decompression',
  duration: number = 5000
): Promise<void> => {
  return new Promise((resolve) => {
    if (operation === 'compression') {
      tracker.startCompression();
    } else {
      tracker.startDecompression();
    }

    const steps = operation === 'compression' 
      ? ProgressIndicator.createCompressionSteps()
      : ProgressIndicator.createDecompressionSteps();

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