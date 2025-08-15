import { VideoCompressionConfig, VideoFrame, NetworkConditions } from '../models/VideoModels';

describe('VideoModels', () => {
  describe('VideoCompressionConfig', () => {
    describe('Constructor and Defaults', () => {
      it('should create default configuration', () => {
        const config = VideoCompressionConfig.createDefault();

        expect(config.baseQuality).toBe('medium');
        expect(config.adaptiveQuality).toBe(true);
        expect(config.quantumCompressionLevel).toBe(5);
        expect(config.bandwidthThreshold).toBe(2);
        expect(config.targetFrameRate).toBe(30);
        expect(config.maxLatency).toBe(100);
        expect(config.keyFrameInterval).toBe(30);
        expect(config.enableTemporalCompression).toBe(true);
        expect(config.enableSpatialCompression).toBe(true);
      });

      it('should create custom configuration', () => {
        const config = new VideoCompressionConfig(
          'high',
          false,
          8,
          5,
          60,
          50,
          15,
          false,
          true
        );

        expect(config.baseQuality).toBe('high');
        expect(config.adaptiveQuality).toBe(false);
        expect(config.quantumCompressionLevel).toBe(8);
        expect(config.bandwidthThreshold).toBe(5);
        expect(config.targetFrameRate).toBe(60);
        expect(config.maxLatency).toBe(50);
        expect(config.keyFrameInterval).toBe(15);
        expect(config.enableTemporalCompression).toBe(false);
        expect(config.enableSpatialCompression).toBe(true);
      });
    });

    describe('Preset Configurations', () => {
      it('should create low latency configuration', () => {
        const config = VideoCompressionConfig.createLowLatency();

        expect(config.baseQuality).toBe('medium');
        expect(config.adaptiveQuality).toBe(true);
        expect(config.quantumCompressionLevel).toBe(3);
        expect(config.bandwidthThreshold).toBe(1);
        expect(config.maxLatency).toBe(50);
        expect(config.keyFrameInterval).toBe(15);
        expect(config.enableTemporalCompression).toBe(false);
        expect(config.enableSpatialCompression).toBe(true);
      });

      it('should create high quality configuration', () => {
        const config = VideoCompressionConfig.createHighQuality();

        expect(config.baseQuality).toBe('high');
        expect(config.adaptiveQuality).toBe(false);
        expect(config.quantumCompressionLevel).toBe(8);
        expect(config.bandwidthThreshold).toBe(10);
        expect(config.targetFrameRate).toBe(60);
        expect(config.maxLatency).toBe(200);
        expect(config.keyFrameInterval).toBe(60);
        expect(config.enableTemporalCompression).toBe(true);
        expect(config.enableSpatialCompression).toBe(true);
      });

      it('should create mobile optimized configuration', () => {
        const config = VideoCompressionConfig.createMobileOptimized();

        expect(config.baseQuality).toBe('low');
        expect(config.adaptiveQuality).toBe(true);
        expect(config.quantumCompressionLevel).toBe(4);
        expect(config.bandwidthThreshold).toBe(0.5);
        expect(config.targetFrameRate).toBe(24);
        expect(config.maxLatency).toBe(150);
        expect(config.keyFrameInterval).toBe(20);
        expect(config.enableTemporalCompression).toBe(true);
        expect(config.enableSpatialCompression).toBe(true);
      });
    });

    describe('Validation', () => {
      it('should validate quantum compression level', () => {
        expect(() => new VideoCompressionConfig('medium', true, 0)).toThrow('Quantum compression level must be between 1 and 10');
        expect(() => new VideoCompressionConfig('medium', true, 11)).toThrow('Quantum compression level must be between 1 and 10');
        expect(() => new VideoCompressionConfig('medium', true, 5)).not.toThrow();
      });

      it('should validate quantum compression level in updateConfig', () => {
        const config = VideoCompressionConfig.createDefault();
        
        expect(() => config.updateConfig({ quantumCompressionLevel: 0 })).toThrow();
        expect(() => config.updateConfig({ quantumCompressionLevel: 11 })).toThrow();
        expect(() => config.updateConfig({ quantumCompressionLevel: 7 })).not.toThrow();
        
        expect(config.quantumCompressionLevel).toBe(7);
      });
    });

    describe('Configuration Updates', () => {
      it('should update configuration parameters', () => {
        const config = VideoCompressionConfig.createDefault();
        
        config.updateConfig({
          baseQuality: 'high',
          adaptiveQuality: false,
          quantumCompressionLevel: 8,
          bandwidthThreshold: 5
        });

        expect(config.baseQuality).toBe('high');
        expect(config.adaptiveQuality).toBe(false);
        expect(config.quantumCompressionLevel).toBe(8);
        expect(config.bandwidthThreshold).toBe(5);
      });

      it('should update partial configuration', () => {
        const config = VideoCompressionConfig.createDefault();
        const originalFrameRate = config.targetFrameRate;
        
        config.updateConfig({
          baseQuality: 'low'
        });

        expect(config.baseQuality).toBe('low');
        expect(config.targetFrameRate).toBe(originalFrameRate); // Should remain unchanged
      });
    });

    describe('Serialization', () => {
      it('should convert to object', () => {
        const config = VideoCompressionConfig.createDefault();
        const obj = config.toObject();

        expect(obj).toBeDefined();
        expect(obj.baseQuality).toBe(config.baseQuality);
        expect(obj.adaptiveQuality).toBe(config.adaptiveQuality);
        expect(obj.quantumCompressionLevel).toBe(config.quantumCompressionLevel);
        expect(obj.bandwidthThreshold).toBe(config.bandwidthThreshold);
        expect(obj.targetFrameRate).toBe(config.targetFrameRate);
        expect(obj.maxLatency).toBe(config.maxLatency);
        expect(obj.keyFrameInterval).toBe(config.keyFrameInterval);
        expect(obj.enableTemporalCompression).toBe(config.enableTemporalCompression);
        expect(obj.enableSpatialCompression).toBe(config.enableSpatialCompression);
      });
    });
  });

  describe('VideoFrame Interface', () => {
    it('should create valid video frame', () => {
      const frame: VideoFrame = {
        id: 'test-frame-001',
        timestamp: Date.now(),
        data: Buffer.alloc(1920 * 1080 * 3),
        width: 1920,
        height: 1080,
        format: 'rgb24',
        isKeyFrame: true,
        qualityLevel: 'high',
        processingTime: 25.5
      };

      expect(frame.id).toBe('test-frame-001');
      expect(typeof frame.timestamp).toBe('number');
      expect(Buffer.isBuffer(frame.data)).toBe(true);
      expect(frame.width).toBe(1920);
      expect(frame.height).toBe(1080);
      expect(frame.format).toBe('rgb24');
      expect(frame.isKeyFrame).toBe(true);
      expect(frame.qualityLevel).toBe('high');
      expect(frame.processingTime).toBe(25.5);
    });

    it('should handle optional properties', () => {
      const minimalFrame: VideoFrame = {
        id: 'minimal-frame',
        timestamp: Date.now(),
        data: Buffer.alloc(100),
        width: 10,
        height: 10,
        format: 'rgb24',
        isKeyFrame: false
      };

      expect(minimalFrame.qualityLevel).toBeUndefined();
      expect(minimalFrame.processingTime).toBeUndefined();
    });

    it('should handle different video formats', () => {
      const formats = ['rgb24', 'yuv420p', 'rgba', 'bgr24', 'nv12'];
      
      formats.forEach(format => {
        const frame: VideoFrame = {
          id: `frame-${format}`,
          timestamp: Date.now(),
          data: Buffer.alloc(100),
          width: 10,
          height: 10,
          format,
          isKeyFrame: false
        };

        expect(frame.format).toBe(format);
      });
    });
  });

  describe('NetworkConditions Interface', () => {
    it('should create valid network conditions', () => {
      const conditions: NetworkConditions = {
        bandwidth: 5.5,
        latency: 25,
        packetLoss: 0.5,
        jitter: 10,
        stability: 0.85,
        timestamp: Date.now()
      };

      expect(conditions.bandwidth).toBe(5.5);
      expect(conditions.latency).toBe(25);
      expect(conditions.packetLoss).toBe(0.5);
      expect(conditions.jitter).toBe(10);
      expect(conditions.stability).toBe(0.85);
      expect(typeof conditions.timestamp).toBe('number');
    });

    it('should handle extreme network conditions', () => {
      const extremeConditions: NetworkConditions = {
        bandwidth: 0,
        latency: 10000,
        packetLoss: 100,
        jitter: 1000,
        stability: 0,
        timestamp: Date.now()
      };

      expect(extremeConditions.bandwidth).toBe(0);
      expect(extremeConditions.latency).toBe(10000);
      expect(extremeConditions.packetLoss).toBe(100);
      expect(extremeConditions.jitter).toBe(1000);
      expect(extremeConditions.stability).toBe(0);
    });

    it('should handle perfect network conditions', () => {
      const perfectConditions: NetworkConditions = {
        bandwidth: 1000,
        latency: 1,
        packetLoss: 0,
        jitter: 0,
        stability: 1,
        timestamp: Date.now()
      };

      expect(perfectConditions.bandwidth).toBe(1000);
      expect(perfectConditions.latency).toBe(1);
      expect(perfectConditions.packetLoss).toBe(0);
      expect(perfectConditions.jitter).toBe(0);
      expect(perfectConditions.stability).toBe(1);
    });
  });

  describe('Quality Levels', () => {
    it('should handle all quality levels', () => {
      const qualityLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      
      qualityLevels.forEach(quality => {
        const config = new VideoCompressionConfig(quality);
        expect(config.baseQuality).toBe(quality);
        
        const frame: VideoFrame = {
          id: `frame-${quality}`,
          timestamp: Date.now(),
          data: Buffer.alloc(100),
          width: 10,
          height: 10,
          format: 'rgb24',
          isKeyFrame: false,
          qualityLevel: quality
        };
        
        expect(frame.qualityLevel).toBe(quality);
      });
    });
  });

  describe('Data Validation', () => {
    it('should handle various frame sizes', () => {
      const frameSizes = [
        { width: 320, height: 240 },   // QVGA
        { width: 640, height: 480 },   // VGA
        { width: 1280, height: 720 },  // HD
        { width: 1920, height: 1080 }, // Full HD
        { width: 3840, height: 2160 }  // 4K
      ];

      frameSizes.forEach(({ width, height }) => {
        const dataSize = width * height * 3; // RGB24
        const frame: VideoFrame = {
          id: `frame-${width}x${height}`,
          timestamp: Date.now(),
          data: Buffer.alloc(dataSize),
          width,
          height,
          format: 'rgb24',
          isKeyFrame: false
        };

        expect(frame.width).toBe(width);
        expect(frame.height).toBe(height);
        expect(frame.data.length).toBe(dataSize);
      });
    });

    it('should handle different pixel formats and data sizes', () => {
      const formats = [
        { format: 'rgb24', bytesPerPixel: 3 },
        { format: 'rgba', bytesPerPixel: 4 },
        { format: 'bgr24', bytesPerPixel: 3 },
        { format: 'yuv420p', bytesPerPixel: 1.5 } // Approximate for YUV420P
      ];

      formats.forEach(({ format, bytesPerPixel }) => {
        const width = 640;
        const height = 480;
        const dataSize = Math.floor(width * height * bytesPerPixel);
        
        const frame: VideoFrame = {
          id: `frame-${format}`,
          timestamp: Date.now(),
          data: Buffer.alloc(dataSize),
          width,
          height,
          format,
          isKeyFrame: false
        };

        expect(frame.format).toBe(format);
        expect(frame.data.length).toBe(dataSize);
      });
    });
  });

  describe('Timestamp Handling', () => {
    it('should handle various timestamp formats', () => {
      const timestamps = [
        Date.now(),
        Date.now() + 1000,
        1640995200000, // Fixed timestamp
        0 // Epoch
      ];

      timestamps.forEach(timestamp => {
        const frame: VideoFrame = {
          id: `frame-${timestamp}`,
          timestamp,
          data: Buffer.alloc(100),
          width: 10,
          height: 10,
          format: 'rgb24',
          isKeyFrame: false
        };

        expect(frame.timestamp).toBe(timestamp);
      });
    });

    it('should handle frame sequence timestamps', () => {
      const baseTimestamp = Date.now();
      const frameRate = 30;
      const frameInterval = 1000 / frameRate; // ~33.33ms

      for (let i = 0; i < 10; i++) {
        const frame: VideoFrame = {
          id: `frame-${i}`,
          timestamp: baseTimestamp + i * frameInterval,
          data: Buffer.alloc(100),
          width: 10,
          height: 10,
          format: 'rgb24',
          isKeyFrame: i % 30 === 0 // Key frame every 30 frames
        };

        expect(frame.timestamp).toBe(baseTimestamp + i * frameInterval);
        expect(frame.isKeyFrame).toBe(i % 30 === 0);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero-sized frames', () => {
      const frame: VideoFrame = {
        id: 'zero-frame',
        timestamp: Date.now(),
        data: Buffer.alloc(0),
        width: 0,
        height: 0,
        format: 'rgb24',
        isKeyFrame: false
      };

      expect(frame.width).toBe(0);
      expect(frame.height).toBe(0);
      expect(frame.data.length).toBe(0);
    });

    it('should handle very large frames', () => {
      const width = 7680; // 8K width
      const height = 4320; // 8K height
      const dataSize = width * height * 4; // RGBA

      const frame: VideoFrame = {
        id: '8k-frame',
        timestamp: Date.now(),
        data: Buffer.alloc(dataSize),
        width,
        height,
        format: 'rgba',
        isKeyFrame: true
      };

      expect(frame.width).toBe(width);
      expect(frame.height).toBe(height);
      expect(frame.data.length).toBe(dataSize);
    });

    it('should handle unusual aspect ratios', () => {
      const unusualSizes = [
        { width: 1, height: 1000 },    // Very tall
        { width: 1000, height: 1 },    // Very wide
        { width: 123, height: 456 },   // Odd dimensions
        { width: 1366, height: 768 }   // Common laptop resolution
      ];

      unusualSizes.forEach(({ width, height }) => {
        const frame: VideoFrame = {
          id: `frame-${width}x${height}`,
          timestamp: Date.now(),
          data: Buffer.alloc(width * height * 3),
          width,
          height,
          format: 'rgb24',
          isKeyFrame: false
        };

        expect(frame.width).toBe(width);
        expect(frame.height).toBe(height);
      });
    });
  });
});