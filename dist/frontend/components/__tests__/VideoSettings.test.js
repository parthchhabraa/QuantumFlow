"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const VideoSettings_1 = require("../VideoSettings");
const VideoModels_1 = require("../../../video/models/VideoModels");
describe('VideoSettings', () => {
    const mockOnSettingsChange = jest.fn();
    const mockOnClose = jest.fn();
    const defaultSettings = VideoModels_1.VideoCompressionConfig.createDefault();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('renders video settings correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        expect(react_1.screen.getByText('Video Settings')).toBeInTheDocument();
        expect(react_1.screen.getByText('Quality')).toBeInTheDocument();
        expect(react_1.screen.getByText('Compression')).toBeInTheDocument();
        expect(react_1.screen.getByText('Network')).toBeInTheDocument();
    });
    it('shows quality settings by default', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        expect(react_1.screen.getByText('Video Quality')).toBeInTheDocument();
        expect(react_1.screen.getByText('Base Quality')).toBeInTheDocument();
        expect(react_1.screen.getByText('Target Frame Rate')).toBeInTheDocument();
        expect(react_1.screen.getByText('Max Latency')).toBeInTheDocument();
        expect(react_1.screen.getByText('Adaptive Quality')).toBeInTheDocument();
    });
    it('switches between tabs correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        // Click compression tab
        const compressionTab = react_1.screen.getByText('Compression');
        react_1.fireEvent.click(compressionTab);
        expect(react_1.screen.getByText('Quantum Compression')).toBeInTheDocument();
        expect(react_1.screen.getByText('Compression Level')).toBeInTheDocument();
        // Click network tab
        const networkTab = react_1.screen.getByText('Network');
        react_1.fireEvent.click(networkTab);
        expect(react_1.screen.getByText('Network Optimization')).toBeInTheDocument();
        expect(react_1.screen.getByText('Bandwidth Threshold')).toBeInTheDocument();
    });
    it('updates base quality setting', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        const qualitySelect = react_1.screen.getByDisplayValue('Medium (720p)');
        react_1.fireEvent.change(qualitySelect, { target: { value: 'high' } });
        expect(mockOnSettingsChange).toHaveBeenCalledWith({ baseQuality: 'high' });
    });
    it('updates frame rate with slider', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        const frameRateSlider = react_1.screen.getByDisplayValue('30');
        react_1.fireEvent.change(frameRateSlider, { target: { value: '60' } });
        expect(mockOnSettingsChange).toHaveBeenCalledWith({ targetFrameRate: 60 });
    });
    it('updates max latency with slider', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        const latencySlider = react_1.screen.getByDisplayValue('100');
        react_1.fireEvent.change(latencySlider, { target: { value: '200' } });
        expect(mockOnSettingsChange).toHaveBeenCalledWith({ maxLatency: 200 });
    });
    it('toggles adaptive quality checkbox', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        const adaptiveCheckbox = react_1.screen.getByLabelText('Adaptive Quality');
        react_1.fireEvent.click(adaptiveCheckbox);
        expect(mockOnSettingsChange).toHaveBeenCalledWith({ adaptiveQuality: false });
    });
    it('updates quantum compression level', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        // Switch to compression tab
        const compressionTab = react_1.screen.getByText('Compression');
        react_1.fireEvent.click(compressionTab);
        const compressionSlider = react_1.screen.getByDisplayValue('5');
        react_1.fireEvent.change(compressionSlider, { target: { value: '8' } });
        expect(mockOnSettingsChange).toHaveBeenCalledWith({ quantumCompressionLevel: 8 });
    });
    it('updates key frame interval', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        // Switch to compression tab
        const compressionTab = react_1.screen.getByText('Compression');
        react_1.fireEvent.click(compressionTab);
        const keyFrameSlider = react_1.screen.getByDisplayValue('30');
        react_1.fireEvent.change(keyFrameSlider, { target: { value: '60' } });
        expect(mockOnSettingsChange).toHaveBeenCalledWith({ keyFrameInterval: 60 });
    });
    it('toggles temporal compression', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        // Switch to compression tab
        const compressionTab = react_1.screen.getByText('Compression');
        react_1.fireEvent.click(compressionTab);
        const temporalCheckbox = react_1.screen.getByLabelText('Temporal Compression');
        react_1.fireEvent.click(temporalCheckbox);
        expect(mockOnSettingsChange).toHaveBeenCalledWith({ enableTemporalCompression: false });
    });
    it('toggles spatial compression', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        // Switch to compression tab
        const compressionTab = react_1.screen.getByText('Compression');
        react_1.fireEvent.click(compressionTab);
        const spatialCheckbox = react_1.screen.getByLabelText('Spatial Compression');
        react_1.fireEvent.click(spatialCheckbox);
        expect(mockOnSettingsChange).toHaveBeenCalledWith({ enableSpatialCompression: false });
    });
    it('updates bandwidth threshold', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        // Switch to network tab
        const networkTab = react_1.screen.getByText('Network');
        react_1.fireEvent.click(networkTab);
        const bandwidthSlider = react_1.screen.getByDisplayValue('2');
        react_1.fireEvent.change(bandwidthSlider, { target: { value: '5' } });
        expect(mockOnSettingsChange).toHaveBeenCalledWith({ bandwidthThreshold: 5 });
    });
    it('shows current performance metrics', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        // Switch to network tab
        const networkTab = react_1.screen.getByText('Network');
        react_1.fireEvent.click(networkTab);
        expect(react_1.screen.getByText('Current Performance')).toBeInTheDocument();
        expect(react_1.screen.getByText('Estimated Compression')).toBeInTheDocument();
        expect(react_1.screen.getByText('Processing Overhead')).toBeInTheDocument();
        expect(react_1.screen.getByText('Quality Score')).toBeInTheDocument();
    });
    it('applies low-latency preset', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        const lowLatencyButton = react_1.screen.getByText('Low Latency');
        react_1.fireEvent.click(lowLatencyButton);
        expect(mockOnSettingsChange).toHaveBeenCalledWith(expect.objectContaining({
            baseQuality: 'medium',
            quantumCompressionLevel: 3,
            maxLatency: 50,
            enableTemporalCompression: false,
        }));
    });
    it('applies high-quality preset', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        const highQualityButton = react_1.screen.getByText('High Quality');
        react_1.fireEvent.click(highQualityButton);
        expect(mockOnSettingsChange).toHaveBeenCalledWith(expect.objectContaining({
            baseQuality: 'high',
            quantumCompressionLevel: 8,
            adaptiveQuality: false,
            targetFrameRate: 60,
        }));
    });
    it('applies mobile preset', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        const mobileButton = react_1.screen.getByText('Mobile');
        react_1.fireEvent.click(mobileButton);
        expect(mockOnSettingsChange).toHaveBeenCalledWith(expect.objectContaining({
            baseQuality: 'low',
            quantumCompressionLevel: 4,
            bandwidthThreshold: 0.5,
            targetFrameRate: 24,
        }));
    });
    it('resets to defaults', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        const resetButton = react_1.screen.getByText('Reset to Defaults');
        react_1.fireEvent.click(resetButton);
        expect(mockOnSettingsChange).toHaveBeenCalledWith(expect.objectContaining({
            baseQuality: 'medium',
            adaptiveQuality: true,
            quantumCompressionLevel: 5,
            bandwidthThreshold: 2,
        }));
    });
    it('calls onClose when close button is clicked', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        const closeButton = react_1.screen.getByRole('button', { name: /close/i });
        react_1.fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
    it('works without onClose prop', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange }));
        // Should render without close button
        expect(react_1.screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });
    it('displays slider values correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        expect(react_1.screen.getByText('30 fps')).toBeInTheDocument();
        expect(react_1.screen.getByText('100 ms')).toBeInTheDocument();
        // Switch to compression tab
        const compressionTab = react_1.screen.getByText('Compression');
        react_1.fireEvent.click(compressionTab);
        expect(react_1.screen.getByText('5/10')).toBeInTheDocument();
        expect(react_1.screen.getByText('30 frames')).toBeInTheDocument();
        // Switch to network tab
        const networkTab = react_1.screen.getByText('Network');
        react_1.fireEvent.click(networkTab);
        expect(react_1.screen.getByText('2 Mbps')).toBeInTheDocument();
    });
    it('shows setting descriptions', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: defaultSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        expect(react_1.screen.getByText('Automatically adjust quality based on network conditions')).toBeInTheDocument();
        // Switch to compression tab
        const compressionTab = react_1.screen.getByText('Compression');
        react_1.fireEvent.click(compressionTab);
        expect(react_1.screen.getByText('Higher levels provide better compression but require more processing power')).toBeInTheDocument();
        expect(react_1.screen.getByText('Compress based on motion between frames')).toBeInTheDocument();
        expect(react_1.screen.getByText('Compress based on patterns within frames')).toBeInTheDocument();
        // Switch to network tab
        const networkTab = react_1.screen.getByText('Network');
        react_1.fireEvent.click(networkTab);
        expect(react_1.screen.getByText('Minimum bandwidth required for current quality level')).toBeInTheDocument();
    });
    it('calculates performance metrics correctly', () => {
        const customSettings = new VideoModels_1.VideoCompressionConfig();
        customSettings.quantumCompressionLevel = 8;
        (0, react_1.render)((0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: customSettings, onSettingsChange: mockOnSettingsChange, onClose: mockOnClose }));
        // Switch to network tab
        const networkTab = react_1.screen.getByText('Network');
        react_1.fireEvent.click(networkTab);
        // Check calculated values based on compression level 8
        expect(react_1.screen.getByText('4.4x')).toBeInTheDocument(); // 8 * 0.3 + 2 = 4.4
        expect(react_1.screen.getByText('50ms')).toBeInTheDocument(); // 8 * 5 + 10 = 50
        expect(react_1.screen.getByText('84%')).toBeInTheDocument(); // min(100, 8 * 8 + 20) = 84
    });
});
//# sourceMappingURL=VideoSettings.test.js.map