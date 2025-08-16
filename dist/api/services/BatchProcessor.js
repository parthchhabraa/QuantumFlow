"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchProcessor = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
const QuantumCompressionEngine_1 = require("../../core/QuantumCompressionEngine");
const CloudStorageService_1 = require("./CloudStorageService");
class BatchProcessor extends events_1.EventEmitter {
    constructor() {
        super();
        this.jobs = new Map();
        this.processingQueue = [];
        this.isProcessing = false;
        this.maxConcurrentJobs = 3;
        this.currentlyProcessing = new Set();
        this.cloudStorageService = new CloudStorageService_1.CloudStorageService();
        this.startProcessing();
    }
    createBatchJob(userId, type, files, compressionConfig, cloudConfig, priority = 0) {
        const jobId = (0, uuid_1.v4)();
        const batchFiles = files.map(file => ({
            ...file,
            id: (0, uuid_1.v4)(),
            status: 'pending',
            progress: 0
        }));
        const job = {
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
    getJob(jobId) {
        return this.jobs.get(jobId);
    }
    getUserJobs(userId) {
        return Array.from(this.jobs.values()).filter(job => job.userId === userId);
    }
    cancelJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job)
            return false;
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
    getQueueStatus() {
        return {
            queueLength: this.processingQueue.length,
            processingJobs: this.currentlyProcessing.size,
            maxConcurrent: this.maxConcurrentJobs
        };
    }
    addToQueue(jobId) {
        const job = this.jobs.get(jobId);
        if (!job)
            return;
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
    removeFromQueue(jobId) {
        const index = this.processingQueue.indexOf(jobId);
        if (index > -1) {
            this.processingQueue.splice(index, 1);
        }
    }
    startProcessing() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        setInterval(() => {
            this.processNextJobs();
        }, 1000);
    }
    async processNextJobs() {
        while (this.currentlyProcessing.size < this.maxConcurrentJobs &&
            this.processingQueue.length > 0) {
            const jobId = this.processingQueue.shift();
            if (!jobId)
                continue;
            const job = this.jobs.get(jobId);
            if (!job || job.status !== 'pending')
                continue;
            this.currentlyProcessing.add(jobId);
            this.processJob(jobId).finally(() => {
                this.currentlyProcessing.delete(jobId);
            });
        }
    }
    async processJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job)
            return;
        try {
            job.status = 'processing';
            job.startedAt = new Date();
            this.emit('jobStarted', job);
            const engine = new QuantumCompressionEngine_1.QuantumCompressionEngine(job.compressionConfig);
            let completedFiles = 0;
            let totalOriginalSize = 0;
            let totalProcessedSize = 0;
            let totalProcessingTime = 0;
            for (const file of job.files) {
                if (job.status === 'cancelled')
                    break;
                try {
                    file.status = 'processing';
                    this.updateJobProgress(job);
                    const startTime = Date.now();
                    let inputData;
                    let outputPath;
                    // Handle cloud storage or local file
                    if (job.cloudConfig && file.cloudSourcePath) {
                        inputData = await this.cloudStorageService.downloadFile(job.cloudConfig, file.cloudSourcePath);
                    }
                    else {
                        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
                        inputData = fs.readFileSync(file.sourcePath);
                    }
                    const originalSize = inputData.length;
                    let processedData;
                    let processedSize;
                    if (job.type === 'compress') {
                        const compressedData = engine.compress(inputData);
                        processedData = Buffer.from(JSON.stringify(compressedData));
                        processedSize = processedData.length;
                    }
                    else {
                        const compressedData = JSON.parse(inputData.toString());
                        processedData = engine.decompress(compressedData);
                        processedSize = processedData.length;
                    }
                    // Save output
                    if (job.cloudConfig && file.cloudDestinationPath) {
                        await this.cloudStorageService.uploadFile(job.cloudConfig, file.cloudDestinationPath, processedData);
                        outputPath = file.cloudDestinationPath;
                    }
                    else {
                        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
                        const path = await Promise.resolve().then(() => __importStar(require('path')));
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
                }
                catch (error) {
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
        }
        catch (error) {
            job.status = 'failed';
            job.error = error instanceof Error ? error.message : 'Unknown error';
            job.completedAt = new Date();
            this.emit('jobFailed', { job, error });
        }
    }
    updateJobProgress(job) {
        const totalFiles = job.files.length;
        const completedFiles = job.files.filter(f => f.status === 'completed' || f.status === 'failed').length;
        const processingFiles = job.files.filter(f => f.status === 'processing');
        let totalProgress = completedFiles * 100;
        for (const file of processingFiles) {
            totalProgress += file.progress;
        }
        job.progress = Math.round(totalProgress / totalFiles);
        this.emit('jobProgress', job);
    }
}
exports.BatchProcessor = BatchProcessor;
//# sourceMappingURL=BatchProcessor.js.map