import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { QuantumCompressionEngine } from '../../core/QuantumCompressionEngine';
import { QuantumConfig } from '../../models/QuantumConfig';
import { CloudStorageService } from './CloudStorageService';

export interface BatchJob {
  id: string;
  userId: string;
  type: 'compress' | 'decompress';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  files: BatchFileItem[];
  cloudConfig?: CloudStorageConfig;
  compressionConfig: QuantumConfig;
  progress: number;
  error?: string;
  metrics?: BatchMetrics;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface BatchFileItem {
  id: string;
  originalName: string;
  sourcePath: string;
  destinationPath?: string;
  cloudSourcePath?: string;
  cloudDestinationPath?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  metrics?: {
    originalSize: number;
    processedSize: number;
    compressionRatio?: number;
    processingTime: number;
  };
}

export interface CloudStorageConfig {
  provider: 'aws-s3' | 'google-drive' | 'dropbox';
  credentials: any;
  sourceBucket?: string;
  destinationBucket?: string;
  sourceFolder?: string;
  destinationFolder?: string;
}

export interface BatchMetrics {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  totalOriginalSize: number;
  totalProcessedSize: number;
  averageCompressionRatio: number;
  totalProcessingTime: number;
}

export class BatchProcessor extends EventEmitter {
  private jobs: Map<string, BatchJob> = new Map();
  private processingQueue: string[] = [];
  private isProcessing: boolean = false;
  private maxConcurrentJobs: number = 3;
  private currentlyProcessing: Set<string> = new Set();
  private cloudStorageService: CloudStorageService;

  constructor() {
    super();
    this.cloudStorageService = new CloudStorageService();
    this.startProcessing();
  }

  public createBatchJob(
    userId: string,
    type: 'compress' | 'decompress',
    files: Omit<BatchFileItem, 'id' | 'status' | 'progress' | 'metrics'>[],
    compressionConfig: QuantumConfig,
    cloudConfig?: CloudStorageConfig,
    priority: number = 0
  ): string {
    const jobId = uuidv4();
    
    const batchFiles: BatchFileItem[] = files.map(file => ({
      ...file,
      id: uuidv4(),
      status: 'pending',
      progress: 0
    }));

    const job: BatchJob = {
      id: jobId,
      userId,
      type,
      status: 'pending',
      priority,
      files: batchFiles,
      cloudConfig,
      compressionConfig,
      progress: 0,
      createdAt: new Date()
    };

    this.jobs.set(jobId, job);
    this.addToQueue(jobId);

    this.emit('jobCreated', job);
    return jobId;
  }

  public getJob(jobId: string): BatchJob | undefined {
    return this.jobs.get(jobId);
  }

  public getUserJobs(userId: string): BatchJob[] {
    return Array.from(this.jobs.values()).filter(job => job.userId === userId);
  }

  public cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'pending') {
      job.status = 'cancelled';
      this.removeFromQueue(jobId);
      this.emit('jobCancelled', job);
      return true;
    }

    if (job.status === 'processing') {
      job.status = 'cancelled';
      this.emit('jobCancelled', job);
      return true;
    }

    return false;
  }

  public getQueueStatus(): {
    queueLength: number;
    processingJobs: number;
    maxConcurrent: number;
  } {
    return {
      queueLength: this.processingQueue.length,
      processingJobs: this.currentlyProcessing.size,
      maxConcurrent: this.maxConcurrentJobs
    };
  }

  private addToQueue(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Insert job based on priority (higher priority first)
    let insertIndex = this.processingQueue.length;
    for (let i = 0; i < this.processingQueue.length; i++) {
      const queuedJob = this.jobs.get(this.processingQueue[i]);
      if (queuedJob && job.priority > queuedJob.priority) {
        insertIndex = i;
        break;
      }
    }

    this.processingQueue.splice(insertIndex, 0, jobId);
  }

  private removeFromQueue(jobId: string): void {
    const index = this.processingQueue.indexOf(jobId);
    if (index > -1) {
      this.processingQueue.splice(index, 1);
    }
  }

  private startProcessing(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    setInterval(() => {
      this.processNextJobs();
    }, 1000);
  }

  private async processNextJobs(): Promise<void> {
    while (
      this.currentlyProcessing.size < this.maxConcurrentJobs &&
      this.processingQueue.length > 0
    ) {
      const jobId = this.processingQueue.shift();
      if (!jobId) continue;

      const job = this.jobs.get(jobId);
      if (!job || job.status !== 'pending') continue;

      this.currentlyProcessing.add(jobId);
      this.processJob(jobId).finally(() => {
        this.currentlyProcessing.delete(jobId);
      });
    }
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'processing';
      job.startedAt = new Date();
      this.emit('jobStarted', job);

      const engine = new QuantumCompressionEngine(job.compressionConfig);
      let completedFiles = 0;
      let totalOriginalSize = 0;
      let totalProcessedSize = 0;
      let totalProcessingTime = 0;

      for (const file of job.files) {
        if (job.status === 'cancelled') break;

        try {
          file.status = 'processing';
          this.updateJobProgress(job);

          const startTime = Date.now();
          let inputData: Buffer;
          let outputPath: string;

          // Handle cloud storage or local file
          if (job.cloudConfig && file.cloudSourcePath) {
            inputData = await this.cloudStorageService.downloadFile(
              job.cloudConfig,
              file.cloudSourcePath
            );
          } else {
            const fs = await import('fs');
            inputData = fs.readFileSync(file.sourcePath);
          }

          const originalSize = inputData.length;
          let processedData: Buffer;
          let processedSize: number;

          if (job.type === 'compress') {
            const compressedData = engine.compress(inputData);
            processedData = Buffer.from(JSON.stringify(compressedData));
            processedSize = processedData.length;
          } else {
            const compressedData = JSON.parse(inputData.toString());
            processedData = engine.decompress(compressedData);
            processedSize = processedData.length;
          }

          // Save output
          if (job.cloudConfig && file.cloudDestinationPath) {
            await this.cloudStorageService.uploadFile(
              job.cloudConfig,
              file.cloudDestinationPath,
              processedData
            );
            outputPath = file.cloudDestinationPath;
          } else {
            const fs = await import('fs');
            const path = await import('path');
            
            if (!file.destinationPath) {
              const outputDir = path.join(process.cwd(), 'batch-outputs');
              if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
              }
              file.destinationPath = path.join(outputDir, `${file.id}_processed`);
            }
            
            fs.writeFileSync(file.destinationPath, processedData);
            outputPath = file.destinationPath;
          }

          const endTime = Date.now();
          const processingTime = endTime - startTime;

          file.status = 'completed';
          file.progress = 100;
          file.metrics = {
            originalSize,
            processedSize,
            compressionRatio: job.type === 'compress' 
              ? (1 - processedSize / originalSize) * 100 
              : undefined,
            processingTime
          };

          completedFiles++;
          totalOriginalSize += originalSize;
          totalProcessedSize += processedSize;
          totalProcessingTime += processingTime;

          this.emit('fileCompleted', { job, file });
        } catch (error) {
          file.status = 'failed';
          file.error = error instanceof Error ? error.message : 'Unknown error';
          this.emit('fileFailed', { job, file, error });
        }

        this.updateJobProgress(job);
      }

      // Calculate final metrics
      job.metrics = {
        totalFiles: job.files.length,
        completedFiles,
        failedFiles: job.files.filter(f => f.status === 'failed').length,
        totalOriginalSize,
        totalProcessedSize,
        averageCompressionRatio: job.type === 'compress' && totalOriginalSize > 0
          ? (1 - totalProcessedSize / totalOriginalSize) * 100
          : 0,
        totalProcessingTime
      };

      job.status = completedFiles === job.files.length ? 'completed' : 'failed';
      job.progress = 100;
      job.completedAt = new Date();

      this.emit('jobCompleted', job);
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      this.emit('jobFailed', { job, error });
    }
  }

  private updateJobProgress(job: BatchJob): void {
    const totalFiles = job.files.length;
    const completedFiles = job.files.filter(f => 
      f.status === 'completed' || f.status === 'failed'
    ).length;
    const processingFiles = job.files.filter(f => f.status === 'processing');
    
    let totalProgress = completedFiles * 100;
    for (const file of processingFiles) {
      totalProgress += file.progress;
    }

    job.progress = Math.round(totalProgress / totalFiles);
    this.emit('jobProgress', job);
  }
}