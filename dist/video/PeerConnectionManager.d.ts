/**
 * Peer Connection Manager for WebRTC connections with STUN/TURN fallback
 */
import { EventEmitter } from 'events';
import { RTCConfiguration, RTCConnectionStats, SessionDescription, ICECandidate, MediaStreamConfig } from './models/WebRTCModels';
import { VideoCompressionConfig } from './models/VideoModels';
/**
 * Manages WebRTC peer connections with quantum compression integration
 */
export declare class PeerConnectionManager extends EventEmitter {
    private peerConnections;
    private localStreams;
    private remoteStreams;
    private compressionEngines;
    private connectionStats;
    private rtcConfiguration;
    private statsInterval;
    constructor(rtcConfiguration?: RTCConfiguration);
    /**
     * Create a new peer connection
     */
    createPeerConnection(participantId: string, compressionConfig: VideoCompressionConfig, isInitiator?: boolean): Promise<RTCPeerConnection>;
    /**
     * Add local media stream to peer connection
     */
    addLocalStream(participantId: string, stream: MediaStream, streamConfig: MediaStreamConfig): Promise<void>;
    /**
     * Create and send offer
     */
    createOffer(participantId: string): Promise<SessionDescription>;
    /**
     * Create and send answer
     */
    createAnswer(participantId: string, offer: SessionDescription): Promise<SessionDescription>;
    /**
     * Handle received answer
     */
    handleAnswer(participantId: string, answer: SessionDescription): Promise<void>;
    /**
     * Add ICE candidate
     */
    addIceCandidate(participantId: string, candidate: ICECandidate): Promise<void>;
    /**
     * Close peer connection
     */
    closePeerConnection(participantId: string): Promise<void>;
    /**
     * Get connection statistics
     */
    getConnectionStats(participantId: string): RTCConnectionStats | undefined;
    /**
     * Get all connection statistics
     */
    getAllConnectionStats(): Map<string, RTCConnectionStats>;
    /**
     * Replace video track (for screen sharing)
     */
    replaceVideoTrack(participantId: string, newVideoTrack: MediaStreamTrack): Promise<void>;
    /**
     * Update RTC configuration (e.g., add new STUN/TURN servers)
     */
    updateRTCConfiguration(config: RTCConfiguration): void;
    /**
     * Process media stream with quantum compression
     */
    private processStreamWithQuantumCompression;
    /**
     * Setup event handlers for peer connection
     */
    private setupPeerConnectionEventHandlers;
    /**
     * Get default RTC configuration with STUN/TURN servers
     */
    private getDefaultRTCConfiguration;
    /**
     * Setup periodic statistics collection
     */
    private setupStatsCollection;
    /**
     * Update connection statistics from WebRTC stats
     */
    private updateConnectionStats;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
//# sourceMappingURL=PeerConnectionManager.d.ts.map