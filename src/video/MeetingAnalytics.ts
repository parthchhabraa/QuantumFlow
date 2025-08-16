/**
 * Meeting analytics dashboard with compression performance metrics
 */

import { EventEmitter } from 'events';
import { VideoConferenceRoom, Participant, RTCConnectionStats } from './models/WebRTCModels';
import { VideoCompressionConfig, VideoStreamStats, QualityMetrics } from './models/VideoModels';
import { RecordingSession } from './MeetingRecorder';
import { ChatStats } from './ChatManager';

export interface MeetingMetrics {
  /** Meeting ID */
  meetingId: string;
  /** Room ID */
  roomId: string;
  /** Meeting start time */
  startTime: number;
  /** Meeting end time */
  endTime?: number;
  /** Meeting duration in milliseconds */
  duration: number;
  /** Peak participant count */
  peakParticipants: number;
  /** Total participants who joined */
  totalParticipants: number;
  /** Average meeting duration per participant */
  averageParticipantDuration: number;
}

export interface CompressionMetrics {
  /** Total data processed */
  totalDataProcessed: number;
  /** Total data after compression */
  totalCompressedData: number;
  /** Overall compression ratio */
  overallCompressionRatio: number;
  /** Data saved in bytes */
  dataSaved: number;
  /** Data saved percentage */
  dataSavedPercentage: number;
  /** Average compression time per frame */
  averageCompressionTime: number;
  /** Compression efficiency score (0-100) */
  compressionEfficiency: number;
  /** Quantum compression statistics */
  quantumStats: {
    averageQuantumBitDepth: number;
    averageEntanglementLevel: number;
    averageSuperpositionComplexity: number;
    quantumEfficiencyScore: number;
  };
}

export interface NetworkMetrics {
  /** Average bandwidth usage per participant */
  averageBandwidthPerParticipant: number;
  /** Peak bandwidth usage */
  peakBandwidth: number;
  /** Total bandwidth saved through compression */
  bandwidthSaved: number;
  /** Average latency */
  averageLatency: number;
  /** Packet loss percentage */
  packetLossPercentage: number;
  /** Connection quality distribution */
  qualityDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  /** Network stability score (0-100) */
  networkStabilityScore: number;
}

export interface ParticipantMetrics {
  /** Participant ID */
  participantId: string;
  /** Participant name */
  participantName: string;
  /** Join time */
  joinTime: number;
  /** Leave time */
  leaveTime?: number;
  /** Duration in meeting */
  duration: number;
  /** Speaking time */
  speakingTime: number;
  /** Speaking percentage */
  speakingPercentage: number;
  /** Average video quality */
  averageVideoQuality: 'low' | 'medium' | 'high';
  /** Data usage */
  dataUsage: {
    sent: number;
    received: number;
    total: number;
  };
  /** Compression stats */
  compressionStats: {
    averageRatio: number;
    dataSaved: number;
  };
  /** Connection quality */
  connectionQuality: {
    average: number;
    worst: number;
    best: number;
  };
}

export interface QualityAnalytics {
  /** Video quality metrics */
  video: {
    averageResolution: string;
    averageFrameRate: number;
    qualityAdaptations: number;
    frameDropRate: number;
  };
  /** Audio quality metrics */
  audio: {
    averageBitrate: number;
    audioDropouts: number;
    echoInstances: number;
  };
  /** Overall quality score (0-100) */
  overallQualityScore: number;
}

export interface MeetingAnalytics {
  /** Meeting metrics */
  meeting: MeetingMetrics;
  /** Compression performance */
  compression: CompressionMetrics;
  /** Network performance */
  network: NetworkMetrics;
  /** Participant analytics */
  participants: ParticipantMetrics[];
  /** Quality analytics */
  quality: QualityAnalytics;
  /** Chat analytics */
  chat?: ChatStats;
  /** Recording analytics */
  recording?: {
    totalRecordingTime: number;
    recordingCompressionRatio: number;
    recordingDataSaved: number;
  };
  /** Generated insights */
  insights: string[];
  /** Performance recommendations */
  recommendations: string[];
}

export class MeetingAnalyticsEngine extends EventEmitter {
  private currentMeeting: MeetingAnalytics | null = null;
  private participantData: Map<string, ParticipantMetrics> = new Map();
  private connectionStats: Map<string, RTCConnectionStats[]> = new Map();
  private compressionData: CompressionMetrics;
  private networkData: NetworkMetrics;
  private qualityData: QualityAnalytics;
  private speakingTimes: Map<string, number> = new Map();
  private lastSpeaker: string | null = null;
  private speakingStartTime: number = 0;

  constructor() {
    super();
    
    this.compressionData = {
      totalDataProcessed: 0,
      totalCompressedData: 0,
      overallCompressionRatio: 1.0,
      dataSaved: 0,
      dataSavedPercentage: 0,
      averageCompressionTime: 0,
      compressionEfficiency: 0,
      quantumStats: {
        averageQuantumBitDepth: 0,
        averageEntanglementLevel: 0,
        averageSuperpositionComplexity: 0,
        quantumEfficiencyScore: 0
      }
    };

    this.networkData = {
      averageBandwidthPerParticipant: 0,
      peakBandwidth: 0,
      bandwidthSaved: 0,
      averageLatency: 0,
      packetLossPercentage: 0,
      qualityDistribution: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
      },
      networkStabilityScore: 0
    };

    this.qualityData = {
      video: {
        averageResolution: '720p',
        averageFrameRate: 30,
        qualityAdaptations: 0,
        frameDropRate: 0
      },
      audio: {
        averageBitrate: 128000,
        audioDropouts: 0,
        echoInstances: 0
      },
      overallQualityScore: 85
    };
  }

  /**
   * Start analytics for a meeting
   */
  startMeetingAnalytics(room: VideoConferenceRoom): void {
    const meetingId = this.generateMeetingId();
    
    this.currentMeeting = {
      meeting: {
        meetingId,
        roomId: room.roomId,
        startTime: Date.now(),
        duration: 0,
        peakParticipants: room.participants.size,
        totalParticipants: room.participants.size,
        averageParticipantDuration: 0
      },
      compression: { ...this.compressionData },
      network: { ...this.networkData },
      participants: [],
      quality: { ...this.qualityData },
      insights: [],
      recommendations: []
    };

    // Initialize participant metrics
    for (const [participantId, participant] of room.participants) {
      this.addParticipant(participant);
    }

    this.emit('analytics-started', { meetingId, roomId: room.roomId });
  }

  /**
   * End analytics for current meeting
   */
  endMeetingAnalytics(): MeetingAnalytics | null {
    if (!this.currentMeeting) {
      return null;
    }

    const endTime = Date.now();
    this.currentMeeting.meeting.endTime = endTime;
    this.currentMeeting.meeting.duration = endTime - this.currentMeeting.meeting.startTime;

    // Finalize participant metrics
    for (const participant of this.participantData.values()) {
      if (!participant.leaveTime) {
        participant.leaveTime = endTime;
        participant.duration = endTime - participant.joinTime;
      }
    }

    this.currentMeeting.participants = Array.from(this.participantData.values());

    // Calculate average participant duration
    const totalDuration = this.currentMeeting.participants.reduce((sum, p) => sum + p.duration, 0);
    this.currentMeeting.meeting.averageParticipantDuration = 
      totalDuration / this.currentMeeting.participants.length;

    // Generate insights and recommendations
    this.generateInsights();
    this.generateRecommendations();

    const analytics = this.currentMeeting;
    this.resetAnalytics();

    this.emit('analytics-completed', analytics);
    return analytics;
  }

  /**
   * Add participant to analytics
   */
  addParticipant(participant: Participant): void {
    if (!this.currentMeeting) return;

    const participantMetrics: ParticipantMetrics = {
      participantId: participant.id,
      participantName: participant.name,
      joinTime: Date.now(),
      duration: 0,
      speakingTime: 0,
      speakingPercentage: 0,
      averageVideoQuality: 'medium',
      dataUsage: {
        sent: 0,
        received: 0,
        total: 0
      },
      compressionStats: {
        averageRatio: 1.0,
        dataSaved: 0
      },
      connectionQuality: {
        average: 85,
        worst: 85,
        best: 85
      }
    };

    this.participantData.set(participant.id, participantMetrics);
    this.speakingTimes.set(participant.id, 0);

    // Update peak participants
    if (this.participantData.size > this.currentMeeting.meeting.peakParticipants) {
      this.currentMeeting.meeting.peakParticipants = this.participantData.size;
    }

    this.currentMeeting.meeting.totalParticipants++;
    this.emit('participant-added', participantMetrics);
  }

  /**
   * Remove participant from analytics
   */
  removeParticipant(participantId: string): void {
    const participant = this.participantData.get(participantId);
    if (!participant) return;

    participant.leaveTime = Date.now();
    participant.duration = participant.leaveTime - participant.joinTime;
    
    // Calculate speaking percentage
    const totalSpeakingTime = this.speakingTimes.get(participantId) || 0;
    participant.speakingTime = totalSpeakingTime;
    participant.speakingPercentage = (totalSpeakingTime / participant.duration) * 100;

    this.emit('participant-removed', participant);
  }

  /**
   * Update compression metrics
   */
  updateCompressionMetrics(
    originalSize: number,
    compressedSize: number,
    compressionTime: number,
    config: VideoCompressionConfig
  ): void {
    if (!this.currentMeeting) return;

    const compression = this.currentMeeting.compression;
    
    compression.totalDataProcessed += originalSize;
    compression.totalCompressedData += compressedSize;
    compression.dataSaved = compression.totalDataProcessed - compression.totalCompressedData;
    compression.overallCompressionRatio = compression.totalDataProcessed / compression.totalCompressedData;
    compression.dataSavedPercentage = (compression.dataSaved / compression.totalDataProcessed) * 100;

    // Update average compression time
    const frameCount = this.getFrameCount();
    compression.averageCompressionTime = 
      (compression.averageCompressionTime * (frameCount - 1) + compressionTime) / frameCount;

    // Update quantum stats
    compression.quantumStats.averageQuantumBitDepth = 
      this.updateAverage(compression.quantumStats.averageQuantumBitDepth, config.quantumBitDepth, frameCount);
    compression.quantumStats.averageEntanglementLevel = 
      this.updateAverage(compression.quantumStats.averageEntanglementLevel, config.maxEntanglementLevel, frameCount);
    compression.quantumStats.averageSuperpositionComplexity = 
      this.updateAverage(compression.quantumStats.averageSuperpositionComplexity, config.superpositionComplexity, frameCount);

    // Calculate compression efficiency (higher ratio + lower time = better efficiency)
    compression.compressionEfficiency = Math.min(100, 
      (compression.overallCompressionRatio * 50) + 
      (Math.max(0, 100 - compression.averageCompressionTime) * 0.5)
    );

    // Calculate quantum efficiency score
    compression.quantumStats.quantumEfficiencyScore = 
      (compression.overallCompressionRatio - 1) * 100 / 3; // Normalize to 0-100 scale

    this.emit('compression-updated', compression);
  }

  /**
   * Update network metrics
   */
  updateNetworkMetrics(participantId: string, stats: RTCConnectionStats): void {
    if (!this.currentMeeting) return;

    // Store connection stats
    if (!this.connectionStats.has(participantId)) {
      this.connectionStats.set(participantId, []);
    }
    this.connectionStats.get(participantId)!.push(stats);

    // Update participant data usage
    const participant = this.participantData.get(participantId);
    if (participant) {
      participant.dataUsage.sent = stats.bytesSent;
      participant.dataUsage.received = stats.bytesReceived;
      participant.dataUsage.total = stats.bytesSent + stats.bytesReceived;
    }

    // Update network metrics
    this.calculateNetworkMetrics();
    this.emit('network-updated', this.currentMeeting.network);
  }

  /**
   * Update quality metrics
   */
  updateQualityMetrics(participantId: string, qualityMetrics: QualityMetrics): void {
    if (!this.currentMeeting) return;

    const participant = this.participantData.get(participantId);
    if (participant) {
      participant.averageVideoQuality = qualityMetrics.currentQuality;
    }

    // Update overall quality metrics
    this.qualityData.video.qualityAdaptations += qualityMetrics.qualityHistory.length;
    this.qualityData.video.frameDropRate = qualityMetrics.frameDropRate;

    this.currentMeeting.quality = { ...this.qualityData };
    this.emit('quality-updated', this.currentMeeting.quality);
  }

  /**
   * Update speaking time
   */
  updateSpeakingTime(currentSpeaker: string | null): void {
    const now = Date.now();

    // End previous speaker's time
    if (this.lastSpeaker && this.lastSpeaker !== currentSpeaker) {
      const speakingDuration = now - this.speakingStartTime;
      const currentTime = this.speakingTimes.get(this.lastSpeaker) || 0;
      this.speakingTimes.set(this.lastSpeaker, currentTime + speakingDuration);
    }

    // Start new speaker's time
    if (currentSpeaker && currentSpeaker !== this.lastSpeaker) {
      this.speakingStartTime = now;
    }

    this.lastSpeaker = currentSpeaker;
  }

  /**
   * Add chat analytics
   */
  addChatAnalytics(chatStats: ChatStats): void {
    if (!this.currentMeeting) return;

    this.currentMeeting.chat = chatStats;
    this.emit('chat-analytics-updated', chatStats);
  }

  /**
   * Add recording analytics
   */
  addRecordingAnalytics(recordingSession: RecordingSession): void {
    if (!this.currentMeeting) return;

    this.currentMeeting.recording = {
      totalRecordingTime: recordingSession.duration,
      recordingCompressionRatio: recordingSession.overallCompressionRatio,
      recordingDataSaved: recordingSession.totalOriginalSize - recordingSession.totalCompressedSize
    };

    this.emit('recording-analytics-updated', this.currentMeeting.recording);
  }

  /**
   * Get current analytics
   */
  getCurrentAnalytics(): MeetingAnalytics | null {
    if (!this.currentMeeting) return null;

    // Update duration
    this.currentMeeting.meeting.duration = Date.now() - this.currentMeeting.meeting.startTime;
    
    return { ...this.currentMeeting };
  }

  /**
   * Generate insights from analytics data
   */
  private generateInsights(): void {
    if (!this.currentMeeting) return;

    const insights: string[] = [];
    const { compression, network, participants, quality } = this.currentMeeting;

    // Compression insights
    if (compression.overallCompressionRatio > 2.0) {
      insights.push(`Excellent compression achieved: ${compression.overallCompressionRatio.toFixed(1)}x ratio saved ${(compression.dataSavedPercentage).toFixed(1)}% bandwidth`);
    }

    if (compression.quantumStats.quantumEfficiencyScore > 80) {
      insights.push('Quantum compression algorithms performed exceptionally well');
    }

    // Network insights
    if (network.packetLossPercentage < 1) {
      insights.push('Excellent network stability with minimal packet loss');
    } else if (network.packetLossPercentage > 5) {
      insights.push('High packet loss detected - network conditions may have affected call quality');
    }

    // Participant insights
    const activeSpeakers = participants.filter(p => p.speakingPercentage > 20);
    if (activeSpeakers.length === 1) {
      insights.push(`Meeting was primarily led by ${activeSpeakers[0].participantName}`);
    } else if (activeSpeakers.length > participants.length * 0.7) {
      insights.push('Highly collaborative meeting with most participants actively speaking');
    }

    // Quality insights
    if (quality.overallQualityScore > 90) {
      insights.push('Exceptional call quality maintained throughout the meeting');
    }

    this.currentMeeting.insights = insights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): void {
    if (!this.currentMeeting) return;

    const recommendations: string[] = [];
    const { compression, network, quality } = this.currentMeeting;

    // Compression recommendations
    if (compression.overallCompressionRatio < 1.5) {
      recommendations.push('Consider increasing quantum compression level for better bandwidth savings');
    }

    if (compression.averageCompressionTime > 50) {
      recommendations.push('Reduce compression complexity to improve real-time performance');
    }

    // Network recommendations
    if (network.averageLatency > 150) {
      recommendations.push('High latency detected - consider using a closer server location');
    }

    if (network.packetLossPercentage > 3) {
      recommendations.push('Network instability detected - recommend wired connection for future calls');
    }

    // Quality recommendations
    if (quality.video.frameDropRate > 5) {
      recommendations.push('High frame drop rate - consider reducing video quality or improving network connection');
    }

    if (quality.audio.audioDropouts > 2) {
      recommendations.push('Audio dropouts detected - check microphone and audio settings');
    }

    this.currentMeeting.recommendations = recommendations;
  }

  /**
   * Calculate network metrics from connection stats
   */
  private calculateNetworkMetrics(): void {
    if (!this.currentMeeting) return;

    let totalBandwidth = 0;
    let totalLatency = 0;
    let totalPacketLoss = 0;
    let participantCount = 0;
    const qualityCount = { excellent: 0, good: 0, fair: 0, poor: 0 };

    for (const [participantId, statsList] of this.connectionStats) {
      if (statsList.length === 0) continue;

      const latestStats = statsList[statsList.length - 1];
      const participant = this.participantData.get(participantId);

      if (participant) {
        // Calculate bandwidth (bytes per second to Mbps)
        const bandwidth = (latestStats.bytesSent + latestStats.bytesReceived) * 8 / (1024 * 1024);
        totalBandwidth += bandwidth;

        // Update participant connection quality
        const quality = this.calculateConnectionQuality(latestStats);
        participant.connectionQuality.average = quality;
        
        if (quality >= 90) qualityCount.excellent++;
        else if (quality >= 75) qualityCount.good++;
        else if (quality >= 60) qualityCount.fair++;
        else qualityCount.poor++;

        totalLatency += latestStats.roundTripTime;
        totalPacketLoss += (latestStats.packetsLost / latestStats.packetsReceived) * 100;
        participantCount++;
      }
    }

    if (participantCount > 0) {
      this.currentMeeting.network.averageBandwidthPerParticipant = totalBandwidth / participantCount;
      this.currentMeeting.network.averageLatency = totalLatency / participantCount;
      this.currentMeeting.network.packetLossPercentage = totalPacketLoss / participantCount;
      this.currentMeeting.network.qualityDistribution = qualityCount;
      
      // Calculate network stability score
      this.currentMeeting.network.networkStabilityScore = Math.max(0, 
        100 - (this.currentMeeting.network.packetLossPercentage * 10) - 
        (Math.max(0, this.currentMeeting.network.averageLatency - 100) * 0.2)
      );
    }
  }

  /**
   * Calculate connection quality score
   */
  private calculateConnectionQuality(stats: RTCConnectionStats): number {
    const latencyScore = Math.max(0, 100 - stats.roundTripTime * 0.5);
    const packetLossScore = Math.max(0, 100 - (stats.packetsLost / stats.packetsReceived) * 1000);
    const jitterScore = Math.max(0, 100 - stats.jitter * 2);

    return (latencyScore + packetLossScore + jitterScore) / 3;
  }

  /**
   * Update running average
   */
  private updateAverage(currentAverage: number, newValue: number, count: number): number {
    return (currentAverage * (count - 1) + newValue) / count;
  }

  /**
   * Get frame count (simplified)
   */
  private getFrameCount(): number {
    return Math.floor(this.compressionData.totalDataProcessed / (1920 * 1080 * 4)) || 1;
  }

  /**
   * Reset analytics data
   */
  private resetAnalytics(): void {
    this.currentMeeting = null;
    this.participantData.clear();
    this.connectionStats.clear();
    this.speakingTimes.clear();
    this.lastSpeaker = null;
    this.speakingStartTime = 0;
  }

  /**
   * Generate unique meeting ID
   */
  private generateMeetingId(): string {
    return `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.resetAnalytics();
    this.removeAllListeners();
  }
}