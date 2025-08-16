import React from 'react';
import { FrontendQuantumConfig } from '../types/FrontendTypes';

interface CompressionSettingsProps {
  config: FrontendQuantumConfig;
  onChange: (config: Partial<FrontendQuantumConfig>) => void;
  disabled: boolean;
}

export const CompressionSettings: React.FC<CompressionSettingsProps> = ({
  config,
  onChange,
  disabled
}) => {
  const handleSliderChange = (key: keyof FrontendQuantumConfig, value: number) => {
    onChange({ [key]: value });
  };

  const getSliderColor = (value: number, max: number) => {
    const percentage = value / max;
    if (percentage < 0.3) return '#10b981'; // green
    if (percentage < 0.7) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const SliderComponent = ({ 
    label, 
    value, 
    min, 
    max, 
    step = 1, 
    configKey,
    description,
    unit = ''
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    configKey: keyof FrontendQuantumConfig;
    description: string;
    unit?: string;
  }) => (
    <div className="slider-container" style={{ marginBottom: '25px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontWeight: '600', color: '#374151' }}>{label}</label>
        <span style={{ 
          backgroundColor: getSliderColor(value, max),
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          {value}{unit}
        </span>
      </div>
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleSliderChange(configKey, Number(e.target.value))}
        disabled={disabled}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: `linear-gradient(to right, ${getSliderColor(value, max)} 0%, ${getSliderColor(value, max)} ${(value / max) * 100}%, #e5e7eb ${(value / max) * 100}%, #e5e7eb 100%)`,
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
      />
      
      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
        {description}
      </p>
    </div>
  );

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

  return (
    <div className="compression-settings">
      <div className="presets-section" style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#374151' }}>Quick Presets</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange(preset.config)}
              disabled={disabled}
              style={{
                flex: 1,
                padding: '12px 8px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.backgroundColor = '#f8faff';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{preset.icon}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="advanced-settings">
        <h3 style={{ marginBottom: '20px', color: '#374151' }}>Advanced Quantum Parameters</h3>
        
        <SliderComponent
          label="Quantum Bit Depth"
          value={config.quantumBitDepth}
          min={2}
          max={16}
          configKey="quantumBitDepth"
          description="Number of qubits simulated. Higher values increase compression potential but require more processing power."
          unit=" qubits"
        />

        <SliderComponent
          label="Entanglement Level"
          value={config.maxEntanglementLevel}
          min={1}
          max={8}
          configKey="maxEntanglementLevel"
          description="Maximum quantum entanglement depth for pattern correlation. Higher levels find more complex relationships."
          unit=" levels"
        />

        <SliderComponent
          label="Superposition Complexity"
          value={config.superpositionComplexity}
          min={1}
          max={10}
          configKey="superpositionComplexity"
          description="Complexity of quantum superposition states. Higher values enable more parallel pattern analysis."
        />

        <SliderComponent
          label="Interference Threshold"
          value={config.interferenceThreshold}
          min={0.1}
          max={0.9}
          step={0.1}
          configKey="interferenceThreshold"
          description="Threshold for quantum interference optimization. Higher values are more aggressive but may reduce quality."
        />
      </div>

      <div className="settings-info" style={{ 
        marginTop: '25px', 
        padding: '15px', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <h4 style={{ color: '#0369a1', marginBottom: '8px' }}>💡 Optimization Tips</h4>
        <ul style={{ fontSize: '0.85rem', color: '#0369a1', paddingLeft: '20px' }}>
          <li>Use Fast preset for quick compression of large files</li>
          <li>Balanced preset works well for most file types</li>
          <li>Maximum preset achieves best ratios for text and structured data</li>
          <li>Higher quantum bit depth improves compression but increases processing time</li>
        </ul>
      </div>
    </div>
  );
};