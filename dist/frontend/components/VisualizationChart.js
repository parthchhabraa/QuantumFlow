"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualizationChart = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const recharts_1 = require("recharts");
const VisualizationChart = ({ data, currentMetrics }) => {
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };
    const compressionData = data.map((metrics, index) => ({
        session: index + 1,
        compressionRatio: (metrics.compressionRatio * 100).toFixed(1),
        processingTime: metrics.processingTime,
        quantumEfficiency: (metrics.quantumEfficiency * 100).toFixed(1),
        originalSize: metrics.originalSize,
        compressedSize: metrics.compressedSize,
        spaceSaved: metrics.originalSize - metrics.compressedSize
    }));
    const quantumBreakdown = currentMetrics ? [
        { name: 'Entanglement Pairs', value: currentMetrics.entanglementPairs || 0, color: '#8b5cf6' },
        { name: 'Superposition States', value: currentMetrics.superpositionStates || 0, color: '#f59e0b' },
        { name: 'Interference Patterns', value: currentMetrics.interferencePatterns || 0, color: '#ef4444' },
        { name: 'Quantum Efficiency', value: Math.round((currentMetrics.quantumEfficiency || 0) * 100), color: '#10b981' }
    ] : [];
    const performanceComparison = currentMetrics ? [
        { algorithm: 'QuantumFlow', ratio: currentMetrics.compressionRatio * 100, color: '#667eea' },
        { algorithm: 'gzip', ratio: 65, color: '#9ca3af' },
        { algorithm: 'bzip2', ratio: 70, color: '#6b7280' },
        { algorithm: 'lzma', ratio: 75, color: '#4b5563' }
    ] : [];
    if (data.length === 0 && !currentMetrics) {
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                marginTop: '20px'
            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '3rem', marginBottom: '20px' }, children: "\uD83D\uDCCA" }), (0, jsx_runtime_1.jsx)("h3", { style: { color: '#6b7280', marginBottom: '10px' }, children: "No Data Yet" }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#9ca3af' }, children: "Upload and compress files to see performance visualizations and quantum processing metrics." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "visualization-section", children: [(0, jsx_runtime_1.jsx)("h2", { style: { marginBottom: '30px', color: '#374151', textAlign: 'center' }, children: "Compression Analytics & Quantum Insights" }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '25px',
                    marginBottom: '30px'
                }, children: [data.length > 1 && ((0, jsx_runtime_1.jsxs)("div", { style: {
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '25px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginBottom: '20px', color: '#374151' }, children: "Compression Ratio Trend" }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 250, children: (0, jsx_runtime_1.jsxs)(recharts_1.LineChart, { data: compressionData, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "session", stroke: "#6b7280", fontSize: 12 }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { stroke: "#6b7280", fontSize: 12, domain: [0, 100] }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }, formatter: (value, name) => [
                                                name === 'compressionRatio' ? `${value}%` : value,
                                                name === 'compressionRatio' ? 'Compression Ratio' : name
                                            ] }), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "compressionRatio", stroke: "#667eea", strokeWidth: 3, dot: { fill: '#667eea', strokeWidth: 2, r: 4 }, activeDot: { r: 6, stroke: '#667eea', strokeWidth: 2 } })] }) })] })), currentMetrics && quantumBreakdown.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: {
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '25px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginBottom: '20px', color: '#374151' }, children: "Quantum Processing Breakdown" }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 250, children: (0, jsx_runtime_1.jsxs)(recharts_1.PieChart, { children: [(0, jsx_runtime_1.jsx)(recharts_1.Pie, { data: quantumBreakdown, cx: "50%", cy: "50%", outerRadius: 80, dataKey: "value", label: ({ name, value }) => `${name}: ${value}`, labelLine: false, children: quantumBreakdown.map((entry, index) => ((0, jsx_runtime_1.jsx)(recharts_1.Cell, { fill: entry.color }, `cell-${index}`))) }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            } })] }) })] }))] }), currentMetrics && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '25px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    marginBottom: '25px'
                }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginBottom: '20px', color: '#374151' }, children: "Algorithm Comparison" }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.BarChart, { data: performanceComparison, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "algorithm", stroke: "#6b7280", fontSize: 12 }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { stroke: "#6b7280", fontSize: 12, domain: [0, 100], label: { value: 'Compression Ratio (%)', angle: -90, position: 'insideLeft' } }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }, formatter: (value) => [`${value}%`, 'Compression Ratio'] }), (0, jsx_runtime_1.jsx)(recharts_1.Bar, { dataKey: "ratio", fill: "#667eea", radius: [4, 4, 0, 0] })] }) })] })), data.length > 1 && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '25px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginBottom: '20px', color: '#374151' }, children: "Processing Time vs File Size" }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: 300, children: (0, jsx_runtime_1.jsxs)(recharts_1.LineChart, { data: compressionData, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "originalSize", stroke: "#6b7280", fontSize: 12, tickFormatter: formatBytes }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { stroke: "#6b7280", fontSize: 12, label: { value: 'Processing Time (ms)', angle: -90, position: 'insideLeft' } }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }, formatter: (value, name) => [
                                        name === 'processingTime' ? `${value}ms` : formatBytes(value),
                                        name === 'processingTime' ? 'Processing Time' : 'File Size'
                                    ], labelFormatter: (value) => `File Size: ${formatBytes(Number(value))}` }), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "processingTime", stroke: "#8b5cf6", strokeWidth: 3, dot: { fill: '#8b5cf6', strokeWidth: 2, r: 4 }, activeDot: { r: 6, stroke: '#8b5cf6', strokeWidth: 2 } })] }) })] }))] }));
};
exports.VisualizationChart = VisualizationChart;
//# sourceMappingURL=VisualizationChart.js.map