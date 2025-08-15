import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricsDisplay } from '../components/MetricsDisplay';
import { QuantumMetrics } from '../../models/QuantumMetrics';

describe('MetricsDisplay', () => {
  const mockMetrics: QuantumMetrics = {
    compressionRatio: 0.75,
    processingTime: 1500,
    quantumEfficiency: 0.85,
    originalSize: 1000000,
    compressedSize: 250000,
    entanglementPairs: 42,
    superpositionStates: 128,
    interferenceOptimizations: 15
  };

  test('renders placeholder values when no metrics provided', () => {
    render(<MetricsDisplay metrics={null} isProcessing={false} />);
    
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
  });

  test('displays metrics correctly when provided', () => {
    render(<MetricsDisplay metrics={mockMetrics} isProcessing={false} />);
    
    expect(screen.getByText('75.0%')).toBeInTheDocument();
    expect(screen.getByText('1.5s')).toBeInTheDocument();
    expect(screen.getByText('85.0%')).toBeInTheDocument();
    expect(screen.getByText('976.56 KB')).toBeInTheDocument(); // Original size
    expect(screen.getByText('244.14 KB')).toBeInTheDocument(); // Compressed size
  });

  test('shows loading state when processing', () => {
    render(<MetricsDisplay metrics={null} isProcessing={true} />);
    
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});  test('
displays quantum processing details', () => {
    render(<MetricsDisplay metrics={mockMetrics} isProcessing={false} />);
    
    expect(screen.getByText('Quantum Processing Details')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument(); // Entanglement pairs
    expect(screen.getByText('128')).toBeInTheDocument(); // Superposition states
    expect(screen.getByText('15')).toBeInTheDocument(); // Interference optimizations
  });

  test('formats time correctly for different durations', () => {
    const shortMetrics = { ...mockMetrics, processingTime: 500 };
    const { rerender } = render(<MetricsDisplay metrics={shortMetrics} isProcessing={false} />);
    expect(screen.getByText('500ms')).toBeInTheDocument();
    
    const longMetrics = { ...mockMetrics, processingTime: 65000 };
    rerender(<MetricsDisplay metrics={longMetrics} isProcessing={false} />);
    expect(screen.getByText('1.1m')).toBeInTheDocument();
  });

  test('shows compression rating based on ratio', () => {
    const excellentMetrics = { ...mockMetrics, compressionRatio: 0.9 };
    const { rerender } = render(<MetricsDisplay metrics={excellentMetrics} isProcessing={false} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
    
    const poorMetrics = { ...mockMetrics, compressionRatio: 0.1 };
    rerender(<MetricsDisplay metrics={poorMetrics} isProcessing={false} />);
    expect(screen.getByText('Poor')).toBeInTheDocument();
  });

  test('calculates space saved correctly', () => {
    render(<MetricsDisplay metrics={mockMetrics} isProcessing={false} />);
    
    expect(screen.getByText('Saved 732.42 KB')).toBeInTheDocument();
  });

  test('shows performance warning for slow processing', () => {
    const slowMetrics = { ...mockMetrics, processingTime: 6000 };
    render(<MetricsDisplay metrics={slowMetrics} isProcessing={false} />);
    
    expect(screen.getByText('Consider lower settings')).toBeInTheDocument();
  });

  test('formats bytes correctly for different sizes', () => {
    const smallMetrics = { ...mockMetrics, originalSize: 500, compressedSize: 100 };
    const { rerender } = render(<MetricsDisplay metrics={smallMetrics} isProcessing={false} />);
    expect(screen.getByText('500 B')).toBeInTheDocument();
    
    const largeMetrics = { ...mockMetrics, originalSize: 1073741824, compressedSize: 268435456 };
    rerender(<MetricsDisplay metrics={largeMetrics} isProcessing={false} />);
    expect(screen.getByText('1 GB')).toBeInTheDocument();
  });

  test('handles zero values gracefully', () => {
    const zeroMetrics = { 
      ...mockMetrics, 
      entanglementPairs: 0,
      superpositionStates: 0,
      interferenceOptimizations: 0
    };
    render(<MetricsDisplay metrics={zeroMetrics} isProcessing={false} />);
    
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  test('displays appropriate icons for different ratings', () => {
    const excellentMetrics = { ...mockMetrics, compressionRatio: 0.9 };
    render(<MetricsDisplay metrics={excellentMetrics} isProcessing={false} />);
    
    expect(screen.getByText('🌟')).toBeInTheDocument();
  });
});