import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VideoSettings } from '../VideoSettings';
import { VideoCompressionConfig } from '../../../video/models/VideoModels';

describe('VideoSettings', () => {
  const mockOnSettingsChange = jest.fn();
  const mockOnClose = jest.fn();
  
  const defaultSettings = VideoCompressionConfig.createDefault();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders video settings correctly', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Video Settings')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('Compression')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
  });

  it('shows quality settings by default', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Video Quality')).toBeInTheDocument();
    expect(screen.getByText('Base Quality')).toBeInTheDocument();
    expect(screen.getByText('Target Frame Rate')).toBeInTheDocument();
    expect(screen.getByText('Max Latency')).toBeInTheDocument();
    expect(screen.getByText('Adaptive Quality')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    // Click compression tab
    const compressionTab = screen.getByText('Compression');
    fireEvent.click(compressionTab);

    expect(screen.getByText('Quantum Compression')).toBeInTheDocument();
    expect(screen.getByText('Compression Level')).toBeInTheDocument();

    // Click network tab
    const networkTab = screen.getByText('Network');
    fireEvent.click(networkTab);

    expect(screen.getByText('Network Optimization')).toBeInTheDocument();
    expect(screen.getByText('Bandwidth Threshold')).toBeInTheDocument();
  });

  it('updates base quality setting', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    const qualitySelect = screen.getByDisplayValue('Medium (720p)');
    fireEvent.change(qualitySelect, { target: { value: 'high' } });

    expect(mockOnSettingsChange).toHaveBeenCalledWith({ baseQuality: 'high' });
  });

  it('updates frame rate with slider', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    const frameRateSlider = screen.getByDisplayValue('30');
    fireEvent.change(frameRateSlider, { target: { value: '60' } });

    expect(mockOnSettingsChange).toHaveBeenCalledWith({ targetFrameRate: 60 });
  });

  it('updates max latency with slider', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    const latencySlider = screen.getByDisplayValue('100');
    fireEvent.change(latencySlider, { target: { value: '200' } });

    expect(mockOnSettingsChange).toHaveBeenCalledWith({ maxLatency: 200 });
  });

  it('toggles adaptive quality checkbox', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    const adaptiveCheckbox = screen.getByLabelText('Adaptive Quality');
    fireEvent.click(adaptiveCheckbox);

    expect(mockOnSettingsChange).toHaveBeenCalledWith({ adaptiveQuality: false });
  });

  it('updates quantum compression level', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    // Switch to compression tab
    const compressionTab = screen.getByText('Compression');
    fireEvent.click(compressionTab);

    const compressionSlider = screen.getByDisplayValue('5');
    fireEvent.change(compressionSlider, { target: { value: '8' } });

    expect(mockOnSettingsChange).toHaveBeenCalledWith({ quantumCompressionLevel: 8 });
  });

  it('updates key frame interval', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    // Switch to compression tab
    const compressionTab = screen.getByText('Compression');
    fireEvent.click(compressionTab);

    const keyFrameSlider = screen.getByDisplayValue('30');
    fireEvent.change(keyFrameSlider, { target: { value: '60' } });

    expect(mockOnSettingsChange).toHaveBeenCalledWith({ keyFrameInterval: 60 });
  });

  it('toggles temporal compression', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    // Switch to compression tab
    const compressionTab = screen.getByText('Compression');
    fireEvent.click(compressionTab);

    const temporalCheckbox = screen.getByLabelText('Temporal Compression');
    fireEvent.click(temporalCheckbox);

    expect(mockOnSettingsChange).toHaveBeenCalledWith({ enableTemporalCompression: false });
  });

  it('toggles spatial compression', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    // Switch to compression tab
    const compressionTab = screen.getByText('Compression');
    fireEvent.click(compressionTab);

    const spatialCheckbox = screen.getByLabelText('Spatial Compression');
    fireEvent.click(spatialCheckbox);

    expect(mockOnSettingsChange).toHaveBeenCalledWith({ enableSpatialCompression: false });
  });

  it('updates bandwidth threshold', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    // Switch to network tab
    const networkTab = screen.getByText('Network');
    fireEvent.click(networkTab);

    const bandwidthSlider = screen.getByDisplayValue('2');
    fireEvent.change(bandwidthSlider, { target: { value: '5' } });

    expect(mockOnSettingsChange).toHaveBeenCalledWith({ bandwidthThreshold: 5 });
  });

  it('shows current performance metrics', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    // Switch to network tab
    const networkTab = screen.getByText('Network');
    fireEvent.click(networkTab);

    expect(screen.getByText('Current Performance')).toBeInTheDocument();
    expect(screen.getByText('Estimated Compression')).toBeInTheDocument();
    expect(screen.getByText('Processing Overhead')).toBeInTheDocument();
    expect(screen.getByText('Quality Score')).toBeInTheDocument();
  });

  it('applies low-latency preset', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    const lowLatencyButton = screen.getByText('Low Latency');
    fireEvent.click(lowLatencyButton);

    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        baseQuality: 'medium',
        quantumCompressionLevel: 3,
        maxLatency: 50,
        enableTemporalCompression: false,
      })
    );
  });

  it('applies high-quality preset', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    const highQualityButton = screen.getByText('High Quality');
    fireEvent.click(highQualityButton);

    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        baseQuality: 'high',
        quantumCompressionLevel: 8,
        adaptiveQuality: false,
        targetFrameRate: 60,
      })
    );
  });

  it('applies mobile preset', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    const mobileButton = screen.getByText('Mobile');
    fireEvent.click(mobileButton);

    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        baseQuality: 'low',
        quantumCompressionLevel: 4,
        bandwidthThreshold: 0.5,
        targetFrameRate: 24,
      })
    );
  });

  it('resets to defaults', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    const resetButton = screen.getByText('Reset to Defaults');
    fireEvent.click(resetButton);

    expect(mockOnSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        baseQuality: 'medium',
        adaptiveQuality: true,
        quantumCompressionLevel: 5,
        bandwidthThreshold: 2,
      })
    );
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('works without onClose prop', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );

    // Should render without close button
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('displays slider values correctly', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('30 fps')).toBeInTheDocument();
    expect(screen.getByText('100 ms')).toBeInTheDocument();

    // Switch to compression tab
    const compressionTab = screen.getByText('Compression');
    fireEvent.click(compressionTab);

    expect(screen.getByText('5/10')).toBeInTheDocument();
    expect(screen.getByText('30 frames')).toBeInTheDocument();

    // Switch to network tab
    const networkTab = screen.getByText('Network');
    fireEvent.click(networkTab);

    expect(screen.getByText('2 Mbps')).toBeInTheDocument();
  });

  it('shows setting descriptions', () => {
    render(
      <VideoSettings
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Automatically adjust quality based on network conditions')).toBeInTheDocument();

    // Switch to compression tab
    const compressionTab = screen.getByText('Compression');
    fireEvent.click(compressionTab);

    expect(screen.getByText('Higher levels provide better compression but require more processing power')).toBeInTheDocument();
    expect(screen.getByText('Compress based on motion between frames')).toBeInTheDocument();
    expect(screen.getByText('Compress based on patterns within frames')).toBeInTheDocument();

    // Switch to network tab
    const networkTab = screen.getByText('Network');
    fireEvent.click(networkTab);

    expect(screen.getByText('Minimum bandwidth required for current quality level')).toBeInTheDocument();
  });

  it('calculates performance metrics correctly', () => {
    const customSettings = new VideoCompressionConfig();
    customSettings.quantumCompressionLevel = 8;

    render(
      <VideoSettings
        settings={customSettings}
        onSettingsChange={mockOnSettingsChange}
        onClose={mockOnClose}
      />
    );

    // Switch to network tab
    const networkTab = screen.getByText('Network');
    fireEvent.click(networkTab);

    // Check calculated values based on compression level 8
    expect(screen.getByText('4.4x')).toBeInTheDocument(); // 8 * 0.3 + 2 = 4.4
    expect(screen.getByText('50ms')).toBeInTheDocument(); // 8 * 5 + 10 = 50
    expect(screen.getByText('84%')).toBeInTheDocument(); // min(100, 8 * 8 + 20) = 84
  });
});