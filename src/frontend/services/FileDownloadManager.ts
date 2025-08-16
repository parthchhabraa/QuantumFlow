/**
 * File Download Manager
 * Handles proper file processing and download functionality for the frontend
 */

interface ProcessedFile {
  originalFile: File;
  processedData: Buffer;
  metadata: ProcessingMetadata;
}

interface ProcessingMetadata {
  originalName: string;
  originalSize: number;
  processedSize: number;
  mimeType: string;
  processingType: 'compression' | 'decompression';
  timestamp: number;
}

export class FileDownloadManager {
  private static instance: FileDownloadManager;
  private activeUrls: Set<string> = new Set();

  private constructor() {}

  static getInstance(): FileDownloadManager {
    if (!FileDownloadManager.instance) {
      FileDownloadManager.instance = new FileDownloadManager();
    }
    return FileDownloadManager.instance;
  }

  /**
   * Process a file for compression
   */
  async processFileForCompression(file: File): Promise<ProcessedFile> {
    try {
      // Read file content
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const inputBuffer = Buffer.from(arrayBuffer);

      // Import compression engine
      const { QuantumCompressionEngine } = await import('../../core/QuantumCompressionEngine');
      const engine = new QuantumCompressionEngine();

      // Compress the file
      const compressedData = engine.compress(inputBuffer);
      const serializedData = compressedData.serialize();

      const metadata: ProcessingMetadata = {
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
    } catch (error) {
      throw new Error(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process a file for decompression
   */
  async processFileForDecompression(file: File): Promise<ProcessedFile> {
    try {
      // Validate file extension
      if (!file.name.endsWith('.qf')) {
        throw new Error('Invalid file format. Only .qf files can be decompressed.');
      }

      // Read file content
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const inputBuffer = Buffer.from(arrayBuffer);

      // Import compression engine and data model
      const { QuantumCompressionEngine } = await import('../../core/QuantumCompressionEngine');
      const { CompressedQuantumData } = await import('../../models/CompressedQuantumData');
      
      const engine = new QuantumCompressionEngine();

      // Deserialize compressed data
      const compressedData = CompressedQuantumData.deserialize(inputBuffer);
      
      // Decompress the file
      const decompressedBuffer = engine.decompress(compressedData);

      // Determine original filename and MIME type
      const originalName = file.name.replace('.qf', '');
      const mimeType = this.detectMimeType(originalName, decompressedBuffer);

      const metadata: ProcessingMetadata = {
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
    } catch (error) {
      throw new Error(`Decompression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a download URL for processed file data
   */
  generateDownloadUrl(data: Buffer, filename: string, mimeType: string): string {
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    const blob = new Blob([arrayBuffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    this.activeUrls.add(url);
    return url;
  }

  /**
   * Trigger download of a file
   */
  triggerDownload(url: string, filename: string): void {
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
  cleanup(url: string): void {
    if (this.activeUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.activeUrls.delete(url);
    }
  }

  /**
   * Clean up all active URLs
   */
  cleanupAll(): void {
    this.activeUrls.forEach(url => URL.revokeObjectURL(url));
    this.activeUrls.clear();
  }

  /**
   * Read file as ArrayBuffer
   */
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Detect MIME type based on filename and content
   */
  private detectMimeType(filename: string, data: Buffer): string {
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
  getProcessedFilename(originalName: string, processingType: 'compression' | 'decompression'): string {
    if (processingType === 'compression') {
      return `${originalName}.qf`;
    } else {
      // For decompression, remove .qf extension if present
      return originalName.endsWith('.qf') ? originalName.slice(0, -3) : originalName;
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}