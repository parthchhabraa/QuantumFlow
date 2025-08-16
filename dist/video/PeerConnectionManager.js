"use strict";
/**
 * Peer Connection Manager for WebRTC connections with STUN/TURN fallback
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerConnectionManager = void 0;
const events_1 = require("events");
const WebRTCModels_1 = require("./models/WebRTCModels");
const VideoCompressionEngine_1 = require("./VideoCompressionEngine");
/**
 * Manages WebRTC peer connections with quantum compression integration
 */
class PeerConnectionManager extends events_1.EventEmitter {
    constructor(rtcConfiguration) {
        super();
        this.peerConnections = new Map();
        this.localStreams = new Map();
        this.remoteStreams = new Map();
        this.compressionEngines = new Map();
        this.connectionStats = new Map();
        this.statsInterval = null;
        this.rtcConfiguration = rtcConfiguration || this.getDefaultRTCConfiguration();
        this.setupStatsCollection();
    }
    /**
     * Create a new peer connection
     */
    async createPeerConnection(participantId, compressionConfig, isInitiator = false) {
        if (this.peerConnections.has(participantId)) {
            throw new WebRTCModels_1.WebRTCError({
                type: 'connection-failed',
                message: `Peer connection already exists for participant ${participantId}`,
                participantId,
                timestamp: Date.now()
            });
        }
        const peerConnection = new RTCPeerConnection(this.rtcConfiguration);
        const compressionEngine = new VideoCompressionEngine_1.VideoCompressionEngine(compressionConfig);
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
    async addLocalStream(participantId, stream, streamConfig) {
        const peerConnection = this.peerConnections.get(participantId);
        if (!peerConnection) {
            throw new WebRTCModels_1.WebRTCError({
                type: 'connection-failed',
                message: `No peer connection found for participant ${participantId}`,
                participantId,
                timestamp: Date.now()
            });
        }
        const compressionEngine = this.compressionEngines.get(participantId);
        if (!compressionEngine) {
            throw new WebRTCModels_1.WebRTCError({
                type: 'compression-failed',
                message: `No compression engine found for participant ${participantId}`,
                participantId,
                timestamp: Date.now()
            });
        }
        // Process video tracks with quantum compression
        const processedStream = await this.processStreamWithQuantumCompression(stream, compressionEngine, streamConfig);
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
    async createOffer(participantId) {
        const peerConnection = this.peerConnections.get(participantId);
        if (!peerConnection) {
            throw new WebRTCModels_1.WebRTCError({
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
            const sessionDescription = {
                type: 'offer',
                sdp: offer.sdp || ''
            };
            this.emit('offer-created', { participantId, offer: sessionDescription });
            return sessionDescription;
        }
        catch (error) {
            throw new WebRTCModels_1.WebRTCError({
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
    async createAnswer(participantId, offer) {
        const peerConnection = this.peerConnections.get(participantId);
        if (!peerConnection) {
            throw new WebRTCModels_1.WebRTCError({
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
            const sessionDescription = {
                type: 'answer',
                sdp: answer.sdp || ''
            };
            this.emit('answer-created', { participantId, answer: sessionDescription });
            return sessionDescription;
        }
        catch (error) {
            throw new WebRTCModels_1.WebRTCError({
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
    async handleAnswer(participantId, answer) {
        const peerConnection = this.peerConnections.get(participantId);
        if (!peerConnection) {
            throw new WebRTCModels_1.WebRTCError({
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
        }
        catch (error) {
            throw new WebRTCModels_1.WebRTCError({
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
    async addIceCandidate(participantId, candidate) {
        const peerConnection = this.peerConnections.get(participantId);
        if (!peerConnection) {
            throw new WebRTCModels_1.WebRTCError({
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
        }
        catch (error) {
            throw new WebRTCModels_1.WebRTCError({
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
    async closePeerConnection(participantId) {
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
    getConnectionStats(participantId) {
        return this.connectionStats.get(participantId);
    }
    /**
     * Get all connection statistics
     */
    getAllConnectionStats() {
        return new Map(this.connectionStats);
    }
    /**
     * Replace video track (for screen sharing)
     */
    async replaceVideoTrack(participantId, newVideoTrack) {
        const peerConnection = this.peerConnections.get(participantId);
        if (!peerConnection) {
            throw new WebRTCModels_1.WebRTCError({
                type: 'connection-failed',
                message: `No peer connection found for participant ${participantId}`,
                participantId,
                timestamp: Date.now()
            });
        }
        try {
            const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) {
                await sender.replaceTrack(newVideoTrack);
                this.emit('video-track-replaced', { participantId, track: newVideoTrack });
            }
            else {
                throw new Error('No video sender found');
            }
        }
        catch (error) {
            throw new WebRTCModels_1.WebRTCError({
                type: 'media-access-denied',
                message: `Failed to replace video track: ${error.message}`,
                participantId,
                timestamp: Date.now(),
                details: error
            });
        }
    }
    /**
     * Update RTC configuration (e.g., add new STUN/TURN servers)
     */
    updateRTCConfiguration(config) {
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
    async processStreamWithQuantumCompression(stream, compressionEngine, streamConfig) {
        // For now, return the original stream
        // In a full implementation, this would process video frames through the compression engine
        // and create a new MediaStream with compressed data
        const processedStream = stream.clone();
        // Add quantum compression metadata to the stream
        const metadata = {
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
        processedStream.quantumMetadata = metadata;
        return processedStream;
    }
    /**
     * Setup event handlers for peer connection
     */
    setupPeerConnectionEventHandlers(participantId, peerConnection) {
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                const candidate = {
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
    getDefaultRTCConfiguration() {
        const iceServers = [
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
    setupStatsCollection() {
        this.statsInterval = setInterval(async () => {
            for (const [participantId, peerConnection] of this.peerConnections) {
                try {
                    const stats = await peerConnection.getStats();
                    await this.updateConnectionStats(participantId, stats);
                }
                catch (error) {
                    console.error(`Failed to collect stats for participant ${participantId}:`, error);
                }
            }
        }, 5000); // Collect stats every 5 seconds
    }
    /**
     * Update connection statistics from WebRTC stats
     */
    async updateConnectionStats(participantId, rtcStats) {
        const currentStats = this.connectionStats.get(participantId);
        if (!currentStats)
            return;
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
            }
            else if (report.type === 'outbound-rtp') {
                bytesSent += report.bytesSent || 0;
                packetsSent += report.packetsSent || 0;
            }
            else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                roundTripTime = report.currentRoundTripTime || 0;
            }
        });
        const updatedStats = {
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
    destroy() {
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
exports.PeerConnectionManager = PeerConnectionManager;
//# sourceMappingURL=PeerConnectionManager.js.map