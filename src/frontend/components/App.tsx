import React, { useState, useCallback, useEffect } from 'react';
import { FileUploadComponent } from './FileUpload';
import { FileDecompressComponent } from './FileDecompress';
import { CompressionSettings } from './CompressionSettings';
import { MetricsDisplay } from './MetricsDisplay';
import { DecompressionMetrics } from './DecompressionMetrics';
import { VisualizationChart } from './VisualizationChart';
import { QuantumConfig } from '../../models/QuantumConfig';
import { QuantumMetrics } from '../../models/QuantumMetrics';

interface CompressionResult {
  success: boolean;
  metrics?: QuantumMetrics;
  downloadUrl?: string;
  error?: string;
}

interface ProgressState {
  phase: string;
  progress: number;
  message: string;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compress' | 'decompress'>('compress');
  const [config, setConfig] = useState<QuantumConfig>({
    quantumBitDepth: 8,
    maxEntanglementLevel: 4,
    superpositionComplexity: 5,
    interferenceThreshold: 0.5
  });

  const [metrics, setMetrics] = useState<QuantumMetrics | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionHistory, setCompressionHistory] = useState<QuantumMetrics[]>([]);
  const [progressState, setProgressState] = useState<ProgressState | null>(null);
  const [filesProcessed, setFilesProcessed] = useState(0);
  const [totalSpaceSaved, setTotalSpaceSaved] = useState(0);
  const [decompressionHistory, setDecompressionHistory] = useState<any[]>([]);

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

  const handleFileUpload = useCallback(async (files: File[]): Promise<void> => {
    setIsProcessing(true);
    
    try {
      for (const file of files) {
        // Simulate quantum compression phases
        const phases = [
          { name: 'Initialization', duration: 500 },
          { name: 'Quantum State Preparation', duration: 2000 },
          { name: 'Entanglement Detection', duration: 1500 },
          { name: 'Interference Optimization', duration: 1000 },
          { name: 'Data Encoding', duration: 500 }
        ];

        for (let i = 0; i < phases.length; i++) {
          const phase = phases[i];
          setProgressState({
            phase: phase.name,
            progress: (i / phases.length) * 100,
            message: `Processing ${file.name}...`
          });

          await new Promise(resolve => setTimeout(resolve, phase.duration));
        }

        // Simulate compression result
        const compressionRatio = 0.25 + Math.random() * 0.4;
        const processingTime = 1000 + Math.random() * 4000;
        const quantumEfficiency = 0.7 + Math.random() * 0.25;
        const spaceSaved = file.size * compressionRatio;

        const mockMetrics: QuantumMetrics = {
          compressionRatio,
          processingTime,
          quantumEfficiency,
          originalSize: file.size,
          compressedSize: file.size * (1 - compressionRatio),
          spaceSaved,
          entanglementPairs: Math.floor(Math.random() * 100),
          superpositionStates: Math.floor(Math.random() * 500),
          interferencePatterns: Math.floor(Math.random() * 200)
        } as QuantumMetrics;

        setMetrics(mockMetrics);
        setCompressionHistory(prev => [...prev, mockMetrics]);
        setFilesProcessed(prev => prev + 1);
        setTotalSpaceSaved(prev => prev + spaceSaved);

        // Complete progress
        setProgressState({
          phase: 'Complete',
          progress: 100,
          message: `${file.name} compressed successfully!`
        });

        // Simulate download
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = '#';
          link.download = `${file.name}.qf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 1000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Show modern error notification
      showErrorNotification(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgressState(null), 3000);
    }
  }, [config]);

  const handleFileDecompress = useCallback(async (files: File[]): Promise<void> => {
    setIsProcessing(true);
    
    try {
      for (const file of files) {
        // Validate quantum compressed file
        if (!file.name.endsWith('.qf')) {
          throw new Error('Invalid file format. Please select a .qf (QuantumFlow) compressed file.');
        }

        // Simulate quantum decompression phases
        const phases = [
          { name: 'Quantum State Reading', duration: 800 },
          { name: 'Entanglement Reconstruction', duration: 1200 },
          { name: 'Interference Pattern Analysis', duration: 1000 },
          { name: 'Superposition Collapse', duration: 1500 },
          { name: 'Data Reconstruction', duration: 600 }
        ];

        for (let i = 0; i < phases.length; i++) {
          const phase = phases[i];
          setProgressState({
            phase: phase.name,
            progress: (i / phases.length) * 100,
            message: `Decompressing ${file.name}...`
          });

          await new Promise(resolve => setTimeout(resolve, phase.duration));
        }

        // Simulate decompression result
        const originalSize = file.size * (2 + Math.random() * 3); // Simulate expansion
        const decompressionTime = 800 + Math.random() * 2000;
        const quantumIntegrity = 0.95 + Math.random() * 0.05;

        const decompressionResult = {
          originalFileName: file.name.replace('.qf', ''),
          compressedSize: file.size,
          decompressedSize: originalSize,
          decompressionTime,
          quantumIntegrity,
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

        // Simulate download of decompressed file
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = '#';
          link.download = decompressionResult.originalFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 1000);
      }
    } catch (error) {
      console.error('Decompression error:', error);
      showErrorNotification(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgressState(null), 3000);
    }
  }, []);

  const handleConfigChange = useCallback((newConfig: Partial<QuantumConfig>) => {
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
                  ? (compressionHistory.reduce((sum, m) => sum + (m as any).quantumEfficiency, 0) / compressionHistory.length * 100).toFixed(0) + '%'
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
          {activeTab === 'compress' ? (
            <>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
        
        {activeTab === 'compress' ? (
          <>
            <div className="metrics-section">
              <MetricsDisplay 
                metrics={metrics}
                isProcessing={isProcessing}
                totalSpaceSaved={totalSpaceSaved}
                filesProcessed={filesProcessed}
              />
            </div>
            
            <div className="visualization-section">
              <VisualizationChart 
                data={compressionHistory}
                currentMetrics={metrics}
              />
            </div>
          </>
        ) : (
          <div className="decompression-section">
            <DecompressionMetrics 
              results={decompressionHistory}
              currentResult={decompressionHistory.length > 0 ? decompressionHistory[decompressionHistory.length - 1] : null}
            />
          </div>
        )}
      </div>

      <style jsx>{`
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
        }

        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-link.active {
          color: white;
          background: rgba(255, 255, 255, 0.2);
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
      `}</style>
    </>
  );
};

export default App;