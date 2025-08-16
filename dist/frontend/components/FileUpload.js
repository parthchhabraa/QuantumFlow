"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadComponent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_dropzone_1 = require("react-dropzone");
const FileUploadComponent = ({ onFilesSelected, isProcessing, progressState }) => {
    const [uploadProgress, setUploadProgress] = (0, react_1.useState)(0);
    const [dragActive, setDragActive] = (0, react_1.useState)(false);
    const onDrop = (0, react_1.useCallback)(async (acceptedFiles) => {
        if (acceptedFiles.length === 0 || isProcessing)
            return;
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
        onDragEnter: () => setDragActive(true),
        onDragLeave: () => setDragActive(false),
    });
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "file-upload-container", children: [(0, jsx_runtime_1.jsxs)("div", { ...getRootProps(), className: `dropzone ${isDragActive || dragActive ? 'active' : ''} ${isProcessing ? 'disabled' : ''}`, style: {
                    border: '2px dashed #667eea',
                    borderRadius: '10px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    backgroundColor: isDragActive ? '#f0f4ff' : '#fafbff',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }, children: [(0, jsx_runtime_1.jsx)("input", { ...getInputProps() }), uploadProgress > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "progress-bar", style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '4px',
                            backgroundColor: '#667eea',
                            width: `${uploadProgress}%`,
                            transition: 'width 0.3s ease'
                        } })), (0, jsx_runtime_1.jsx)("div", { className: "upload-icon", style: { fontSize: '3rem', marginBottom: '20px' }, children: isProcessing ? '⚛️' : '📁' }), isProcessing ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { style: { fontSize: '1.2rem', marginBottom: '10px' }, children: progressState?.phase || 'Processing with Quantum Compression...' }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '0.9rem', color: '#666', marginBottom: '15px' }, children: progressState?.message || 'Applying quantum algorithms...' }), (0, jsx_runtime_1.jsx)("div", { className: "quantum-spinner", style: {
                                    width: '40px',
                                    height: '40px',
                                    border: '4px solid #f3f3f3',
                                    borderTop: '4px solid #667eea',
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
                                                backgroundColor: '#667eea',
                                                transition: 'width 0.3s ease',
                                                borderRadius: '4px'
                                            } }) }), (0, jsx_runtime_1.jsxs)("p", { style: { fontSize: '0.8rem', color: '#666', marginTop: '5px' }, children: [Math.round(progressState.progress), "% Complete"] })] }))] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { style: { fontSize: '1.2rem', marginBottom: '10px' }, children: isDragActive
                                    ? 'Drop files here to compress with quantum algorithms'
                                    : 'Drag & drop files here, or click to select' }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#666', fontSize: '0.9rem' }, children: "Supports all file types \u2022 Max size: 1GB per file" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "upload-info", style: { marginTop: '20px', fontSize: '0.9rem', color: '#666' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "\u2728 Quantum superposition processing" }), (0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDD17 Entanglement pattern detection" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }, children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83C\uDF0A Quantum interference optimization" }), (0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDCCA Real-time compression metrics" })] })] }), (0, jsx_runtime_1.jsx)("style", { children: `
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
      ` })] }));
};
exports.FileUploadComponent = FileUploadComponent;
//# sourceMappingURL=FileUpload.js.map