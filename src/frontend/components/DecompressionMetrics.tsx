import * as React from 'react';
import { DecompressionResult } from '../types/FrontendTypes';

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
    <div style={{ marginTop: '2rem' }}>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            fontSize: '2rem',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
          }}>🔒</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '0.25rem'
            }}>
              {(averageIntegrity * 100).toFixed(1)}%
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#a1a1aa',
              marginBottom: '0.125rem'
            }}>Quantum Integrity</div>
            <div style={{
              fontSize: '0.75rem',
              color: '#71717a'
            }}>Average data fidelity</div>
          </div>
        </div>

        {/* Speed Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            fontSize: '2rem',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)'
          }}>⚡</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '0.25rem'
            }}>
              {displayResult ? formatTime(displayResult.decompressionTime) : '--'}
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#a1a1aa',
              marginBottom: '0.125rem'
            }}>Decompression Time</div>
            <div style={{
              fontSize: '0.75rem',
              color: '#71717a'
            }}>Latest operation</div>
          </div>
        </div>

        {/* Expansion Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            fontSize: '2rem',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
          }}>📈</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '0.25rem'
            }}>
              {displayResult
                ? `${(displayResult.decompressedSize / displayResult.compressedSize).toFixed(1)}x`
                : '--'
              }
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#a1a1aa',
              marginBottom: '0.125rem'
            }}>Expansion Ratio</div>
            <div style={{
              fontSize: '0.75rem',
              color: '#71717a'
            }}>Size multiplication</div>
          </div>
        </div>

        {/* Files Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            fontSize: '2rem',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)'
          }}>📁</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '0.25rem'
            }}>
              {results.length}
            </div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#a1a1aa',
              marginBottom: '0.125rem'
            }}>Files Restored</div>
            <div style={{
              fontSize: '0.75rem',
              color: '#71717a'
            }}>Total processed</div>
          </div>
        </div>
      </div>

      {/* Simple status message */}
      {displayResult && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>
            Latest Decompression: {displayResult.originalFileName}
          </h3>
          <p style={{ color: '#a1a1aa' }}>
            {formatFileSize(displayResult.compressedSize)} → {formatFileSize(displayResult.decompressedSize)} 
            • {formatTime(displayResult.decompressionTime)}
            • {(displayResult.quantumIntegrity * 100).toFixed(1)}% integrity
          </p>
        </div>
      )}

      {results.length === 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No Decompressions Yet</h3>
          <p style={{ color: '#a1a1aa' }}>
            Upload a .qf file to see decompression metrics here
          </p>
        </div>
      )}


    </div>
  );
};