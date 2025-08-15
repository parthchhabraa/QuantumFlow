import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { QuantumMetrics } from '../../models/QuantumMetrics';

interface VisualizationChartProps {
  data: QuantumMetrics[];
  currentMetrics: QuantumMetrics | null;
}

export const VisualizationChart: React.FC<VisualizationChartProps> = ({ 
  data, 
  currentMetrics 
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const compressionData = data.map((metrics, index) => ({
    session: index + 1,
    compressionRatio: (metrics.compressionRatio * 100).toFixed(1),
    processingTime: metrics.processingTime,
    quantumEfficiency: (metrics.quantumEfficiency * 100).toFixed(1),
    originalSize: metrics.originalSize,
    compressedSize: metrics.compressedSize,
    spaceSaved: metrics.originalSize - metrics.compressedSize
  }));

  const quantumBreakdown = currentMetrics ? [
    { name: 'Entanglement Pairs', value: currentMetrics.entanglementPairs || 0, color: '#8b5cf6' },
    { name: 'Superposition States', value: currentMetrics.superpositionStates || 0, color: '#f59e0b' },
    { name: 'Interference Opts', value: currentMetrics.interferenceOptimizations || 0, color: '#ef4444' },
    { name: 'Quantum Efficiency', value: Math.round((currentMetrics.quantumEfficiency || 0) * 100), color: '#10b981' }
  ] : [];

  const performanceComparison = currentMetrics ? [
    { algorithm: 'QuantumFlow', ratio: currentMetrics.compressionRatio * 100, color: '#667eea' },
    { algorithm: 'gzip', ratio: 65, color: '#9ca3af' },
    { algorithm: 'bzip2', ratio: 70, color: '#6b7280' },
    { algorithm: 'lzma', ratio: 75, color: '#4b5563' }
  ] : [];

  if (data.length === 0 && !currentMetrics) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📊</div>
        <h3 style={{ color: '#6b7280', marginBottom: '10px' }}>No Data Yet</h3>
        <p style={{ color: '#9ca3af' }}>
          Upload and compress files to see performance visualizations and quantum processing metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="visualization-section">
      <h2 style={{ marginBottom: '30px', color: '#374151', textAlign: 'center' }}>
        Compression Analytics & Quantum Insights
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '25px',
        marginBottom: '30px'
      }}>
        {/* Compression Ratio Trend */}
        {data.length > 1 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#374151' }}>Compression Ratio Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={compressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="session" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'compressionRatio' ? `${value}%` : value,
                    name === 'compressionRatio' ? 'Compression Ratio' : name
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="compressionRatio" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quantum Processing Breakdown */}
        {currentMetrics && quantumBreakdown.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#374151' }}>Quantum Processing Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={quantumBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {quantumBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Performance Comparison */}
      {currentMetrics && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '25px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#374151' }}>Algorithm Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="algorithm" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                domain={[0, 100]}
                label={{ value: 'Compression Ratio (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value: any) => [`${value}%`, 'Compression Ratio']}
              />
              <Bar 
                dataKey="ratio" 
                fill="#667eea"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Processing Time Analysis */}
      {data.length > 1 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#374151' }}>Processing Time vs File Size</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={compressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="originalSize" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={formatBytes}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Processing Time (ms)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value: any, name: string) => [
                  name === 'processingTime' ? `${value}ms` : formatBytes(value),
                  name === 'processingTime' ? 'Processing Time' : 'File Size'
                ]}
                labelFormatter={(value) => `File Size: ${formatBytes(Number(value))}`}
              />
              <Line 
                type="monotone" 
                dataKey="processingTime" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};