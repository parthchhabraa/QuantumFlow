"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsDisplay = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const MetricsDisplay = ({ metrics, isProcessing }) => {
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatTime = (ms) => {
        if (ms < 1000)
            return `${ms.toFixed(0)}ms`;
        if (ms < 60000)
            return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    };
    const getCompressionRating = (ratio) => {
        if (ratio >= 0.8)
            return { text: 'Excellent', color: '#10b981', icon: '🌟' };
        if (ratio >= 0.6)
            return { text: 'Very Good', color: '#059669', icon: '✨' };
        if (ratio >= 0.4)
            return { text: 'Good', color: '#f59e0b', icon: '👍' };
        if (ratio >= 0.2)
            return { text: 'Fair', color: '#f97316', icon: '👌' };
        return { text: 'Poor', color: '#ef4444', icon: '⚠️' };
    };
    const MetricCard = ({ title, value, subtitle, icon, color = '#667eea', isLoading = false }) => ((0, jsx_runtime_1.jsxs)("div", { style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: `2px solid ${color}20`
        }, children: [isLoading && ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '3px',
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    animation: 'shimmer 2s infinite'
                } })), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '2rem', marginBottom: '8px' }, children: icon }), (0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: color,
                    marginBottom: '4px'
                }, children: isLoading ? '...' : value }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }, children: title }), subtitle && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }, children: subtitle }))] }));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "metrics-display", children: [(0, jsx_runtime_1.jsx)("h2", { style: { marginBottom: '20px', color: '#374151', textAlign: 'center' }, children: "Performance Metrics" }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }, children: [(0, jsx_runtime_1.jsx)(MetricCard, { title: "Compression Ratio", value: metrics ? `${(metrics.compressionRatio * 100).toFixed(1)}%` : '--', subtitle: metrics ? getCompressionRating(metrics.compressionRatio).text : undefined, icon: metrics ? getCompressionRating(metrics.compressionRatio).icon : '📊', color: metrics ? getCompressionRating(metrics.compressionRatio).color : '#667eea', isLoading: isProcessing }), (0, jsx_runtime_1.jsx)(MetricCard, { title: "Processing Time", value: metrics ? formatTime(metrics.processingTime) : '--', subtitle: metrics && metrics.processingTime > 5000 ? 'Consider lower settings' : undefined, icon: "\u23F1\uFE0F", color: "#8b5cf6", isLoading: isProcessing }), (0, jsx_runtime_1.jsx)(MetricCard, { title: "Original Size", value: metrics ? formatBytes(metrics.originalSize) : '--', icon: "\uD83D\uDCC4", color: "#06b6d4", isLoading: isProcessing }), (0, jsx_runtime_1.jsx)(MetricCard, { title: "Compressed Size", value: metrics ? formatBytes(metrics.compressedSize) : '--', subtitle: metrics ? `Saved ${formatBytes(metrics.originalSize - metrics.compressedSize)}` : undefined, icon: "\uD83D\uDDDC\uFE0F", color: "#10b981", isLoading: isProcessing })] }), metrics && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '25px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    marginBottom: '20px'
                }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginBottom: '20px', color: '#374151' }, children: "Quantum Processing Details" }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '20px'
                        }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { style: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }, children: "QUANTUM EFFICIENCY" }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '1.4rem', fontWeight: 'bold', color: '#667eea' }, children: [(metrics.quantumEfficiency * 100).toFixed(1), "%"] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Quantum algorithm effectiveness" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { style: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }, children: "ENTANGLEMENT PAIRS" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1.4rem', fontWeight: 'bold', color: '#8b5cf6' }, children: metrics.entanglementPairs || 0 }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Correlated pattern pairs found" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { style: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }, children: "SUPERPOSITION STATES" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }, children: metrics.superpositionStates || 0 }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Parallel quantum states processed" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { style: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }, children: "INTERFERENCE OPTIMIZATIONS" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444' }, children: metrics.interferencePatterns || 0 }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.8rem', color: '#9ca3af' }, children: "Redundancy eliminations applied" })] })] })] })), (0, jsx_runtime_1.jsx)("style", { children: `
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      ` })] }));
};
exports.MetricsDisplay = MetricsDisplay;
//# sourceMappingURL=MetricsDisplay.js.map