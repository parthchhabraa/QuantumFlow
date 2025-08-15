import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => Promise<void>;
  isProcessing: boolean;
}

export const FileUploadComponent: React.FC<FileUploadProps> = ({ 
  onFilesSelected, 
  isProcessing 
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || isProcessing) return;
    
    setUploadProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      await onFilesSelected(acceptedFiles);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (error) {
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  }, [onFilesSelected, isProcessing]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isProcessing,
    multiple: true,
    maxSize: 1024 * 1024 * 1024, // 1GB limit
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive || dragActive ? 'active' : ''} ${
          isProcessing ? 'disabled' : ''
        }`}
        style={{
          border: '2px dashed #667eea',
          borderRadius: '10px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? '#f0f4ff' : '#fafbff',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <input {...getInputProps()} />
        
        {uploadProgress > 0 && (
          <div 
            className="progress-bar"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '4px',
              backgroundColor: '#667eea',
              width: `${uploadProgress}%`,
              transition: 'width 0.3s ease'
            }}
          />
        )}
        
        <div className="upload-icon" style={{ fontSize: '3rem', marginBottom: '20px' }}>
          {isProcessing ? '⚛️' : '📁'}
        </div>
        
        {isProcessing ? (
          <div>
            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
              Processing with Quantum Compression...
            </p>
            <div className="quantum-spinner" style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
              {isDragActive
                ? 'Drop files here to compress with quantum algorithms'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Supports all file types • Max size: 1GB per file
            </p>
          </div>
        )}
      </div>
      
      <div className="upload-info" style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✨ Quantum superposition processing</span>
          <span>🔗 Entanglement pattern detection</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
          <span>🌊 Quantum interference optimization</span>
          <span>📊 Real-time compression metrics</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .dropzone.active {
          border-color: #4f46e5;
          background-color: #eef2ff;
          transform: scale(1.02);
        }
        
        .dropzone.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .dropzone:hover:not(.disabled) {
          border-color: #4f46e5;
          background-color: #f8faff;
        }
      `}</style>
    </div>
  );
};