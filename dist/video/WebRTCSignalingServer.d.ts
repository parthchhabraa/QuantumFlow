/**
 * WebRTC Signaling Server for quantum-compressed video conferencing
 */
import { EventEmitter } from 'events';
import { SignalingMessage, VideoConferenceRoom, Participant, CreateRoomRequest, JoinRoomRequest } from './models/WebRTCModels';
/**
 * WebRTC Signaling Server manages room creation, participant management,
 * and signaling message routing for quantum-compressed video conferencing
 */
export declare class WebRTCSignalingServer extends EventEmitter {
    private rooms;
    private participantRoomMap;
    private roomCodeMap;
    private connectionHandlers;
    constructor();
    /**
     * Create a new video conference room
     */
    createRoom(request: CreateRoomRequest): Promise<VideoConferenceRoom>;
    /**
     * Join a participant to a room
     */
    joinRoom(request: JoinRoomRequest): Promise<{
        room: VideoConferenceRoom;
        participant: Participant;
    }>;
    /**
     * Remove a participant from their current room
     */
    leaveRoom(participantId: string): Promise<void>;
    /**
     * Handle signaling messages between participants
     */
    handleSignalingMessage(message: SignalingMessage): Promise<void>;
    /**
     * Register a connection handler for a participant
     */
    registerConnectionHandler(participantId: string, handler: (message: SignalingMessage) => void): void;
    /**
     * Unregister a connection handler for a participant
     */
    unregisterConnectionHandler(participantId: string): void;
    /**
     * Get room by ID
     */
    getRoom(roomId: string): VideoConferenceRoom | undefined;
    /**
     * Get room by room code
     */
    getRoomByCode(roomCode: string): VideoConferenceRoom | undefined;
    /**
     * Get all active rooms
     */
    getAllRooms(): VideoConferenceRoom[];
    /**
     * Update participant connection state
     */
    updateParticipantConnectionState(participantId: string, state: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed'): void;
    /**
     * Optimize bandwidth distribution across participants
     */
    private optimizeBandwidthDistribution;
    /**
     * Forward signaling message to target participants
     */
    private forwardSignalingMessage;
    /**
     * Broadcast message to all participants in a room
     */
    private broadcastToRoom;
    /**
     * Handle join room signaling message
     */
    private handleJoinRoomMessage;
    /**
     * Generate unique room ID
     */
    private generateRoomId;
    /**
     * Generate human-readable room code
     */
    private generateRoomCode;
    /**
     * Setup cleanup interval for inactive rooms
     */
    private setupCleanupInterval;
}
//# sourceMappingURL=WebRTCSignalingServer.d.ts.map