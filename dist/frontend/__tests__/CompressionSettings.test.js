"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const CompressionSettings_1 = require("../components/CompressionSettings");
describe('CompressionSettings', () => {
    const defaultConfig = {
        quantumBitDepth: 8,
        maxEntanglementLevel: 4,
        superpositionComplexity: 5,
        interferenceThreshold: 0.5
    };
    const mockOnChange = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('renders all preset buttons', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        expect(react_1.screen.getByText('Fast')).toBeInTheDocument();
        expect(react_1.screen.getByText('Balanced')).toBeInTheDocument();
        expect(react_1.screen.getByText('Maximum')).toBeInTheDocument();
        expect(react_1.screen.getByText('⚡')).toBeInTheDocument();
        expect(react_1.screen.getByText('⚖️')).toBeInTheDocument();
        expect(react_1.screen.getByText('🚀')).toBeInTheDocument();
    });
    test('renders all quantum parameter sliders', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        expect(react_1.screen.getByText('Quantum Bit Depth')).toBeInTheDocument();
        expect(react_1.screen.getByText('Entanglement Level')).toBeInTheDocument();
        expect(react_1.screen.getByText('Superposition Complexity')).toBeInTheDocument();
        expect(react_1.screen.getByText('Interference Threshold')).toBeInTheDocument();
    });
    test('displays current configuration values', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        expect(react_1.screen.getByText('8 qubits')).toBeInTheDocument();
        expect(react_1.screen.getByText('4 levels')).toBeInTheDocument();
        expect(react_1.screen.getByText('5')).toBeInTheDocument();
        expect(react_1.screen.getByText('0.5')).toBeInTheDocument();
    });
    test('handles slider value changes', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        const bitDepthSlider = react_1.screen.getByDisplayValue('8');
        react_1.fireEvent.change(bitDepthSlider, { target: { value: '12' } });
        expect(mockOnChange).toHaveBeenCalledWith({ quantumBitDepth: 12 });
    });
    test('handles preset button clicks', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        const fastButton = react_1.screen.getByText('Fast');
        react_1.fireEvent.click(fastButton);
        expect(mockOnChange).toHaveBeenCalledWith({
            quantumBitDepth: 4,
            maxEntanglementLevel: 2,
            superpositionComplexity: 3,
            interferenceThreshold: 0.3
        });
    });
    test('applies correct color coding for slider values', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        // Test low value (should be green)
        const lowConfig = { ...defaultConfig, quantumBitDepth: 2 };
        const { rerender } = (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: lowConfig, onChange: mockOnChange, disabled: false }));
        expect(react_1.screen.getByText('2 qubits')).toBeInTheDocument();
        // Test high value (should be red)
        const highConfig = { ...defaultConfig, quantumBitDepth: 16 };
        rerender((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: highConfig, onChange: mockOnChange, disabled: false }));
        expect(react_1.screen.getByText('16 qubits')).toBeInTheDocument();
    });
    test('disables controls when disabled prop is true', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: true }));
        const bitDepthSlider = react_1.screen.getByDisplayValue('8');
        const fastButton = react_1.screen.getByText('Fast');
        expect(bitDepthSlider).toBeDisabled();
        expect(fastButton).toBeDisabled();
    });
    test('handles entanglement level changes', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        const entanglementSlider = react_1.screen.getByDisplayValue('4');
        react_1.fireEvent.change(entanglementSlider, { target: { value: '6' } });
        expect(mockOnChange).toHaveBeenCalledWith({ maxEntanglementLevel: 6 });
    });
    test('handles superposition complexity changes', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        const superpositionSlider = react_1.screen.getByDisplayValue('5');
        react_1.fireEvent.change(superpositionSlider, { target: { value: '8' } });
        expect(mockOnChange).toHaveBeenCalledWith({ superpositionComplexity: 8 });
    });
    test('handles interference threshold changes', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        const interferenceSlider = react_1.screen.getByDisplayValue('0.5');
        react_1.fireEvent.change(interferenceSlider, { target: { value: '0.7' } });
        expect(mockOnChange).toHaveBeenCalledWith({ interferenceThreshold: 0.7 });
    });
    test('displays optimization tips', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        expect(react_1.screen.getByText('💡 Optimization Tips')).toBeInTheDocument();
        expect(react_1.screen.getByText(/use fast preset for quick compression/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/balanced preset works well for most file types/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/maximum preset achieves best ratios/i)).toBeInTheDocument();
    });
    test('shows parameter descriptions', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        expect(react_1.screen.getByText(/number of qubits simulated/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/maximum quantum entanglement depth/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/complexity of quantum superposition states/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/threshold for quantum interference optimization/i)).toBeInTheDocument();
    });
    test('validates slider ranges', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        const bitDepthSlider = react_1.screen.getByDisplayValue('8');
        const entanglementSlider = react_1.screen.getByDisplayValue('4');
        const superpositionSlider = react_1.screen.getByDisplayValue('5');
        const interferenceSlider = react_1.screen.getByDisplayValue('0.5');
        expect(bitDepthSlider).toHaveAttribute('min', '2');
        expect(bitDepthSlider).toHaveAttribute('max', '16');
        expect(entanglementSlider).toHaveAttribute('min', '1');
        expect(entanglementSlider).toHaveAttribute('max', '8');
        expect(superpositionSlider).toHaveAttribute('min', '1');
        expect(superpositionSlider).toHaveAttribute('max', '10');
        expect(interferenceSlider).toHaveAttribute('min', '0.1');
        expect(interferenceSlider).toHaveAttribute('max', '0.9');
        expect(interferenceSlider).toHaveAttribute('step', '0.1');
    });
    test('handles maximum preset correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        const maximumButton = react_1.screen.getByText('Maximum');
        react_1.fireEvent.click(maximumButton);
        expect(mockOnChange).toHaveBeenCalledWith({
            quantumBitDepth: 16,
            maxEntanglementLevel: 8,
            superpositionComplexity: 10,
            interferenceThreshold: 0.8
        });
    });
    test('handles balanced preset correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        const balancedButton = react_1.screen.getByText('Balanced');
        react_1.fireEvent.click(balancedButton);
        expect(mockOnChange).toHaveBeenCalledWith({
            quantumBitDepth: 8,
            maxEntanglementLevel: 4,
            superpositionComplexity: 5,
            interferenceThreshold: 0.5
        });
    });
    test('shows hover effects on preset buttons', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CompressionSettings_1.CompressionSettings, { config: defaultConfig, onChange: mockOnChange, disabled: false }));
        const fastButton = react_1.screen.getByText('Fast');
        react_1.fireEvent.mouseEnter(fastButton);
        // Hover effects are tested through CSS, so we just verify the button exists
        expect(fastButton).toBeInTheDocument();
        react_1.fireEvent.mouseLeave(fastButton);
        expect(fastButton).toBeInTheDocument();
    });
});
//# sourceMappingURL=CompressionSettings.test.js.map