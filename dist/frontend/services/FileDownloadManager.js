"use strict";
/**
 * File Download Manager
 * Handles proper file processing and download functionality for the frontend
 */
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
exports.FileDownloadManager = void 0;
class FileDownloadManager {
    constructor() {
        this.activeUrls = new Set();
    }
    static getInstance() {
        if (!FileDownloadManager.instance) {
            FileDownloadManager.instance = new FileDownloadManager();
        }
        return FileDownloadManager.instance;
    }
    /**
     * Process a file for compression
     */
    async processFileForCompression(file) {
        try {
            // Read file content
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const inputBuffer = Buffer.from(arrayBuffer);
            // Import compression engine
            const { QuantumCompressionEngine } = await Promise.resolve().then(() => __importStar(require('../../core/QuantumCompressionEngine')));
            const engine = new QuantumCompressionEngine();
            // Compress the file
            const compressedData = engine.compress(inputBuffer);
            const serializedData = compressedData.serialize();
            const metadata = {
                originalName: file.name,
                originalSize: file.size,
                processedSize: serializedData.length,
                mimeType: 'application/quantum-flow',
                processingType: 'compression',
                timestamp: Date.now()
            };
            return {
                originalFile: file,
                processedData: Buffer.from(serializedData),
                metadata
            };
        }
        catch (error) {
            throw new Error(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Process a file for decompression
     */
    async processFileForDecompression(file) {
        try {
            // Validate file extension
            if (!file.name.endsWith('.qf')) {
                throw new Error('Invalid file format. Only .qf files can be decompressed.');
            }
            // Read file content
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const inputBuffer = Buffer.from(arrayBuffer);
            // Import compression engine and data model
            const { QuantumCompressionEngine } = await Promise.resolve().then(() => __importStar(require('../../core/QuantumCompressionEngine')));
            const { CompressedQuantumData } = await Promise.resolve().then(() => __importStar(require('../../models/CompressedQuantumData')));
            const engine = new QuantumCompressionEngine();
            // Deserialize compressed data
            const compressedData = CompressedQuantumData.deserialize(inputBuffer);
            // Decompress the file
            const decompressedBuffer = engine.decompress(compressedData);
            // Determine original filename and MIME type
            const originalName = file.name.replace('.qf', '');
            const mimeType = this.detectMimeType(originalName, decompressedBuffer);
            const metadata = {
                originalName: originalName,
                originalSize: decompressedBuffer.length,
                processedSize: decompressedBuffer.length,
                mimeType,
                processingType: 'decompression',
                timestamp: Date.now()
            };
            return {
                originalFile: file,
                processedData: decompressedBuffer,
                metadata
            };
        }
        catch (error) {
            throw new Error(`Decompression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Generate a download URL for processed file data
     */
    generateDownloadUrl(data, filename, mimeType) {
        const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const url = URL.createObjectURL(blob);
        this.activeUrls.add(url);
        return url;
    }
    /**
     * Trigger download of a file
     */
    triggerDownload(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    /**
     * Clean up a download URL
     */
    cleanup(url) {
        if (this.activeUrls.has(url)) {
            URL.revokeObjectURL(url);
            this.activeUrls.delete(url);
        }
    }
    /**
     * Clean up all active URLs
     */
    cleanupAll() {
        this.activeUrls.forEach(url => URL.revokeObjectURL(url));
        this.activeUrls.clear();
    }
    /**
     * Read file as ArrayBuffer
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }
    /**
     * Detect MIME type based on filename and content
     */
    detectMimeType(filename, data) {
        const extension = filename.split('.').pop()?.toLowerCase();
        // Check file signature (magic numbers) for common formats
        if (data.length >= 4) {
            const signature = data.subarray(0, 4);
            // PNG
            if (signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4E && signature[3] === 0x47) {
                return 'image/png';
            }
            // JPEG
            if (signature[0] === 0xFF && signature[1] === 0xD8) {
                return 'image/jpeg';
            }
            // PDF
            if (signature[0] === 0x25 && signature[1] === 0x50 && signature[2] === 0x44 && signature[3] === 0x46) {
                return 'application/pdf';
            }
            // ZIP
            if (signature[0] === 0x50 && signature[1] === 0x4B) {
                return 'application/zip';
            }
        }
        // Fallback to extension-based detection
        switch (extension) {
            case 'txt':
                return 'text/plain';
            case 'html':
            case 'htm':
                return 'text/html';
            case 'css':
                return 'text/css';
            case 'js':
                return 'application/javascript';
            case 'json':
                return 'application/json';
            case 'xml':
                return 'application/xml';
            case 'csv':
                return 'text/csv';
            case 'md':
                return 'text/markdown';
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'svg':
                return 'image/svg+xml';
            case 'pdf':
                return 'application/pdf';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'xls':
                return 'application/vnd.ms-excel';
            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'zip':
                return 'application/zip';
            case 'tar':
                return 'application/x-tar';
            case 'gz':
                return 'application/gzip';
            case 'mp3':
                return 'audio/mpeg';
            case 'mp4':
                return 'video/mp4';
            case 'avi':
                return 'video/x-msvideo';
            default:
                return 'application/octet-stream';
        }
    }
    /**
     * Get appropriate filename for processed file
     */
    getProcessedFilename(originalName, processingType) {
        if (processingType === 'compression') {
            return `${originalName}.qf`;
        }
        else {
            // For decompression, remove .qf extension if present
            return originalName.endsWith('.qf') ? originalName.slice(0, -3) : originalName;
        }
    }
    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
exports.FileDownloadManager = FileDownloadManager;
//# sourceMappingURL=FileDownloadManager.js.map