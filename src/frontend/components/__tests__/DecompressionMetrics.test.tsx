/**
 * Tests for DecompressionMetrics component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DecompressionMetrics } from '../DecompressionMetrics';

describe('DecompressionMetrics', () => {
  const mockResults = [
    {
      originalFileName: 'test.txt',
      compressedSize: 1000,
      decompressedSize: 3000,
      decompressionTime: 1500,
      quantumIntegrity: 0.98,
      entanglementPairsRestored: 45,
      superpositionStatesCollapsed: 120,
      interferencePatternsMapped: 78,
      timestamp: Date.now()
    }
  ];

  test('renders without crashing with empty results', () => {
    render(<DecompressionMetrics results={[]} />);
    expect(screen.getByText('Quantum Integrity')).toBeInTheDocument();
  });

  test('displays metrics when results are provided', () => {
    render(<DecompressionMetrics results={mockResults} />);
    
    expect(screen.getByText('98.0%')).toBeInTheDocument(); // Quantum Integrity
    expect(screen.getByText('3.0x')).toBeInTheDocument(); // Expansion Ratio
    expect(screen.getByText('1')).toBeInTheDocument(); // Files Restored
  });

  test('displays detailed metrics for current result', () => {
    render(<DecompressionMetrics results={mockResults} currentResult={mockResults[0]} />);
    
    expect(screen.getByText('Quantum Decompression Analysis')).toBeInTheDocument();
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument(); // Entanglement Pairs Restored
  });

  test('displays recent operations', () => {
    render(<DecompressionMetrics results={mockResults} />);
    
    expect(screen.getByText('Recent Decompressions')).toBeInTheDocument();
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  test('handles multiple results correctly', () => {
    const multipleResults = [
      ...mockResults,
      {
        originalFileName: 'test2.txt',
        compressedSize: 2000,
        decompressedSize: 6000,
        decompressionTime: 2000,
        quantumIntegrity: 0.95,
        entanglementPairsRestored: 60,
        superpositionStatesCollapsed: 150,
        interferencePatternsMapped: 90,
        timestamp: Date.now() + 1000
      }
    ];

    render(<DecompressionMetrics results={multipleResults} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // Files Restored count
    // Average integrity should be (0.98 + 0.95) / 2 = 0.965 = 96.5%
    expect(screen.getByText('96.5%')).toBeInTheDocument();
  });

  test('formats file sizes correctly', () => {
    const largeFileResult = [{
      ...mockResults[0],
      compressedSize: 1024 * 1024, // 1 MB
      decompressedSize: 1024 * 1024 * 1024 // 1 GB
    }];

    render(<DecompressionMetrics results={largeFileResult} />);
    
    expect(screen.getByText(/1 MB → 1 GB/)).toBeInTheDocument();
  });

  test('formats time correctly', () => {
    const quickResult = [{
      ...mockResults[0],
      decompressionTime: 500 // 500ms
    }];

    render(<DecompressionMetrics results={quickResult} />);
    
    expect(screen.getByText('500ms')).toBeInTheDocument();
  });
});