"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompressionSettings = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const CompressionSettings = ({ config, onChange, disabled }) => {
    const handleSliderChange = (key, value) => {
        onChange({ [key]: value });
    };
    const getSliderColor = (value, max) => {
        const percentage = value / max;
        if (percentage < 0.3)
            return '#10b981'; // green
        if (percentage < 0.7)
            return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };
    const SliderComponent = ({ label, value, min, max, step = 1, configKey, description, unit = '' }) => ((0, jsx_runtime_1.jsxs)("div", { className: "slider-container", style: { marginBottom: '25px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [(0, jsx_runtime_1.jsx)("label", { style: { fontWeight: '600', color: '#374151' }, children: label }), (0, jsx_runtime_1.jsxs)("span", { style: {
                            backgroundColor: getSliderColor(value, max),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }, children: [value, unit] })] }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: min, max: max, step: step, value: value, onChange: (e) => handleSliderChange(configKey, Number(e.target.value)), disabled: disabled, style: {
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: `linear-gradient(to right, ${getSliderColor(value, max)} 0%, ${getSliderColor(value, max)} ${(value / max) * 100}%, #e5e7eb ${(value / max) * 100}%, #e5e7eb 100%)`,
                    outline: 'none',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.6 : 1
                } }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }, children: description })] }));
    const presets = [
        {
            name: 'Fast',
            icon: '⚡',
            config: { quantumBitDepth: 4, maxEntanglementLevel: 2, superpositionComplexity: 3, interferenceThreshold: 0.3 }
        },
        {
            name: 'Balanced',
            icon: '⚖️',
            config: { quantumBitDepth: 8, maxEntanglementLevel: 4, superpositionComplexity: 5, interferenceThreshold: 0.5 }
        },
        {
            name: 'Maximum',
            icon: '🚀',
            config: { quantumBitDepth: 16, maxEntanglementLevel: 8, superpositionComplexity: 10, interferenceThreshold: 0.8 }
        }
    ];
    return ((0, jsx_runtime_1.jsxs)("div", { className: "compression-settings", children: [(0, jsx_runtime_1.jsxs)("div", { className: "presets-section", style: { marginBottom: '30px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginBottom: '15px', color: '#374151' }, children: "Quick Presets" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: '10px' }, children: presets.map((preset) => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => onChange(preset.config), disabled: disabled, style: {
                                flex: 1,
                                padding: '12px 8px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: disabled ? 0.6 : 1
                            }, onMouseEnter: (e) => {
                                if (!disabled) {
                                    e.currentTarget.style.borderColor = '#667eea';
                                    e.currentTarget.style.backgroundColor = '#f8faff';
                                }
                            }, onMouseLeave: (e) => {
                                if (!disabled) {
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                    e.currentTarget.style.backgroundColor = 'white';
                                }
                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1.5rem', marginBottom: '4px' }, children: preset.icon }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem', fontWeight: '600' }, children: preset.name })] }, preset.name))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "advanced-settings", children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginBottom: '20px', color: '#374151' }, children: "Advanced Quantum Parameters" }), (0, jsx_runtime_1.jsx)(SliderComponent, { label: "Quantum Bit Depth", value: config.quantumBitDepth, min: 2, max: 16, configKey: "quantumBitDepth", description: "Number of qubits simulated. Higher values increase compression potential but require more processing power.", unit: " qubits" }), (0, jsx_runtime_1.jsx)(SliderComponent, { label: "Entanglement Level", value: config.maxEntanglementLevel, min: 1, max: 8, configKey: "maxEntanglementLevel", description: "Maximum quantum entanglement depth for pattern correlation. Higher levels find more complex relationships.", unit: " levels" }), (0, jsx_runtime_1.jsx)(SliderComponent, { label: "Superposition Complexity", value: config.superpositionComplexity, min: 1, max: 10, configKey: "superpositionComplexity", description: "Complexity of quantum superposition states. Higher values enable more parallel pattern analysis." }), (0, jsx_runtime_1.jsx)(SliderComponent, { label: "Interference Threshold", value: config.interferenceThreshold, min: 0.1, max: 0.9, step: 0.1, configKey: "interferenceThreshold", description: "Threshold for quantum interference optimization. Higher values are more aggressive but may reduce quality." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "settings-info", style: {
                    marginTop: '25px',
                    padding: '15px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #0ea5e9'
                }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { color: '#0369a1', marginBottom: '8px' }, children: "\uD83D\uDCA1 Optimization Tips" }), (0, jsx_runtime_1.jsxs)("ul", { style: { fontSize: '0.85rem', color: '#0369a1', paddingLeft: '20px' }, children: [(0, jsx_runtime_1.jsx)("li", { children: "Use Fast preset for quick compression of large files" }), (0, jsx_runtime_1.jsx)("li", { children: "Balanced preset works well for most file types" }), (0, jsx_runtime_1.jsx)("li", { children: "Maximum preset achieves best ratios for text and structured data" }), (0, jsx_runtime_1.jsx)("li", { children: "Higher quantum bit depth improves compression but increases processing time" })] })] })] }));
};
exports.CompressionSettings = CompressionSettings;
//# sourceMappingURL=CompressionSettings.js.map