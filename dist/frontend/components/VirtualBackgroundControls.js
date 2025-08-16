"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualBackgroundControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const VirtualBackgroundControls = ({ processor, onConfigChange, isVisible, onToggleVisibility }) => {
    const [availableBackgrounds, setAvailableBackgrounds] = (0, react_1.useState)([]);
    const [availableFilters, setAvailableFilters] = (0, react_1.useState)([]);
    const [config, setConfig] = (0, react_1.useState)({
        enableBackground: false,
        enableFilters: false,
        filters: [],
        quality: 'medium',
        enableEdgeSmoothing: true,
        detectionSensitivity: 0.8,
        processingRate: 1
    });
    const [stats, setStats] = (0, react_1.useState)({
        framesProcessed: 0,
        averageProcessingTime: 0,
        detectionAccuracy: 0.85,
        memoryUsage: 0,
        cpuUsage: 0,
        fps: 0
    });
    const [activeTab, setActiveTab] = (0, react_1.useState)('backgrounds');
    const [customBackgroundFile, setCustomBackgroundFile] = (0, react_1.useState)(null);
    // Load available backgrounds and filters
    (0, react_1.useEffect)(() => {
        setAvailableBackgrounds(processor.getAvailableBackgrounds());
        setAvailableFilters(processor.getAvailableFilters());
    }, [processor]);
    // Listen for stats updates
    (0, react_1.useEffect)(() => {
        const handleStatsUpdate = (newStats) => {
            setStats(newStats);
        };
        processor.on('stats-updated', handleStatsUpdate);
        return () => processor.off('stats-updated', handleStatsUpdate);
    }, [processor]);
    // Update config when changes are made
    (0, react_1.useEffect)(() => {
        onConfigChange(config);
    }, [config, onConfigChange]);
    const selectBackground = (0, react_1.useCallback)((background) => {
        setConfig(prev => ({
            ...prev,
            background,
            enableBackground: true
        }));
    }, []);
    const toggleFilter = (0, react_1.useCallback)((filter) => {
        setConfig(prev => {
            const isActive = prev.filters.some(f => f.id === filter.id);
            const newFilters = isActive
                ? prev.filters.filter(f => f.id !== filter.id)
                : [...prev.filters, filter];
            return {
                ...prev,
                filters: newFilters,
                enableFilters: newFilters.length > 0
            };
        });
    }, []);
    const updateFilterParameter = (0, react_1.useCallback)((filterId, parameter, value) => {
        setConfig(prev => ({
            ...prev,
            filters: prev.filters.map(filter => filter.id === filterId
                ? {
                    ...filter,
                    parameters: {
                        ...filter.parameters,
                        [parameter]: value
                    }
                }
                : filter)
        }));
    }, []);
    const handleCustomBackgroundUpload = (0, react_1.useCallback)(async (file) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        const url = URL.createObjectURL(file);
        const customBackground = processor.addCustomBackground({
            name: file.name,
            type: 'image',
            data: url,
            thumbnail: url,
            isAnimated: false,
            complexity: 5
        });
        setAvailableBackgrounds(processor.getAvailableBackgrounds());
        selectBackground(customBackground);
        setCustomBackgroundFile(null);
    }, [processor, selectBackground]);
    const removeBackground = (0, react_1.useCallback)(() => {
        setConfig(prev => ({
            ...prev,
            background: undefined,
            enableBackground: false
        }));
    }, []);
    const resetFilters = (0, react_1.useCallback)(() => {
        setConfig(prev => ({
            ...prev,
            filters: [],
            enableFilters: false
        }));
    }, []);
    if (!isVisible) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "bg-controls-toggle", children: (0, jsx_runtime_1.jsx)("button", { className: "bg-toggle-btn", onClick: onToggleVisibility, title: "Virtual Backgrounds & Filters", children: "\uD83C\uDFAD" }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "virtual-background-controls", children: [(0, jsx_runtime_1.jsxs)("div", { className: "controls-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Effects" }), (0, jsx_runtime_1.jsx)("button", { className: "close-btn", onClick: onToggleVisibility, children: "\u2715" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "controls-tabs", children: [(0, jsx_runtime_1.jsx)("button", { className: `tab-btn ${activeTab === 'backgrounds' ? 'active' : ''}`, onClick: () => setActiveTab('backgrounds'), children: "Backgrounds" }), (0, jsx_runtime_1.jsx)("button", { className: `tab-btn ${activeTab === 'filters' ? 'active' : ''}`, onClick: () => setActiveTab('filters'), children: "Filters" }), (0, jsx_runtime_1.jsx)("button", { className: `tab-btn ${activeTab === 'settings' ? 'active' : ''}`, onClick: () => setActiveTab('settings'), children: "Settings" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "controls-content", children: [activeTab === 'backgrounds' && ((0, jsx_runtime_1.jsxs)("div", { className: "backgrounds-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-header", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Virtual Backgrounds" }), (0, jsx_runtime_1.jsxs)("label", { className: "toggle-switch", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: config.enableBackground, onChange: (e) => setConfig(prev => ({ ...prev, enableBackground: e.target.checked })) }), (0, jsx_runtime_1.jsx)("span", { className: "toggle-slider" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "backgrounds-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: `background-option none-option ${!config.background ? 'selected' : ''}`, onClick: removeBackground, children: [(0, jsx_runtime_1.jsx)("div", { className: "background-preview", children: (0, jsx_runtime_1.jsx)("span", { children: "None" }) }), (0, jsx_runtime_1.jsx)("span", { className: "background-name", children: "No Background" })] }), availableBackgrounds.map(background => ((0, jsx_runtime_1.jsxs)("div", { className: `background-option ${config.background?.id === background.id ? 'selected' : ''}`, onClick: () => selectBackground(background), children: [(0, jsx_runtime_1.jsx)("div", { className: "background-preview", children: background.type === 'image' ? ((0, jsx_runtime_1.jsx)("img", { src: background.thumbnail, alt: background.name })) : background.type === 'blur' ? ((0, jsx_runtime_1.jsx)("div", { className: "blur-preview", children: "Blur" })) : background.type === 'color' ? ((0, jsx_runtime_1.jsx)("div", { className: "color-preview", style: { background: background.data } })) : ((0, jsx_runtime_1.jsx)("div", { className: "video-preview", children: "Video" })) }), (0, jsx_runtime_1.jsx)("span", { className: "background-name", children: background.name }), (0, jsx_runtime_1.jsx)("div", { className: "complexity-indicator", children: '●'.repeat(Math.min(background.complexity, 5)) })] }, background.id)))] }), (0, jsx_runtime_1.jsxs)("div", { className: "custom-background-upload", children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setCustomBackgroundFile(file);
                                                handleCustomBackgroundUpload(file);
                                            }
                                        }, style: { display: 'none' }, id: "custom-bg-upload" }), (0, jsx_runtime_1.jsxs)("label", { htmlFor: "custom-bg-upload", className: "upload-btn", children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDCC1" }), "Upload Custom Background"] })] })] })), activeTab === 'filters' && ((0, jsx_runtime_1.jsxs)("div", { className: "filters-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-header", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Video Filters" }), (0, jsx_runtime_1.jsxs)("label", { className: "toggle-switch", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: config.enableFilters, onChange: (e) => setConfig(prev => ({ ...prev, enableFilters: e.target.checked })) }), (0, jsx_runtime_1.jsx)("span", { className: "toggle-slider" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "filters-list", children: availableFilters.map(filter => {
                                    const isActive = config.filters.some(f => f.id === filter.id);
                                    const activeFilter = config.filters.find(f => f.id === filter.id);
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: `filter-item ${isActive ? 'active' : ''}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "filter-header", onClick: () => toggleFilter(filter), children: [(0, jsx_runtime_1.jsxs)("div", { className: "filter-info", children: [(0, jsx_runtime_1.jsx)("span", { className: "filter-name", children: filter.name }), (0, jsx_runtime_1.jsx)("span", { className: "filter-type", children: filter.type })] }), (0, jsx_runtime_1.jsx)("div", { className: "filter-toggle", children: (0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: isActive, onChange: () => toggleFilter(filter) }) })] }), isActive && activeFilter && ((0, jsx_runtime_1.jsx)("div", { className: "filter-controls", children: Object.entries(filter.parameters).map(([param, defaultValue]) => ((0, jsx_runtime_1.jsxs)("div", { className: "filter-control", children: [(0, jsx_runtime_1.jsxs)("label", { children: [param.charAt(0).toUpperCase() + param.slice(1), ":"] }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: param === 'brightness' || param === 'contrast' || param === 'saturation' || param === 'warmth' ? -100 : 0, max: 100, value: activeFilter.parameters[param] || defaultValue, onChange: (e) => updateFilterParameter(filter.id, param, parseInt(e.target.value)) }), (0, jsx_runtime_1.jsx)("span", { children: activeFilter.parameters[param] || defaultValue })] }, param))) }))] }, filter.id));
                                }) }), config.filters.length > 0 && ((0, jsx_runtime_1.jsx)("button", { className: "reset-filters-btn", onClick: resetFilters, children: "Reset All Filters" }))] })), activeTab === 'settings' && ((0, jsx_runtime_1.jsxs)("div", { className: "settings-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Processing Settings" }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Processing Quality:" }), (0, jsx_runtime_1.jsxs)("select", { value: config.quality, onChange: (e) => setConfig(prev => ({
                                            ...prev,
                                            quality: e.target.value
                                        })), children: [(0, jsx_runtime_1.jsx)("option", { value: "low", children: "Low (Fast)" }), (0, jsx_runtime_1.jsx)("option", { value: "medium", children: "Medium (Balanced)" }), (0, jsx_runtime_1.jsx)("option", { value: "high", children: "High (Quality)" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Detection Sensitivity:" }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: "0.1", max: "1.0", step: "0.1", value: config.detectionSensitivity, onChange: (e) => setConfig(prev => ({
                                            ...prev,
                                            detectionSensitivity: parseFloat(e.target.value)
                                        })) }), (0, jsx_runtime_1.jsxs)("span", { children: [(config.detectionSensitivity * 100).toFixed(0), "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Processing Rate:" }), (0, jsx_runtime_1.jsxs)("select", { value: config.processingRate, onChange: (e) => setConfig(prev => ({
                                            ...prev,
                                            processingRate: parseInt(e.target.value)
                                        })), children: [(0, jsx_runtime_1.jsx)("option", { value: "1", children: "Every Frame" }), (0, jsx_runtime_1.jsx)("option", { value: "2", children: "Every 2nd Frame" }), (0, jsx_runtime_1.jsx)("option", { value: "3", children: "Every 3rd Frame" }), (0, jsx_runtime_1.jsx)("option", { value: "5", children: "Every 5th Frame" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "setting-group", children: (0, jsx_runtime_1.jsxs)("label", { className: "checkbox-label", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: config.enableEdgeSmoothing, onChange: (e) => setConfig(prev => ({
                                                ...prev,
                                                enableEdgeSmoothing: e.target.checked
                                            })) }), "Enable Edge Smoothing"] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "performance-stats", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Performance Statistics" }), (0, jsx_runtime_1.jsxs)("div", { className: "stats-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "FPS:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: stats.fps.toFixed(1) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Processing Time:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [stats.averageProcessingTime.toFixed(1), "ms"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Memory Usage:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [stats.memoryUsage.toFixed(1), "MB"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Detection Accuracy:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [(stats.detectionAccuracy * 100).toFixed(0), "%"] })] })] })] })] }))] }), (0, jsx_runtime_1.jsx)("style", { children: `
        .bg-controls-toggle {
          position: fixed;
          bottom: 8rem;
          right: 2rem;
          z-index: 999;
        }

        .bg-toggle-btn {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
          transition: all 0.3s ease;
        }

        .bg-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255, 107, 107, 0.4);
        }

        .virtual-background-controls {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          width: 400px;
          max-height: 600px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          border-radius: 16px 16px 0 0;
        }

        .controls-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .controls-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.05);
        }

        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 1rem;
          cursor: pointer;
          font-weight: 500;
          color: #666;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: white;
          color: #333;
          border-bottom: 2px solid #ff6b6b;
        }

        .controls-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h4 {
          margin: 0;
          color: #333;
          font-size: 1rem;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #ff6b6b;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .backgrounds-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .background-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .background-option:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .background-option.selected {
          border-color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
        }

        .background-preview {
          width: 80px;
          height: 60px;
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          margin-bottom: 0.5rem;
        }

        .background-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .blur-preview,
        .video-preview {
          color: #666;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .color-preview {
          width: 100%;
          height: 100%;
          border-radius: 4px;
        }

        .none-option .background-preview {
          border: 2px dashed #ccc;
          color: #999;
          font-size: 0.8rem;
        }

        .background-name {
          font-size: 0.8rem;
          color: #333;
          text-align: center;
          margin-bottom: 0.25rem;
        }

        .complexity-indicator {
          font-size: 0.7rem;
          color: #ff6b6b;
        }

        .upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .upload-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .filters-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .filter-item {
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .filter-item.active {
          border-color: #ff6b6b;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          background: rgba(0, 0, 0, 0.02);
        }

        .filter-info {
          display: flex;
          flex-direction: column;
        }

        .filter-name {
          font-weight: 500;
          color: #333;
        }

        .filter-type {
          font-size: 0.8rem;
          color: #666;
          text-transform: capitalize;
        }

        .filter-controls {
          padding: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 107, 107, 0.05);
        }

        .filter-control {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .filter-control:last-child {
          margin-bottom: 0;
        }

        .filter-control label {
          min-width: 80px;
          font-size: 0.9rem;
          color: #333;
        }

        .filter-control input[type="range"] {
          flex: 1;
        }

        .filter-control span {
          min-width: 30px;
          text-align: right;
          font-size: 0.9rem;
          color: #666;
        }

        .reset-filters-btn {
          background: #ff4757;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          width: 100%;
          margin-top: 1rem;
        }

        .setting-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .setting-group label {
          min-width: 120px;
          font-size: 0.9rem;
          color: #333;
        }

        .setting-group select,
        .setting-group input[type="range"] {
          flex: 1;
        }

        .setting-group span {
          min-width: 40px;
          text-align: right;
          font-size: 0.9rem;
          color: #666;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          min-width: auto !important;
        }

        .performance-stats {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .performance-stats h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: rgba(255, 107, 107, 0.1);
          border-radius: 6px;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #666;
        }

        .stat-value {
          font-weight: 600;
          color: #333;
        }

        @media (max-width: 768px) {
          .virtual-background-controls {
            width: calc(100vw - 2rem);
            left: 1rem;
            right: 1rem;
          }

          .backgrounds-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      ` })] }));
};
exports.VirtualBackgroundControls = VirtualBackgroundControls;
//# sourceMappingURL=VirtualBackgroundControls.js.map