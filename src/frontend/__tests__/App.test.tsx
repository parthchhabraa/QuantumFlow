import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../components/App';

// Mock fetch
global.fetch = jest.fn();

// Mock file creation for downloads
Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockImplementation((tagName) => {
    if (tagName === 'a') {
      return {
        href: '',
        download: '',
        click: jest.fn(),
        style: {},
      };
    }
    return document.createElement(tagName);
  }),
});

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn(),
});

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn(),
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  test('renders main components', () => {
    render(<App />);
    
    expect(screen.getByText('File Upload')).toBeInTheDocument();
    expect(screen.getByText('Quantum Compression Settings')).toBeInTheDocument();
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
  });

  test('displays initial metrics as placeholder values', () => {
    render(<App />);
    
    expect(screen.getByText('--')).toBeInTheDocument(); // Compression ratio
    expect(screen.getByText('0')).toBeInTheDocument(); // Files processed
  });

  test('handles successful file upload and compression', async () => {
    const mockMetrics = {
      compressionRatio: 0.75,
      processingTime: 1500,
      quantumEfficiency: 0.85,
      originalSize: 1000000,
      compressedSize: 250000,
      entanglementPairs: 42,
      superpositionStates: 128,
      interferenceOptimizations: 15
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        metrics: mockMetrics,
        downloadUrl: '/download/test-file.qf'
      })
    });

    render(<App />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByRole('button', { name: /drag & drop files here/i });
    
    // Simulate file upload
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/compress', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      }));
    });

    // Check if metrics are updated
    await waitFor(() => {
      expect(screen.getByText('75.0%')).toBeInTheDocument();
      expect(screen.getByText('1.5s')).toBeInTheDocument();
      expect(screen.getByText('85.0%')).toBeInTheDocument();
    });
  });

  test('handles compression error gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error'
    });

    // Mock alert
    window.alert = jest.fn();

    render(<App />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByRole('button', { name: /drag & drop files here/i });
    
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error: Compression failed: Internal Server Error');
    });
  });

  test('updates configuration when settings change', async () => {
    render(<App />);
    
    const bitDepthSlider = screen.getByLabelText(/quantum bit depth/i);
    
    fireEvent.change(bitDepthSlider, { target: { value: '12' } });
    
    expect(bitDepthSlider).toHaveValue('12');
  });

  test('applies preset configurations correctly', async () => {
    render(<App />);
    
    const fastPresetButton = screen.getByText('Fast');
    
    fireEvent.click(fastPresetButton);
    
    // Check if sliders are updated to fast preset values
    const bitDepthSlider = screen.getByLabelText(/quantum bit depth/i);
    expect(bitDepthSlider).toHaveValue('4');
  });

  test('disables upload during processing', async () => {
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, metrics: {} })
      }), 1000))
    );

    render(<App />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByRole('button', { name: /drag & drop files here/i });
    
    await userEvent.upload(fileInput, file);
    
    // Check if upload is disabled during processing
    expect(screen.getByText(/processing with quantum compression/i)).toBeInTheDocument();
  });

  test('handles multiple file uploads sequentially', async () => {
    const mockMetrics = {
      compressionRatio: 0.8,
      processingTime: 1000,
      quantumEfficiency: 0.9,
      originalSize: 500000,
      compressedSize: 100000
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        metrics: mockMetrics
      })
    });

    render(<App />);
    
    const files = [
      new File(['content 1'], 'test1.txt', { type: 'text/plain' }),
      new File(['content 2'], 'test2.txt', { type: 'text/plain' })
    ];
    
    const fileInput = screen.getByRole('button', { name: /drag & drop files here/i });
    
    await userEvent.upload(fileInput, files);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('validates configuration parameters', () => {
    render(<App />);
    
    const interferenceSlider = screen.getByLabelText(/interference threshold/i);
    
    // Test boundary values
    fireEvent.change(interferenceSlider, { target: { value: '0.1' } });
    expect(interferenceSlider).toHaveValue('0.1');
    
    fireEvent.change(interferenceSlider, { target: { value: '0.9' } });
    expect(interferenceSlider).toHaveValue('0.9');
  });

  test('displays compression history in visualization', async () => {
    const mockMetrics1 = {
      compressionRatio: 0.7,
      processingTime: 1200,
      quantumEfficiency: 0.8,
      originalSize: 1000000,
      compressedSize: 300000
    };

    const mockMetrics2 = {
      compressionRatio: 0.75,
      processingTime: 1100,
      quantumEfficiency: 0.85,
      originalSize: 800000,
      compressedSize: 200000
    };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, metrics: mockMetrics1 })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, metrics: mockMetrics2 })
      });

    render(<App />);
    
    const file1 = new File(['content 1'], 'test1.txt', { type: 'text/plain' });
    const file2 = new File(['content 2'], 'test2.txt', { type: 'text/plain' });
    const fileInput = screen.getByRole('button', { name: /drag & drop files here/i });
    
    await userEvent.upload(fileInput, file1);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    
    await userEvent.upload(fileInput, file2);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    
    // Check if visualization shows multiple data points
    expect(screen.getByText('Compression Analytics & Quantum Insights')).toBeInTheDocument();
  });
});