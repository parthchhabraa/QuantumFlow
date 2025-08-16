/**
 * Multi-Participant Manager for optimized bandwidth distribution in video conferencing
 */
import { EventEmitter } from 'events';
import { VideoConferenceRoom, Participant, BandwidthDistribution, BandwidthOptimizationResult, RTCConnectionStats } from './models/WebRTCModels';
import { NetworkConditions } from './models/VideoModels';
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
    totalBandwidthLimit: number;
    bandwidthStrategy: BandwidthStrategy;
    enableAdaptiveQuality: boolean;
    enableSpeakerDetection: boolean;
    enableScreenSharingPriority: boolean;
    qualityLevels: {
        low: {
            bandwidth: number;
            resolution: string;
            fps: number;
        };
        medium: {
            bandwidth: number;
            resolution: string;
            fps: number;
        };
        high: {
            bandwidth: number;
            resolution: string;
            fps: number;
        };
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
export declare class MultiParticipantManager extends EventEmitter {
    private room;
    private participantSessions;
    private peerConnectionManager;
    private signalingServer;
    private config;
    private optimizationInterval;
    private speakerDetectionInterval;
    private currentSpeaker;
    constructor(room: VideoConferenceRoom, peerConnectionManager: PeerConnectionManager, signalingServer: WebRTCSignalingServer, config?: Partial<MultiParticipantConfig>);
    /**
     * Add participant to the session
     */
    addParticipant(participant: Participant, priority?: ParticipantPriority): Promise<ParticipantSession>;
    /**
     * Remove participant from the session
     */
    removeParticipant(participantId: string): Promise<void>;
    /**
     * Update participant priority
     */
    updateParticipantPriority(participantId: string, priority: ParticipantPriority): Promise<void>;
    /**
     * Update participant network conditions
     */
    updateNetworkConditions(participantId: string, conditions: NetworkConditions): void;
    /**
     * Set current speaker
     */
    setCurrentSpeaker(participantId: string | null): void;
    /**
     * Get participant session
     */
    getParticipantSession(participantId: string): ParticipantSession | undefined;
    /**
     * Get all participant sessions
     */
    getAllParticipantSessions(): Map<string, ParticipantSession>;
    /**
     * Get current bandwidth distribution
     */
    getCurrentBandwidthDistribution(): BandwidthDistribution;
    /**
     * Optimize bandwidth distribution across all participants
     */
    optimizeBandwidthDistribution(): Promise<BandwidthOptimizationResult>;
    /**
     * Equal distribution bandwidth strategy
     */
    private equalDistributionStrategy;
    /**
     * Priority-based bandwidth strategy
     */
    private priorityBasedStrategy;
    /**
     * Adaptive quality bandwidth strategy
     */
    private adaptiveQualityStrategy;
    /**
     * Speaker-focus bandwidth strategy
     */
    private speakerFocusStrategy;
    /**
     * Apply bandwidth optimization results
     */
    private applyBandwidthOptimization;
    /**
     * Update participant compression configuration
     */
    private updateParticipantCompressionConfig;
    /**
     * Get network multiplier based on conditions
     */
    private getNetworkMultiplier;
    /**
     * Calculate network quality from conditions
     */
    private calculateNetworkQuality;
    /**
     * Get compression level for quality
     */
    private getCompressionLevelForQuality;
    /**
     * Establish peer connections with other participants
     */
    private establishPeerConnections;
    /**
     * Setup event handlers
     */
    private setupEventHandlers;
    /**
     * Start optimization loop
     */
    private startOptimizationLoop;
    /**
     * Start speaker detection
     */
    private startSpeakerDetection;
    /**
     * Detect current speaker based on audio levels
     */
    private detectCurrentSpeaker;
    /**
     * Create default configuration
     */
    private createDefaultConfig;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
//# sourceMappingURL=MultiParticipantManager.d.ts.map