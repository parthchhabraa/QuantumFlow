"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDecompressComponent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_dropzone_1 = require("react-dropzone");
const FileDecompressComponent = ({ onFilesSelected, isProcessing, progressState }) => {
    const [uploadProgress, setUploadProgress] = (0, react_1.useState)(0);
    const [dragActive, setDragActive] = (0, react_1.useState)(false);
    const onDrop = (0, react_1.useCallback)(async (acceptedFiles) => {
        if (acceptedFiles.length === 0 || isProcessing)
            return;
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
        }
        catch (error) {
            setUploadProgress(0);
        }
        finally {
            clearInterval(progressInterval);
        }
    }, [onFilesSelected, isProcessing]);
    const { getRootProps, getInputProps, isDragActive } = (0, react_dropzone_1.useDropzone)({
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "file-decompress-container", children: [(0, jsx_runtime_1.jsxs)("div", { ...getRootProps(), className: `dropzone ${isDragActive || dragActive ? 'active' : ''} ${isProcessing ? 'disabled' : ''}`, style: {
                    border: '2px dashed #10b981',
                    borderRadius: '10px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    backgroundColor: isDragActive ? '#f0fdf4' : '#fafffe',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }, children: [(0, jsx_runtime_1.jsx)("input", { ...getInputProps() }), uploadProgress > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "progress-bar", style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '4px',
                            backgroundColor: '#10b981',
                            width: `${uploadProgress}%`,
                            transition: 'width 0.3s ease'
                        } })), (0, jsx_runtime_1.jsx)("div", { className: "upload-icon", style: { fontSize: '3rem', marginBottom: '20px' }, children: isProcessing ? '🔄' : '📦' }), isProcessing ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { style: { fontSize: '1.2rem', marginBottom: '10px' }, children: progressState?.phase || 'Processing Quantum Decompression...' }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '0.9rem', color: '#666', marginBottom: '15px' }, children: progressState?.message || 'Reconstructing quantum states...' }), (0, jsx_runtime_1.jsx)("div", { className: "quantum-spinner", style: {
                                    width: '40px',
                                    height: '40px',
                                    border: '4px solid #f3f3f3',
                                    borderTop: '4px solid #10b981',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto'
                                } }), progressState && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '15px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                                width: `${progressState.progress}%`,
                                                height: '100%',
                                                backgroundColor: '#10b981',
                                                transition: 'width 0.3s ease',
                                                borderRadius: '4px'
                                            } }) }), (0, jsx_runtime_1.jsxs)("p", { style: { fontSize: '0.8rem', color: '#666', marginTop: '5px' }, children: [Math.round(progressState.progress), "% Complete"] })] }))] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { style: { fontSize: '1.2rem', marginBottom: '10px' }, children: isDragActive
                                    ? 'Drop .qf files here to decompress'
                                    : 'Drag & drop .qf files here, or click to select' }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#666', fontSize: '0.9rem' }, children: "Only QuantumFlow (.qf) compressed files \u2022 Max size: 1GB per file" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "decompress-info", style: { marginTop: '20px', fontSize: '0.9rem', color: '#666' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDD13 Quantum state reconstruction" }), (0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDD17 Entanglement pair restoration" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83C\uDF0A Interference pattern mapping" }), (0, jsx_runtime_1.jsx)("span", { children: "\u2705 Data integrity verification" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "file-format-info", style: {
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: '0 0 10px 0', color: '#065f46', fontSize: '0.9rem' }, children: "\uD83D\uDCCB Supported Format" }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '0.8rem', color: '#047857' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', marginBottom: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontWeight: 'bold', marginRight: '10px' }, children: ".qf" }), (0, jsx_runtime_1.jsx)("span", { children: "QuantumFlow compressed files" })] }), (0, jsx_runtime_1.jsx)("p", { style: { margin: '5px 0 0 0', fontSize: '0.75rem', color: '#059669' }, children: "Files compressed using QuantumFlow's quantum-inspired algorithms with embedded metadata for perfect reconstruction." })] })] }), (0, jsx_runtime_1.jsx)("style", { children: `
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
      ` })] }));
};
exports.FileDecompressComponent = FileDecompressComponent;
//# sourceMappingURL=FileDecompress.js.map