"use strict";
/**
 * WebRTC Signaling Server for quantum-compressed video conferencing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRTCSignalingServer = void 0;
const events_1 = require("events");
const WebRTCModels_1 = require("./models/WebRTCModels");
const VideoModels_1 = require("./models/VideoModels");
/**
 * WebRTC Signaling Server manages room creation, participant management,
 * and signaling message routing for quantum-compressed video conferencing
 */
class WebRTCSignalingServer extends events_1.EventEmitter {
    constructor() {
        super();
        this.rooms = new Map();
        this.participantRoomMap = new Map();
        this.roomCodeMap = new Map(); // roomCode -> roomId
        this.connectionHandlers = new Map();
        this.setupCleanupInterval();
    }
    /**
     * Create a new video conference room
     */
    async createRoom(request) {
        const roomId = this.generateRoomId();
        const roomCode = request.roomCode || this.generateRoomCode();
        // Check if room code is already in use
        if (this.roomCodeMap.has(roomCode)) {
            throw new WebRTCModels_1.WebRTCError({
                type: 'room-not-found',
                message: `Room code ${roomCode} is already in use`,
                timestamp: Date.now()
            });
        }
        const compressionSettings = new VideoModels_1.VideoCompressionConfig(request.compressionSettings?.baseQuality || 'medium', request.compressionSettings?.adaptiveQuality ?? true, request.compressionSettings?.quantumCompressionLevel || 5, request.compressionSettings?.bandwidthThreshold || 2);
        const room = {
            roomId,
            roomCode,
            createdAt: Date.now(),
            createdBy: request.createdBy,
            participants: new Map(),
            maxParticipants: request.maxParticipants || 50,
            isRecording: false,
            compressionSettings,
            roomSettings: {
                allowScreenSharing: request.roomSettings?.allowScreenSharing ?? true,
                allowRecording: request.roomSettings?.allowRecording ?? true,
                requireAuth: request.roomSettings?.requireAuth ?? false,
                autoAdaptQuality: request.roomSettings?.autoAdaptQuality ?? true
            },
            bandwidthDistribution: {
                totalAvailableBandwidth: 100, // Default 100 Mbps
                allocatedBandwidth: new Map(),
                reservedBandwidth: 5, // 5 Mbps reserved for signaling
                adaptiveAllocation: true,
                lastUpdated: Date.now()
            }
        };
        this.rooms.set(roomId, room);
        this.roomCodeMap.set(roomCode, roomId);
        this.emit('room-created', room);
        return room;
    }
    /**
     * Join a participant to a room
     */
    async joinRoom(request) {
        const room = this.rooms.get(request.roomId);
        if (!room) {
            throw new WebRTCModels_1.WebRTCError({
                type: 'room-not-found',
                message: `Room ${request.roomId} not found`,
                roomId: request.roomId,
                timestamp: Date.now()
            });
        }
        if (room.participants.size >= room.maxParticipants) {
            throw new WebRTCModels_1.WebRTCError({
                type: 'room-full',
                message: `Room ${request.roomId} is full`,
                roomId: request.roomId,
                timestamp: Date.now()
            });
        }
        // Check if participant is already in another room
        const existingRoomId = this.participantRoomMap.get(request.participantId);
        if (existingRoomId && existingRoomId !== request.roomId) {
            await this.leaveRoom(request.participantId);
        }
        const participant = {
            id: request.participantId,
            name: request.participantName,
            joinedAt: Date.now(),
            connectionState: 'new',
            isAudioEnabled: true,
            isVideoEnabled: true,
            isScreenSharing: false,
            networkQuality: 'good',
            bandwidthUsage: 0,
            compressionStats: {
                averageCompressionRatio: 0,
                totalBytesTransmitted: 0,
                totalBytesReceived: 0
            }
        };
        room.participants.set(request.participantId, participant);
        this.participantRoomMap.set(request.participantId, request.roomId);
        // Optimize bandwidth distribution
        await this.optimizeBandwidthDistribution(request.roomId);
        const updateEvent = {
            type: 'participant-joined',
            roomId: request.roomId,
            data: participant,
            timestamp: Date.now()
        };
        this.broadcastToRoom(request.roomId, {
            type: 'room-update',
            roomId: request.roomId,
            participantId: 'server',
            data: updateEvent,
            timestamp: Date.now()
        });
        this.emit('participant-joined', { room, participant });
        return { room, participant };
    }
    /**
     * Remove a participant from their current room
     */
    async leaveRoom(participantId) {
        const roomId = this.participantRoomMap.get(participantId);
        if (!roomId) {
            return; // Participant not in any room
        }
        const room = this.rooms.get(roomId);
        if (!room) {
            this.participantRoomMap.delete(participantId);
            return;
        }
        const participant = room.participants.get(participantId);
        room.participants.delete(participantId);
        this.participantRoomMap.delete(participantId);
        this.connectionHandlers.delete(participantId);
        // Optimize bandwidth distribution after participant leaves
        await this.optimizeBandwidthDistribution(roomId);
        const updateEvent = {
            type: 'participant-left',
            roomId,
            data: { participantId, participant },
            timestamp: Date.now()
        };
        this.broadcastToRoom(roomId, {
            type: 'room-update',
            roomId,
            participantId: 'server',
            data: updateEvent,
            timestamp: Date.now()
        });
        // Clean up empty rooms
        if (room.participants.size === 0) {
            this.rooms.delete(roomId);
            this.roomCodeMap.delete(room.roomCode);
            this.emit('room-closed', room);
        }
        this.emit('participant-left', { roomId, participantId, participant });
    }
    /**
     * Handle signaling messages between participants
     */
    async handleSignalingMessage(message) {
        const room = this.rooms.get(message.roomId);
        if (!room) {
            throw new WebRTCModels_1.WebRTCError({
                type: 'room-not-found',
                message: `Room ${message.roomId} not found`,
                roomId: message.roomId,
                timestamp: Date.now()
            });
        }
        const participant = room.participants.get(message.participantId);
        if (!participant) {
            throw new WebRTCModels_1.WebRTCError({
                type: 'participant-not-found',
                message: `Participant ${message.participantId} not found in room`,
                roomId: message.roomId,
                participantId: message.participantId,
                timestamp: Date.now()
            });
        }
        switch (message.type) {
            case 'offer':
            case 'answer':
            case 'ice-candidate':
                // Forward signaling messages to other participants
                this.forwardSignalingMessage(message);
                break;
            case 'join-room':
                // Handle join room request
                await this.handleJoinRoomMessage(message);
                break;
            case 'leave-room':
                // Handle leave room request
                await this.leaveRoom(message.participantId);
                break;
            default:
                throw new WebRTCModels_1.WebRTCError({
                    type: 'signaling-error',
                    message: `Unknown signaling message type: ${message.type}`,
                    roomId: message.roomId,
                    participantId: message.participantId,
                    timestamp: Date.now()
                });
        }
        this.emit('signaling-message', message);
    }
    /**
     * Register a connection handler for a participant
     */
    registerConnectionHandler(participantId, handler) {
        this.connectionHandlers.set(participantId, handler);
    }
    /**
     * Unregister a connection handler for a participant
     */
    unregisterConnectionHandler(participantId) {
        this.connectionHandlers.delete(participantId);
    }
    /**
     * Get room by ID
     */
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    /**
     * Get room by room code
     */
    getRoomByCode(roomCode) {
        const roomId = this.roomCodeMap.get(roomCode);
        return roomId ? this.rooms.get(roomId) : undefined;
    }
    /**
     * Get all active rooms
     */
    getAllRooms() {
        return Array.from(this.rooms.values());
    }
    /**
     * Update participant connection state
     */
    updateParticipantConnectionState(participantId, state) {
        const roomId = this.participantRoomMap.get(participantId);
        if (!roomId)
            return;
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const participant = room.participants.get(participantId);
        if (!participant)
            return;
        participant.connectionState = state;
        const updateEvent = {
            type: 'participant-updated',
            roomId,
            data: { participantId, connectionState: state },
            timestamp: Date.now()
        };
        this.broadcastToRoom(roomId, {
            type: 'room-update',
            roomId,
            participantId: 'server',
            data: updateEvent,
            timestamp: Date.now()
        });
    }
    /**
     * Optimize bandwidth distribution across participants
     */
    async optimizeBandwidthDistribution(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} not found`);
        }
        const participants = Array.from(room.participants.values());
        const totalParticipants = participants.length;
        if (totalParticipants === 0) {
            return {
                participantAllocations: new Map(),
                totalBandwidthUsed: 0,
                optimizationStrategy: 'equal-distribution',
                qualityAdjustments: new Map(),
                estimatedSavings: 0
            };
        }
        const availableBandwidth = room.bandwidthDistribution.totalAvailableBandwidth - room.bandwidthDistribution.reservedBandwidth;
        // Equal distribution strategy for now (can be enhanced with priority-based allocation)
        const baseAllocation = availableBandwidth / totalParticipants;
        const participantAllocations = new Map();
        const qualityAdjustments = new Map();
        for (const participant of participants) {
            let allocation = baseAllocation;
            let quality = 'medium';
            // Adjust based on network quality
            switch (participant.networkQuality) {
                case 'excellent':
                    allocation *= 1.2;
                    quality = 'high';
                    break;
                case 'good':
                    allocation *= 1.0;
                    quality = 'medium';
                    break;
                case 'fair':
                    allocation *= 0.8;
                    quality = 'medium';
                    break;
                case 'poor':
                    allocation *= 0.6;
                    quality = 'low';
                    break;
            }
            participantAllocations.set(participant.id, allocation);
            qualityAdjustments.set(participant.id, quality);
        }
        // Update room bandwidth distribution
        room.bandwidthDistribution.allocatedBandwidth = participantAllocations;
        room.bandwidthDistribution.lastUpdated = Date.now();
        const totalBandwidthUsed = Array.from(participantAllocations.values()).reduce((sum, allocation) => sum + allocation, 0);
        const estimatedSavings = ((availableBandwidth - totalBandwidthUsed) / availableBandwidth) * 100;
        const result = {
            participantAllocations,
            totalBandwidthUsed,
            optimizationStrategy: 'equal-distribution',
            qualityAdjustments,
            estimatedSavings: Math.max(0, estimatedSavings)
        };
        this.emit('bandwidth-optimized', { roomId, result });
        return result;
    }
    /**
     * Forward signaling message to target participants
     */
    forwardSignalingMessage(message) {
        const room = this.rooms.get(message.roomId);
        if (!room)
            return;
        // Forward to all other participants in the room
        for (const [participantId, participant] of room.participants) {
            if (participantId !== message.participantId) {
                const handler = this.connectionHandlers.get(participantId);
                if (handler) {
                    handler(message);
                }
            }
        }
    }
    /**
     * Broadcast message to all participants in a room
     */
    broadcastToRoom(roomId, message) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        for (const [participantId, participant] of room.participants) {
            const handler = this.connectionHandlers.get(participantId);
            if (handler) {
                handler(message);
            }
        }
    }
    /**
     * Handle join room signaling message
     */
    async handleJoinRoomMessage(message) {
        const joinRequest = message.data;
        try {
            await this.joinRoom(joinRequest);
        }
        catch (error) {
            const errorMessage = {
                type: 'error',
                roomId: message.roomId,
                participantId: 'server',
                data: error,
                timestamp: Date.now()
            };
            const handler = this.connectionHandlers.get(message.participantId);
            if (handler) {
                handler(errorMessage);
            }
        }
    }
    /**
     * Generate unique room ID
     */
    generateRoomId() {
        return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Generate human-readable room code
     */
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    /**
     * Setup cleanup interval for inactive rooms
     */
    setupCleanupInterval() {
        setInterval(() => {
            const now = Date.now();
            const inactiveThreshold = 24 * 60 * 60 * 1000; // 24 hours
            for (const [roomId, room] of this.rooms) {
                // Clean up rooms with no participants that are older than threshold
                if (room.participants.size === 0 && (now - room.createdAt) > inactiveThreshold) {
                    this.rooms.delete(roomId);
                    this.roomCodeMap.delete(room.roomCode);
                    this.emit('room-cleaned-up', room);
                }
            }
        }, 60 * 60 * 1000); // Run every hour
    }
}
exports.WebRTCSignalingServer = WebRTCSignalingServer;
//# sourceMappingURL=WebRTCSignalingServer.js.map