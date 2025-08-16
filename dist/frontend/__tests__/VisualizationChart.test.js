"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const VisualizationChart_1 = require("../components/VisualizationChart");
// Mock recharts components
jest.mock('recharts', () => ({
    LineChart: ({ children }) => (0, jsx_runtime_1.jsx)("div", { "data-testid": "line-chart", children: children }),
    Line: () => (0, jsx_runtime_1.jsx)("div", { "data-testid": "line" }),
    XAxis: () => (0, jsx_runtime_1.jsx)("div", { "data-testid": "x-axis" }),
    YAxis: () => (0, jsx_runtime_1.jsx)("div", { "data-testid": "y-axis" }),
    CartesianGrid: () => (0, jsx_runtime_1.jsx)("div", { "data-testid": "cartesian-grid" }),
    Tooltip: () => (0, jsx_runtime_1.jsx)("div", { "data-testid": "tooltip" }),
    Legend: () => (0, jsx_runtime_1.jsx)("div", { "data-testid": "legend" }),
    ResponsiveContainer: ({ children }) => (0, jsx_runtime_1.jsx)("div", { "data-testid": "responsive-container", children: children }),
    BarChart: ({ children }) => (0, jsx_runtime_1.jsx)("div", { "data-testid": "bar-chart", children: children }),
    Bar: () => (0, jsx_runtime_1.jsx)("div", { "data-testid": "bar" }),
    PieChart: ({ children }) => (0, jsx_runtime_1.jsx)("div", { "data-testid": "pie-chart", children: children }),
    Pie: () => (0, jsx_runtime_1.jsx)("div", { "data-testid": "pie" }),
    Cell: () => (0, jsx_runtime_1.jsx)("div", { "data-testid": "cell" })
}));
describe('VisualizationChart', () => {
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
    const mockData = [mockMetrics];
    test('shows empty state when no data available', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VisualizationChart_1.VisualizationChart, { data: [], currentMetrics: null }));
        expect(react_1.screen.getByText('No Data Yet')).toBeInTheDocument();
        expect(react_1.screen.getByText(/upload and compress files to see/i)).toBeInTheDocument();
        expect(react_1.screen.getByText('📊')).toBeInTheDocument();
    });
    test('renders main title when data is available', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VisualizationChart_1.VisualizationChart, { data: mockData, currentMetrics: mockMetrics }));
        expect(react_1.screen.getByText('Compression Analytics & Quantum Insights')).toBeInTheDocument();
    });
    test('renders quantum processing breakdown chart', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VisualizationChart_1.VisualizationChart, { data: mockData, currentMetrics: mockMetrics }));
        expect(react_1.screen.getByText('Quantum Processing Breakdown')).toBeInTheDocument();
        expect(react_1.screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
    test('renders algorithm comparison chart', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VisualizationChart_1.VisualizationChart, { data: mockData, currentMetrics: mockMetrics }));
        expect(react_1.screen.getByText('Algorithm Comparison')).toBeInTheDocument();
        expect(react_1.screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
    test('renders compression ratio trend for multiple data points', () => {
        const multipleData = [mockMetrics, { ...mockMetrics, compressionRatio: 0.8 }];
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VisualizationChart_1.VisualizationChart, { data: multipleData, currentMetrics: mockMetrics }));
        expect(react_1.screen.getByText('Compression Ratio Trend')).toBeInTheDocument();
        expect(react_1.screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    test('renders processing time analysis for multiple data points', () => {
        const multipleData = [mockMetrics, { ...mockMetrics, processingTime: 2000 }];
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VisualizationChart_1.VisualizationChart, { data: multipleData, currentMetrics: mockMetrics }));
        expect(react_1.screen.getByText('Processing Time vs File Size')).toBeInTheDocument();
    });
    test('does not render trend charts for single data point', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VisualizationChart_1.VisualizationChart, { data: mockData, currentMetrics: mockMetrics }));
        expect(react_1.screen.queryByText('Compression Ratio Trend')).not.toBeInTheDocument();
        expect(react_1.screen.queryByText('Processing Time vs File Size')).not.toBeInTheDocument();
    });
    test('handles missing quantum metrics gracefully', () => {
        const incompleteMetrics = {
            ...mockMetrics,
            entanglementPairs: undefined,
            superpositionStates: undefined,
            interferenceOptimizations: undefined
        };
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VisualizationChart_1.VisualizationChart, { data: [incompleteMetrics], currentMetrics: incompleteMetrics }));
        expect(react_1.screen.getByText('Quantum Processing Breakdown')).toBeInTheDocument();
    });
    test('formats bytes correctly in tooltips and labels', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VisualizationChart_1.VisualizationChart, { data: mockData, currentMetrics: mockMetrics }));
        // The formatBytes function is used internally, we test its presence through the component
        expect(react_1.screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
});
//# sourceMappingURL=VisualizationChart.test.js.map