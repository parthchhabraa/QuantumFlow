import { VideoCompressionConfig, NetworkConditions, VideoFrame, VideoCompressionResult, QualityMetrics } from './models/VideoModels';

/**
 * Adaptive quality controller that adjusts compression quality based on network conditions and performance
 */
export class AdaptiveQualityController {
  private config: VideoCompressionConfig;
  private currentQuality: 'low' | 'medium' | 'high';
  private networkConditions: NetworkConditions | null = null;
  private qualityHistory: Array<{ timestamp: number; quality: 'low' | 'medium' | 'high'; reason: string }> = [];
  private recentCompressionResults: VideoCompressionResult[] = [];
  private maxHistorySize: number = 100;
  private qualityChangeThreshold: number = 0.2; // Minimum change needed to trigger quality adjustment
  private stabilityWindow: number = 10; // Number of frames to consider for stability

  constructor(config: VideoCompressionConfig) {
    this.config = config;
    this.currentQuality = config.baseQuality;
    this.recordQualityChange(this.currentQuality, 'Initial quality setting');
  }

  /**
   * Update network conditions for quality adaptation
   */
  updateNetworkConditions(conditions: NetworkConditions): void {
    this.networkConditions = conditions;
    
    if (this.config.adaptiveQuality) {
      this.adaptQualityToNetwork();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: VideoCompressionConfig): void {
    this.config = config;
    
    if (!config.adaptiveQuality) {
      this.setQuality(config.baseQuality, 'Adaptive quality disabled');
    }
  }

  /**
   * Determine optimal quality level for a frame
   */
  determineOptimalQuality(frame: VideoFrame): 'low' | 'medium' | 'high' {
    if (!this.config.adaptiveQuality) {
      return this.config.baseQuality;
    }

    // Analyze frame characteristics
    const frameComplexity = this.analyzeFrameComplexity(frame);
    
    // Consider network conditions
    const networkScore = this.calculateNetworkScore();
    
    // Consider recent performance
    const performanceScore = this.calculatePerformanceScore();
    
    // Calculate optimal quality based on all factors
    const qualityScore = this.calculateQualityScore(frameComplexity, networkScore, performanceScore);
    
    const optimalQuality = this.scoreToQuality(qualityScore);
    
    // Apply quality change threshold to prevent oscillation
    if (this.shouldChangeQuality(optimalQuality)) {
      this.setQuality(optimalQuality, `Adaptive adjustment: complexity=${frameComplexity.toFixed(2)}, network=${networkScore.toFixed(2)}, performance=${performanceScore.toFixed(2)}`);
    }

    return this.currentQuality;
  }

  /**
   * Record compression result for performance tracking
   */
  recordCompressionResult(result: VideoCompressionResult): void {
    this.recentCompressionResults.push(result);
    
    // Keep only recent results
    if (this.recentCompressionResults.length > this.maxHistorySize) {
      this.recentCompressionResults.shift();
    }

    // Check if quality adjustment is needed based on performance
    if (this.config.adaptiveQuality) {
      this.adaptQualityToPerformance();
    }
  }

  /**
   * Get current quality level
   */
  getCurrentQuality(): 'low' | 'medium' | 'high' {
    return this.currentQuality;
  }

  /**
   * Get quality metrics
   */
  getQualityMetrics(): QualityMetrics {
    const recentResults = this.recentCompressionResults.slice(-this.stabilityWindow);
    
    return {
      currentQuality: this.currentQuality,
      targetQuality: this.calculateTargetQuality(),
      qualityHistory: [...this.qualityHistory],
      averageCompressionRatio: this.calculateAverageCompressionRatio(recentResults),
      averageProcessingTime: this.calculateAverageProcessingTime(recentResults),
      frameDropRate: this.calculateFrameDropRate(),
      qualityStability: this.calculateQualityStability()
    };
  }

  /**
   * Force quality level (overrides adaptive behavior temporarily)
   */
  forceQuality(quality: 'low' | 'medium' | 'high', reason: string = 'Manual override'): void {
    this.setQuality(quality, reason);
  }

  /**
   * Reset quality to base configuration
   */
  resetQuality(): void {
    this.setQuality(this.config.baseQuality, 'Reset to base quality');
  }

  /**
   * Analyze frame complexity to determine processing requirements
   */
  private analyzeFrameComplexity(frame: VideoFrame): number {
    // Simple complexity analysis based on frame characteristics
    let complexity = 0.5; // Base complexity
    
    // Key frames are more complex
    if (frame.isKeyFrame) {
      complexity += 0.3;
    }
    
    // Larger frames are more complex
    const pixelCount = frame.width * frame.height;
    const normalizedPixelCount = pixelCount / (1920 * 1080); // Normalize to 1080p
    complexity += Math.min(normalizedPixelCount * 0.2, 0.3);
    
    // Analyze data entropy as a proxy for visual complexity
    const entropy = this.calculateDataEntropy(frame.data);
    complexity += (entropy / 8) * 0.2; // Normalize entropy to 0-1 range
    
    return Math.min(complexity, 1.0);
  }

  /**
   * Calculate network score based on current conditions
   */
  private calculateNetworkScore(): number {
    if (!this.networkConditions) {
      return 0.5; // Neutral score if no network data
    }

    const conditions = this.networkConditions;
    let score = 0;

    // Bandwidth score (0-1)
    const bandwidthScore = Math.min(conditions.bandwidth / 10, 1); // Normalize to 10 Mbps max
    score += bandwidthScore * 0.4;

    // Latency score (lower is better)
    const latencyScore = Math.max(0, 1 - (conditions.latency / 200)); // Normalize to 200ms max
    score += latencyScore * 0.3;

    // Packet loss score (lower is better)
    const packetLossScore = Math.max(0, 1 - (conditions.packetLoss / 5)); // Normalize to 5% max
    score += packetLossScore * 0.2;

    // Stability score
    score += conditions.stability * 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate performance score based on recent compression results
   */
  private calculatePerformanceScore(): number {
    if (this.recentCompressionResults.length === 0) {
      return 0.5; // Neutral score if no performance data
    }

    const recentResults = this.recentCompressionResults.slice(-this.stabilityWindow);
    let score = 0;

    // Processing time score (lower is better)
    const avgProcessingTime = this.calculateAverageProcessingTime(recentResults);
    const processingTimeScore = Math.max(0, 1 - (avgProcessingTime / this.config.maxLatency));
    score += processingTimeScore * 0.5;

    // Compression ratio score (higher is better)
    const avgCompressionRatio = this.calculateAverageCompressionRatio(recentResults);
    const compressionRatioScore = Math.min(avgCompressionRatio / 3, 1); // Normalize to 3:1 max
    score += compressionRatioScore * 0.3;

    // Frame drop rate score (lower is better)
    const frameDropRate = this.calculateFrameDropRate();
    const frameDropScore = Math.max(0, 1 - (frameDropRate / 10)); // Normalize to 10% max
    score += frameDropScore * 0.2;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate overall quality score from individual factors
   */
  private calculateQualityScore(frameComplexity: number, networkScore: number, performanceScore: number): number {
    // Weight the factors based on their importance
    const complexityWeight = 0.3;
    const networkWeight = 0.4;
    const performanceWeight = 0.3;

    // Higher network and performance scores allow for higher quality
    // Higher frame complexity may require lower quality for real-time processing
    const qualityScore = 
      (1 - frameComplexity) * complexityWeight +
      networkScore * networkWeight +
      performanceScore * performanceWeight;

    return Math.max(0, Math.min(qualityScore, 1));
  }

  /**
   * Convert quality score to quality level
   */
  private scoreToQuality(score: number): 'low' | 'medium' | 'high' {
    if (score >= 0.7) {
      return 'high';
    } else if (score >= 0.4) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Determine if quality should be changed based on threshold
   */
  private shouldChangeQuality(newQuality: 'low' | 'medium' | 'high'): boolean {
    if (newQuality === this.currentQuality) {
      return false;
    }

    // Prevent rapid quality changes
    const lastChange = this.qualityHistory[this.qualityHistory.length - 1];
    if (lastChange && (Date.now() - lastChange.timestamp) < 2000) { // 2 second minimum between changes
      return false;
    }

    return true;
  }

  /**
   * Set quality level and record the change
   */
  private setQuality(quality: 'low' | 'medium' | 'high', reason: string): void {
    if (quality !== this.currentQuality) {
      this.currentQuality = quality;
      this.recordQualityChange(quality, reason);
    }
  }

  /**
   * Record quality change in history
   */
  private recordQualityChange(quality: 'low' | 'medium' | 'high', reason: string): void {
    this.qualityHistory.push({
      timestamp: Date.now(),
      quality,
      reason
    });

    // Keep history size manageable
    if (this.qualityHistory.length > this.maxHistorySize) {
      this.qualityHistory.shift();
    }
  }

  /**
   * Adapt quality based on network conditions
   */
  private adaptQualityToNetwork(): void {
    if (!this.networkConditions) return;

    const conditions = this.networkConditions;
    let targetQuality = this.currentQuality;

    // Reduce quality for poor network conditions
    if (conditions.bandwidth < this.config.bandwidthThreshold * 0.5) {
      targetQuality = 'low';
    } else if (conditions.bandwidth < this.config.bandwidthThreshold) {
      targetQuality = 'medium';
    } else if (conditions.bandwidth > this.config.bandwidthThreshold * 2) {
      targetQuality = 'high';
    }

    // Consider latency and packet loss
    if (conditions.latency > 150 || conditions.packetLoss > 2) {
      targetQuality = this.lowerQuality(targetQuality);
    }

    if (this.shouldChangeQuality(targetQuality)) {
      this.setQuality(targetQuality, `Network adaptation: bandwidth=${conditions.bandwidth}Mbps, latency=${conditions.latency}ms, loss=${conditions.packetLoss}%`);
    }
  }

  /**
   * Adapt quality based on performance metrics
   */
  private adaptQualityToPerformance(): void {
    const recentResults = this.recentCompressionResults.slice(-this.stabilityWindow);
    if (recentResults.length < 5) return; // Need enough data

    const avgProcessingTime = this.calculateAverageProcessingTime(recentResults);
    let targetQuality = this.currentQuality;

    // Reduce quality if processing time is too high
    if (avgProcessingTime > this.config.maxLatency * 0.8) {
      targetQuality = this.lowerQuality(this.currentQuality);
    } else if (avgProcessingTime < this.config.maxLatency * 0.4) {
      targetQuality = this.raiseQuality(this.currentQuality);
    }

    if (this.shouldChangeQuality(targetQuality)) {
      this.setQuality(targetQuality, `Performance adaptation: avgProcessingTime=${avgProcessingTime.toFixed(1)}ms`);
    }
  }

  /**
   * Calculate target quality based on current conditions
   */
  private calculateTargetQuality(): 'low' | 'medium' | 'high' {
    if (!this.config.adaptiveQuality) {
      return this.config.baseQuality;
    }

    const networkScore = this.calculateNetworkScore();
    const performanceScore = this.calculatePerformanceScore();
    const combinedScore = (networkScore + performanceScore) / 2;

    return this.scoreToQuality(combinedScore);
  }

  /**
   * Lower quality level by one step
   */
  private lowerQuality(quality: 'low' | 'medium' | 'high'): 'low' | 'medium' | 'high' {
    switch (quality) {
      case 'high': return 'medium';
      case 'medium': return 'low';
      case 'low': return 'low';
    }
  }

  /**
   * Raise quality level by one step
   */
  private raiseQuality(quality: 'low' | 'medium' | 'high'): 'low' | 'medium' | 'high' {
    switch (quality) {
      case 'low': return 'medium';
      case 'medium': return 'high';
      case 'high': return 'high';
    }
  }

  /**
   * Calculate average compression ratio from results
   */
  private calculateAverageCompressionRatio(results: VideoCompressionResult[]): number {
    if (results.length === 0) return 1;
    
    const sum = results.reduce((acc, result) => acc + result.compressionRatio, 0);
    return sum / results.length;
  }

  /**
   * Calculate average processing time from results
   */
  private calculateAverageProcessingTime(results: VideoCompressionResult[]): number {
    if (results.length === 0) return 0;
    
    const sum = results.reduce((acc, result) => acc + result.processingTime, 0);
    return sum / results.length;
  }

  /**
   * Calculate frame drop rate percentage
   */
  private calculateFrameDropRate(): number {
    // This would be calculated based on actual frame drops
    // For now, return 0 as a placeholder
    return 0;
  }

  /**
   * Calculate quality stability score
   */
  private calculateQualityStability(): number {
    if (this.qualityHistory.length < 2) return 1;

    const recentHistory = this.qualityHistory.slice(-this.stabilityWindow);
    const qualityChanges = recentHistory.length - 1;
    
    // Fewer changes = higher stability
    return Math.max(0, 1 - (qualityChanges / this.stabilityWindow));
  }

  /**
   * Calculate data entropy as a measure of complexity
   */
  private calculateDataEntropy(data: Buffer): number {
    const frequency = new Array(256).fill(0);
    
    // Count byte frequencies
    for (let i = 0; i < data.length; i++) {
      frequency[data[i]]++;
    }
    
    // Calculate entropy
    let entropy = 0;
    for (let i = 0; i < 256; i++) {
      if (frequency[i] > 0) {
        const probability = frequency[i] / data.length;
        entropy -= probability * Math.log2(probability);
      }
    }
    
    return entropy;
  }
}