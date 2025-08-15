import * as React from 'react';

interface DecompressionResult {
  originalFileName: string;
  compressedSize: number;
  decompressedSize: number;
  decompressionTime: number;
  quantumIntegrity: number;
  entanglementPairsRestored: number;
  superpositionStatesCollapsed: number;
  interferencePatternsMapped: number;
  timestamp: number;
}

interface DecompressionMetricsProps {
  results: DecompressionResult[];
  currentResult?: DecompressionResult | null;
}

export const DecompressionMetrics: React.FC<DecompressionMetricsProps> = ({
  results,
  currentResult
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const averageIntegrity = results.length > 0
    ? results.reduce((sum, r) => sum + r.quantumIntegrity, 0) / results.length
    : 0;

  const displayResult = currentResult || (results.length > 0 ? results[results.length - 1] : null);

  return (
    <div className="decompression-metrics">
      {/* Summary Cards */}
      <div className="metrics-grid">
        <div className="metric-card integrity-card">
          <div className="metric-icon">🔒</div>
          <div className="metric-content">
            <div className="metric-value">
              {(averageIntegrity * 100).toFixed(1)}%
            </div>
            <div className="metric-label">Quantum Integrity</div>
            <div className="metric-sublabel">Average data fidelity</div>
          </div>
        </div>

        <div className="metric-card speed-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <div className="metric-value">
              {displayResult ? formatTime(displayResult.decompressionTime) : '--'}
            </div>
            <div className="metric-label">Decompression Time</div>
            <div className="metric-sublabel">Latest operation</div>
          </div>
        </div>

        <div className="metric-card expansion-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-value">
              {displayResult
                ? `${(displayResult.decompressedSize / displayResult.compressedSize).toFixed(1)}x`
                : '--'
              }
            </div>
            <div className="metric-label">Expansion Ratio</div>
            <div className="metric-sublabel">Size multiplication</div>
          </div>
        </div>

        <div className="metric-card files-card">
          <div className="metric-icon">📁</div>
          <div className="metric-content">
            <div className="metric-value">{results.length}</div>
            <div className="metric-label">Files Restored</div>
            <div className="metric-sublabel">Total processed</div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      {displayResult && (
        <div className="detailed-metrics">
          <div className="glass-card">
            <div className="card-header">
              <div className="card-icon">📊</div>
              <div>
                <h3 className="card-title">Quantum Decompression Analysis</h3>
                <p className="card-subtitle">Latest operation: {displayResult.originalFileName}</p>
              </div>
            </div>

            <div className="metrics-content">
              <div className="metric-row">
                <div className="metric-item">
                  <span className="metric-name">Compressed Size</span>
                  <span className="metric-value">{formatFileSize(displayResult.compressedSize)}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Decompressed Size</span>
                  <span className="metric-value">{formatFileSize(displayResult.decompressedSize)}</span>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-item">
                  <span className="metric-name">Processing Time</span>
                  <span className="metric-value">{formatTime(displayResult.decompressionTime)}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-name">Quantum Integrity</span>
                  <span className="metric-value">{(displayResult.quantumIntegrity * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="quantum-details">
                <h4>Quantum State Reconstruction</h4>
                <div className="quantum-stats">
                  <div className="quantum-stat">
                    <div className="stat-icon">🔗</div>
                    <div className="stat-info">
                      <div className="stat-value">{displayResult.entanglementPairsRestored}</div>
                      <div className="stat-label">Entanglement Pairs Restored</div>
                    </div>
                  </div>
                  <div className="quantum-stat">
                    <div className="stat-icon">⚛️</div>
                    <div className="stat-info">
                      <div className="stat-value">{displayResult.superpositionStatesCollapsed}</div>
                      <div className="stat-label">Superposition States Collapsed</div>
                    </div>
                  </div>
                  <div className="quantum-stat">
                    <div className="stat-icon">🌊</div>
                    <div className="stat-info">
                      <div className="stat-value">{displayResult.interferencePatternsMapped}</div>
                      <div className="stat-label">Interference Patterns Mapped</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Operations */}
      {results.length > 0 && (
        <div className="recent-operations">
          <div className="glass-card">
            <div className="card-header">
              <div className="card-icon">📋</div>
              <div>
                <h3 className="card-title">Recent Decompressions</h3>
                <p className="card-subtitle">Last {Math.min(results.length, 5)} operations</p>
              </div>
            </div>

            <div className="operations-list">
              {results.slice(-5).reverse().map((result) => (
                <div key={result.timestamp} className="operation-item">
                  <div className="operation-info">
                    <div className="operation-name">{result.originalFileName}</div>
                    <div className="operation-details">
                      {formatFileSize(result.compressedSize)} → {formatFileSize(result.decompressedSize)}
                      • {formatTime(result.decompressionTime)}
                      • {(result.quantumIntegrity * 100).toFixed(1)}% integrity
                    </div>
                  </div>
                  <div className="operation-status">
                    <div className="status-indicator success">✓</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};