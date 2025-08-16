import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ProgressState } from '../types/FrontendTypes';

interface FileDecompressProps {
  onFilesSelected: (files: File[]) => Promise<void>;
  isProcessing: boolean;
  progressState?: ProgressState | null;
}

export const FileDecompressComponent: React.FC<FileDecompressProps> = ({ 
  onFilesSelected, 
  isProcessing,
  progressState 
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || isProcessing) return;
    
    // Validate file types
    const invalidFiles = acceptedFiles.filter(file => !file.name.endsWith('.qf'));
    if (invalidFiles.length > 0) {
      const errorMsg = `Invalid file format: ${invalidFiles.map(f => f.name).join(', ')}. Only .qf files are supported for decompression.`;
      showErrorNotification(errorMsg);
      return;
    }
    
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
    accept: {
      'application/quantum-flow': ['.qf']
    },
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const showErrorNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
      z-index: 10000;
      font-weight: 600;
      max-width: 400px;
      animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  };

  return (
    <div className="file-decompress-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive || dragActive ? 'active' : ''} ${
          isProcessing ? 'disabled' : ''
        }`}
        style={{
          border: '2px dashed #10b981',
          borderRadius: '10px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? '#f0fdf4' : '#fafffe',
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
              backgroundColor: '#10b981',
              width: `${uploadProgress}%`,
              transition: 'width 0.3s ease'
            }}
          />
        )}
        
        <div className="upload-icon" style={{ fontSize: '3rem', marginBottom: '20px' }}>
          {isProcessing ? '🔄' : '📦'}
        </div>
        
        {isProcessing ? (
          <div>
            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
              {progressState?.phase || 'Processing Quantum Decompression...'}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
              {progressState?.message || 'Reconstructing quantum states...'}
            </p>
            <div className="quantum-spinner" style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
            {progressState && (
              <div style={{ marginTop: '15px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progressState.progress}%`,
                    height: '100%',
                    backgroundColor: '#10b981',
                    transition: 'width 0.3s ease',
                    borderRadius: '4px'
                  }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                  {Math.round(progressState.progress)}% Complete
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
              {isDragActive
                ? 'Drop .qf files here to decompress'
                : 'Drag & drop .qf files here, or click to select'}
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Only QuantumFlow (.qf) compressed files • Max size: 1GB per file
            </p>
          </div>
        )}
      </div>
      
      <div className="decompress-info" style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🔓 Quantum state reconstruction</span>
          <span>🔗 Entanglement pair restoration</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
          <span>🌊 Interference pattern mapping</span>
          <span>✅ Data integrity verification</span>
        </div>
      </div>

      <div className="file-format-info" style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f0fdf4', 
        borderRadius: '8px',
        border: '1px solid #bbf7d0'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#065f46', fontSize: '0.9rem' }}>
          📋 Supported Format
        </h4>
        <div style={{ fontSize: '0.8rem', color: '#047857' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ fontWeight: 'bold', marginRight: '10px' }}>.qf</span>
            <span>QuantumFlow compressed files</span>
          </div>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#059669' }}>
            Files compressed using QuantumFlow's quantum-inspired algorithms with embedded metadata for perfect reconstruction.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .dropzone.active {
          border-color: #059669;
          background-color: #ecfdf5;
          transform: scale(1.02);
        }
        
        .dropzone.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .dropzone:hover:not(.disabled) {
          border-color: #059669;
          background-color: #f0fdf4;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};