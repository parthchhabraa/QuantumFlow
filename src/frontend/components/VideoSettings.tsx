import React, { useState } from 'react';
import { VideoCompressionConfig } from '../../video/models/VideoModels';

interface VideoSettingsProps {
  settings: VideoCompressionConfig;
  onSettingsChange: (settings: Partial<VideoCompressionConfig>) => void;
  onClose?: () => void;
}

export const VideoSettings: React.FC<VideoSettingsProps> = ({
  settings,
  onSettingsChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'quality' | 'compression' | 'network'>('quality');

  const handleSettingChange = (key: keyof VideoCompressionConfig, value: any) => {
    onSettingsChange({ [key]: value });
  };

  const resetToDefaults = () => {
    const defaultConfig = VideoCompressionConfig.createDefault();
    onSettingsChange(defaultConfig.toObject());
  };

  const applyPreset = (preset: 'low-latency' | 'high-quality' | 'mobile') => {
    let presetConfig: VideoCompressionConfig;
    
    switch (preset) {
      case 'low-latency':
        presetConfig = VideoCompressionConfig.createLowLatency();
        break;
      case 'high-quality':
        presetConfig = VideoCompressionConfig.createHighQuality();
        break;
      case 'mobile':
        presetConfig = VideoCompressionConfig.createMobileOptimized();
        break;
      default:
        presetConfig = VideoCompressionConfig.createDefault();
    }
    
    onSettingsChange(presetConfig.toObject());
  };

  const renderQualitySettings = () => (
    <div className="settings-section">
      <h4>Video Quality</h4>
      
      <div className="setting-group">
        <label>Base Quality</label>
        <select
          value={settings.baseQuality}
          onChange={(e) => handleSettingChange('baseQuality', e.target.value as 'low' | 'medium' | 'high')}
          className="setting-select"
        >
          <option value="low">Low (320p)</option>
          <option value="medium">Medium (720p)</option>
          <option value="high">High (1080p)</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Target Frame Rate</label>
        <div className="slider-container">
          <input
            type="range"
            min="15"
            max="60"
            step="5"
            value={settings.targetFrameRate}
            onChange={(e) => handleSettingChange('targetFrameRate', parseInt(e.target.value))}
            className="setting-slider"
          />
          <span className="slider-value">{settings.targetFrameRate} fps</span>
        </div>
      </div>

      <div className="setting-group">
        <label>Max Latency</label>
        <div className="slider-container">
          <input
            type="range"
            min="50"
            max="500"
            step="25"
            value={settings.maxLatency}
            onChange={(e) => handleSettingChange('maxLatency', parseInt(e.target.value))}
            className="setting-slider"
          />
          <span className="slider-value">{settings.maxLatency} ms</span>
        </div>
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.adaptiveQuality}
            onChange={(e) => handleSettingChange('adaptiveQuality', e.target.checked)}
          />
          <span className="checkmark"></span>
          Adaptive Quality
        </label>
        <p className="setting-description">
          Automatically adjust quality based on network conditions
        </p>
      </div>
    </div>
  );

  const renderCompressionSettings = () => (
    <div className="settings-section">
      <h4>Quantum Compression</h4>
      
      <div className="setting-group">
        <label>Compression Level</label>
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={settings.quantumCompressionLevel}
            onChange={(e) => handleSettingChange('quantumCompressionLevel', parseInt(e.target.value))}
            className="setting-slider quantum-slider"
          />
          <span className="slider-value">{settings.quantumCompressionLevel}/10</span>
        </div>
        <p className="setting-description">
          Higher levels provide better compression but require more processing power
        </p>
      </div>

      <div className="setting-group">
        <label>Key Frame Interval</label>
        <div className="slider-container">
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={settings.keyFrameInterval}
            onChange={(e) => handleSettingChange('keyFrameInterval', parseInt(e.target.value))}
            className="setting-slider"
          />
          <span className="slider-value">{settings.keyFrameInterval} frames</span>
        </div>
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.enableTemporalCompression}
            onChange={(e) => handleSettingChange('enableTemporalCompression', e.target.checked)}
          />
          <span className="checkmark"></span>
          Temporal Compression
        </label>
        <p className="setting-description">
          Compress based on motion between frames
        </p>
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.enableSpatialCompression}
            onChange={(e) => handleSettingChange('enableSpatialCompression', e.target.checked)}
          />
          <span className="checkmark"></span>
          Spatial Compression
        </label>
        <p className="setting-description">
          Compress based on patterns within frames
        </p>
      </div>
    </div>
  );

  const renderNetworkSettings = () => (
    <div className="settings-section">
      <h4>Network Optimization</h4>
      
      <div className="setting-group">
        <label>Bandwidth Threshold</label>
        <div className="slider-container">
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={settings.bandwidthThreshold}
            onChange={(e) => handleSettingChange('bandwidthThreshold', parseFloat(e.target.value))}
            className="setting-slider"
          />
          <span className="slider-value">{settings.bandwidthThreshold} Mbps</span>
        </div>
        <p className="setting-description">
          Minimum bandwidth required for current quality level
        </p>
      </div>

      <div className="network-info">
        <div className="info-card">
          <div className="info-header">
            <i className="fas fa-chart-line"></i>
            <span>Current Performance</span>
          </div>
          <div className="info-stats">
            <div className="stat">
              <span className="stat-label">Estimated Compression</span>
              <span className="stat-value">
                {(settings.quantumCompressionLevel * 0.3 + 2).toFixed(1)}x
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Processing Overhead</span>
              <span className="stat-value">
                {(settings.quantumCompressionLevel * 5 + 10)}ms
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Quality Score</span>
              <span className="stat-value">
                {Math.min(100, settings.quantumCompressionLevel * 8 + 20)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="video-settings">
      <div className="settings-header">
        <h3>
          <i className="fas fa-cog"></i>
          Video Settings
        </h3>
        {onClose && (
          <button onClick={onClose} className="close-button">
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          <i className="fas fa-video"></i>
          Quality
        </button>
        <button
          className={`tab-button ${activeTab === 'compression' ? 'active' : ''}`}
          onClick={() => setActiveTab('compression')}
        >
          <i className="fas fa-compress-alt"></i>
          Compression
        </button>
        <button
          className={`tab-button ${activeTab === 'network' ? 'active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          <i className="fas fa-network-wired"></i>
          Network
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'quality' && renderQualitySettings()}
        {activeTab === 'compression' && renderCompressionSettings()}
        {activeTab === 'network' && renderNetworkSettings()}
      </div>

      <div className="settings-presets">
        <h4>Quick Presets</h4>
        <div className="preset-buttons">
          <button
            onClick={() => applyPreset('low-latency')}
            className="preset-button"
          >
            <i className="fas fa-bolt"></i>
            Low Latency
          </button>
          <button
            onClick={() => applyPreset('high-quality')}
            className="preset-button"
          >
            <i className="fas fa-gem"></i>
            High Quality
          </button>
          <button
            onClick={() => applyPreset('mobile')}
            className="preset-button"
          >
            <i className="fas fa-mobile-alt"></i>
            Mobile
          </button>
        </div>
      </div>

      <div className="settings-actions">
        <button onClick={resetToDefaults} className="reset-button">
          <i className="fas fa-undo"></i>
          Reset to Defaults
        </button>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};