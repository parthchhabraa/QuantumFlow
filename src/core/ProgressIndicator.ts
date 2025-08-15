/**
 * Progress indicator system for long-running QuantumFlow operations
 * Provides real-time feedback and estimated completion times
 */

export interface ProgressStep {
  id: string;
  name: string;
  description: string;
  weight: number; // Relative weight for progress calculation (0-1)
  estimatedDuration?: number; // Estimated duration in milliseconds
}

export interface ProgressState {
  currentStep: string;
  stepProgress: number; // 0-1 for current step
  overallProgress: number; // 0-1 for entire operation
  startTime: number;
  elapsedTime: number;
  estimatedTimeRemaining: number;
  currentOperation: string;
  processedBytes?: number;
  totalBytes?: number;
  throughput?: number; // bytes per second
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
  updateInterval: number; // milliseconds
  barWidth: number;
  useColors: boolean;
  logLevel: 'minimal' | 'normal' | 'verbose';
}

export class ProgressIndicator {
  private steps: Map<string, ProgressStep> = new Map();
  private state: ProgressState;
  private options: ProgressOptions;
  private updateTimer?: NodeJS.Timeout;
  private lastUpdateTime: number = 0;
  private callbacks: ((state: ProgressState) => void)[] = [];
  private isActive: boolean = false;

  constructor(options: Partial<ProgressOptions> = {}) {
    this.options = {
      showProgressBar: true,
      showPercentage: true,
      showTimeEstimate: true,
      showThroughput: false,
      showMemoryUsage: false,
      updateInterval: 250,
      barWidth: 40,
      useColors: true,
      logLevel: 'normal',
      ...options
    };

    this.state = {
      currentStep: '',
      stepProgress: 0,
      overallProgress: 0,
      startTime: 0,
      elapsedTime: 0,
      estimatedTimeRemaining: 0,
      currentOperation: '',
      errors: [],
      warnings: []
    };
  }

  /**
   * Define the steps for the operation
   */
  defineSteps(steps: ProgressStep[]): void {
    this.steps.clear();
    let totalWeight = 0;

    steps.forEach(step => {
      this.steps.set(step.id, step);
      totalWeight += step.weight;
    });

    // Normalize weights to sum to 1
    if (totalWeight > 0) {
      steps.forEach(step => {
        const normalizedStep = { ...step, weight: step.weight / totalWeight };
        this.steps.set(step.id, normalizedStep);
      });
    }
  }

  /**
   * Start progress tracking
   */
  start(operationName: string, totalBytes?: number): void {
    this.state = {
      currentStep: '',
      stepProgress: 0,
      overallProgress: 0,
      startTime: Date.now(),
      elapsedTime: 0,
      estimatedTimeRemaining: 0,
      currentOperation: operationName,
      processedBytes: 0,
      totalBytes,
      errors: [],
      warnings: []
    };

    this.isActive = true;
    this.lastUpdateTime = Date.now();

    if (this.options.logLevel !== 'minimal') {
      console.log(`\n🚀 Starting ${operationName}...`);
    }

    // Start update timer
    this.updateTimer = setInterval(() => {
      this.updateDisplay();
    }, this.options.updateInterval);

    this.notifyCallbacks();
  }

  /**
   * Update current step
   */
  setCurrentStep(stepId: string, operation?: string): void {
    if (!this.isActive) return;

    const step = this.steps.get(stepId);
    if (!step) {
      this.addWarning(`Unknown step: ${stepId}`);
      return;
    }

    this.state.currentStep = stepId;
    this.state.stepProgress = 0;
    this.state.currentOperation = operation || step.description;

    if (this.options.logLevel === 'verbose') {
      console.log(`\n📋 ${step.name}: ${step.description}`);
    }

    this.updateOverallProgress();
    this.notifyCallbacks();
  }

  /**
   * Update progress for current step
   */
  updateStepProgress(progress: number, processedBytes?: number): void {
    if (!this.isActive) return;

    this.state.stepProgress = Math.max(0, Math.min(1, progress));
    
    if (processedBytes !== undefined) {
      this.state.processedBytes = processedBytes;
      this.updateThroughput();
    }

    this.updateOverallProgress();
    this.updateTimeEstimates();
    this.notifyCallbacks();
  }

  /**
   * Add an error message
   */
  addError(error: string): void {
    this.state.errors.push(error);
    if (this.options.logLevel !== 'minimal') {
      console.error(`❌ Error: ${error}`);
    }
    this.notifyCallbacks();
  }

  /**
   * Add a warning message
   */
  addWarning(warning: string): void {
    this.state.warnings.push(warning);
    if (this.options.logLevel === 'verbose') {
      console.warn(`⚠️  Warning: ${warning}`);
    }
    this.notifyCallbacks();
  }

  /**
   * Complete the operation
   */
  complete(message?: string): void {
    if (!this.isActive) return;

    this.state.overallProgress = 1;
    this.state.stepProgress = 1;
    this.state.elapsedTime = Date.now() - this.state.startTime;
    this.state.estimatedTimeRemaining = 0;

    this.isActive = false;

    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }

    // Final display update
    this.updateDisplay(true);

    const completionMessage = message || `✅ ${this.state.currentOperation} completed`;
    const timeMessage = this.formatDuration(this.state.elapsedTime);
    
    if (this.options.logLevel !== 'minimal') {
      console.log(`\n${completionMessage} in ${timeMessage}`);
      
      if (this.state.errors.length > 0) {
        console.log(`❌ Errors: ${this.state.errors.length}`);
      }
      
      if (this.state.warnings.length > 0) {
        console.log(`⚠️  Warnings: ${this.state.warnings.length}`);
      }
    }

    this.notifyCallbacks();
  }

  /**
   * Abort the operation
   */
  abort(reason?: string): void {
    if (!this.isActive) return;

    this.isActive = false;

    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }

    const abortMessage = reason 
      ? `🛑 ${this.state.currentOperation} aborted: ${reason}`
      : `🛑 ${this.state.currentOperation} aborted`;

    if (this.options.logLevel !== 'minimal') {
      console.log(`\n${abortMessage}`);
    }

    this.notifyCallbacks();
  }

  /**
   * Add progress callback
   */
  onProgress(callback: (state: ProgressState) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove progress callback
   */
  removeCallback(callback: (state: ProgressState) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Get current progress state
   */
  getState(): ProgressState {
    return { ...this.state };
  }

  /**
   * Check if progress tracking is active
   */
  isTracking(): boolean {
    return this.isActive;
  }

  /**
   * Update overall progress based on step progress
   */
  private updateOverallProgress(): void {
    let completedWeight = 0;
    let currentStepWeight = 0;

    const stepArray = Array.from(this.steps.values());
    const currentStepIndex = stepArray.findIndex(step => step.id === this.state.currentStep);

    // Add weight of completed steps
    for (let i = 0; i < currentStepIndex; i++) {
      completedWeight += stepArray[i].weight;
    }

    // Add partial weight of current step
    if (currentStepIndex >= 0) {
      currentStepWeight = stepArray[currentStepIndex].weight * this.state.stepProgress;
    }

    this.state.overallProgress = Math.min(1, completedWeight + currentStepWeight);
  }

  /**
   * Update time estimates
   */
  private updateTimeEstimates(): void {
    this.state.elapsedTime = Date.now() - this.state.startTime;

    if (this.state.overallProgress > 0) {
      const totalEstimatedTime = this.state.elapsedTime / this.state.overallProgress;
      this.state.estimatedTimeRemaining = Math.max(0, totalEstimatedTime - this.state.elapsedTime);
    }
  }

  /**
   * Update throughput calculation
   */
  private updateThroughput(): void {
    if (this.state.processedBytes && this.state.elapsedTime > 0) {
      this.state.throughput = (this.state.processedBytes * 1000) / this.state.elapsedTime;
    }
  }

  /**
   * Update memory usage
   */
  private updateMemoryUsage(): void {
    if (this.options.showMemoryUsage) {
      const memUsage = process.memoryUsage();
      this.state.memoryUsage = memUsage.heapUsed;
    }
  }

  /**
   * Update display
   */
  private updateDisplay(final: boolean = false): void {
    if (!this.options.showProgressBar && this.options.logLevel === 'minimal') {
      return;
    }

    const now = Date.now();
    if (!final && now - this.lastUpdateTime < this.options.updateInterval) {
      return;
    }

    this.lastUpdateTime = now;
    this.updateMemoryUsage();

    if (this.options.showProgressBar) {
      this.renderProgressBar();
    }
  }

  /**
   * Render progress bar
   */
  private renderProgressBar(): void {
    const progress = this.state.overallProgress;
    const percentage = Math.round(progress * 100);
    
    // Create progress bar
    const filledWidth = Math.round(progress * this.options.barWidth);
    const emptyWidth = this.options.barWidth - filledWidth;
    
    const filledChar = this.options.useColors ? '█' : '=';
    const emptyChar = this.options.useColors ? '░' : '-';
    const filled = filledChar.repeat(filledWidth);
    const empty = emptyChar.repeat(emptyWidth);
    
    let progressLine = `[${filled}${empty}]`;
    
    if (this.options.showPercentage) {
      progressLine += ` ${percentage.toString().padStart(3)}%`;
    }

    // Add current operation
    const currentStep = this.steps.get(this.state.currentStep);
    if (currentStep) {
      progressLine += ` ${currentStep.name}`;
    }

    // Add time estimate
    if (this.options.showTimeEstimate && this.state.estimatedTimeRemaining > 0) {
      const eta = this.formatDuration(this.state.estimatedTimeRemaining);
      progressLine += ` ETA: ${eta}`;
    }

    // Add throughput
    if (this.options.showThroughput && this.state.throughput) {
      const throughput = this.formatBytes(this.state.throughput);
      progressLine += ` ${throughput}/s`;
    }

    // Add memory usage
    if (this.options.showMemoryUsage && this.state.memoryUsage) {
      const memory = this.formatBytes(this.state.memoryUsage);
      progressLine += ` Mem: ${memory}`;
    }

    // Clear line and print progress
    process.stdout.write('\r\x1b[K' + progressLine);
  }

  /**
   * Notify all callbacks
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Progress callback error:', error);
      }
    });
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format bytes in human-readable format
   */
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Create default compression steps
   */
  static createCompressionSteps(): ProgressStep[] {
    return [
      {
        id: 'initialization',
        name: 'Initialization',
        description: 'Initializing quantum compression engine',
        weight: 0.05,
        estimatedDuration: 500
      },
      {
        id: 'data_analysis',
        name: 'Data Analysis',
        description: 'Analyzing input data characteristics',
        weight: 0.10,
        estimatedDuration: 1000
      },
      {
        id: 'quantum_state_preparation',
        name: 'Quantum State Preparation',
        description: 'Converting data to quantum states',
        weight: 0.20,
        estimatedDuration: 2000
      },
      {
        id: 'superposition_analysis',
        name: 'Superposition Analysis',
        description: 'Analyzing quantum superposition patterns',
        weight: 0.25,
        estimatedDuration: 3000
      },
      {
        id: 'entanglement_detection',
        name: 'Entanglement Detection',
        description: 'Finding correlated quantum patterns',
        weight: 0.20,
        estimatedDuration: 2500
      },
      {
        id: 'interference_optimization',
        name: 'Interference Optimization',
        description: 'Optimizing quantum interference patterns',
        weight: 0.15,
        estimatedDuration: 2000
      },
      {
        id: 'data_encoding',
        name: 'Data Encoding',
        description: 'Encoding compressed quantum data',
        weight: 0.05,
        estimatedDuration: 500
      }
    ];
  }

  /**
   * Create default decompression steps
   */
  static createDecompressionSteps(): ProgressStep[] {
    return [
      {
        id: 'initialization',
        name: 'Initialization',
        description: 'Initializing quantum decompression engine',
        weight: 0.05,
        estimatedDuration: 300
      },
      {
        id: 'data_validation',
        name: 'Data Validation',
        description: 'Validating compressed quantum data',
        weight: 0.10,
        estimatedDuration: 500
      },
      {
        id: 'quantum_state_reconstruction',
        name: 'Quantum State Reconstruction',
        description: 'Reconstructing quantum states',
        weight: 0.25,
        estimatedDuration: 1500
      },
      {
        id: 'interference_reversal',
        name: 'Interference Reversal',
        description: 'Reversing quantum interference patterns',
        weight: 0.20,
        estimatedDuration: 1200
      },
      {
        id: 'entanglement_reconstruction',
        name: 'Entanglement Reconstruction',
        description: 'Reconstructing entanglement relationships',
        weight: 0.20,
        estimatedDuration: 1200
      },
      {
        id: 'superposition_collapse',
        name: 'Superposition Collapse',
        description: 'Collapsing superposition states',
        weight: 0.15,
        estimatedDuration: 800
      },
      {
        id: 'data_reconstruction',
        name: 'Data Reconstruction',
        description: 'Converting quantum states back to classical data',
        weight: 0.05,
        estimatedDuration: 300
      }
    ];
  }
}