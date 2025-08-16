"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const user_event_1 = __importDefault(require("@testing-library/user-event"));
require("@testing-library/jest-dom");
const App_1 = __importDefault(require("../components/App"));
// Mock fetch
global.fetch = jest.fn();
// Mock file creation for downloads
Object.defineProperty(document, 'createElement', {
    value: jest.fn().mockImplementation((tagName) => {
        if (tagName === 'a') {
            return {
                href: '',
                download: '',
                click: jest.fn(),
                style: {},
            };
        }
        return document.createElement(tagName);
    }),
});
Object.defineProperty(document.body, 'appendChild', {
    value: jest.fn(),
});
Object.defineProperty(document.body, 'removeChild', {
    value: jest.fn(),
});
describe('App Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetch.mockClear();
    });
    test('renders main components', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        expect(react_1.screen.getByText('File Upload')).toBeInTheDocument();
        expect(react_1.screen.getByText('Quantum Compression Settings')).toBeInTheDocument();
        expect(react_1.screen.getByText('Performance Metrics')).toBeInTheDocument();
    });
    test('displays initial metrics as placeholder values', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        expect(react_1.screen.getByText('--')).toBeInTheDocument(); // Compression ratio
        expect(react_1.screen.getByText('0')).toBeInTheDocument(); // Files processed
    });
    test('handles successful file upload and compression', async () => {
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
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                metrics: mockMetrics,
                downloadUrl: '/download/test-file.qf'
            })
        });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const fileInput = react_1.screen.getByRole('button', { name: /drag & drop files here/i });
        // Simulate file upload
        await user_event_1.default.upload(fileInput, file);
        await (0, react_1.waitFor)(() => {
            expect(fetch).toHaveBeenCalledWith('/api/compress', expect.objectContaining({
                method: 'POST',
                body: expect.any(FormData)
            }));
        });
        // Check if metrics are updated
        await (0, react_1.waitFor)(() => {
            expect(react_1.screen.getByText('75.0%')).toBeInTheDocument();
            expect(react_1.screen.getByText('1.5s')).toBeInTheDocument();
            expect(react_1.screen.getByText('85.0%')).toBeInTheDocument();
        });
    });
    test('handles compression error gracefully', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Internal Server Error'
        });
        // Mock alert
        window.alert = jest.fn();
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const fileInput = react_1.screen.getByRole('button', { name: /drag & drop files here/i });
        await user_event_1.default.upload(fileInput, file);
        await (0, react_1.waitFor)(() => {
            expect(window.alert).toHaveBeenCalledWith('Error: Compression failed: Internal Server Error');
        });
    });
    test('updates configuration when settings change', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const bitDepthSlider = react_1.screen.getByLabelText(/quantum bit depth/i);
        react_1.fireEvent.change(bitDepthSlider, { target: { value: '12' } });
        expect(bitDepthSlider).toHaveValue('12');
    });
    test('applies preset configurations correctly', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const fastPresetButton = react_1.screen.getByText('Fast');
        react_1.fireEvent.click(fastPresetButton);
        // Check if sliders are updated to fast preset values
        const bitDepthSlider = react_1.screen.getByLabelText(/quantum bit depth/i);
        expect(bitDepthSlider).toHaveValue('4');
    });
    test('disables upload during processing', async () => {
        fetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true, metrics: {} })
        }), 1000)));
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const fileInput = react_1.screen.getByRole('button', { name: /drag & drop files here/i });
        await user_event_1.default.upload(fileInput, file);
        // Check if upload is disabled during processing
        expect(react_1.screen.getByText(/processing with quantum compression/i)).toBeInTheDocument();
    });
    test('handles multiple file uploads sequentially', async () => {
        const mockMetrics = {
            compressionRatio: 0.8,
            processingTime: 1000,
            quantumEfficiency: 0.9,
            originalSize: 500000,
            compressedSize: 100000
        };
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                success: true,
                metrics: mockMetrics
            })
        });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const files = [
            new File(['content 1'], 'test1.txt', { type: 'text/plain' }),
            new File(['content 2'], 'test2.txt', { type: 'text/plain' })
        ];
        const fileInput = react_1.screen.getByRole('button', { name: /drag & drop files here/i });
        await user_event_1.default.upload(fileInput, files);
        await (0, react_1.waitFor)(() => {
            expect(fetch).toHaveBeenCalledTimes(2);
        });
    });
    test('validates configuration parameters', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const interferenceSlider = react_1.screen.getByLabelText(/interference threshold/i);
        // Test boundary values
        react_1.fireEvent.change(interferenceSlider, { target: { value: '0.1' } });
        expect(interferenceSlider).toHaveValue('0.1');
        react_1.fireEvent.change(interferenceSlider, { target: { value: '0.9' } });
        expect(interferenceSlider).toHaveValue('0.9');
    });
    test('displays compression history in visualization', async () => {
        const mockMetrics1 = {
            compressionRatio: 0.7,
            processingTime: 1200,
            quantumEfficiency: 0.8,
            originalSize: 1000000,
            compressedSize: 300000
        };
        const mockMetrics2 = {
            compressionRatio: 0.75,
            processingTime: 1100,
            quantumEfficiency: 0.85,
            originalSize: 800000,
            compressedSize: 200000
        };
        fetch
            .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, metrics: mockMetrics1 })
        })
            .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, metrics: mockMetrics2 })
        });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const file1 = new File(['content 1'], 'test1.txt', { type: 'text/plain' });
        const file2 = new File(['content 2'], 'test2.txt', { type: 'text/plain' });
        const fileInput = react_1.screen.getByRole('button', { name: /drag & drop files here/i });
        await user_event_1.default.upload(fileInput, file1);
        await (0, react_1.waitFor)(() => expect(fetch).toHaveBeenCalledTimes(1));
        await user_event_1.default.upload(fileInput, file2);
        await (0, react_1.waitFor)(() => expect(fetch).toHaveBeenCalledTimes(2));
        // Check if visualization shows multiple data points
        expect(react_1.screen.getByText('Compression Analytics & Quantum Insights')).toBeInTheDocument();
    });
});
//# sourceMappingURL=App.test.js.map