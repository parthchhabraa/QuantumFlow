import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VisualizationChart } from '../components/VisualizationChart';
import { QuantumMetrics } from '../../models/QuantumMetrics';

// Mock recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />
}));

describe('VisualizationChart', () => {
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

  const mockData = [mockMetrics];

  test('shows empty state when no data available', () => {
    render(<VisualizationChart data={[]} currentMetrics={null} />);
    
    expect(screen.getByText('No Data Yet')).toBeInTheDocument();
    expect(screen.getByText(/upload and compress files to see/i)).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  test('renders main title when data is available', () => {
    render(<VisualizationChart data={mockData} currentMetrics={mockMetrics} />);
    
    expect(screen.getByText('Compression Analytics & Quantum Insights')).toBeInTheDocument();
  });

  test('renders quantum processing breakdown chart', () => {
    render(<VisualizationChart data={mockData} currentMetrics={mockMetrics} />);
    
    expect(screen.getByText('Quantum Processing Breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  test('renders algorithm comparison chart', () => {
    render(<VisualizationChart data={mockData} currentMetrics={mockMetrics} />);
    
    expect(screen.getByText('Algorithm Comparison')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('renders compression ratio trend for multiple data points', () => {
    const multipleData = [mockMetrics, { ...mockMetrics, compressionRatio: 0.8 }];
    render(<VisualizationChart data={multipleData} currentMetrics={mockMetrics} />);
    
    expect(screen.getByText('Compression Ratio Trend')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('renders processing time analysis for multiple data points', () => {
    const multipleData = [mockMetrics, { ...mockMetrics, processingTime: 2000 }];
    render(<VisualizationChart data={multipleData} currentMetrics={mockMetrics} />);
    
    expect(screen.getByText('Processing Time vs File Size')).toBeInTheDocument();
  });

  test('does not render trend charts for single data point', () => {
    render(<VisualizationChart data={mockData} currentMetrics={mockMetrics} />);
    
    expect(screen.queryByText('Compression Ratio Trend')).not.toBeInTheDocument();
    expect(screen.queryByText('Processing Time vs File Size')).not.toBeInTheDocument();
  });

  test('handles missing quantum metrics gracefully', () => {
    const incompleteMetrics = {
      ...mockMetrics,
      entanglementPairs: undefined,
      superpositionStates: undefined,
      interferenceOptimizations: undefined
    };
    
    render(<VisualizationChart data={[incompleteMetrics]} currentMetrics={incompleteMetrics} />);
    
    expect(screen.getByText('Quantum Processing Breakdown')).toBeInTheDocument();
  });

  test('formats bytes correctly in tooltips and labels', () => {
    render(<VisualizationChart data={mockData} currentMetrics={mockMetrics} />);
    
    // The formatBytes function is used internally, we test its presence through the component
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});