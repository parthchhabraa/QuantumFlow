"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoSettings = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const VideoModels_1 = require("../../video/models/VideoModels");
const VideoSettings = ({ settings, onSettingsChange, onClose }) => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('quality');
    const handleSettingChange = (key, value) => {
        onSettingsChange({ [key]: value });
    };
    const resetToDefaults = () => {
        const defaultConfig = VideoModels_1.VideoCompressionConfig.createDefault();
        onSettingsChange(defaultConfig.toObject());
    };
    const applyPreset = (preset) => {
        let presetConfig;
        switch (preset) {
            case 'low-latency':
                presetConfig = VideoModels_1.VideoCompressionConfig.createLowLatency();
                break;
            case 'high-quality':
                presetConfig = VideoModels_1.VideoCompressionConfig.createHighQuality();
                break;
            case 'mobile':
                presetConfig = VideoModels_1.VideoCompressionConfig.createMobileOptimized();
                break;
            default:
                presetConfig = VideoModels_1.VideoCompressionConfig.createDefault();
        }
        onSettingsChange(presetConfig.toObject());
    };
    const renderQualitySettings = () => ((0, jsx_runtime_1.jsxs)("div", { className: "settings-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Video Quality" }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Base Quality" }), (0, jsx_runtime_1.jsxs)("select", { value: settings.baseQuality, onChange: (e) => handleSettingChange('baseQuality', e.target.value), className: "setting-select", children: [(0, jsx_runtime_1.jsx)("option", { value: "low", children: "Low (320p)" }), (0, jsx_runtime_1.jsx)("option", { value: "medium", children: "Medium (720p)" }), (0, jsx_runtime_1.jsx)("option", { value: "high", children: "High (1080p)" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Target Frame Rate" }), (0, jsx_runtime_1.jsxs)("div", { className: "slider-container", children: [(0, jsx_runtime_1.jsx)("input", { type: "range", min: "15", max: "60", step: "5", value: settings.targetFrameRate, onChange: (e) => handleSettingChange('targetFrameRate', parseInt(e.target.value)), className: "setting-slider" }), (0, jsx_runtime_1.jsxs)("span", { className: "slider-value", children: [settings.targetFrameRate, " fps"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Max Latency" }), (0, jsx_runtime_1.jsxs)("div", { className: "slider-container", children: [(0, jsx_runtime_1.jsx)("input", { type: "range", min: "50", max: "500", step: "25", value: settings.maxLatency, onChange: (e) => handleSettingChange('maxLatency', parseInt(e.target.value)), className: "setting-slider" }), (0, jsx_runtime_1.jsxs)("span", { className: "slider-value", children: [settings.maxLatency, " ms"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsxs)("label", { className: "checkbox-label", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: settings.adaptiveQuality, onChange: (e) => handleSettingChange('adaptiveQuality', e.target.checked) }), (0, jsx_runtime_1.jsx)("span", { className: "checkmark" }), "Adaptive Quality"] }), (0, jsx_runtime_1.jsx)("p", { className: "setting-description", children: "Automatically adjust quality based on network conditions" })] })] }));
    const renderCompressionSettings = () => ((0, jsx_runtime_1.jsxs)("div", { className: "settings-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Quantum Compression" }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Compression Level" }), (0, jsx_runtime_1.jsxs)("div", { className: "slider-container", children: [(0, jsx_runtime_1.jsx)("input", { type: "range", min: "1", max: "10", step: "1", value: settings.quantumCompressionLevel, onChange: (e) => handleSettingChange('quantumCompressionLevel', parseInt(e.target.value)), className: "setting-slider quantum-slider" }), (0, jsx_runtime_1.jsxs)("span", { className: "slider-value", children: [settings.quantumCompressionLevel, "/10"] })] }), (0, jsx_runtime_1.jsx)("p", { className: "setting-description", children: "Higher levels provide better compression but require more processing power" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Key Frame Interval" }), (0, jsx_runtime_1.jsxs)("div", { className: "slider-container", children: [(0, jsx_runtime_1.jsx)("input", { type: "range", min: "10", max: "120", step: "5", value: settings.keyFrameInterval, onChange: (e) => handleSettingChange('keyFrameInterval', parseInt(e.target.value)), className: "setting-slider" }), (0, jsx_runtime_1.jsxs)("span", { className: "slider-value", children: [settings.keyFrameInterval, " frames"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsxs)("label", { className: "checkbox-label", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: settings.enableTemporalCompression, onChange: (e) => handleSettingChange('enableTemporalCompression', e.target.checked) }), (0, jsx_runtime_1.jsx)("span", { className: "checkmark" }), "Temporal Compression"] }), (0, jsx_runtime_1.jsx)("p", { className: "setting-description", children: "Compress based on motion between frames" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsxs)("label", { className: "checkbox-label", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: settings.enableSpatialCompression, onChange: (e) => handleSettingChange('enableSpatialCompression', e.target.checked) }), (0, jsx_runtime_1.jsx)("span", { className: "checkmark" }), "Spatial Compression"] }), (0, jsx_runtime_1.jsx)("p", { className: "setting-description", children: "Compress based on patterns within frames" })] })] }));
    const renderNetworkSettings = () => ((0, jsx_runtime_1.jsxs)("div", { className: "settings-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Network Optimization" }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Bandwidth Threshold" }), (0, jsx_runtime_1.jsxs)("div", { className: "slider-container", children: [(0, jsx_runtime_1.jsx)("input", { type: "range", min: "0.5", max: "10", step: "0.5", value: settings.bandwidthThreshold, onChange: (e) => handleSettingChange('bandwidthThreshold', parseFloat(e.target.value)), className: "setting-slider" }), (0, jsx_runtime_1.jsxs)("span", { className: "slider-value", children: [settings.bandwidthThreshold, " Mbps"] })] }), (0, jsx_runtime_1.jsx)("p", { className: "setting-description", children: "Minimum bandwidth required for current quality level" })] }), (0, jsx_runtime_1.jsx)("div", { className: "network-info", children: (0, jsx_runtime_1.jsxs)("div", { className: "info-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "info-header", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-chart-line" }), (0, jsx_runtime_1.jsx)("span", { children: "Current Performance" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Estimated Compression" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [(settings.quantumCompressionLevel * 0.3 + 2).toFixed(1), "x"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Processing Overhead" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [(settings.quantumCompressionLevel * 5 + 10), "ms"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Quality Score" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [Math.min(100, settings.quantumCompressionLevel * 8 + 20), "%"] })] })] })] }) })] }));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "video-settings", children: [(0, jsx_runtime_1.jsxs)("div", { className: "settings-header", children: [(0, jsx_runtime_1.jsxs)("h3", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-cog" }), "Video Settings"] }), onClose && ((0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "close-button", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-times" }) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "settings-tabs", children: [(0, jsx_runtime_1.jsxs)("button", { className: `tab-button ${activeTab === 'quality' ? 'active' : ''}`, onClick: () => setActiveTab('quality'), children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-video" }), "Quality"] }), (0, jsx_runtime_1.jsxs)("button", { className: `tab-button ${activeTab === 'compression' ? 'active' : ''}`, onClick: () => setActiveTab('compression'), children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-compress-alt" }), "Compression"] }), (0, jsx_runtime_1.jsxs)("button", { className: `tab-button ${activeTab === 'network' ? 'active' : ''}`, onClick: () => setActiveTab('network'), children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-network-wired" }), "Network"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "settings-content", children: [activeTab === 'quality' && renderQualitySettings(), activeTab === 'compression' && renderCompressionSettings(), activeTab === 'network' && renderNetworkSettings()] }), (0, jsx_runtime_1.jsxs)("div", { className: "settings-presets", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Quick Presets" }), (0, jsx_runtime_1.jsxs)("div", { className: "preset-buttons", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => applyPreset('low-latency'), className: "preset-button", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-bolt" }), "Low Latency"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => applyPreset('high-quality'), className: "preset-button", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-gem" }), "High Quality"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => applyPreset('mobile'), className: "preset-button", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-mobile-alt" }), "Mobile"] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "settings-actions", children: (0, jsx_runtime_1.jsxs)("button", { onClick: resetToDefaults, className: "reset-button", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-undo" }), "Reset to Defaults"] }) }), (0, jsx_runtime_1.jsx)("style", { children: `
        .video-settings {
          height: 100%;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .settings-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .settings-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab-button {
          flex: 1;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .tab-button:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .tab-button.active {
          background: rgba(79, 172, 254, 0.1);
          color: #4facfe;
          border-bottom: 2px solid #4facfe;
        }

        .settings-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .settings-section h4 {
          margin: 0 0 1.5rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #4facfe;
        }

        .setting-group {
          margin-bottom: 2rem;
        }

        .setting-group label {
          display: block;
          margin-bottom: 0.75rem;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .setting-select {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
        }

        .setting-select option {
          background: #333;
          color: white;
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .setting-slider {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }

        .setting-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #4facfe;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(79, 172, 254, 0.3);
        }

        .setting-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #4facfe;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(79, 172, 254, 0.3);
        }

        .quantum-slider::-webkit-slider-thumb {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          box-shadow: 0 2px 6px rgba(79, 172, 254, 0.5);
        }

        .slider-value {
          min-width: 60px;
          text-align: right;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          color: #4facfe;
          font-weight: 600;
        }

        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          margin-bottom: 0.5rem !important;
        }

        .checkbox-label input[type="checkbox"] {
          opacity: 0;
          position: absolute;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          position: relative;
          transition: all 0.3s ease;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          border-color: #4facfe;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: -2px;
          left: 3px;
          color: white;
          font-size: 14px;
          font-weight: bold;
        }

        .setting-description {
          margin: 0.5rem 0 0 0;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.4;
        }

        .network-info {
          margin-top: 2rem;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: #4facfe;
        }

        .info-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .stat-value {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: white;
        }

        .settings-presets {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .settings-presets h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #4facfe;
        }

        .preset-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .preset-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .preset-button:hover {
          background: rgba(79, 172, 254, 0.2);
          border-color: #4facfe;
          color: #4facfe;
        }

        .settings-actions {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .reset-button {
          width: 100%;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .reset-button:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        /* Scrollbar styling */
        .settings-content::-webkit-scrollbar {
          width: 6px;
        }

        .settings-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .settings-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .settings-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .preset-buttons {
            grid-template-columns: 1fr;
          }

          .tab-button {
            font-size: 0.8rem;
            padding: 0.75rem;
          }

          .slider-container {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .slider-value {
            text-align: center;
          }
        }
      ` })] }));
};
exports.VideoSettings = VideoSettings;
//# sourceMappingURL=VideoSettings.js.map