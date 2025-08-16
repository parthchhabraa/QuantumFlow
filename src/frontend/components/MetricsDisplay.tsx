import React from 'react';
import { FrontendQuantumMetrics } from '../types/FrontendTypes';

interface MetricsDisplayProps {
  metrics: FrontendQuantumMetrics | null;
  isProcessing: boolean;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ 
  metrics, 
  isProcessing 
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getCompressionRating = (ratio: number): { text: string; color: string; icon: string } => {
    if (ratio >= 0.8) return { text: 'Excellent', color: '#10b981', icon: '🌟' };
    if (ratio >= 0.6) return { text: 'Very Good', color: '#059669', icon: '✨' };
    if (ratio >= 0.4) return { text: 'Good', color: '#f59e0b', icon: '👍' };
    if (ratio >= 0.2) return { text: 'Fair', color: '#f97316', icon: '👌' };
    return { text: 'Poor', color: '#ef4444', icon: '⚠️' };
  };

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = '#667eea',
    isLoading = false 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: string;
    isLoading?: boolean;
  }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      border: `2px solid ${color}20`
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          animation: 'shimmer 2s infinite'
        }} />
      )}
      
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
      <div style={{ 
        fontSize: '1.8rem', 
        fontWeight: 'bold', 
        color: color,
        marginBottom: '4px'
      }}>
        {isLoading ? '...' : value}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  return (
    <div className="metrics-display">
      <h2 style={{ marginBottom: '20px', color: '#374151', textAlign: 'center' }}>
        Performance Metrics
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <MetricCard
          title="Compression Ratio"
          value={metrics ? `${(metrics.compressionRatio * 100).toFixed(1)}%` : '--'}
          subtitle={metrics ? getCompressionRating(metrics.compressionRatio).text : undefined}
          icon={metrics ? getCompressionRating(metrics.compressionRatio).icon : '📊'}
          color={metrics ? getCompressionRating(metrics.compressionRatio).color : '#667eea'}
          isLoading={isProcessing}
        />
        
        <MetricCard
          title="Processing Time"
          value={metrics ? formatTime(metrics.processingTime) : '--'}
          subtitle={metrics && metrics.processingTime > 5000 ? 'Consider lower settings' : undefined}
          icon="⏱️"
          color="#8b5cf6"
          isLoading={isProcessing}
        />
        
        <MetricCard
          title="Original Size"
          value={metrics ? formatBytes(metrics.originalSize) : '--'}
          icon="📄"
          color="#06b6d4"
          isLoading={isProcessing}
        />
        
        <MetricCard
          title="Compressed Size"
          value={metrics ? formatBytes(metrics.compressedSize) : '--'}
          subtitle={metrics ? `Saved ${formatBytes(metrics.originalSize - metrics.compressedSize)}` : undefined}
          icon="🗜️"
          color="#10b981"
          isLoading={isProcessing}
        />
      </div>

      {metrics && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#374151' }}>Quantum Processing Details</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <h4 style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }}>
                QUANTUM EFFICIENCY
              </h4>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#667eea' }}>
                {(metrics.quantumEfficiency * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                Quantum algorithm effectiveness
              </div>
            </div>
            
            <div>
              <h4 style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }}>
                ENTANGLEMENT PAIRS
              </h4>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                {metrics.entanglementPairs || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                Correlated pattern pairs found
              </div>
            </div>
            
            <div>
              <h4 style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }}>
                SUPERPOSITION STATES
              </h4>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {metrics.superpositionStates || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                Parallel quantum states processed
              </div>
            </div>
            
            <div>
              <h4 style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '8px' }}>
                INTERFERENCE OPTIMIZATIONS
              </h4>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444' }}>
                {metrics.interferencePatterns || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                Redundancy eliminations applied
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};