/**
 * Video frame data structure for real-time compression
 */
export interface VideoFrame {
  /** Unique frame identifier */
  id: string;
  /** Frame timestamp in milliseconds */
  timestamp: number;
  /** Raw frame data */
  data: Buffer;
  /** Frame width in pixels */
  width: number;
  /** Frame height in pixels */
  height: number;
  /** Video format (e.g., 'yuv420p', 'rgb24') */
  format: string;
  /** Whether this is a key frame */
  isKeyFrame: boolean;
  /** Quality level used for this frame */
  qualityLevel?: 'low' | 'medium' | 'high';
  /** Processing time for this frame */
  processingTime?: number;
}

/**
 * Video compression configuration
 */
export class VideoCompressionConfig {
  public baseQuality: 'low' | 'medium' | 'high';
  public adaptiveQuality: boolean;
  public quantumCompressionLevel: number; // 1-10
  public bandwidthThreshold: number; // Mbps
  public targetFrameRate: number;
  public maxLatency: number; // milliseconds
  public keyFrameInterval: number; // frames
  public enableTemporalCompression: boolean;
  public enableSpatialCompression: boolean;

  constructor(
    baseQuality: 'low' | 'medium' | 'high' = 'medium',
    adaptiveQuality: boolean = true,
    quantumCompressionLevel: number = 5,
    bandwidthThreshold: number = 2,
    targetFrameRate: number = 30,
    maxLatency: number = 100,
    keyFrameInterval: number = 30,
    enableTemporalCompression: boolean = true,
    enableSpatialCompression: boolean = true
  ) {
    this.baseQuality = baseQuality;
    this.adaptiveQuality = adaptiveQuality;
    this.quantumCompressionLevel = this.validateCompressionLevel(quantumCompressionLevel);
    this.bandwidthThreshold = bandwidthThreshold;
    this.targetFrameRate = targetFrameRate;
    this.maxLatency = maxLatency;
    this.keyFrameInterval = keyFrameInterval;
    this.enableTemporalCompression = enableTemporalCompression;
    this.enableSpatialCompression = enableSpatialCompression;
  }

  /**
   * Create default video compression configuration
   */
  static createDefault(): VideoCompressionConfig {
    return new VideoCompressionConfig();
  }

  /**
   * Create low-latency configuration for real-time applications
   */
  static createLowLatency(): VideoCompressionConfig {
    return new VideoCompressionConfig(
      'medium',
      true,
      3, // Lower compression level for speed
      1, // Lower bandwidth threshold
      30,
      50, // Lower max latency
      15, // More frequent key frames
      false, // Disable temporal compression for lower latency
      true
    );
  }

  /**
   * Create high-quality configuration for recording
   */
  static createHighQuality(): VideoCompressionConfig {
    return new VideoCompressionConfig(
      'high',
      false, // Disable adaptive quality for consistent high quality
      8, // Higher compression level
      10, // Higher bandwidth threshold
      60,
      200, // Allow higher latency for quality
      60, // Less frequent key frames
      true,
      true
    );
  }

  /**
   * Create mobile-optimized configuration
   */
  static createMobileOptimized(): VideoCompressionConfig {
    return new VideoCompressionConfig(
      'low',
      true,
      4,
      0.5, // Very low bandwidth threshold
      24, // Lower frame rate
      150,
      20,
      true,
      true
    );
  }

  /**
   * Validate compression level parameter
   */
  private validateCompressionLevel(level: number): number {
    if (level < 1 || level > 10) {
      throw new Error('Quantum compression level must be between 1 and 10');
    }
    return level;
  }

  /**
   * Update configuration parameters
   */
  updateConfig(updates: Partial<VideoCompressionConfig>): void {
    Object.assign(this, updates);
    
    if (updates.quantumCompressionLevel !== undefined) {
      this.quantumCompressionLevel = this.validateCompressionLevel(updates.quantumCompressionLevel);
    }
  }

  /**
   * Get configuration as plain object
   */
  toObject(): any {
    return {
      baseQuality: this.baseQuality,
      adaptiveQuality: this.adaptiveQuality,
      quantumCompressionLevel: this.quantumCompressionLevel,
      bandwidthThreshold: this.bandwidthThreshold,
      targetFrameRate: this.targetFrameRate,
      maxLatency: this.maxLatency,
      keyFrameInterval: this.keyFrameInterval,
      enableTemporalCompression: this.enableTemporalCompression,
      enableSpatialCompression: this.enableSpatialCompression
    };
  }
}

/**
 * Network conditions for adaptive quality control
 */
export interface NetworkConditions {
  /** Available bandwidth in Mbps */
  bandwidth: number;
  /** Network latency in milliseconds */
  latency: number;
  /** Packet loss percentage (0-100) */
  packetLoss: number;
  /** Network jitter in milliseconds */
  jitter: number;
  /** Connection stability score (0-1) */
  stability: number;
  /** Timestamp when conditions were measured */
  timestamp: number;
}

/**
 * Video compression result
 */
export interface VideoCompressionResult {
  /** Compressed frame data */
  compressedData: Buffer;
  /** Original frame size in bytes */
  originalSize: number;
  /** Compressed frame size in bytes */
  compressedSize: number;
  /** Compression ratio achieved */
  compressionRatio: number;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Quality level used */
  qualityLevel: 'low' | 'medium' | 'high';
  /** Frame identifier */
  frameId: string;
  /** Frame timestamp */
  timestamp: number;
  /** Whether this was a key frame */
  isKeyFrame: boolean;
}

/**
 * Quality adaptation metrics
 */
export interface QualityMetrics {
  /** Current quality level */
  currentQuality: 'low' | 'medium' | 'high';
  /** Target quality level */
  targetQuality: 'low' | 'medium' | 'high';
  /** Quality adaptation history */
  qualityHistory: Array<{
    timestamp: number;
    quality: 'low' | 'medium' | 'high';
    reason: string;
  }>;
  /** Average compression ratio over recent frames */
  averageCompressionRatio: number;
  /** Average processing time over recent frames */
  averageProcessingTime: number;
  /** Frame drop rate percentage */
  frameDropRate: number;
  /** Quality stability score (0-1) */
  qualityStability: number;
}

/**
 * Video stream statistics
 */
export interface VideoStreamStats {
  /** Total frames processed */
  totalFrames: number;
  /** Total frames dropped */
  droppedFrames: number;
  /** Total bytes processed */
  totalBytesProcessed: number;
  /** Total bytes compressed */
  totalBytesCompressed: number;
  /** Average compression ratio */
  averageCompressionRatio: number;
  /** Average processing time per frame */
  averageProcessingTime: number;
  /** Current frames per second */
  currentFPS: number;
  /** Target frames per second */
  targetFPS: number;
  /** Stream duration in milliseconds */
  streamDuration: number;
  /** Quality distribution */
  qualityDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * Temporal compression context for inter-frame analysis
 */
export interface TemporalContext {
  /** Previous frame for motion analysis */
  previousFrame?: VideoFrame;
  /** Motion vectors between frames */
  motionVectors?: Array<{
    x: number;
    y: number;
    magnitude: number;
  }>;
  /** Scene change detection score */
  sceneChangeScore: number;
  /** Temporal complexity score */
  temporalComplexity: number;
}

/**
 * Spatial compression context for intra-frame analysis
 */
export interface SpatialContext {
  /** Spatial complexity score */
  spatialComplexity: number;
  /** Edge density in the frame */
  edgeDensity: number;
  /** Texture complexity score */
  textureComplexity: number;
  /** Color distribution analysis */
  colorDistribution: {
    entropy: number;
    dominantColors: number;
    colorVariance: number;
  };
}

/**
 * Frame analysis result combining temporal and spatial analysis
 */
export interface FrameAnalysis {
  /** Frame being analyzed */
  frame: VideoFrame;
  /** Temporal analysis context */
  temporal: TemporalContext;
  /** Spatial analysis context */
  spatial: SpatialContext;
  /** Recommended quality level based on analysis */
  recommendedQuality: 'low' | 'medium' | 'high';
  /** Recommended compression parameters */
  recommendedParams: {
    quantumBitDepth: number;
    entanglementLevel: number;
    superpositionComplexity: number;
  };
}