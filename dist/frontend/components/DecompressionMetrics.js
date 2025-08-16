"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecompressionMetrics = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const DecompressionMetrics = ({ results, currentResult }) => {
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatTime = (ms) => {
        if (ms < 1000)
            return `${Math.round(ms)}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };
    const averageIntegrity = results.length > 0
        ? results.reduce((sum, r) => sum + r.quantumIntegrity, 0) / results.length
        : 0;
    const displayResult = currentResult || (results.length > 0 ? results[results.length - 1] : null);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '2rem' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    fontSize: '2rem',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                                }, children: "\uD83D\uDD12" }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                                            fontSize: '1.8rem',
                                            fontWeight: '700',
                                            color: '#ffffff',
                                            marginBottom: '0.25rem'
                                        }, children: [(averageIntegrity * 100).toFixed(1), "%"] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: '#a1a1aa',
                                            marginBottom: '0.125rem'
                                        }, children: "Quantum Integrity" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: '0.75rem',
                                            color: '#71717a'
                                        }, children: "Average data fidelity" })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    fontSize: '2rem',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)'
                                }, children: "\u26A1" }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: '1.8rem',
                                            fontWeight: '700',
                                            color: '#ffffff',
                                            marginBottom: '0.25rem'
                                        }, children: displayResult ? formatTime(displayResult.decompressionTime) : '--' }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: '#a1a1aa',
                                            marginBottom: '0.125rem'
                                        }, children: "Decompression Time" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: '0.75rem',
                                            color: '#71717a'
                                        }, children: "Latest operation" })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    fontSize: '2rem',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                                }, children: "\uD83D\uDCC8" }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: '1.8rem',
                                            fontWeight: '700',
                                            color: '#ffffff',
                                            marginBottom: '0.25rem'
                                        }, children: displayResult
                                            ? `${(displayResult.decompressedSize / displayResult.compressedSize).toFixed(1)}x`
                                            : '--' }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: '#a1a1aa',
                                            marginBottom: '0.125rem'
                                        }, children: "Expansion Ratio" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: '0.75rem',
                                            color: '#71717a'
                                        }, children: "Size multiplication" })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    fontSize: '2rem',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)'
                                }, children: "\uD83D\uDCC1" }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: '1.8rem',
                                            fontWeight: '700',
                                            color: '#ffffff',
                                            marginBottom: '0.25rem'
                                        }, children: results.length }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: '#a1a1aa',
                                            marginBottom: '0.125rem'
                                        }, children: "Files Restored" }), (0, jsx_runtime_1.jsx)("div", { style: {
                                            fontSize: '0.75rem',
                                            color: '#71717a'
                                        }, children: "Total processed" })] })] })] }), displayResult && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginTop: '2rem',
                    textAlign: 'center'
                }, children: [(0, jsx_runtime_1.jsxs)("h3", { style: { color: '#ffffff', marginBottom: '1rem' }, children: ["Latest Decompression: ", displayResult.originalFileName] }), (0, jsx_runtime_1.jsxs)("p", { style: { color: '#a1a1aa' }, children: [formatFileSize(displayResult.compressedSize), " \u2192 ", formatFileSize(displayResult.decompressedSize), "\u2022 ", formatTime(displayResult.decompressionTime), "\u2022 ", (displayResult.quantumIntegrity * 100).toFixed(1), "% integrity"] })] })), results.length === 0 && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    marginTop: '2rem'
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '3rem', marginBottom: '1rem' }, children: "\uD83D\uDCE6" }), (0, jsx_runtime_1.jsx)("h3", { style: { color: '#ffffff', marginBottom: '0.5rem' }, children: "No Decompressions Yet" }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#a1a1aa' }, children: "Upload a .qf file to see decompression metrics here" })] }))] }));
};
exports.DecompressionMetrics = DecompressionMetrics;
//# sourceMappingURL=DecompressionMetrics.js.map