/**
 * WebRTC models for video conferencing infrastructure
 */

import { VideoCompressionConfig } from './VideoModels';

/**
 * WebRTC peer connection state
 */
export type RTCConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';

/**
 * WebRTC signaling message types
 */
export type SignalingMessageType = 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'room-update' | 'error';

/**
 * WebRTC signaling message
 */
export interface SignalingMessage {
  type: SignalingMessageType;
  roomId: string;
  participantId: string;
  data?: any;
  timestamp: number;
}

/**
 * ICE candidate information
 */
export interface ICECandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}

/**
 * Session description (offer/answer)
 */
export interface SessionDescription {
  type: 'offer' | 'answer';
  sdp: string;
}

/**
 * Participant in a video conference room
 */
export interface Participant {
  id: string;
  name: string;
  joinedAt: number;
  connectionState: RTCConnectionState;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  bandwidthUsage: number; // Mbps
  compressionStats: {
    averageCompressionRatio: number;
    totalBytesTransmitted: number;
    totalBytesReceived: number;
  };
}

/**
 * Video conference room
 */
export interface VideoConferenceRoom {
  roomId: string;
  roomCode: string;
  createdAt: number;
  createdBy: string;
  participants: Map<string, Participant>;
  maxParticipants: number;
  isRecording: boolean;
  recordingStartedAt?: number;
  compressionSettings: VideoCompressionConfig;
  roomSettings: {
    allowScreenSharing: boolean;
    allowRecording: boolean;
    requireAuth: boolean;
    autoAdaptQuality: boolean;
  };
  bandwidthDistribution: BandwidthDistribution;
}

/**
 * Bandwidth distribution across participants
 */
export interface BandwidthDistribution {
  totalAvailableBandwidth: number; // Mbps
  allocatedBandwidth: Map<string, number>; // participantId -> allocated bandwidth
  reservedBandwidth: number; // Reserved for signaling and overhead
  adaptiveAllocation: boolean;
  lastUpdated: number;
}

/**
 * WebRTC peer connection configuration
 */
export interface RTCConfiguration {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
  bundlePolicy?: 'balanced' | 'max-compat' | 'max-bundle';
  rtcpMuxPolicy?: 'negotiate' | 'require';
  iceTransportPolicy?: 'all' | 'relay';
}

/**
 * STUN/TURN server configuration
 */
export interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
  credentialType?: 'password' | 'oauth';
}

/**
 * WebRTC connection statistics
 */
export interface RTCConnectionStats {
  participantId: string;
  connectionState: RTCConnectionState;
  iceConnectionState: 'new' | 'checking' | 'connected' | 'completed' | 'failed' | 'disconnected' | 'closed';
  signalingState: 'stable' | 'have-local-offer' | 'have-remote-offer' | 'have-local-pranswer' | 'have-remote-pranswer' | 'closed';
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  packetsLost: number;
  jitter: number;
  roundTripTime: number;
  availableIncomingBitrate?: number;
  availableOutgoingBitrate?: number;
  timestamp: number;
}

/**
 * Room creation request
 */
export interface CreateRoomRequest {
  roomCode?: string; // Optional custom room code
  maxParticipants?: number;
  compressionSettings?: Partial<VideoCompressionConfig>;
  roomSettings?: {
    allowScreenSharing?: boolean;
    allowRecording?: boolean;
    requireAuth?: boolean;
    autoAdaptQuality?: boolean;
  };
  createdBy: string;
}

/**
 * Join room request
 */
export interface JoinRoomRequest {
  roomId: string;
  participantName: string;
  participantId: string;
  capabilities: {
    supportsVideo: boolean;
    supportsAudio: boolean;
    supportsScreenSharing: boolean;
    maxBandwidth: number; // Mbps
  };
}

/**
 * Room update event
 */
export interface RoomUpdateEvent {
  type: 'participant-joined' | 'participant-left' | 'participant-updated' | 'room-settings-changed' | 'recording-started' | 'recording-stopped';
  roomId: string;
  data: any;
  timestamp: number;
}

/**
 * Bandwidth optimization result
 */
export interface BandwidthOptimizationResult {
  participantAllocations: Map<string, number>;
  totalBandwidthUsed: number;
  optimizationStrategy: 'equal-distribution' | 'priority-based' | 'adaptive-quality' | 'speaker-focus';
  qualityAdjustments: Map<string, 'low' | 'medium' | 'high'>;
  estimatedSavings: number; // Percentage
}

/**
 * WebRTC error types
 */
export type WebRTCErrorType = 
  | 'connection-failed'
  | 'signaling-error'
  | 'ice-gathering-failed'
  | 'media-access-denied'
  | 'bandwidth-exceeded'
  | 'room-full'
  | 'room-not-found'
  | 'participant-not-found'
  | 'compression-failed';

/**
 * WebRTC error
 */
export interface WebRTCError {
  type: WebRTCErrorType;
  message: string;
  code?: string;
  participantId?: string;
  roomId?: string;
  timestamp: number;
  details?: any;
}

/**
 * WebRTC error class
 */
export class WebRTCError extends Error {
  public type: WebRTCErrorType;
  public code?: string;
  public participantId?: string;
  public roomId?: string;
  public timestamp: number;
  public details?: any;

  constructor(errorData: {
    type: WebRTCErrorType;
    message: string;
    code?: string;
    participantId?: string;
    roomId?: string;
    timestamp: number;
    details?: any;
  }) {
    super(errorData.message);
    this.name = 'WebRTCError';
    this.type = errorData.type;
    this.code = errorData.code;
    this.participantId = errorData.participantId;
    this.roomId = errorData.roomId;
    this.timestamp = errorData.timestamp;
    this.details = errorData.details;
  }
}

/**
 * Media stream configuration
 */
export interface MediaStreamConfig {
  video: {
    enabled: boolean;
    width?: number;
    height?: number;
    frameRate?: number;
    facingMode?: 'user' | 'environment';
  };
  audio: {
    enabled: boolean;
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
  };
  screen: {
    enabled: boolean;
    includeAudio?: boolean;
    cursor?: 'always' | 'motion' | 'never';
  };
}

/**
 * Quantum compression stream metadata
 */
export interface QuantumStreamMetadata {
  compressionLevel: number;
  quantumBitDepth: number;
  entanglementLevel: number;
  superpositionComplexity: number;
  interferenceThreshold: number;
  adaptiveCompression: boolean;
  compressionRatio: number;
  processingLatency: number;
}