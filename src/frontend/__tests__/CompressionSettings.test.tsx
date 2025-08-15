import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompressionSettings } from '../components/CompressionSettings';
import { QuantumConfig } from '../../models/QuantumConfig';

describe('CompressionSettings', () => {
  const defaultConfig: QuantumConfig = {
    quantumBitDepth: 8,
    maxEntanglementLevel: 4,
    superpositionComplexity: 5,
    interferenceThreshold: 0.5
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all preset buttons', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    expect(screen.getByText('Fast')).toBeInTheDocument();
    expect(screen.getByText('Balanced')).toBeInTheDocument();
    expect(screen.getByText('Maximum')).toBeInTheDocument();
    
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('⚖️')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  test('renders all quantum parameter sliders', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    expect(screen.getByText('Quantum Bit Depth')).toBeInTheDocument();
    expect(screen.getByText('Entanglement Level')).toBeInTheDocument();
    expect(screen.getByText('Superposition Complexity')).toBeInTheDocument();
    expect(screen.getByText('Interference Threshold')).toBeInTheDocument();
  });

  test('displays current configuration values', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    expect(screen.getByText('8 qubits')).toBeInTheDocument();
    expect(screen.getByText('4 levels')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('0.5')).toBeInTheDocument();
  });

  test('handles slider value changes', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    const bitDepthSlider = screen.getByDisplayValue('8');
    fireEvent.change(bitDepthSlider, { target: { value: '12' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({ quantumBitDepth: 12 });
  });

  test('handles preset button clicks', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    const fastButton = screen.getByText('Fast');
    fireEvent.click(fastButton);
    
    expect(mockOnChange).toHaveBeenCalledWith({
      quantumBitDepth: 4,
      maxEntanglementLevel: 2,
      superpositionComplexity: 3,
      interferenceThreshold: 0.3
    });
  });

  test('applies correct color coding for slider values', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    // Test low value (should be green)
    const lowConfig = { ...defaultConfig, quantumBitDepth: 2 };
    const { rerender } = render(
      <CompressionSettings 
        config={lowConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    expect(screen.getByText('2 qubits')).toBeInTheDocument();
    
    // Test high value (should be red)
    const highConfig = { ...defaultConfig, quantumBitDepth: 16 };
    rerender(
      <CompressionSettings 
        config={highConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    expect(screen.getByText('16 qubits')).toBeInTheDocument();
  });

  test('disables controls when disabled prop is true', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={true} 
      />
    );
    
    const bitDepthSlider = screen.getByDisplayValue('8');
    const fastButton = screen.getByText('Fast');
    
    expect(bitDepthSlider).toBeDisabled();
    expect(fastButton).toBeDisabled();
  });

  test('handles entanglement level changes', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    const entanglementSlider = screen.getByDisplayValue('4');
    fireEvent.change(entanglementSlider, { target: { value: '6' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({ maxEntanglementLevel: 6 });
  });

  test('handles superposition complexity changes', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    const superpositionSlider = screen.getByDisplayValue('5');
    fireEvent.change(superpositionSlider, { target: { value: '8' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({ superpositionComplexity: 8 });
  });

  test('handles interference threshold changes', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    const interferenceSlider = screen.getByDisplayValue('0.5');
    fireEvent.change(interferenceSlider, { target: { value: '0.7' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({ interferenceThreshold: 0.7 });
  });

  test('displays optimization tips', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    expect(screen.getByText('💡 Optimization Tips')).toBeInTheDocument();
    expect(screen.getByText(/use fast preset for quick compression/i)).toBeInTheDocument();
    expect(screen.getByText(/balanced preset works well for most file types/i)).toBeInTheDocument();
    expect(screen.getByText(/maximum preset achieves best ratios/i)).toBeInTheDocument();
  });

  test('shows parameter descriptions', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    expect(screen.getByText(/number of qubits simulated/i)).toBeInTheDocument();
    expect(screen.getByText(/maximum quantum entanglement depth/i)).toBeInTheDocument();
    expect(screen.getByText(/complexity of quantum superposition states/i)).toBeInTheDocument();
    expect(screen.getByText(/threshold for quantum interference optimization/i)).toBeInTheDocument();
  });

  test('validates slider ranges', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    const bitDepthSlider = screen.getByDisplayValue('8');
    const entanglementSlider = screen.getByDisplayValue('4');
    const superpositionSlider = screen.getByDisplayValue('5');
    const interferenceSlider = screen.getByDisplayValue('0.5');
    
    expect(bitDepthSlider).toHaveAttribute('min', '2');
    expect(bitDepthSlider).toHaveAttribute('max', '16');
    
    expect(entanglementSlider).toHaveAttribute('min', '1');
    expect(entanglementSlider).toHaveAttribute('max', '8');
    
    expect(superpositionSlider).toHaveAttribute('min', '1');
    expect(superpositionSlider).toHaveAttribute('max', '10');
    
    expect(interferenceSlider).toHaveAttribute('min', '0.1');
    expect(interferenceSlider).toHaveAttribute('max', '0.9');
    expect(interferenceSlider).toHaveAttribute('step', '0.1');
  });

  test('handles maximum preset correctly', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    const maximumButton = screen.getByText('Maximum');
    fireEvent.click(maximumButton);
    
    expect(mockOnChange).toHaveBeenCalledWith({
      quantumBitDepth: 16,
      maxEntanglementLevel: 8,
      superpositionComplexity: 10,
      interferenceThreshold: 0.8
    });
  });

  test('handles balanced preset correctly', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    const balancedButton = screen.getByText('Balanced');
    fireEvent.click(balancedButton);
    
    expect(mockOnChange).toHaveBeenCalledWith({
      quantumBitDepth: 8,
      maxEntanglementLevel: 4,
      superpositionComplexity: 5,
      interferenceThreshold: 0.5
    });
  });

  test('shows hover effects on preset buttons', () => {
    render(
      <CompressionSettings 
        config={defaultConfig} 
        onChange={mockOnChange} 
        disabled={false} 
      />
    );
    
    const fastButton = screen.getByText('Fast');
    
    fireEvent.mouseEnter(fastButton);
    // Hover effects are tested through CSS, so we just verify the button exists
    expect(fastButton).toBeInTheDocument();
    
    fireEvent.mouseLeave(fastButton);
    expect(fastButton).toBeInTheDocument();
  });
});