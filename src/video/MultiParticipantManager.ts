/**
 * Multi-Participant Manager for optimized bandwidth distribution in video conferencing
 */

import { EventEmitter } from 'events';
import { 
  VideoConferenceRoom, 
  Participant, 
  BandwidthDistribution,
  BandwidthOptimizationResult,
  RTCConnectionStats,
  WebRTCError
} from './models/WebRTCModels';
import { VideoCompressionConfig, NetworkConditions } from './models/VideoModels';
import { PeerConnectionManager } from './PeerConnectionManager';
import { WebRTCSignalingServer } from './WebRTCSignalingServer';

/**
 * Bandwidth allocation strategy
 */
export type BandwidthStrategy = 'equal-distribution' | 'priority-based' | 'adaptive-quality' | 'speaker-focus';

/**
 * Participant priority levels
 */
export type ParticipantPriority = 'low' | 'normal' | 'high' | 'presenter';

/**
 * Multi-participant session configuration
 */
export interface MultiParticipantConfig {
  maxParticipants: number;
  totalBandwidthLimit: number; // Mbps
  bandwidthStrategy: BandwidthStrategy;
  enableAdaptiveQuality: boolean;
  enableSpeakerDetection: boolean;
  enableScreenSharingPriority: boolean;
  qualityLevels: {
    low: { bandwidth: number; resolution: string; fps: number };
    medium: { bandwidth: number; resolution: string; fps: number };
    high: { bandwidth: number; resolution: string; fps: number };
  };
}

/**
 * Participant session data
 */
export interface ParticipantSession {
  participant: Participant;
  priority: ParticipantPriority;
  allocatedBandwidth: number;
  currentQuality: 'low' | 'medium' | 'high';
  networkConditions: NetworkConditions;
  isSpeaking: boolean;
  isPresenting: boolean;
  connectionStats: RTCConnectionStats;
  lastActivity: number;
}

/**
 * Manages multiple participants with optimized bandwidth distribution
 */
export class MultiParticipantManager extends EventEmitter {
  private room: VideoConferenceRoom;
  private participantSessions: Map<string, ParticipantSession> = new Map();
  private peerConnectionManager: PeerConnectionManager;
  private signalingServer: WebRTCSignalingServer;
  private config: MultiParticipantConfig;
  private optimizationInterval: NodeJS.Timeout | null = null;
  private speakerDetectionInterval: NodeJS.Timeout | null = null;
  private currentSpeaker: string | null = null;

  constructor(
    room: VideoConferenceRoom,
    peerConnectionManager: PeerConnectionManager,
    signalingServer: WebRTCSignalingServer,
    config?: Partial<MultiParticipantConfig>
  ) {
    super();
    this.room = room;
    this.peerConnectionManager = peerConnectionManager;
    this.signalingServer = signalingServer;
    this.config = this.createDefaultConfig(config);
    
    this.setupEventHandlers();
    this.startOptimizationLoop();
    
    if (this.config.enableSpeakerDetection) {
      this.startSpeakerDetection();
    }
  }

  /**
   * Add participant to the session
   */
  async addParticipant(
    participant: Participant, 
    priority: ParticipantPriority = 'normal'
  ): Promise<ParticipantSession> {
    if (this.participantSessions.size >= this.config.maxParticipants) {
      throw new WebRTCError({
        type: 'room-full',
        message: `Maximum participants (${this.config.maxParticipants}) reached`,
        participantId: participant.id,
        timestamp: Date.now()
      });
    }

    const session: ParticipantSession = {
      participant,
      priority,
      allocatedBandwidth: 0,
      currentQuality: 'medium',
      networkConditions: {
        bandwidth: 5, // Default 5 Mbps
        latency: 50,
        packetLoss: 0,
        jitter: 10,
        stability: 0.8,
        timestamp: Date.now()
      },
      isSpeaking: false,
      isPresenting: false,
      connectionStats: {
        participantId: participant.id,
        connectionState: 'new',
        iceConnectionState: 'new',
        signalingState: 'stable',
        bytesReceived: 0,
        bytesSent: 0,
        packetsReceived: 0,
        packetsSent: 0,
        packetsLost: 0,
        jitter: 0,
        roundTripTime: 0,
        timestamp: Date.now()
      },
      lastActivity: Date.now()
    };

    this.participantSessions.set(participant.id, session);

    // Create peer connections with other participants
    await this.establishPeerConnections(participant.id);

    // Optimize bandwidth distribution
    await this.optimizeBandwidthDistribution();

    this.emit('participant-added', { session });
    return session;
  }

  /**
   * Remove participant from the session
   */
  async removeParticipant(participantId: string): Promise<void> {
    const session = this.participantSessions.get(participantId);
    if (!session) {
      return;
    }

    // Close peer connections
    await this.peerConnectionManager.closePeerConnection(participantId);

    // Remove from sessions
    this.participantSessions.delete(participantId);

    // Update speaker if necessary
    if (this.currentSpeaker === participantId) {
      this.currentSpeaker = null;
      this.detectCurrentSpeaker();
    }

    // Reoptimize bandwidth distribution
    await this.optimizeBandwidthDistribution();

    this.emit('participant-removed', { participantId, session });
  }

  /**
   * Update participant priority
   */
  async updateParticipantPriority(participantId: string, priority: ParticipantPriority): Promise<void> {
    const session = this.participantSessions.get(participantId);
    if (!session) {
      throw new WebRTCError({
        type: 'participant-not-found',
        message: `Participant ${participantId} not found`,
        participantId,
        timestamp: Date.now()
      });
    }

    session.priority = priority;
    
    // Special handling for presenter priority
    if (priority === 'presenter') {
      session.isPresenting = true;
      // Notify other participants about presenter change
      this.emit('presenter-changed', { participantId, session });
    } else if (session.isPresenting && priority !== 'presenter') {
      session.isPresenting = false;
    }

    // Reoptimize bandwidth distribution
    await this.optimizeBandwidthDistribution();

    this.emit('participant-priority-updated', { participantId, priority, session });
  }

  /**
   * Update participant network conditions
   */
  updateNetworkConditions(participantId: string, conditions: NetworkConditions): void {
    const session = this.participantSessions.get(participantId);
    if (!session) {
      return;
    }

    session.networkConditions = conditions;
    session.lastActivity = Date.now();

    // Update participant network quality based on conditions
    session.participant.networkQuality = this.calculateNetworkQuality(conditions);

    // Trigger bandwidth reoptimization if conditions changed significantly
    const bandwidthChange = Math.abs(conditions.bandwidth - session.networkConditions.bandwidth);
    if (bandwidthChange > 1) { // 1 Mbps threshold
      this.optimizeBandwidthDistribution();
    }

    this.emit('network-conditions-updated', { participantId, conditions, session });
  }

  /**
   * Set current speaker
   */
  setCurrentSpeaker(participantId: string | null): void {
    if (this.currentSpeaker === participantId) {
      return;
    }

    const previousSpeaker = this.currentSpeaker;
    this.currentSpeaker = participantId;

    // Update speaking status
    if (previousSpeaker) {
      const prevSession = this.participantSessions.get(previousSpeaker);
      if (prevSession) {
        prevSession.isSpeaking = false;
      }
    }

    if (participantId) {
      const currentSession = this.participantSessions.get(participantId);
      if (currentSession) {
        currentSession.isSpeaking = true;
      }
    }

    // Reoptimize bandwidth if using speaker-focus strategy
    if (this.config.bandwidthStrategy === 'speaker-focus') {
      this.optimizeBandwidthDistribution();
    }

    this.emit('speaker-changed', { 
      previousSpeaker, 
      currentSpeaker: participantId 
    });
  }

  /**
   * Get participant session
   */
  getParticipantSession(participantId: string): ParticipantSession | undefined {
    return this.participantSessions.get(participantId);
  }

  /**
   * Get all participant sessions
   */
  getAllParticipantSessions(): Map<string, ParticipantSession> {
    return new Map(this.participantSessions);
  }

  /**
   * Get current bandwidth distribution
   */
  getCurrentBandwidthDistribution(): BandwidthDistribution {
    return this.room.bandwidthDistribution;
  }

  /**
   * Optimize bandwidth distribution across all participants
   */
  async optimizeBandwidthDistribution(): Promise<BandwidthOptimizationResult> {
    const participants = Array.from(this.participantSessions.values());
    const totalParticipants = participants.length;

    if (totalParticipants === 0) {
      return {
        participantAllocations: new Map(),
        totalBandwidthUsed: 0,
        optimizationStrategy: this.config.bandwidthStrategy,
        qualityAdjustments: new Map(),
        estimatedSavings: 0
      };
    }

    const availableBandwidth = this.config.totalBandwidthLimit - 2; // Reserve 2 Mbps for signaling
    let result: BandwidthOptimizationResult;

    switch (this.config.bandwidthStrategy) {
      case 'equal-distribution':
        result = await this.equalDistributionStrategy(participants, availableBandwidth);
        break;
      case 'priority-based':
        result = await this.priorityBasedStrategy(participants, availableBandwidth);
        break;
      case 'adaptive-quality':
        result = await this.adaptiveQualityStrategy(participants, availableBandwidth);
        break;
      case 'speaker-focus':
        result = await this.speakerFocusStrategy(participants, availableBandwidth);
        break;
      default:
        result = await this.equalDistributionStrategy(participants, availableBandwidth);
    }

    // Apply the optimization results
    await this.applyBandwidthOptimization(result);

    this.emit('bandwidth-optimized', { result });
    return result;
  }

  /**
   * Equal distribution bandwidth strategy
   */
  private async equalDistributionStrategy(
    participants: ParticipantSession[], 
    availableBandwidth: number
  ): Promise<BandwidthOptimizationResult> {
    const baseAllocation = availableBandwidth / participants.length;
    const participantAllocations = new Map<string, number>();
    const qualityAdjustments = new Map<string, 'low' | 'medium' | 'high'>();

    for (const session of participants) {
      let allocation = baseAllocation;
      let quality: 'low' | 'medium' | 'high' = 'medium';

      // Adjust based on network conditions
      const networkMultiplier = this.getNetworkMultiplier(session.networkConditions);
      allocation *= networkMultiplier;

      // Determine quality level
      if (allocation >= this.config.qualityLevels.high.bandwidth) {
        quality = 'high';
      } else if (allocation >= this.config.qualityLevels.medium.bandwidth) {
        quality = 'medium';
      } else {
        quality = 'low';
      }

      participantAllocations.set(session.participant.id, allocation);
      qualityAdjustments.set(session.participant.id, quality);
    }

    const totalBandwidthUsed = Array.from(participantAllocations.values())
      .reduce((sum, allocation) => sum + allocation, 0);

    return {
      participantAllocations,
      totalBandwidthUsed,
      optimizationStrategy: 'equal-distribution',
      qualityAdjustments,
      estimatedSavings: ((availableBandwidth - totalBandwidthUsed) / availableBandwidth) * 100
    };
  }

  /**
   * Priority-based bandwidth strategy
   */
  private async priorityBasedStrategy(
    participants: ParticipantSession[], 
    availableBandwidth: number
  ): Promise<BandwidthOptimizationResult> {
    const priorityWeights = {
      'presenter': 4,
      'high': 3,
      'normal': 2,
      'low': 1
    };

    const totalWeight = participants.reduce((sum, session) => 
      sum + priorityWeights[session.priority], 0);

    const participantAllocations = new Map<string, number>();
    const qualityAdjustments = new Map<string, 'low' | 'medium' | 'high'>();

    for (const session of participants) {
      const weight = priorityWeights[session.priority];
      let allocation = (weight / totalWeight) * availableBandwidth;

      // Adjust based on network conditions
      const networkMultiplier = this.getNetworkMultiplier(session.networkConditions);
      allocation *= networkMultiplier;

      // Determine quality level
      let quality: 'low' | 'medium' | 'high' = 'medium';
      if (allocation >= this.config.qualityLevels.high.bandwidth) {
        quality = 'high';
      } else if (allocation >= this.config.qualityLevels.medium.bandwidth) {
        quality = 'medium';
      } else {
        quality = 'low';
      }

      participantAllocations.set(session.participant.id, allocation);
      qualityAdjustments.set(session.participant.id, quality);
    }

    const totalBandwidthUsed = Array.from(participantAllocations.values())
      .reduce((sum, allocation) => sum + allocation, 0);

    return {
      participantAllocations,
      totalBandwidthUsed,
      optimizationStrategy: 'priority-based',
      qualityAdjustments,
      estimatedSavings: ((availableBandwidth - totalBandwidthUsed) / availableBandwidth) * 100
    };
  }

  /**
   * Adaptive quality bandwidth strategy
   */
  private async adaptiveQualityStrategy(
    participants: ParticipantSession[], 
    availableBandwidth: number
  ): Promise<BandwidthOptimizationResult> {
    const participantAllocations = new Map<string, number>();
    const qualityAdjustments = new Map<string, 'low' | 'medium' | 'high'>();

    // Sort participants by network quality (best first)
    const sortedParticipants = participants.sort((a, b) => {
      const qualityScore = (conditions: NetworkConditions) => 
        conditions.bandwidth * conditions.stability * (1 - conditions.packetLoss / 100);
      return qualityScore(b.networkConditions) - qualityScore(a.networkConditions);
    });

    let remainingBandwidth = availableBandwidth;

    for (const session of sortedParticipants) {
      const maxPossibleBandwidth = Math.min(
        session.networkConditions.bandwidth * 0.8, // Use 80% of available bandwidth
        remainingBandwidth / (sortedParticipants.length - participantAllocations.size)
      );

      let allocation = maxPossibleBandwidth;
      let quality: 'low' | 'medium' | 'high' = 'low';

      // Determine optimal quality level
      if (allocation >= this.config.qualityLevels.high.bandwidth && remainingBandwidth > allocation) {
        quality = 'high';
        allocation = this.config.qualityLevels.high.bandwidth;
      } else if (allocation >= this.config.qualityLevels.medium.bandwidth && remainingBandwidth > allocation) {
        quality = 'medium';
        allocation = this.config.qualityLevels.medium.bandwidth;
      } else {
        quality = 'low';
        allocation = Math.min(allocation, this.config.qualityLevels.low.bandwidth);
      }

      participantAllocations.set(session.participant.id, allocation);
      qualityAdjustments.set(session.participant.id, quality);
      remainingBandwidth -= allocation;
    }

    const totalBandwidthUsed = Array.from(participantAllocations.values())
      .reduce((sum, allocation) => sum + allocation, 0);

    return {
      participantAllocations,
      totalBandwidthUsed,
      optimizationStrategy: 'adaptive-quality',
      qualityAdjustments,
      estimatedSavings: ((availableBandwidth - totalBandwidthUsed) / availableBandwidth) * 100
    };
  }

  /**
   * Speaker-focus bandwidth strategy
   */
  private async speakerFocusStrategy(
    participants: ParticipantSession[], 
    availableBandwidth: number
  ): Promise<BandwidthOptimizationResult> {
    const participantAllocations = new Map<string, number>();
    const qualityAdjustments = new Map<string, 'low' | 'medium' | 'high'>();

    const speakerBandwidthRatio = 0.6; // 60% for speaker
    const othersBandwidthRatio = 0.4; // 40% for others

    const speakerBandwidth = availableBandwidth * speakerBandwidthRatio;
    const othersBandwidth = availableBandwidth * othersBandwidthRatio;

    const currentSpeakerSession = this.currentSpeaker ? 
      this.participantSessions.get(this.currentSpeaker) : null;

    const nonSpeakerParticipants = participants.filter(session => 
      session.participant.id !== this.currentSpeaker);

    // Allocate bandwidth to current speaker
    if (currentSpeakerSession) {
      participantAllocations.set(currentSpeakerSession.participant.id, speakerBandwidth);
      qualityAdjustments.set(currentSpeakerSession.participant.id, 'high');
    }

    // Distribute remaining bandwidth among non-speakers
    if (nonSpeakerParticipants.length > 0) {
      const perParticipantBandwidth = othersBandwidth / nonSpeakerParticipants.length;

      for (const session of nonSpeakerParticipants) {
        let allocation = perParticipantBandwidth;
        let quality: 'low' | 'medium' | 'high' = 'medium';

        // Adjust based on network conditions
        const networkMultiplier = this.getNetworkMultiplier(session.networkConditions);
        allocation *= networkMultiplier;

        if (allocation >= this.config.qualityLevels.medium.bandwidth) {
          quality = 'medium';
        } else {
          quality = 'low';
        }

        participantAllocations.set(session.participant.id, allocation);
        qualityAdjustments.set(session.participant.id, quality);
      }
    }

    const totalBandwidthUsed = Array.from(participantAllocations.values())
      .reduce((sum, allocation) => sum + allocation, 0);

    return {
      participantAllocations,
      totalBandwidthUsed,
      optimizationStrategy: 'speaker-focus',
      qualityAdjustments,
      estimatedSavings: ((availableBandwidth - totalBandwidthUsed) / availableBandwidth) * 100
    };
  }

  /**
   * Apply bandwidth optimization results
   */
  private async applyBandwidthOptimization(result: BandwidthOptimizationResult): Promise<void> {
    for (const [participantId, allocation] of result.participantAllocations) {
      const session = this.participantSessions.get(participantId);
      if (session) {
        session.allocatedBandwidth = allocation;
        
        const newQuality = result.qualityAdjustments.get(participantId);
        if (newQuality && newQuality !== session.currentQuality) {
          session.currentQuality = newQuality;
          
          // Update compression configuration
          await this.updateParticipantCompressionConfig(participantId, newQuality);
        }
      }
    }

    // Update room bandwidth distribution
    this.room.bandwidthDistribution.allocatedBandwidth = result.participantAllocations;
    this.room.bandwidthDistribution.lastUpdated = Date.now();
  }

  /**
   * Update participant compression configuration
   */
  private async updateParticipantCompressionConfig(
    participantId: string, 
    quality: 'low' | 'medium' | 'high'
  ): Promise<void> {
    const qualityConfig = this.config.qualityLevels[quality];
    
    // Update compression settings based on quality level
    const compressionConfig = new VideoCompressionConfig(
      quality,
      this.config.enableAdaptiveQuality,
      this.getCompressionLevelForQuality(quality),
      qualityConfig.bandwidth
    );

    // This would update the actual compression engine in a full implementation
    this.emit('compression-config-updated', { 
      participantId, 
      quality, 
      config: compressionConfig 
    });
  }

  /**
   * Get network multiplier based on conditions
   */
  private getNetworkMultiplier(conditions: NetworkConditions): number {
    const stabilityFactor = conditions.stability;
    const latencyFactor = Math.max(0.5, 1 - (conditions.latency - 50) / 200);
    const packetLossFactor = Math.max(0.3, 1 - conditions.packetLoss / 10);
    
    return stabilityFactor * latencyFactor * packetLossFactor;
  }

  /**
   * Calculate network quality from conditions
   */
  private calculateNetworkQuality(conditions: NetworkConditions): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = conditions.bandwidth * conditions.stability * (1 - conditions.packetLoss / 100) * 
                  Math.max(0.1, 1 - conditions.latency / 500);

    if (score >= 8) return 'excellent';
    if (score >= 5) return 'good';
    if (score >= 2) return 'fair';
    return 'poor';
  }

  /**
   * Get compression level for quality
   */
  private getCompressionLevelForQuality(quality: 'low' | 'medium' | 'high'): number {
    switch (quality) {
      case 'low': return 3;
      case 'medium': return 5;
      case 'high': return 7;
      default: return 5;
    }
  }

  /**
   * Establish peer connections with other participants
   */
  private async establishPeerConnections(participantId: string): Promise<void> {
    const session = this.participantSessions.get(participantId);
    if (!session) return;

    // Create peer connection
    await this.peerConnectionManager.createPeerConnection(
      participantId,
      this.room.compressionSettings,
      false
    );

    this.emit('peer-connections-established', { participantId });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.peerConnectionManager.on('stats-updated', ({ participantId, stats }) => {
      const session = this.participantSessions.get(participantId);
      if (session) {
        session.connectionStats = stats;
        session.lastActivity = Date.now();
      }
    });

    this.peerConnectionManager.on('connection-state-changed', ({ participantId, connectionState }) => {
      const session = this.participantSessions.get(participantId);
      if (session) {
        session.participant.connectionState = connectionState;
      }
    });
  }

  /**
   * Start optimization loop
   */
  private startOptimizationLoop(): void {
    this.optimizationInterval = setInterval(() => {
      this.optimizeBandwidthDistribution();
    }, 10000); // Optimize every 10 seconds
  }

  /**
   * Start speaker detection
   */
  private startSpeakerDetection(): void {
    this.speakerDetectionInterval = setInterval(() => {
      this.detectCurrentSpeaker();
    }, 1000); // Check every second
  }

  /**
   * Detect current speaker based on audio levels
   */
  private detectCurrentSpeaker(): void {
    // This is a simplified implementation
    // In a real implementation, this would analyze audio levels from WebRTC stats
    
    let maxAudioLevel = 0;
    let speakerId: string | null = null;

    for (const [participantId, session] of this.participantSessions) {
      // Simulate audio level detection
      const audioLevel = Math.random(); // Replace with actual audio level detection
      
      if (audioLevel > maxAudioLevel && audioLevel > 0.3) { // Threshold for speaking
        maxAudioLevel = audioLevel;
        speakerId = participantId;
      }
    }

    if (speakerId !== this.currentSpeaker) {
      this.setCurrentSpeaker(speakerId);
    }
  }

  /**
   * Create default configuration
   */
  private createDefaultConfig(config?: Partial<MultiParticipantConfig>): MultiParticipantConfig {
    return {
      maxParticipants: 50,
      totalBandwidthLimit: 100, // 100 Mbps
      bandwidthStrategy: 'adaptive-quality',
      enableAdaptiveQuality: true,
      enableSpeakerDetection: true,
      enableScreenSharingPriority: true,
      qualityLevels: {
        low: { bandwidth: 0.5, resolution: '320x240', fps: 15 },
        medium: { bandwidth: 1.5, resolution: '640x480', fps: 24 },
        high: { bandwidth: 3.0, resolution: '1280x720', fps: 30 }
      },
      ...config
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }

    if (this.speakerDetectionInterval) {
      clearInterval(this.speakerDetectionInterval);
      this.speakerDetectionInterval = null;
    }

    this.participantSessions.clear();
    this.removeAllListeners();
  }
}