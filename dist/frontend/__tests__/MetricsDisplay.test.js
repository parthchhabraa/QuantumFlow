"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const MetricsDisplay_1 = require("../components/MetricsDisplay");
describe('MetricsDisplay', () => {
    const mockMetrics = {
        compressionRatio: 0.75,
        processingTime: 1500,
        quantumEfficiency: 0.85,
        originalSize: 1000000,
        compressedSize: 250000,
        entanglementPairs: 42,
        superpositionStates: 128,
        interferenceOptimizations: 15
    };
    test('renders placeholder values when no metrics provided', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: null, isProcessing: false }));
        expect(react_1.screen.getByText('--')).toBeInTheDocument();
        expect(react_1.screen.getByText('Performance Metrics')).toBeInTheDocument();
    });
    test('displays metrics correctly when provided', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: mockMetrics, isProcessing: false }));
        expect(react_1.screen.getByText('75.0%')).toBeInTheDocument();
        expect(react_1.screen.getByText('1.5s')).toBeInTheDocument();
        expect(react_1.screen.getByText('85.0%')).toBeInTheDocument();
        expect(react_1.screen.getByText('976.56 KB')).toBeInTheDocument(); // Original size
        expect(react_1.screen.getByText('244.14 KB')).toBeInTheDocument(); // Compressed size
    });
    test('shows loading state when processing', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: null, isProcessing: true }));
        expect(react_1.screen.getByText('...')).toBeInTheDocument();
    });
    test('displays quantum processing details', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: mockMetrics, isProcessing: false }));
        expect(react_1.screen.getByText('Quantum Processing Details')).toBeInTheDocument();
        expect(react_1.screen.getByText('42')).toBeInTheDocument(); // Entanglement pairs
        expect(react_1.screen.getByText('128')).toBeInTheDocument(); // Superposition states
        expect(react_1.screen.getByText('15')).toBeInTheDocument(); // Interference optimizations
    });
    test('formats time correctly for different durations', () => {
        const shortMetrics = { ...mockMetrics, processingTime: 500 };
        const { rerender } = (0, react_1.render)((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: shortMetrics, isProcessing: false }));
        expect(react_1.screen.getByText('500ms')).toBeInTheDocument();
        const longMetrics = { ...mockMetrics, processingTime: 65000 };
        rerender((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: longMetrics, isProcessing: false }));
        expect(react_1.screen.getByText('1.1m')).toBeInTheDocument();
    });
    test('shows compression rating based on ratio', () => {
        const excellentMetrics = { ...mockMetrics, compressionRatio: 0.9 };
        const { rerender } = (0, react_1.render)((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: excellentMetrics, isProcessing: false }));
        expect(react_1.screen.getByText('Excellent')).toBeInTheDocument();
        const poorMetrics = { ...mockMetrics, compressionRatio: 0.1 };
        rerender((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: poorMetrics, isProcessing: false }));
        expect(react_1.screen.getByText('Poor')).toBeInTheDocument();
    });
    test('calculates space saved correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: mockMetrics, isProcessing: false }));
        expect(react_1.screen.getByText('Saved 732.42 KB')).toBeInTheDocument();
    });
    test('shows performance warning for slow processing', () => {
        const slowMetrics = { ...mockMetrics, processingTime: 6000 };
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: slowMetrics, isProcessing: false }));
        expect(react_1.screen.getByText('Consider lower settings')).toBeInTheDocument();
    });
    test('formats bytes correctly for different sizes', () => {
        const smallMetrics = { ...mockMetrics, originalSize: 500, compressedSize: 100 };
        const { rerender } = (0, react_1.render)((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: smallMetrics, isProcessing: false }));
        expect(react_1.screen.getByText('500 B')).toBeInTheDocument();
        const largeMetrics = { ...mockMetrics, originalSize: 1073741824, compressedSize: 268435456 };
        rerender((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: largeMetrics, isProcessing: false }));
        expect(react_1.screen.getByText('1 GB')).toBeInTheDocument();
    });
    test('handles zero values gracefully', () => {
        const zeroMetrics = {
            ...mockMetrics,
            entanglementPairs: 0,
            superpositionStates: 0,
            interferenceOptimizations: 0
        };
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: zeroMetrics, isProcessing: false }));
        expect(react_1.screen.getAllByText('0')).toHaveLength(3);
    });
    test('displays appropriate icons for different ratings', () => {
        const excellentMetrics = { ...mockMetrics, compressionRatio: 0.9 };
        (0, react_1.render)((0, jsx_runtime_1.jsx)(MetricsDisplay_1.MetricsDisplay, { metrics: excellentMetrics, isProcessing: false }));
        expect(react_1.screen.getByText('🌟')).toBeInTheDocument();
    });
});
//# sourceMappingURL=MetricsDisplay.test.js.map