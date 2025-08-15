/**
 * Peer Connection Manager for WebRTC connections with STUN/TURN fallback
 */

import { EventEmitter } from 'events';
import { 
  RTCConfiguration, 
  RTCIceServer, 
  RTCConnectionStats,
  WebRTCError,
  SessionDescription,
  ICECandidate,
  MediaStreamConfig,
  QuantumStreamMetadata
} from './models/WebRTCModels';
import { VideoCompressionEngine } from './VideoCompressionEngine';
import { VideoCompressionConfig } from './models/VideoModels';

/**
 * Manages WebRTC peer connections with quantum compression integration
 */
export class PeerConnectionManager extends EventEmitter {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStreams: Map<string, MediaStream> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private compressionEngines: Map<string, VideoCompressionEngine> = new Map();
  private connectionStats: Map<string, RTCConnectionStats> = new Map();
  private rtcConfiguration: RTCConfiguration;
  private statsInterval: NodeJS.Timeout | null = null;

  constructor(rtcConfiguration?: RTCConfiguration) {
    super();
    this.rtcConfiguration = rtcConfiguration || this.getDefaultRTCConfiguration();
    this.setupStatsCollection();
  }

  /**
   * Create a new peer connection
   */
  async createPeerConnection(
    participantId: string, 
    compressionConfig: VideoCompressionConfig,
    isInitiator: boolean = false
  ): Promise<RTCPeerConnection> {
    if (this.peerConnections.has(participantId)) {
      throw new WebRTCError({
        type: 'connection-failed',
        message: `Peer connection already exists for participant ${participantId}`,
        participantId,
        timestamp: Date.now()
      });
    }

    const peerConnection = new RTCPeerConnection(this.rtcConfiguration);
    const compressionEngine = new VideoCompressionEngine(compressionConfig);

    this.peerConnections.set(participantId, peerConnection);
    this.compressionEngines.set(participantId, compressionEngine);

    // Setup event handlers
    this.setupPeerConnectionEventHandlers(participantId, peerConnection);

    // Initialize connection stats
    this.connectionStats.set(participantId, {
      participantId,
      connectionState: peerConnection.connectionState,
      iceConnectionState: peerConnection.iceConnectionState,
      signalingState: peerConnection.signalingState,
      bytesReceived: 0,
      bytesSent: 0,
      packetsReceived: 0,
      packetsSent: 0,
      packetsLost: 0,
      jitter: 0,
      roundTripTime: 0,
      timestamp: Date.now()
    });

    this.emit('peer-connection-created', { participantId, peerConnection });
    return peerConnection;
  }

  /**
   * Add local media stream to peer connection
   */
  async addLocalStream(
    participantId: string, 
    stream: MediaStream,
    streamConfig: MediaStreamConfig
  ): Promise<void> {
    const peerConnection = this.peerConnections.get(participantId);
    if (!peerConnection) {
      throw new WebRTCError({
        type: 'connection-failed',
        message: `No peer connection found for participant ${participantId}`,
        participantId,
        timestamp: Date.now()
      });
    }

    const compressionEngine = this.compressionEngines.get(participantId);
    if (!compressionEngine) {
      throw new WebRTCError({
        type: 'compression-failed',
        message: `No compression engine found for participant ${participantId}`,
        participantId,
        timestamp: Date.now()
      });
    }

    // Process video tracks with quantum compression
    const processedStream = await this.processStreamWithQuantumCompression(
      stream, 
      compressionEngine,
      streamConfig
    );

    // Add tracks to peer connection
    processedStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, processedStream);
    });

    this.localStreams.set(participantId, processedStream);
    this.emit('local-stream-added', { participantId, stream: processedStream });
  }

  /**
   * Create and send offer
   */
  async createOffer(participantId: string): Promise<SessionDescription> {
    const peerConnection = this.peerConnections.get(participantId);
    if (!peerConnection) {
      throw new WebRTCError({
        type: 'connection-failed',
        message: `No peer connection found for participant ${participantId}`,
        participantId,
        timestamp: Date.now()
      });
    }

    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await peerConnection.setLocalDescription(offer);

      const sessionDescription: SessionDescription = {
        type: 'offer',
        sdp: offer.sdp || ''
      };

      this.emit('offer-created', { participantId, offer: sessionDescription });
      return sessionDescription;
    } catch (error) {
      throw new WebRTCError({
        type: 'signaling-error',
        message: `Failed to create offer: ${error.message}`,
        participantId,
        timestamp: Date.now(),
        details: error
      });
    }
  }

  /**
   * Create and send answer
   */
  async createAnswer(participantId: string, offer: SessionDescription): Promise<SessionDescription> {
    const peerConnection = this.peerConnections.get(participantId);
    if (!peerConnection) {
      throw new WebRTCError({
        type: 'connection-failed',
        message: `No peer connection found for participant ${participantId}`,
        participantId,
        timestamp: Date.now()
      });
    }

    try {
      await peerConnection.setRemoteDescription({
        type: offer.type,
        sdp: offer.sdp
      });

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      const sessionDescription: SessionDescription = {
        type: 'answer',
        sdp: answer.sdp || ''
      };

      this.emit('answer-created', { participantId, answer: sessionDescription });
      return sessionDescription;
    } catch (error) {
      throw new WebRTCError({
        type: 'signaling-error',
        message: `Failed to create answer: ${error.message}`,
        participantId,
        timestamp: Date.now(),
        details: error
      });
    }
  }

  /**
   * Handle received answer
   */
  async handleAnswer(participantId: string, answer: SessionDescription): Promise<void> {
    const peerConnection = this.peerConnections.get(participantId);
    if (!peerConnection) {
      throw new WebRTCError({
        type: 'connection-failed',
        message: `No peer connection found for participant ${participantId}`,
        participantId,
        timestamp: Date.now()
      });
    }

    try {
      await peerConnection.setRemoteDescription({
        type: answer.type,
        sdp: answer.sdp
      });

      this.emit('answer-handled', { participantId });
    } catch (error) {
      throw new WebRTCError({
        type: 'signaling-error',
        message: `Failed to handle answer: ${error.message}`,
        participantId,
        timestamp: Date.now(),
        details: error
      });
    }
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(participantId: string, candidate: ICECandidate): Promise<void> {
    const peerConnection = this.peerConnections.get(participantId);
    if (!peerConnection) {
      throw new WebRTCError({
        type: 'connection-failed',
        message: `No peer connection found for participant ${participantId}`,
        participantId,
        timestamp: Date.now()
      });
    }

    try {
      await peerConnection.addIceCandidate({
        candidate: candidate.candidate,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid
      });

      this.emit('ice-candidate-added', { participantId, candidate });
    } catch (error) {
      throw new WebRTCError({
        type: 'ice-gathering-failed',
        message: `Failed to add ICE candidate: ${error.message}`,
        participantId,
        timestamp: Date.now(),
        details: error
      });
    }
  }

  /**
   * Close peer connection
   */
  async closePeerConnection(participantId: string): Promise<void> {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
    }

    // Clean up associated resources
    this.compressionEngines.delete(participantId);
    this.connectionStats.delete(participantId);
    
    const localStream = this.localStreams.get(participantId);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      this.localStreams.delete(participantId);
    }

    const remoteStream = this.remoteStreams.get(participantId);
    if (remoteStream) {
      this.remoteStreams.delete(participantId);
    }

    this.emit('peer-connection-closed', { participantId });
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(participantId: string): RTCConnectionStats | undefined {
    return this.connectionStats.get(participantId);
  }

  /**
   * Get all connection statistics
   */
  getAllConnectionStats(): Map<string, RTCConnectionStats> {
    return new Map(this.connectionStats);
  }

  /**
   * Update RTC configuration (e.g., add new STUN/TURN servers)
   */
  updateRTCConfiguration(config: RTCConfiguration): void {
    this.rtcConfiguration = config;
    
    // Update existing connections
    for (const [participantId, peerConnection] of this.peerConnections) {
      // Note: RTCPeerConnection doesn't support runtime configuration updates
      // This would require recreating connections in a real implementation
      this.emit('rtc-configuration-updated', { participantId, config });
    }
  }

  /**
   * Process media stream with quantum compression
   */
  private async processStreamWithQuantumCompression(
    stream: MediaStream,
    compressionEngine: VideoCompressionEngine,
    streamConfig: MediaStreamConfig
  ): Promise<MediaStream> {
    // For now, return the original stream
    // In a full implementation, this would process video frames through the compression engine
    // and create a new MediaStream with compressed data
    
    const processedStream = stream.clone();
    
    // Add quantum compression metadata to the stream
    const metadata: QuantumStreamMetadata = {
      compressionLevel: compressionEngine.getConfig().quantumCompressionLevel,
      quantumBitDepth: 8, // Default quantum bit depth
      entanglementLevel: 4, // Default entanglement level
      superpositionComplexity: 5, // Default superposition complexity
      interferenceThreshold: 0.5, // Default interference threshold
      adaptiveCompression: true,
      compressionRatio: 0, // Will be updated during processing
      processingLatency: 0 // Will be updated during processing
    };

    // Store metadata for later use
    (processedStream as any).quantumMetadata = metadata;

    return processedStream;
  }

  /**
   * Setup event handlers for peer connection
   */
  private setupPeerConnectionEventHandlers(participantId: string, peerConnection: RTCPeerConnection): void {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate: ICECandidate = {
          candidate: event.candidate.candidate,
          sdpMLineIndex: event.candidate.sdpMLineIndex || 0,
          sdpMid: event.candidate.sdpMid || ''
        };
        this.emit('ice-candidate', { participantId, candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      this.remoteStreams.set(participantId, remoteStream);
      this.emit('remote-stream-added', { participantId, stream: remoteStream });
    };

    peerConnection.onconnectionstatechange = () => {
      const stats = this.connectionStats.get(participantId);
      if (stats) {
        stats.connectionState = peerConnection.connectionState;
        stats.timestamp = Date.now();
      }
      this.emit('connection-state-changed', { 
        participantId, 
        connectionState: peerConnection.connectionState 
      });
    };

    peerConnection.oniceconnectionstatechange = () => {
      const stats = this.connectionStats.get(participantId);
      if (stats) {
        stats.iceConnectionState = peerConnection.iceConnectionState;
        stats.timestamp = Date.now();
      }
      this.emit('ice-connection-state-changed', { 
        participantId, 
        iceConnectionState: peerConnection.iceConnectionState 
      });
    };

    peerConnection.onsignalingstatechange = () => {
      const stats = this.connectionStats.get(participantId);
      if (stats) {
        stats.signalingState = peerConnection.signalingState;
        stats.timestamp = Date.now();
      }
      this.emit('signaling-state-changed', { 
        participantId, 
        signalingState: peerConnection.signalingState 
      });
    };

    peerConnection.onicegatheringstatechange = () => {
      this.emit('ice-gathering-state-changed', { 
        participantId, 
        iceGatheringState: peerConnection.iceGatheringState 
      });
    };
  }

  /**
   * Get default RTC configuration with STUN/TURN servers
   */
  private getDefaultRTCConfiguration(): RTCConfiguration {
    const iceServers: RTCIceServer[] = [
      // Google's public STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      
      // Additional public STUN servers for redundancy
      { urls: 'stun:stun.stunprotocol.org:3478' },
      { urls: 'stun:stun.voiparound.com' },
      { urls: 'stun:stun.voipbuster.com' }
      
      // TURN servers would be added here in production
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'password'
      // }
    ];

    return {
      iceServers,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceTransportPolicy: 'all'
    };
  }

  /**
   * Setup periodic statistics collection
   */
  private setupStatsCollection(): void {
    this.statsInterval = setInterval(async () => {
      for (const [participantId, peerConnection] of this.peerConnections) {
        try {
          const stats = await peerConnection.getStats();
          await this.updateConnectionStats(participantId, stats);
        } catch (error) {
          console.error(`Failed to collect stats for participant ${participantId}:`, error);
        }
      }
    }, 5000); // Collect stats every 5 seconds
  }

  /**
   * Update connection statistics from WebRTC stats
   */
  private async updateConnectionStats(participantId: string, rtcStats: RTCStatsReport): Promise<void> {
    const currentStats = this.connectionStats.get(participantId);
    if (!currentStats) return;

    let bytesReceived = 0;
    let bytesSent = 0;
    let packetsReceived = 0;
    let packetsSent = 0;
    let packetsLost = 0;
    let jitter = 0;
    let roundTripTime = 0;

    rtcStats.forEach((report) => {
      if (report.type === 'inbound-rtp') {
        bytesReceived += report.bytesReceived || 0;
        packetsReceived += report.packetsReceived || 0;
        packetsLost += report.packetsLost || 0;
        jitter += report.jitter || 0;
      } else if (report.type === 'outbound-rtp') {
        bytesSent += report.bytesSent || 0;
        packetsSent += report.packetsSent || 0;
      } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        roundTripTime = report.currentRoundTripTime || 0;
      }
    });

    const updatedStats: RTCConnectionStats = {
      ...currentStats,
      bytesReceived,
      bytesSent,
      packetsReceived,
      packetsSent,
      packetsLost,
      jitter,
      roundTripTime,
      timestamp: Date.now()
    };

    this.connectionStats.set(participantId, updatedStats);
    this.emit('stats-updated', { participantId, stats: updatedStats });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    // Close all peer connections
    for (const participantId of this.peerConnections.keys()) {
      this.closePeerConnection(participantId);
    }

    this.removeAllListeners();
  }
}