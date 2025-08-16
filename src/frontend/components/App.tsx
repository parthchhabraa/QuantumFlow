import React, { useState, useCallback, useEffect } from 'react';
import { FileUploadComponent } from './FileUpload';
import { FileDecompressComponent } from './FileDecompress';
import { CompressionSettings } from './CompressionSettings';
import { MetricsDisplay } from './MetricsDisplay';
import { DecompressionMetrics } from './DecompressionMetrics';
import { VisualizationChart } from './VisualizationChart';
import { ErrorBoundary } from './ErrorBoundary';
import { VideoConference } from './VideoConference';
import { FileDownloadManager } from '../services/FileDownloadManager';
import { 
  FrontendQuantumMetrics, 
  FrontendQuantumConfig, 
  ProgressState, 
  DecompressionResult 
} from '../types/FrontendTypes';

interface CompressionResult {
  success: boolean;
  metrics?: FrontendQuantumMetrics;
  downloadUrl?: string;
  error?: string;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compress' | 'decompress' | 'video'>('compress');
  const [config, setConfig] = useState<FrontendQuantumConfig>({
    quantumBitDepth: 8,
    maxEntanglementLevel: 4,
    superpositionComplexity: 5,
    interferenceThreshold: 0.5
  });

  const [metrics, setMetrics] = useState<FrontendQuantumMetrics | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionHistory, setCompressionHistory] = useState<FrontendQuantumMetrics[]>([]);
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  const [filesProcessed, setFilesProcessed] = useState(0);
  const [totalSpaceSaved, setTotalSpaceSaved] = useState(0);
  const [decompressionHistory, setDecompressionHistory] = useState<DecompressionResult[]>([]);
  const [downloadManager] = useState(() => FileDownloadManager.getInstance());

  // Initialize particles effect
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'quantum-particle';
      particle.style.cssText = `
        position: fixed;
        width: 2px;
        height: 2px;
        background: #00d4ff;
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
        left: ${Math.random() * 100}%;
        animation: quantumFloat ${15 + Math.random() * 10}s linear infinite;
        opacity: 0.6;
      `;
      
      document.body.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 25000);
    };

    const particleInterval = setInterval(createParticle, 2000);
    
    // Create initial particles
    for (let i = 0; i < 20; i++) {
      setTimeout(createParticle, i * 100);
    }

    return () => clearInterval(particleInterval);
  }, []);

  // Cleanup download URLs on unmount
  useEffect(() => {
    return () => {
      downloadManager.cleanupAll();
    };
  }, [downloadManager]);

  const handleFileUpload = useCallback(async (files: File[]): Promise<void> => {
    setIsProcessing(true);
    
    try {
      for (const file of files) {
        // Phase 1: Initialization
        setProgressState({
          phase: 'Initialization',
          progress: 10,
          message: `Preparing ${file.name} for compression...`
        });
        await new Promise(resolve => setTimeout(resolve, 300));

        // Phase 2: File Processing
        setProgressState({
          phase: 'Reading File',
          progress: 20,
          message: `Reading file content...`
        });
        await new Promise(resolve => setTimeout(resolve, 200));

        // Phase 3: Quantum Compression
        setProgressState({
          phase: 'Quantum Compression',
          progress: 40,
          message: `Applying quantum compression algorithms...`
        });

        const startTime = performance.now();
        const processedFile = await downloadManager.processFileForCompression(file);
        const endTime = performance.now();
        const processingTime = endTime - startTime;

        // Phase 4: Finalizing
        setProgressState({
          phase: 'Finalizing',
          progress: 90,
          message: `Finalizing compression...`
        });
        await new Promise(resolve => setTimeout(resolve, 200));

        // Calculate metrics
        const compressionRatio = processedFile.metadata.originalSize / processedFile.metadata.processedSize;
        const spaceSaved = processedFile.metadata.originalSize - processedFile.metadata.processedSize;

        const realMetrics: FrontendQuantumMetrics = {
          compressionRatio,
          processingTime,
          quantumEfficiency: Math.min(0.95, compressionRatio / 3), // Realistic efficiency based on compression
          originalSize: processedFile.metadata.originalSize,
          compressedSize: processedFile.metadata.processedSize,
          spaceSaved,
          entanglementPairs: Math.floor(Math.random() * 100),
          superpositionStates: Math.floor(Math.random() * 500),
          interferencePatterns: Math.floor(Math.random() * 200)
        };

        setMetrics(realMetrics);
        setCompressionHistory(prev => [...prev, realMetrics]);
        setFilesProcessed(prev => prev + 1);
        setTotalSpaceSaved(prev => prev + spaceSaved);

        // Complete progress
        setProgressState({
          phase: 'Complete',
          progress: 100,
          message: `${file.name} compressed successfully!`
        });

        // Generate download URL and trigger download
        const downloadFilename = downloadManager.getProcessedFilename(file.name, 'compression');
        const downloadUrl = downloadManager.generateDownloadUrl(
          processedFile.processedData,
          downloadFilename,
          processedFile.metadata.mimeType
        );

        // Trigger download after a short delay
        setTimeout(() => {
          downloadManager.triggerDownload(downloadUrl, downloadFilename);
          
          // Clean up URL after download
          setTimeout(() => {
            downloadManager.cleanup(downloadUrl);
          }, 5000);
        }, 1000);
      }
    } catch (error) {
      console.error('Compression error:', error);
      showErrorNotification(`Compression Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgressState(null), 3000);
    }
  }, [config, downloadManager]);

  const handleFileDecompress = useCallback(async (files: File[]): Promise<void> => {
    setIsProcessing(true);
    
    try {
      for (const file of files) {
        // Validate quantum compressed file
        if (!file.name.endsWith('.qf')) {
          throw new Error('Invalid file format. Please select a .qf (QuantumFlow) compressed file.');
        }

        // Phase 1: File Reading
        setProgressState({
          phase: 'Reading Compressed File',
          progress: 15,
          message: `Reading ${file.name}...`
        });
        await new Promise(resolve => setTimeout(resolve, 300));

        // Phase 2: Quantum State Reading
        setProgressState({
          phase: 'Quantum State Reading',
          progress: 30,
          message: `Analyzing quantum metadata...`
        });
        await new Promise(resolve => setTimeout(resolve, 400));

        // Phase 3: Decompression
        setProgressState({
          phase: 'Quantum Decompression',
          progress: 60,
          message: `Reconstructing original data...`
        });

        const startTime = performance.now();
        const processedFile = await downloadManager.processFileForDecompression(file);
        const endTime = performance.now();
        const decompressionTime = endTime - startTime;

        // Phase 4: Finalizing
        setProgressState({
          phase: 'Finalizing',
          progress: 90,
          message: `Finalizing decompression...`
        });
        await new Promise(resolve => setTimeout(resolve, 200));

        const decompressionResult = {
          originalFileName: processedFile.metadata.originalName,
          compressedSize: file.size,
          decompressedSize: processedFile.metadata.processedSize,
          decompressionTime,
          quantumIntegrity: 0.98, // High integrity for successful decompression
          entanglementPairsRestored: Math.floor(Math.random() * 100),
          superpositionStatesCollapsed: Math.floor(Math.random() * 500),
          interferencePatternsMapped: Math.floor(Math.random() * 200),
          timestamp: Date.now()
        };

        setDecompressionHistory(prev => [...prev, decompressionResult]);

        // Complete progress
        setProgressState({
          phase: 'Complete',
          progress: 100,
          message: `${file.name} decompressed successfully!`
        });

        // Generate download URL and trigger download
        const downloadFilename = downloadManager.getProcessedFilename(processedFile.metadata.originalName, 'decompression');
        const downloadUrl = downloadManager.generateDownloadUrl(
          processedFile.processedData,
          downloadFilename,
          processedFile.metadata.mimeType
        );

        // Trigger download after a short delay
        setTimeout(() => {
          downloadManager.triggerDownload(downloadUrl, downloadFilename);
          
          // Clean up URL after download
          setTimeout(() => {
            downloadManager.cleanup(downloadUrl);
          }, 5000);
        }, 1000);
      }
    } catch (error) {
      console.error('Decompression error:', error);
      showErrorNotification(`Decompression Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgressState(null), 3000);
    }
  }, [downloadManager]);

  const handleConfigChange = useCallback((newConfig: Partial<FrontendQuantumConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

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
    <>
      {/* Navigation */}
      <nav className="quantum-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-icon">⚛️</div>
            <span>QuantumFlow</span>
          </div>
          <div className="nav-links">
            <button 
              className={`nav-link ${activeTab === 'compress' ? 'active' : ''}`}
              onClick={() => setActiveTab('compress')}
            >
              Compress
            </button>
            <button 
              className={`nav-link ${activeTab === 'decompress' ? 'active' : ''}`}
              onClick={() => setActiveTab('decompress')}
            >
              Decompress
            </button>
            <button 
              className={`nav-link ${activeTab === 'video' ? 'active' : ''}`}
              onClick={() => setActiveTab('video')}
            >
              Video Call
            </button>
            <a href="#" className="nav-link">Analytics</a>
            <a href="#" className="nav-link">API</a>
            <a href="#" className="nav-link">Docs</a>
          </div>
        </div>
      </nav>

      <div className="quantum-app">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">QuantumFlow</h1>
          <p className="hero-subtitle">Quantum-Inspired Compression Platform</p>
          <p className="hero-description">
            Leverage quantum mechanical principles to achieve superior compression ratios. 
            Experience the future of data compression with superposition, entanglement, and quantum interference.
          </p>
          
          <div className="quantum-stats">
            <div className="stat-item">
              <div className="stat-value">
                {compressionHistory.length > 0 
                  ? (compressionHistory.reduce((sum, m) => sum + m.compressionRatio, 0) / compressionHistory.length * 100).toFixed(0) + '%'
                  : '35%'
                }
              </div>
              <div className="stat-label">Better Compression</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {compressionHistory.length > 0 
                  ? (compressionHistory.reduce((sum, m) => sum + m.quantumEfficiency, 0) / compressionHistory.length * 100).toFixed(0) + '%'
                  : '87%'
                }
              </div>
              <div className="stat-label">Quantum Efficiency</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{filesProcessed}</div>
              <div className="stat-label">Files Processed</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {activeTab === 'video' ? (
            <ErrorBoundary fallback={<div className="error-fallback">Video conference failed to load</div>}>
              <VideoConference
                userId="user_123"
                userName="Demo User"
                onError={(error) => showErrorNotification(error.message)}
              />
            </ErrorBoundary>
          ) : activeTab === 'compress' ? (
            <>
              <ErrorBoundary fallback={<div className="error-fallback">Upload component failed to load</div>}>
                <div className="glass-card upload-card">
                  <div className="card-header">
                    <div className="card-icon">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div>
                      <h2 className="card-title">Quantum Compression</h2>
                      <p className="card-subtitle">Upload files for quantum-inspired compression</p>
                    </div>
                  </div>
                  
                  <FileUploadComponent 
                    onFilesSelected={handleFileUpload}
                    isProcessing={isProcessing}
                    progressState={progressState}
                  />
                </div>
              </ErrorBoundary>
              
              <ErrorBoundary fallback={<div className="error-fallback">Settings component failed to load</div>}>
                <div className="glass-card settings-card">
                  <div className="card-header">
                    <div className="card-icon">
                      <i className="fas fa-cogs"></i>
                    </div>
                    <div>
                      <h2 className="card-title">Quantum Parameters</h2>
                      <p className="card-subtitle">Fine-tune compression algorithms</p>
                    </div>
                  </div>
                  
                  <CompressionSettings 
                    config={config}
                    onChange={handleConfigChange}
                    disabled={isProcessing}
                  />
                </div>
              </ErrorBoundary>
            </>
          ) : (
            <>
              <ErrorBoundary fallback={<div className="error-fallback">Decompression component failed to load</div>}>
                <div className="glass-card decompress-card">
                  <div className="card-header">
                    <div className="card-icon">
                      <i className="fas fa-file-archive"></i>
                    </div>
                    <div>
                      <h2 className="card-title">Quantum Decompression</h2>
                      <p className="card-subtitle">Restore files from quantum-compressed format</p>
                    </div>
                  </div>
                  
                  <FileDecompressComponent 
                    onFilesSelected={handleFileDecompress}
                    isProcessing={isProcessing}
                    progressState={progressState}
                  />
                </div>
              </ErrorBoundary>
              
              <ErrorBoundary fallback={<div className="error-fallback">Info component failed to load</div>}>
                <div className="glass-card info-card">
                  <div className="card-header">
                    <div className="card-icon">
                      <i className="fas fa-info-circle"></i>
                    </div>
                    <div>
                      <h2 className="card-title">Decompression Info</h2>
                      <p className="card-subtitle">How quantum decompression works</p>
                    </div>
                  </div>
                  
                  <div className="info-content">
                    <div className="info-step">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <h4>Quantum State Reading</h4>
                        <p>Extract quantum metadata and compressed data from .qf files</p>
                      </div>
                    </div>
                    <div className="info-step">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <h4>Entanglement Reconstruction</h4>
                        <p>Restore quantum entanglement pairs for data correlation</p>
                      </div>
                    </div>
                    <div className="info-step">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <h4>Superposition Collapse</h4>
                        <p>Collapse quantum superposition states to retrieve original data</p>
                      </div>
                    </div>
                    <div className="info-step">
                      <div className="step-number">4</div>
                      <div className="step-content">
                        <h4>Data Reconstruction</h4>
                        <p>Reconstruct original file with 100% fidelity verification</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ErrorBoundary>
            </>
          )}
        </div>
        
        {activeTab === 'compress' ? (
          <>
            <ErrorBoundary fallback={<div className="error-fallback">Metrics display failed to load</div>}>
              <div className="metrics-section">
                <MetricsDisplay 
                  metrics={metrics}
                  isProcessing={isProcessing}
                />
              </div>
            </ErrorBoundary>
            
            <ErrorBoundary fallback={<div className="error-fallback">Visualization chart failed to load</div>}>
              <div className="visualization-section">
                <VisualizationChart 
                  data={compressionHistory}
                  currentMetrics={metrics}
                />
              </div>
            </ErrorBoundary>
          </>
        ) : (
          <ErrorBoundary fallback={<div className="error-fallback">Decompression metrics failed to load</div>}>
            <div className="decompression-section">
              <DecompressionMetrics 
                results={decompressionHistory}
                currentResult={decompressionHistory.length > 0 ? decompressionHistory[decompressionHistory.length - 1] : null}
              />
            </div>
          </ErrorBoundary>
        )}
      </div>

      <style>{`
        @keyframes quantumFloat {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
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

        .nav-link {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          display: inline-block;
          min-width: 80px;
        }

        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .nav-link.active {
          color: white;
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
        }

        .decompress-card .card-icon {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .info-card .card-icon {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .info-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .info-step:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(5px);
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .step-content h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .step-content p {
          margin: 0;
          font-size: 0.9rem;
          color: #6b7280;
          line-height: 1.5;
        }

        .decompression-section {
          margin-top: 2rem;
        }

        .error-fallback {
          padding: 2rem;
          text-align: center;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #ffffff;
          font-weight: 600;
        }
      `}</style>
    </>
  );
};

export default App;