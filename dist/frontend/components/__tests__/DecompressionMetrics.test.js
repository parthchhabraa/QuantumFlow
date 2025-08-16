"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const DecompressionMetrics_1 = require("../DecompressionMetrics");
describe('DecompressionMetrics', () => {
    const mockResults = [
        {
            originalFileName: 'test.txt',
            compressedSize: 1000,
            decompressedSize: 3000,
            decompressionTime: 1500,
            quantumIntegrity: 0.98,
            entanglementPairsRestored: 45,
            superpositionStatesCollapsed: 120,
            interferencePatternsMapped: 78,
            timestamp: Date.now()
        }
    ];
    test('renders without crashing with empty results', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(DecompressionMetrics_1.DecompressionMetrics, { results: [] }));
        expect(react_1.screen.getByText('Quantum Integrity')).toBeInTheDocument();
    });
    test('displays metrics when results are provided', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(DecompressionMetrics_1.DecompressionMetrics, { results: mockResults }));
        expect(react_1.screen.getByText('98.0%')).toBeInTheDocument(); // Quantum Integrity
        expect(react_1.screen.getByText('3.0x')).toBeInTheDocument(); // Expansion Ratio
        expect(react_1.screen.getByText('1')).toBeInTheDocument(); // Files Restored
    });
    test('displays detailed metrics for current result', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(DecompressionMetrics_1.DecompressionMetrics, { results: mockResults, currentResult: mockResults[0] }));
        expect(react_1.screen.getByText('Quantum Decompression Analysis')).toBeInTheDocument();
        expect(react_1.screen.getByText('test.txt')).toBeInTheDocument();
        expect(react_1.screen.getByText('45')).toBeInTheDocument(); // Entanglement Pairs Restored
    });
    test('displays recent operations', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(DecompressionMetrics_1.DecompressionMetrics, { results: mockResults }));
        expect(react_1.screen.getByText('Recent Decompressions')).toBeInTheDocument();
        expect(react_1.screen.getByText('test.txt')).toBeInTheDocument();
    });
    test('handles multiple results correctly', () => {
        const multipleResults = [
            ...mockResults,
            {
                originalFileName: 'test2.txt',
                compressedSize: 2000,
                decompressedSize: 6000,
                decompressionTime: 2000,
                quantumIntegrity: 0.95,
                entanglementPairsRestored: 60,
                superpositionStatesCollapsed: 150,
                interferencePatternsMapped: 90,
                timestamp: Date.now() + 1000
            }
        ];
        (0, react_1.render)((0, jsx_runtime_1.jsx)(DecompressionMetrics_1.DecompressionMetrics, { results: multipleResults }));
        expect(react_1.screen.getByText('2')).toBeInTheDocument(); // Files Restored count
        // Average integrity should be (0.98 + 0.95) / 2 = 0.965 = 96.5%
        expect(react_1.screen.getByText('96.5%')).toBeInTheDocument();
    });
    test('formats file sizes correctly', () => {
        const largeFileResult = [{
                ...mockResults[0],
                compressedSize: 1024 * 1024, // 1 MB
                decompressedSize: 1024 * 1024 * 1024 // 1 GB
            }];
        (0, react_1.render)((0, jsx_runtime_1.jsx)(DecompressionMetrics_1.DecompressionMetrics, { results: largeFileResult }));
        expect(react_1.screen.getByText(/1 MB → 1 GB/)).toBeInTheDocument();
    });
    test('formats time correctly', () => {
        const quickResult = [{
                ...mockResults[0],
                decompressionTime: 500 // 500ms
            }];
        (0, react_1.render)((0, jsx_runtime_1.jsx)(DecompressionMetrics_1.DecompressionMetrics, { results: quickResult }));
        expect(react_1.screen.getByText('500ms')).toBeInTheDocument();
    });
});
//# sourceMappingURL=DecompressionMetrics.test.js.map