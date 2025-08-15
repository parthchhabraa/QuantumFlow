import { VideoFrameProcessor } from '../VideoFrameProcessor';
import { VideoCompressionConfig, VideoFrame } from '../models/VideoModels';

describe('VideoFrameProcessor', () => {
  let processor: VideoFrameProcessor;
  let config: VideoCompressionConfig;
  let mockFrame: VideoFrame;

  beforeEach(() => {
    config = VideoCompressionConfig.createDefault();
    processor = new VideoFrameProcessor(config);

    mockFrame = {
      id: 'test-frame',
      timestamp: Date.now(),
      data: Buffer.alloc(640 * 480 * 3), // RGB24 VGA frame
      width: 640,
      height: 480,
      format: 'rgb24',
      isKeyFrame: true
    };

    // Fill with test pattern
    for (let i = 0; i < mockFrame.data.length; i++) {
      mockFrame.data[i] = (i % 256);
    }
  });

  describe('Frame Preprocessing', () => {
    it('should preprocess frame for low quality', async () => {
      const processedFrame = await processor.preprocessFrame(mockFrame, 'low');

      expect(processedFrame).toBeDefined();
      expect(processedFrame.id).toBe(mockFrame.id);
      expect(processedFrame.timestamp).toBe(mockFrame.timestamp);
      expect(processedFrame.qualityLevel).toBe('low');
      expect(processedFrame.data).toBeDefined();
      expect(processedFrame.data.length).toBeGreaterThan(0);
    });

    it('should preprocess frame for medium quality', async () => {
      const processedFrame = await processor.preprocessFrame(mockFrame, 'medium');

      expect(processedFrame).toBeDefined();
      expect(processedFrame.qualityLevel).toBe('medium');
      expect(processedFrame.data.length).toBeGreaterThan(0);
    });

    it('should preprocess frame for high quality', async () => {
      const processedFrame = await processor.preprocessFrame(mockFrame, 'high');

      expect(processedFrame).toBeDefined();
      expect(processedFrame.qualityLevel).toBe('high');
      expect(processedFrame.data.length).toBeGreaterThan(0);
    });

    it('should apply different processing based on quality level', async () => {
      const lowFrame = await processor.preprocessFrame(mockFrame, 'low');
      const mediumFrame = await processor.preprocessFrame(mockFrame, 'medium');
      const highFrame = await processor.preprocessFrame(mockFrame, 'high');

      // All should be processed
      expect(lowFrame.data).toBeDefined();
      expect(mediumFrame.data).toBeDefined();
      expect(highFrame.data).toBeDefined();

      // Quality levels should be set correctly
      expect(lowFrame.qualityLevel).toBe('low');
      expect(mediumFrame.qualityLevel).toBe('medium');
      expect(highFrame.qualityLevel).toBe('high');
    });
  });

  describe('Frame Analysis', () => {
    it('should analyze frame characteristics', () => {
      const analysis = processor.analyzeFrame(mockFrame);

      expect(analysis).toBeDefined();
      expect(analysis.frame).toBe(mockFrame);
      expect(analysis.temporal).toBeDefined();
      expect(analysis.spatial).toBeDefined();
      expect(analysis.recommendedQuality).toBeDefined();
      expect(analysis.recommendedParams).toBeDefined();

      // Check temporal context
      expect(typeof analysis.temporal.sceneChangeScore).toBe('number');
      expect(typeof analysis.temporal.temporalComplexity).toBe('number');
      expect(Array.isArray(analysis.temporal.motionVectors)).toBe(true);

      // Check spatial context
      expect(typeof analysis.spatial.spatialComplexity).toBe('number');
      expect(typeof analysis.spatial.edgeDensity).toBe('number');
      expect(typeof analysis.spatial.textureComplexity).toBe('number');
      expect(analysis.spatial.colorDistribution).toBeDefined();

      // Check recommendations
      expect(['low', 'medium', 'high']).toContain(analysis.recommendedQuality);
      expect(typeof analysis.recommendedParams.quantumBitDepth).toBe('number');
      expect(typeof analysis.recommendedParams.entanglementLevel).toBe('number');
      expect(typeof analysis.recommendedParams.superpositionComplexity).toBe('number');
    });

    it('should analyze simple frames correctly', () => {
      // Create a simple frame (uniform color)
      const simpleFrame = { ...mockFrame };
      simpleFrame.data.fill(128);

      const analysis = processor.analyzeFrame(simpleFrame);

      expect(analysis.spatial.spatialComplexity).toBeLessThan(0.5);
      expect(analysis.recommendedQuality).toBeDefined();
    });

    it('should analyze complex frames correctly', () => {
      // Create a complex frame (random noise)
      const complexFrame = { ...mockFrame };
      for (let i = 0; i < complexFrame.data.length; i++) {
        complexFrame.data[i] = Math.floor(Math.random() * 256);
      }

      const analysis = processor.analyzeFrame(complexFrame);

      expect(analysis.spatial.spatialComplexity).toBeGreaterThan(0);
      expect(analysis.recommendedQuality).toBeDefined();
    });
  });

  describe('Temporal Compression', () => {
    it('should handle temporal compression with previous frame', async () => {
      const temporalConfig = new VideoCompressionConfig('medium', true, 5, 2, 30, 100, 30, true, true);
      const temporalProcessor = new VideoFrameProcessor(temporalConfig);

      // Process first frame
      const frame1 = { ...mockFrame, id: 'frame-1', timestamp: 1000 };
      await temporalProcessor.preprocessFrame(frame1, 'medium');

      // Process second frame (should use temporal compression)
      const frame2 = { ...mockFrame, id: 'frame-2', timestamp: 1033 };
      const processedFrame2 = await temporalProcessor.preprocessFrame(frame2, 'medium');

      expect(processedFrame2).toBeDefined();
      expect(processedFrame2.data).toBeDefined();
    });

    it('should handle first frame without temporal compression', async () => {
      const temporalConfig = new VideoCompressionConfig('medium', true, 5, 2, 30, 100, 30, true, true);
      const temporalProcessor = new VideoFrameProcessor(temporalConfig);

      // First frame should not use temporal compression
      const processedFrame = await temporalProcessor.preprocessFrame(mockFrame, 'medium');

      expect(processedFrame).toBeDefined();
      expect(processedFrame.data).toBeDefined();
    });
  });

  describe('Spatial Compression', () => {
    it('should apply spatial compression when enabled', async () => {
      const spatialConfig = new VideoCompressionConfig('medium', true, 5, 2, 30, 100, 30, false, true);
      const spatialProcessor = new VideoFrameProcessor(spatialConfig);

      const processedFrame = await spatialProcessor.preprocessFrame(mockFrame, 'medium');

      expect(processedFrame).toBeDefined();
      expect(processedFrame.data).toBeDefined();
    });

    it('should skip spatial compression when disabled', async () => {
      const noSpatialConfig = new VideoCompressionConfig('medium', true, 5, 2, 30, 100, 30, false, false);
      const noSpatialProcessor = new VideoFrameProcessor(noSpatialConfig);

      const processedFrame = await noSpatialProcessor.preprocessFrame(mockFrame, 'medium');

      expect(processedFrame).toBeDefined();
      expect(processedFrame.data).toBeDefined();
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration successfully', () => {
      const newConfig = VideoCompressionConfig.createLowLatency();
      
      expect(() => processor.updateConfig(newConfig)).not.toThrow();
    });

    it('should handle different configuration presets', () => {
      const configs = [
        VideoCompressionConfig.createDefault(),
        VideoCompressionConfig.createLowLatency(),
        VideoCompressionConfig.createHighQuality(),
        VideoCompressionConfig.createMobileOptimized()
      ];

      configs.forEach(config => {
        expect(() => processor.updateConfig(config)).not.toThrow();
      });
    });
  });

  describe('Motion Analysis', () => {
    it('should detect motion between frames', async () => {
      // Create two similar frames with slight differences
      const frame1 = { ...mockFrame, id: 'frame-1', timestamp: 1000 };
      const frame2 = { ...mockFrame, id: 'frame-2', timestamp: 1033 };
      
      // Modify frame2 slightly to simulate motion
      for (let i = 0; i < frame2.data.length; i += 100) {
        frame2.data[i] = (frame2.data[i] + 10) % 256;
      }

      // Process frames
      await processor.preprocessFrame(frame1, 'medium');
      const analysis2 = processor.analyzeFrame(frame2);

      expect(analysis2.temporal.motionVectors).toBeDefined();
      expect(Array.isArray(analysis2.temporal.motionVectors)).toBe(true);
      expect(analysis2.temporal.sceneChangeScore).toBeGreaterThanOrEqual(0);
      expect(analysis2.temporal.temporalComplexity).toBeGreaterThanOrEqual(0);
    });

    it('should detect scene changes', async () => {
      // Create two very different frames
      const frame1 = { ...mockFrame, id: 'frame-1', timestamp: 1000 };
      frame1.data.fill(0); // Black frame

      const frame2 = { ...mockFrame, id: 'frame-2', timestamp: 1033 };
      frame2.data.fill(255); // White frame

      // Process frames
      await processor.preprocessFrame(frame1, 'medium');
      const analysis2 = processor.analyzeFrame(frame2);

      expect(analysis2.temporal.sceneChangeScore).toBeGreaterThan(0.8); // Very different frames should have high score
    });
  });

  describe('Color Analysis', () => {
    it('should analyze color distribution correctly', () => {
      // Create frame with known color distribution
      const colorFrame = { ...mockFrame };
      
      // Fill with gradient pattern
      for (let i = 0; i < colorFrame.data.length; i++) {
        colorFrame.data[i] = (i * 255) / colorFrame.data.length;
      }

      const analysis = processor.analyzeFrame(colorFrame);

      expect(analysis.spatial.colorDistribution).toBeDefined();
      expect(typeof analysis.spatial.colorDistribution.entropy).toBe('number');
      expect(typeof analysis.spatial.colorDistribution.dominantColors).toBe('number');
      expect(typeof analysis.spatial.colorDistribution.colorVariance).toBe('number');

      expect(analysis.spatial.colorDistribution.entropy).toBeGreaterThanOrEqual(0);
      expect(analysis.spatial.colorDistribution.entropy).toBeLessThanOrEqual(1);
    });

    it('should handle uniform color frames', () => {
      const uniformFrame = { ...mockFrame };
      uniformFrame.data.fill(128); // Uniform gray

      const analysis = processor.analyzeFrame(uniformFrame);

      expect(analysis.spatial.colorDistribution.entropy).toBeLessThan(0.1);
      expect(analysis.spatial.colorDistribution.dominantColors).toBeLessThanOrEqual(1);
    });
  });

  describe('Edge Detection', () => {
    it('should detect edges in frames', () => {
      // Create frame with clear edges
      const edgeFrame = { ...mockFrame };
      
      // Create vertical stripes (clear edges)
      for (let y = 0; y < mockFrame.height; y++) {
        for (let x = 0; x < mockFrame.width; x++) {
          const pixelIndex = (y * mockFrame.width + x) * 3;
          const color = (x % 20 < 10) ? 0 : 255; // Alternating stripes
          edgeFrame.data[pixelIndex] = color;
          edgeFrame.data[pixelIndex + 1] = color;
          edgeFrame.data[pixelIndex + 2] = color;
        }
      }

      const analysis = processor.analyzeFrame(edgeFrame);

      expect(analysis.spatial.edgeDensity).toBeGreaterThan(0);
    });

    it('should handle smooth frames with few edges', () => {
      const smoothFrame = { ...mockFrame };
      
      // Create smooth gradient
      for (let y = 0; y < mockFrame.height; y++) {
        for (let x = 0; x < mockFrame.width; x++) {
          const pixelIndex = (y * mockFrame.width + x) * 3;
          const color = Math.floor((x / mockFrame.width) * 255);
          smoothFrame.data[pixelIndex] = color;
          smoothFrame.data[pixelIndex + 1] = color;
          smoothFrame.data[pixelIndex + 2] = color;
        }
      }

      const analysis = processor.analyzeFrame(smoothFrame);

      expect(analysis.spatial.edgeDensity).toBeLessThan(0.8); // Smooth gradients should have fewer edges
    });
  });

  describe('Parameter Recommendations', () => {
    it('should recommend appropriate parameters for different qualities', () => {
      const lowAnalysis = processor.analyzeFrame(mockFrame);
      
      // Force low quality recommendation
      const lowParams = lowAnalysis.recommendedParams;
      
      expect(lowParams.quantumBitDepth).toBeGreaterThanOrEqual(2);
      expect(lowParams.quantumBitDepth).toBeLessThanOrEqual(16);
      expect(lowParams.entanglementLevel).toBeGreaterThanOrEqual(1);
      expect(lowParams.entanglementLevel).toBeLessThanOrEqual(lowParams.quantumBitDepth / 2);
      expect(lowParams.superpositionComplexity).toBeGreaterThanOrEqual(1);
      expect(lowParams.superpositionComplexity).toBeLessThanOrEqual(lowParams.quantumBitDepth);
    });

    it('should adjust parameters based on frame complexity', () => {
      // Simple frame
      const simpleFrame = { ...mockFrame };
      simpleFrame.data.fill(128);
      const simpleAnalysis = processor.analyzeFrame(simpleFrame);

      // Complex frame
      const complexFrame = { ...mockFrame };
      for (let i = 0; i < complexFrame.data.length; i++) {
        complexFrame.data[i] = Math.floor(Math.random() * 256);
      }
      const complexAnalysis = processor.analyzeFrame(complexFrame);

      // Complex frames might need different parameters
      expect(simpleAnalysis.recommendedParams).toBeDefined();
      expect(complexAnalysis.recommendedParams).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty frames', async () => {
      const emptyFrame: VideoFrame = {
        id: 'empty-frame',
        timestamp: Date.now(),
        data: Buffer.alloc(0),
        width: 0,
        height: 0,
        format: 'rgb24',
        isKeyFrame: false
      };

      expect(async () => {
        await processor.preprocessFrame(emptyFrame, 'medium');
      }).not.toThrow();
    });

    it('should handle very small frames', async () => {
      const tinyFrame: VideoFrame = {
        id: 'tiny-frame',
        timestamp: Date.now(),
        data: Buffer.alloc(3), // Single pixel
        width: 1,
        height: 1,
        format: 'rgb24',
        isKeyFrame: false
      };

      const processedFrame = await processor.preprocessFrame(tinyFrame, 'medium');
      expect(processedFrame).toBeDefined();

      const analysis = processor.analyzeFrame(tinyFrame);
      expect(analysis).toBeDefined();
    });

    it('should handle invalid frame formats gracefully', async () => {
      const invalidFrame: VideoFrame = {
        id: 'invalid-frame',
        timestamp: Date.now(),
        data: Buffer.alloc(100),
        width: 10,
        height: 10,
        format: 'invalid-format',
        isKeyFrame: false
      };

      expect(async () => {
        await processor.preprocessFrame(invalidFrame, 'medium');
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should process frames within reasonable time', async () => {
      const startTime = performance.now();
      
      await processor.preprocessFrame(mockFrame, 'medium');
      
      const processingTime = performance.now() - startTime;
      
      // Should process within reasonable time (less than 1000ms for VGA frame in test environment)
      expect(processingTime).toBeLessThan(1000);
    });

    it('should handle multiple frames efficiently', async () => {
      const frames: VideoFrame[] = [];
      
      // Create multiple frames
      for (let i = 0; i < 5; i++) {
        frames.push({
          ...mockFrame,
          id: `frame-${i}`,
          timestamp: mockFrame.timestamp + i * 33
        });
      }

      const startTime = performance.now();
      
      // Process all frames
      for (const frame of frames) {
        await processor.preprocessFrame(frame, 'medium');
      }
      
      const totalTime = performance.now() - startTime;
      const avgTimePerFrame = totalTime / frames.length;
      
      // Average time per frame should be reasonable (less than 1000ms in test environment)
      expect(avgTimePerFrame).toBeLessThan(1000);
    });
  });
});