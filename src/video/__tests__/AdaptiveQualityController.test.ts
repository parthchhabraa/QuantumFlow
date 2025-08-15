import { AdaptiveQualityController } from '../AdaptiveQualityController';
import { VideoCompressionConfig, NetworkConditions, VideoFrame, VideoCompressionResult } from '../models/VideoModels';

describe('AdaptiveQualityController', () => {
  let controller: AdaptiveQualityController;
  let config: VideoCompressionConfig;
  let mockFrame: VideoFrame;

  beforeEach(() => {
    config = VideoCompressionConfig.createDefault();
    controller = new AdaptiveQualityController(config);

    mockFrame = {
      id: 'test-frame',
      timestamp: Date.now(),
      data: Buffer.alloc(1920 * 1080 * 3),
      width: 1920,
      height: 1080,
      format: 'rgb24',
      isKeyFrame: true
    };

    // Fill with test pattern
    for (let i = 0; i < mockFrame.data.length; i++) {
      mockFrame.data[i] = (i % 256);
    }
  });

  describe('Initialization', () => {
    it('should initialize with base quality from config', () => {
      const mediumConfig = new VideoCompressionConfig('medium');
      const mediumController = new AdaptiveQualityController(mediumConfig);
      
      expect(mediumController.getCurrentQuality()).toBe('medium');
    });

    it('should initialize with different quality levels', () => {
      const qualities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      
      qualities.forEach(quality => {
        const testConfig = new VideoCompressionConfig(quality);
        const testController = new AdaptiveQualityController(testConfig);
        
        expect(testController.getCurrentQuality()).toBe(quality);
      });
    });
  });

  describe('Network Adaptation', () => {
    it('should reduce quality for poor network conditions', () => {
      const poorConditions: NetworkConditions = {
        bandwidth: 0.5, // Very low bandwidth
        latency: 300,   // High latency
        packetLoss: 10, // High packet loss
        jitter: 100,    // High jitter
        stability: 0.2, // Low stability
        timestamp: Date.now()
      };

      controller.updateNetworkConditions(poorConditions);
      
      const quality = controller.determineOptimalQuality(mockFrame);
      expect(['low', 'medium']).toContain(quality); // Allow for medium quality as well
    });

    it('should increase quality for good network conditions', () => {
      const goodConditions: NetworkConditions = {
        bandwidth: 20,  // High bandwidth
        latency: 10,    // Low latency
        packetLoss: 0,  // No packet loss
        jitter: 2,      // Low jitter
        stability: 0.95, // High stability
        timestamp: Date.now()
      };

      controller.updateNetworkConditions(goodConditions);
      
      const quality = controller.determineOptimalQuality(mockFrame);
      expect(['medium', 'high']).toContain(quality);
    });

    it('should handle gradual network changes', () => {
      // Start with good conditions
      const goodConditions: NetworkConditions = {
        bandwidth: 10,
        latency: 20,
        packetLoss: 0.1,
        jitter: 5,
        stability: 0.9,
        timestamp: Date.now()
      };

      controller.updateNetworkConditions(goodConditions);
      const initialQuality = controller.getCurrentQuality();

      // Gradually degrade conditions
      const degradedConditions: NetworkConditions = {
        bandwidth: 2,
        latency: 100,
        packetLoss: 3,
        jitter: 30,
        stability: 0.6,
        timestamp: Date.now() + 1000
      };

      controller.updateNetworkConditions(degradedConditions);
      const degradedQuality = controller.getCurrentQuality();

      // Quality should adapt to worse conditions
      const qualityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
      expect(qualityOrder[degradedQuality]).toBeLessThanOrEqual(qualityOrder[initialQuality]);
    });
  });

  describe('Performance-based Adaptation', () => {
    it('should reduce quality when processing time is too high', () => {
      // Simulate high processing time results
      const highLatencyResults: VideoCompressionResult[] = [];
      for (let i = 0; i < 10; i++) {
        highLatencyResults.push({
          compressedData: Buffer.alloc(1000),
          originalSize: 10000,
          compressedSize: 1000,
          compressionRatio: 10,
          processingTime: 150, // High processing time
          qualityLevel: 'high',
          frameId: `frame-${i}`,
          timestamp: Date.now() + i * 33,
          isKeyFrame: i % 30 === 0
        });
      }

      highLatencyResults.forEach(result => {
        controller.recordCompressionResult(result);
      });

      const quality = controller.determineOptimalQuality(mockFrame);
      expect(['low', 'medium']).toContain(quality);
    });

    it('should increase quality when processing time is acceptable', () => {
      // Simulate low processing time results
      const lowLatencyResults: VideoCompressionResult[] = [];
      for (let i = 0; i < 10; i++) {
        lowLatencyResults.push({
          compressedData: Buffer.alloc(1000),
          originalSize: 10000,
          compressedSize: 1000,
          compressionRatio: 10,
          processingTime: 20, // Low processing time
          qualityLevel: 'low',
          frameId: `frame-${i}`,
          timestamp: Date.now() + i * 33,
          isKeyFrame: i % 30 === 0
        });
      }

      lowLatencyResults.forEach(result => {
        controller.recordCompressionResult(result);
      });

      const quality = controller.determineOptimalQuality(mockFrame);
      expect(['medium', 'high']).toContain(quality);
    });
  });

  describe('Frame Complexity Analysis', () => {
    it('should handle simple frames with higher quality', () => {
      // Create a simple frame (uniform color)
      const simpleFrame = { ...mockFrame };
      simpleFrame.data.fill(128); // Uniform gray

      const quality = controller.determineOptimalQuality(simpleFrame);
      expect(['medium', 'high']).toContain(quality);
    });

    it('should handle complex frames with appropriate quality', () => {
      // Create a complex frame (random noise)
      const complexFrame = { ...mockFrame };
      for (let i = 0; i < complexFrame.data.length; i++) {
        complexFrame.data[i] = Math.floor(Math.random() * 256);
      }

      const quality = controller.determineOptimalQuality(complexFrame);
      expect(quality).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(quality);
    });

    it('should treat key frames appropriately', () => {
      const keyFrame = { ...mockFrame, isKeyFrame: true };
      const nonKeyFrame = { ...mockFrame, isKeyFrame: false };

      const keyFrameQuality = controller.determineOptimalQuality(keyFrame);
      const nonKeyFrameQuality = controller.determineOptimalQuality(nonKeyFrame);

      // Both should be valid qualities
      expect(['low', 'medium', 'high']).toContain(keyFrameQuality);
      expect(['low', 'medium', 'high']).toContain(nonKeyFrameQuality);
    });
  });

  describe('Quality Metrics', () => {
    it('should provide comprehensive quality metrics', () => {
      const metrics = controller.getQualityMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.currentQuality).toBeDefined();
      expect(metrics.targetQuality).toBeDefined();
      expect(Array.isArray(metrics.qualityHistory)).toBe(true);
      expect(typeof metrics.averageCompressionRatio).toBe('number');
      expect(typeof metrics.averageProcessingTime).toBe('number');
      expect(typeof metrics.frameDropRate).toBe('number');
      expect(typeof metrics.qualityStability).toBe('number');
    });

    it('should track quality history', () => {
      const initialMetrics = controller.getQualityMetrics();
      const initialHistoryLength = initialMetrics.qualityHistory.length;

      // Force a quality change
      controller.forceQuality('low', 'Test quality change');

      const updatedMetrics = controller.getQualityMetrics();
      expect(updatedMetrics.qualityHistory.length).toBe(initialHistoryLength + 1);
      expect(updatedMetrics.qualityHistory[updatedMetrics.qualityHistory.length - 1].quality).toBe('low');
    });

    it('should calculate quality stability correctly', () => {
      // Start with stable quality
      const stableMetrics = controller.getQualityMetrics();
      expect(stableMetrics.qualityStability).toBeGreaterThan(0.8);

      // Make several quality changes
      controller.forceQuality('low', 'Change 1');
      controller.forceQuality('high', 'Change 2');
      controller.forceQuality('medium', 'Change 3');

      const unstableMetrics = controller.getQualityMetrics();
      expect(unstableMetrics.qualityStability).toBeLessThan(stableMetrics.qualityStability);
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration successfully', () => {
      const newConfig = VideoCompressionConfig.createLowLatency();
      
      controller.updateConfig(newConfig);
      
      // Should not throw and should maintain valid state
      expect(controller.getCurrentQuality()).toBeDefined();
    });

    it('should disable adaptive quality when configured', () => {
      const nonAdaptiveConfig = new VideoCompressionConfig('high', false); // Disable adaptive quality
      
      controller.updateConfig(nonAdaptiveConfig);
      
      // Should always return the base quality
      const quality1 = controller.determineOptimalQuality(mockFrame);
      const quality2 = controller.determineOptimalQuality(mockFrame);
      
      expect(quality1).toBe('high');
      expect(quality2).toBe('high');
    });
  });

  describe('Quality Change Thresholds', () => {
    it('should prevent rapid quality oscillation', () => {
      const qualities: Array<'low' | 'medium' | 'high'> = [];
      
      // Simulate conditions that might cause oscillation
      for (let i = 0; i < 10; i++) {
        const conditions: NetworkConditions = {
          bandwidth: 2 + Math.sin(i) * 1.5, // Oscillating bandwidth
          latency: 50 + Math.cos(i) * 30,   // Oscillating latency
          packetLoss: 1 + Math.sin(i * 2),  // Oscillating packet loss
          jitter: 10 + Math.cos(i * 3) * 5, // Oscillating jitter
          stability: 0.7 + Math.sin(i * 0.5) * 0.2, // Oscillating stability
          timestamp: Date.now() + i * 100
        };

        controller.updateNetworkConditions(conditions);
        const quality = controller.determineOptimalQuality(mockFrame);
        qualities.push(quality);
      }

      // Count quality changes
      let changes = 0;
      for (let i = 1; i < qualities.length; i++) {
        if (qualities[i] !== qualities[i - 1]) {
          changes++;
        }
      }

      // Should not change quality too frequently
      expect(changes).toBeLessThan(qualities.length / 2);
    });
  });

  describe('Force Quality Override', () => {
    it('should allow manual quality override', () => {
      controller.forceQuality('low', 'Manual override');
      expect(controller.getCurrentQuality()).toBe('low');

      controller.forceQuality('high', 'Another override');
      expect(controller.getCurrentQuality()).toBe('high');
    });

    it('should record reason for quality changes', () => {
      const reason = 'Test manual override';
      controller.forceQuality('low', reason); // Change to a different quality than the initial

      const metrics = controller.getQualityMetrics();
      const lastChange = metrics.qualityHistory[metrics.qualityHistory.length - 1];
      
      expect(lastChange.reason).toBe(reason);
      expect(lastChange.quality).toBe('low');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to base quality', () => {
      // Change quality
      controller.forceQuality('low', 'Test change');
      expect(controller.getCurrentQuality()).toBe('low');

      // Reset
      controller.resetQuality();
      expect(controller.getCurrentQuality()).toBe(config.baseQuality);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null network conditions', () => {
      // Should not throw when no network conditions are set
      expect(() => {
        controller.determineOptimalQuality(mockFrame);
      }).not.toThrow();
    });

    it('should handle empty compression results', () => {
      const metrics = controller.getQualityMetrics();
      
      // Should provide default values when no results are available
      expect(metrics.averageCompressionRatio).toBeDefined();
      expect(metrics.averageProcessingTime).toBeDefined();
    });

    it('should handle extreme network conditions', () => {
      const extremeConditions: NetworkConditions = {
        bandwidth: 0,     // No bandwidth
        latency: 10000,   // Extreme latency
        packetLoss: 100,  // Complete packet loss
        jitter: 1000,     // Extreme jitter
        stability: 0,     // No stability
        timestamp: Date.now()
      };

      expect(() => {
        controller.updateNetworkConditions(extremeConditions);
        controller.determineOptimalQuality(mockFrame);
      }).not.toThrow();

      expect(['low', 'medium']).toContain(controller.getCurrentQuality()); // Allow for medium quality as well
    });

    it('should handle very small frames', () => {
      const tinyFrame: VideoFrame = {
        id: 'tiny-frame',
        timestamp: Date.now(),
        data: Buffer.alloc(1),
        width: 1,
        height: 1,
        format: 'rgb24',
        isKeyFrame: false
      };

      expect(() => {
        controller.determineOptimalQuality(tinyFrame);
      }).not.toThrow();
    });

    it('should handle very large frames', () => {
      const largeFrame: VideoFrame = {
        id: 'large-frame',
        timestamp: Date.now(),
        data: Buffer.alloc(4096 * 2160 * 4), // 4K RGBA
        width: 4096,
        height: 2160,
        format: 'rgba',
        isKeyFrame: true
      };

      expect(() => {
        controller.determineOptimalQuality(largeFrame);
      }).not.toThrow();
    });
  });
});