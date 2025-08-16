/**
 * Meeting analytics dashboard with compression performance metrics
 */
import { EventEmitter } from 'events';
import { VideoConferenceRoom, Participant, RTCConnectionStats } from './models/WebRTCModels';
import { VideoCompressionConfig, QualityMetrics } from './models/VideoModels';
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
export declare class MeetingAnalyticsEngine extends EventEmitter {
    private currentMeeting;
    private participantData;
    private connectionStats;
    private compressionData;
    private networkData;
    private qualityData;
    private speakingTimes;
    private lastSpeaker;
    private speakingStartTime;
    constructor();
    /**
     * Start analytics for a meeting
     */
    startMeetingAnalytics(room: VideoConferenceRoom): void;
    /**
     * End analytics for current meeting
     */
    endMeetingAnalytics(): MeetingAnalytics | null;
    /**
     * Add participant to analytics
     */
    addParticipant(participant: Participant): void;
    /**
     * Remove participant from analytics
     */
    removeParticipant(participantId: string): void;
    /**
     * Update compression metrics
     */
    updateCompressionMetrics(originalSize: number, compressedSize: number, compressionTime: number, config: VideoCompressionConfig): void;
    /**
     * Update network metrics
     */
    updateNetworkMetrics(participantId: string, stats: RTCConnectionStats): void;
    /**
     * Update quality metrics
     */
    updateQualityMetrics(participantId: string, qualityMetrics: QualityMetrics): void;
    /**
     * Update speaking time
     */
    updateSpeakingTime(currentSpeaker: string | null): void;
    /**
     * Add chat analytics
     */
    addChatAnalytics(chatStats: ChatStats): void;
    /**
     * Add recording analytics
     */
    addRecordingAnalytics(recordingSession: RecordingSession): void;
    /**
     * Get current analytics
     */
    getCurrentAnalytics(): MeetingAnalytics | null;
    /**
     * Generate insights from analytics data
     */
    private generateInsights;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Calculate network metrics from connection stats
     */
    private calculateNetworkMetrics;
    /**
     * Calculate connection quality score
     */
    private calculateConnectionQuality;
    /**
     * Update running average
     */
    private updateAverage;
    /**
     * Get frame count (simplified)
     */
    private getFrameCount;
    /**
     * Reset analytics data
     */
    private resetAnalytics;
    /**
     * Generate unique meeting ID
     */
    private generateMeetingId;
    /**
     * Clean up resources
     */
    destroy(): void;
}
//# sourceMappingURL=MeetingAnalytics.d.ts.map