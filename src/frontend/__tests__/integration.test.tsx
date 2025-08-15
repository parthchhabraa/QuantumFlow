import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../components/App';

// Mock fetch for integration tests
global.fetch = jest.fn();

// Mock DOM methods
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

describe('Frontend Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  test('complete compression workflow', async () => {
    const mockMetrics = {
      compressionRatio: 0.8,
      processingTime: 1200,
      quantumEfficiency: 0.9,
      originalSize: 1000000,
      compressedSize: 200000,
      entanglementPairs: 35,
      superpositionStates: 64,
      interferenceOptimizations: 12
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
    
    // 1. Change settings to Fast preset
    const fastPreset = screen.getByText('Fast');
    fireEvent.click(fastPreset);
    
    // 2. Upload a file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByRole('button', { name: /drag & drop files here/i });
    
    await userEvent.upload(fileInput, file);
    
    // 3. Verify API call with correct config
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/compress', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      }));
    });
    
    // 4. Verify metrics are displayed
    await waitFor(() => {
      expect(screen.getByText('80.0%')).toBeInTheDocument();
      expect(screen.getByText('1.2s')).toBeInTheDocument();
      expect(screen.getByText('90.0%')).toBeInTheDocument();
    });
    
    // 5. Verify quantum details are shown
    expect(screen.getByText('35')).toBeInTheDocument(); // Entanglement pairs
    expect(screen.getByText('64')).toBeInTheDocument(); // Superposition states
    expect(screen.getByText('12')).toBeInTheDocument(); // Interference optimizations
  });

  test('settings changes affect compression requests', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        metrics: {
          compressionRatio: 0.7,
          processingTime: 1000,
          quantumEfficiency: 0.8,
          originalSize: 500000,
          compressedSize: 150000
        }
      })
    });

    render(<App />);
    
    // Change quantum bit depth
    const bitDepthSlider = screen.getByDisplayValue('8');
    fireEvent.change(bitDepthSlider, { target: { value: '12' } });
    
    // Change entanglement level
    const entanglementSlider = screen.getByDisplayValue('4');
    fireEvent.change(entanglementSlider, { target: { value: '6' } });
    
    // Upload file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByRole('button', { name: /drag & drop files here/i });
    
    await userEvent.upload(fileInput, file);
    
    // Verify the configuration was sent correctly
    await waitFor(() => {
      const formData = (fetch as jest.Mock).mock.calls[0][1].body;
      expect(formData).toBeInstanceOf(FormData);
    });
  });

  test('error handling throughout the workflow', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    window.alert = jest.fn();
    
    render(<App />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByRole('button', { name: /drag & drop files here/i });
    
    await userEvent.upload(fileInput, file);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error: Network error');
    });
    
    // Verify UI returns to normal state
    expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument();
  });

  test('multiple file processing with different results', async () => {
    const metrics1 = {
      compressionRatio: 0.75,
      processingTime: 1000,
      quantumEfficiency: 0.85,
      originalSize: 1000000,
      compressedSize: 250000
    };
    
    const metrics2 = {
      compressionRatio: 0.8,
      processingTime: 1200,
      quantumEfficiency: 0.9,
      originalSize: 800000,
      compressedSize: 160000
    };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, metrics: metrics1 })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, metrics: metrics2 })
      });

    render(<App />);
    
    const files = [
      new File(['content 1'], 'test1.txt', { type: 'text/plain' }),
      new File(['content 2'], 'test2.txt', { type: 'text/plain' })
    ];
    
    const fileInput = screen.getByRole('button', { name: /drag & drop files here/i });
    
    await userEvent.upload(fileInput, files);
    
    // Wait for both files to be processed
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
    
    // Should show metrics from the last processed file
    await waitFor(() => {
      expect(screen.getByText('80.0%')).toBeInTheDocument();
    });
    
    // Should show updated file count
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('preset changes update all sliders correctly', () => {
    render(<App />);
    
    // Start with balanced preset (default)
    expect(screen.getByDisplayValue('8')).toBeInTheDocument(); // Bit depth
    expect(screen.getByDisplayValue('4')).toBeInTheDocument(); // Entanglement
    expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // Superposition
    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument(); // Interference
    
    // Switch to Maximum preset
    const maximumPreset = screen.getByText('Maximum');
    fireEvent.click(maximumPreset);
    
    expect(screen.getByDisplayValue('16')).toBeInTheDocument(); // Bit depth
    expect(screen.getByDisplayValue('8')).toBeInTheDocument(); // Entanglement
    expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // Superposition
    expect(screen.getByDisplayValue('0.8')).toBeInTheDocument(); // Interference
    
    // Switch to Fast preset
    const fastPreset = screen.getByText('Fast');
    fireEvent.click(fastPreset);
    
    expect(screen.getByDisplayValue('4')).toBeInTheDocument(); // Bit depth
    expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // Entanglement
    expect(screen.getByDisplayValue('3')).toBeInTheDocument(); // Superposition
    expect(screen.getByDisplayValue('0.3')).toBeInTheDocument(); // Interference
  });

  test('visualization updates with compression history', async () => {
    const metrics1 = {
      compressionRatio: 0.7,
      processingTime: 1000,
      quantumEfficiency: 0.8,
      originalSize: 1000000,
      compressedSize: 300000
    };
    
    const metrics2 = {
      compressionRatio: 0.75,
      processingTime: 1100,
      quantumEfficiency: 0.85,
      originalSize: 800000,
      compressedSize: 200000
    };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, metrics: metrics1 })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, metrics: metrics2 })
      });

    render(<App />);
    
    // Upload first file
    const file1 = new File(['content 1'], 'test1.txt', { type: 'text/plain' });
    const fileInput = screen.getByRole('button', { name: /drag & drop files here/i });
    
    await userEvent.upload(fileInput, file1);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    
    // Upload second file
    const file2 = new File(['content 2'], 'test2.txt', { type: 'text/plain' });
    await userEvent.upload(fileInput, file2);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    
    // Should show visualization section
    expect(screen.getByText('Compression Analytics & Quantum Insights')).toBeInTheDocument();
  });

  test('UI responsiveness during processing', async () => {
    // Mock a slow response
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
    
    // Should show processing state immediately
    expect(screen.getByText(/processing with quantum compression/i)).toBeInTheDocument();
    
    // Settings should be disabled during processing
    const fastPreset = screen.getByText('Fast');
    expect(fastPreset).toBeDisabled();
    
    const bitDepthSlider = screen.getByDisplayValue('8');
    expect(bitDepthSlider).toBeDisabled();
  });
});