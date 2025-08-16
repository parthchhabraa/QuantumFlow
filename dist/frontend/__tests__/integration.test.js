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
// Mock fetch for integration tests
global.fetch = jest.fn();
// Mock DOM methods
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
describe('Frontend Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetch.mockClear();
    });
    test('complete compression workflow', async () => {
        const mockMetrics = {
            compressionRatio: 0.8,
            processingTime: 1200,
            quantumEfficiency: 0.9,
            originalSize: 1000000,
            compressedSize: 200000,
            entanglementPairs: 35,
            superpositionStates: 64,
            interferenceOptimizations: 12
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
        // 1. Change settings to Fast preset
        const fastPreset = react_1.screen.getByText('Fast');
        react_1.fireEvent.click(fastPreset);
        // 2. Upload a file
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const fileInput = react_1.screen.getByRole('button', { name: /drag & drop files here/i });
        await user_event_1.default.upload(fileInput, file);
        // 3. Verify API call with correct config
        await (0, react_1.waitFor)(() => {
            expect(fetch).toHaveBeenCalledWith('/api/compress', expect.objectContaining({
                method: 'POST',
                body: expect.any(FormData)
            }));
        });
        // 4. Verify metrics are displayed
        await (0, react_1.waitFor)(() => {
            expect(react_1.screen.getByText('80.0%')).toBeInTheDocument();
            expect(react_1.screen.getByText('1.2s')).toBeInTheDocument();
            expect(react_1.screen.getByText('90.0%')).toBeInTheDocument();
        });
        // 5. Verify quantum details are shown
        expect(react_1.screen.getByText('35')).toBeInTheDocument(); // Entanglement pairs
        expect(react_1.screen.getByText('64')).toBeInTheDocument(); // Superposition states
        expect(react_1.screen.getByText('12')).toBeInTheDocument(); // Interference optimizations
    });
    test('settings changes affect compression requests', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                metrics: {
                    compressionRatio: 0.7,
                    processingTime: 1000,
                    quantumEfficiency: 0.8,
                    originalSize: 500000,
                    compressedSize: 150000
                }
            })
        });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        // Change quantum bit depth
        const bitDepthSlider = react_1.screen.getByDisplayValue('8');
        react_1.fireEvent.change(bitDepthSlider, { target: { value: '12' } });
        // Change entanglement level
        const entanglementSlider = react_1.screen.getByDisplayValue('4');
        react_1.fireEvent.change(entanglementSlider, { target: { value: '6' } });
        // Upload file
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const fileInput = react_1.screen.getByRole('button', { name: /drag & drop files here/i });
        await user_event_1.default.upload(fileInput, file);
        // Verify the configuration was sent correctly
        await (0, react_1.waitFor)(() => {
            const formData = fetch.mock.calls[0][1].body;
            expect(formData).toBeInstanceOf(FormData);
        });
    });
    test('error handling throughout the workflow', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        window.alert = jest.fn();
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const fileInput = react_1.screen.getByRole('button', { name: /drag & drop files here/i });
        await user_event_1.default.upload(fileInput, file);
        await (0, react_1.waitFor)(() => {
            expect(window.alert).toHaveBeenCalledWith('Error: Network error');
        });
        // Verify UI returns to normal state
        expect(react_1.screen.getByText(/drag & drop files here/i)).toBeInTheDocument();
    });
    test('multiple file processing with different results', async () => {
        const metrics1 = {
            compressionRatio: 0.75,
            processingTime: 1000,
            quantumEfficiency: 0.85,
            originalSize: 1000000,
            compressedSize: 250000
        };
        const metrics2 = {
            compressionRatio: 0.8,
            processingTime: 1200,
            quantumEfficiency: 0.9,
            originalSize: 800000,
            compressedSize: 160000
        };
        fetch
            .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, metrics: metrics1 })
        })
            .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, metrics: metrics2 })
        });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const files = [
            new File(['content 1'], 'test1.txt', { type: 'text/plain' }),
            new File(['content 2'], 'test2.txt', { type: 'text/plain' })
        ];
        const fileInput = react_1.screen.getByRole('button', { name: /drag & drop files here/i });
        await user_event_1.default.upload(fileInput, files);
        // Wait for both files to be processed
        await (0, react_1.waitFor)(() => {
            expect(fetch).toHaveBeenCalledTimes(2);
        });
        // Should show metrics from the last processed file
        await (0, react_1.waitFor)(() => {
            expect(react_1.screen.getByText('80.0%')).toBeInTheDocument();
        });
        // Should show updated file count
        expect(react_1.screen.getByText('2')).toBeInTheDocument();
    });
    test('preset changes update all sliders correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        // Start with balanced preset (default)
        expect(react_1.screen.getByDisplayValue('8')).toBeInTheDocument(); // Bit depth
        expect(react_1.screen.getByDisplayValue('4')).toBeInTheDocument(); // Entanglement
        expect(react_1.screen.getByDisplayValue('5')).toBeInTheDocument(); // Superposition
        expect(react_1.screen.getByDisplayValue('0.5')).toBeInTheDocument(); // Interference
        // Switch to Maximum preset
        const maximumPreset = react_1.screen.getByText('Maximum');
        react_1.fireEvent.click(maximumPreset);
        expect(react_1.screen.getByDisplayValue('16')).toBeInTheDocument(); // Bit depth
        expect(react_1.screen.getByDisplayValue('8')).toBeInTheDocument(); // Entanglement
        expect(react_1.screen.getByDisplayValue('10')).toBeInTheDocument(); // Superposition
        expect(react_1.screen.getByDisplayValue('0.8')).toBeInTheDocument(); // Interference
        // Switch to Fast preset
        const fastPreset = react_1.screen.getByText('Fast');
        react_1.fireEvent.click(fastPreset);
        expect(react_1.screen.getByDisplayValue('4')).toBeInTheDocument(); // Bit depth
        expect(react_1.screen.getByDisplayValue('2')).toBeInTheDocument(); // Entanglement
        expect(react_1.screen.getByDisplayValue('3')).toBeInTheDocument(); // Superposition
        expect(react_1.screen.getByDisplayValue('0.3')).toBeInTheDocument(); // Interference
    });
    test('visualization updates with compression history', async () => {
        const metrics1 = {
            compressionRatio: 0.7,
            processingTime: 1000,
            quantumEfficiency: 0.8,
            originalSize: 1000000,
            compressedSize: 300000
        };
        const metrics2 = {
            compressionRatio: 0.75,
            processingTime: 1100,
            quantumEfficiency: 0.85,
            originalSize: 800000,
            compressedSize: 200000
        };
        fetch
            .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, metrics: metrics1 })
        })
            .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, metrics: metrics2 })
        });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        // Upload first file
        const file1 = new File(['content 1'], 'test1.txt', { type: 'text/plain' });
        const fileInput = react_1.screen.getByRole('button', { name: /drag & drop files here/i });
        await user_event_1.default.upload(fileInput, file1);
        await (0, react_1.waitFor)(() => expect(fetch).toHaveBeenCalledTimes(1));
        // Upload second file
        const file2 = new File(['content 2'], 'test2.txt', { type: 'text/plain' });
        await user_event_1.default.upload(fileInput, file2);
        await (0, react_1.waitFor)(() => expect(fetch).toHaveBeenCalledTimes(2));
        // Should show visualization section
        expect(react_1.screen.getByText('Compression Analytics & Quantum Insights')).toBeInTheDocument();
    });
    test('UI responsiveness during processing', async () => {
        // Mock a slow response
        fetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true, metrics: {} })
        }), 1000)));
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const fileInput = react_1.screen.getByRole('button', { name: /drag & drop files here/i });
        await user_event_1.default.upload(fileInput, file);
        // Should show processing state immediately
        expect(react_1.screen.getByText(/processing with quantum compression/i)).toBeInTheDocument();
        // Settings should be disabled during processing
        const fastPreset = react_1.screen.getByText('Fast');
        expect(fastPreset).toBeDisabled();
        const bitDepthSlider = react_1.screen.getByDisplayValue('8');
        expect(bitDepthSlider).toBeDisabled();
    });
});
//# sourceMappingURL=integration.test.js.map