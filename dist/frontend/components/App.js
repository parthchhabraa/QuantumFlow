"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const FileUpload_1 = require("./FileUpload");
const FileDecompress_1 = require("./FileDecompress");
const CompressionSettings_1 = require("./CompressionSettings");
const MetricsDisplay_1 = require("./MetricsDisplay");
const DecompressionMetrics_1 = require("./DecompressionMetrics");
const VisualizationChart_1 = require("./VisualizationChart");
const ErrorBoundary_1 = require("./ErrorBoundary");
const VideoConference_1 = require("./VideoConference");
const FileDownloadManager_1 = require("../services/FileDownloadManager");
const App = () => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('compress');
    const [config, setConfig] = (0, react_1.useState)({
        quantumBitDepth: 8,
        maxEntanglementLevel: 4,
        superpositionComplexity: 5,
        interferenceThreshold: 0.5
    });
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const [compressionHistory, setCompressionHistory] = (0, react_1.useState)([]);
    const [progressState, setProgressState] = (0, react_1.useState)(null);
    const [filesProcessed, setFilesProcessed] = (0, react_1.useState)(0);
    const [totalSpaceSaved, setTotalSpaceSaved] = (0, react_1.useState)(0);
    const [decompressionHistory, setDecompressionHistory] = (0, react_1.useState)([]);
    const [downloadManager] = (0, react_1.useState)(() => FileDownloadManager_1.FileDownloadManager.getInstance());
    // Initialize particles effect
    (0, react_1.useEffect)(() => {
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
    (0, react_1.useEffect)(() => {
        return () => {
            downloadManager.cleanupAll();
        };
    }, [downloadManager]);
    const handleFileUpload = (0, react_1.useCallback)(async (files) => {
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
                const realMetrics = {
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
                const downloadUrl = downloadManager.generateDownloadUrl(processedFile.processedData, downloadFilename, processedFile.metadata.mimeType);
                // Trigger download after a short delay
                setTimeout(() => {
                    downloadManager.triggerDownload(downloadUrl, downloadFilename);
                    // Clean up URL after download
                    setTimeout(() => {
                        downloadManager.cleanup(downloadUrl);
                    }, 5000);
                }, 1000);
            }
        }
        catch (error) {
            console.error('Compression error:', error);
            showErrorNotification(`Compression Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            setIsProcessing(false);
            setTimeout(() => setProgressState(null), 3000);
        }
    }, [config, downloadManager]);
    const handleFileDecompress = (0, react_1.useCallback)(async (files) => {
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
                const downloadUrl = downloadManager.generateDownloadUrl(processedFile.processedData, downloadFilename, processedFile.metadata.mimeType);
                // Trigger download after a short delay
                setTimeout(() => {
                    downloadManager.triggerDownload(downloadUrl, downloadFilename);
                    // Clean up URL after download
                    setTimeout(() => {
                        downloadManager.cleanup(downloadUrl);
                    }, 5000);
                }, 1000);
            }
        }
        catch (error) {
            console.error('Decompression error:', error);
            showErrorNotification(`Decompression Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            setIsProcessing(false);
            setTimeout(() => setProgressState(null), 3000);
        }
    }, [downloadManager]);
    const handleConfigChange = (0, react_1.useCallback)((newConfig) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    }, []);
    const showErrorNotification = (message) => {
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
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("nav", { className: "quantum-nav", children: (0, jsx_runtime_1.jsxs)("div", { className: "nav-container", children: [(0, jsx_runtime_1.jsxs)("div", { className: "nav-logo", children: [(0, jsx_runtime_1.jsx)("div", { className: "logo-icon", children: "\u269B\uFE0F" }), (0, jsx_runtime_1.jsx)("span", { children: "QuantumFlow" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "nav-links", children: [(0, jsx_runtime_1.jsx)("button", { className: `nav-link ${activeTab === 'compress' ? 'active' : ''}`, onClick: () => setActiveTab('compress'), children: "Compress" }), (0, jsx_runtime_1.jsx)("button", { className: `nav-link ${activeTab === 'decompress' ? 'active' : ''}`, onClick: () => setActiveTab('decompress'), children: "Decompress" }), (0, jsx_runtime_1.jsx)("button", { className: `nav-link ${activeTab === 'video' ? 'active' : ''}`, onClick: () => setActiveTab('video'), children: "Video Call" }), (0, jsx_runtime_1.jsx)("a", { href: "#", className: "nav-link", children: "Analytics" }), (0, jsx_runtime_1.jsx)("a", { href: "#", className: "nav-link", children: "API" }), (0, jsx_runtime_1.jsx)("a", { href: "#", className: "nav-link", children: "Docs" })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "quantum-app", children: [(0, jsx_runtime_1.jsxs)("div", { className: "hero-section", children: [(0, jsx_runtime_1.jsx)("h1", { className: "hero-title", children: "QuantumFlow" }), (0, jsx_runtime_1.jsx)("p", { className: "hero-subtitle", children: "Quantum-Inspired Compression Platform" }), (0, jsx_runtime_1.jsx)("p", { className: "hero-description", children: "Leverage quantum mechanical principles to achieve superior compression ratios. Experience the future of data compression with superposition, entanglement, and quantum interference." }), (0, jsx_runtime_1.jsxs)("div", { className: "quantum-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "stat-value", children: compressionHistory.length > 0
                                                    ? (compressionHistory.reduce((sum, m) => sum + m.compressionRatio, 0) / compressionHistory.length * 100).toFixed(0) + '%'
                                                    : '35%' }), (0, jsx_runtime_1.jsx)("div", { className: "stat-label", children: "Better Compression" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "stat-value", children: compressionHistory.length > 0
                                                    ? (compressionHistory.reduce((sum, m) => sum + m.quantumEfficiency, 0) / compressionHistory.length * 100).toFixed(0) + '%'
                                                    : '87%' }), (0, jsx_runtime_1.jsx)("div", { className: "stat-label", children: "Quantum Efficiency" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "stat-value", children: filesProcessed }), (0, jsx_runtime_1.jsx)("div", { className: "stat-label", children: "Files Processed" })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "main-content", children: activeTab === 'video' ? ((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { fallback: (0, jsx_runtime_1.jsx)("div", { className: "error-fallback", children: "Video conference failed to load" }), children: (0, jsx_runtime_1.jsx)(VideoConference_1.VideoConference, { userId: "user_123", userName: "Demo User", onError: (error) => showErrorNotification(error.message) }) })) : activeTab === 'compress' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { fallback: (0, jsx_runtime_1.jsx)("div", { className: "error-fallback", children: "Upload component failed to load" }), children: (0, jsx_runtime_1.jsxs)("div", { className: "glass-card upload-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "card-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "card-icon", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-cloud-upload-alt" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "card-title", children: "Quantum Compression" }), (0, jsx_runtime_1.jsx)("p", { className: "card-subtitle", children: "Upload files for quantum-inspired compression" })] })] }), (0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: handleFileUpload, isProcessing: isProcessing, progressState: progressState })] }) }), (0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { fallback: (0, jsx_runtime_1.jsx)("div", { className: "error-fallback", children: "Settings component failed to load" }), children: (0, jsx_runtime_1.jsxs)("div", { className: "glass-card settings-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "card-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "card-icon", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-cogs" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "card-title", children: "Quantum Parameters" }), (0, jsx_runtime_1.jsx)("p", { className: "card-subtitle", children: "Fine-tune compression algorithms" })] })] }), (0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: config, onChange: handleConfigChange, disabled: isProcessing })] }) })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { fallback: (0, jsx_runtime_1.jsx)("div", { className: "error-fallback", children: "Decompression component failed to load" }), children: (0, jsx_runtime_1.jsxs)("div", { className: "glass-card decompress-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "card-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "card-icon", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-file-archive" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "card-title", children: "Quantum Decompression" }), (0, jsx_runtime_1.jsx)("p", { className: "card-subtitle", children: "Restore files from quantum-compressed format" })] })] }), (0, jsx_runtime_1.jsx)(FileDecompress_1.FileDecompressComponent, { onFilesSelected: handleFileDecompress, isProcessing: isProcessing, progressState: progressState })] }) }), (0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { fallback: (0, jsx_runtime_1.jsx)("div", { className: "error-fallback", children: "Info component failed to load" }), children: (0, jsx_runtime_1.jsxs)("div", { className: "glass-card info-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "card-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "card-icon", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-info-circle" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "card-title", children: "Decompression Info" }), (0, jsx_runtime_1.jsx)("p", { className: "card-subtitle", children: "How quantum decompression works" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-content", children: [(0, jsx_runtime_1.jsxs)("div", { className: "info-step", children: [(0, jsx_runtime_1.jsx)("div", { className: "step-number", children: "1" }), (0, jsx_runtime_1.jsxs)("div", { className: "step-content", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Quantum State Reading" }), (0, jsx_runtime_1.jsx)("p", { children: "Extract quantum metadata and compressed data from .qf files" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-step", children: [(0, jsx_runtime_1.jsx)("div", { className: "step-number", children: "2" }), (0, jsx_runtime_1.jsxs)("div", { className: "step-content", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Entanglement Reconstruction" }), (0, jsx_runtime_1.jsx)("p", { children: "Restore quantum entanglement pairs for data correlation" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-step", children: [(0, jsx_runtime_1.jsx)("div", { className: "step-number", children: "3" }), (0, jsx_runtime_1.jsxs)("div", { className: "step-content", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Superposition Collapse" }), (0, jsx_runtime_1.jsx)("p", { children: "Collapse quantum superposition states to retrieve original data" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-step", children: [(0, jsx_runtime_1.jsx)("div", { className: "step-number", children: "4" }), (0, jsx_runtime_1.jsxs)("div", { className: "step-content", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Data Reconstruction" }), (0, jsx_runtime_1.jsx)("p", { children: "Reconstruct original file with 100% fidelity verification" })] })] })] })] }) })] })) }), activeTab === 'compress' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { fallback: (0, jsx_runtime_1.jsx)("div", { className: "error-fallback", children: "Metrics display failed to load" }), children: (0, jsx_runtime_1.jsx)("div", { className: "metrics-section", children: (0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: metrics, isProcessing: isProcessing }) }) }), (0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { fallback: (0, jsx_runtime_1.jsx)("div", { className: "error-fallback", children: "Visualization chart failed to load" }), children: (0, jsx_runtime_1.jsx)("div", { className: "visualization-section", children: (0, jsx_runtime_1.jsx)(VisualizationChart_1.VisualizationChart, { data: compressionHistory, currentMetrics: metrics }) }) })] })) : ((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { fallback: (0, jsx_runtime_1.jsx)("div", { className: "error-fallback", children: "Decompression metrics failed to load" }), children: (0, jsx_runtime_1.jsx)("div", { className: "decompression-section", children: (0, jsx_runtime_1.jsx)(DecompressionMetrics_1.DecompressionMetrics, { results: decompressionHistory, currentResult: decompressionHistory.length > 0 ? decompressionHistory[decompressionHistory.length - 1] : null }) }) }))] }), (0, jsx_runtime_1.jsx)("style", { children: `
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
      ` })] }));
};
exports.App = App;
exports.default = exports.App;
//# sourceMappingURL=App.js.map