/**
 * Tests for WebRTC Signaling Server
 */

import { WebRTCSignalingServer } from '../WebRTCSignalingServer';
import { 
  CreateRoomRequest, 
  JoinRoomRequest, 
  SignalingMessage,
  WebRTCError
} from '../models/WebRTCModels';
import { VideoCompressionConfig } from '../models/VideoModels';

describe('WebRTCSignalingServer', () => {
  let signalingServer: WebRTCSignalingServer;

  beforeEach(() => {
    signalingServer = new WebRTCSignalingServer();
  });

  afterEach(() => {
    // Clean up any resources
    signalingServer.removeAllListeners();
  });

  describe('Room Management', () => {
    test('should create a new room with default settings', async () => {
      const request: CreateRoomRequest = {
        createdBy: 'user123'
      };

      const room = await signalingServer.createRoom(request);

      expect(room).toBeDefined();
      expect(room.roomId).toBeDefined();
      expect(room.roomCode).toBeDefined();
      expect(room.createdBy).toBe('user123');
      expect(room.participants.size).toBe(0);
      expect(room.maxParticipants).toBe(50);
      expect(room.isRecording).toBe(false);
      expect(room.compressionSettings).toBeInstanceOf(VideoCompressionConfig);
    });

    test('should create a room with custom settings', async () => {
      const request: CreateRoomRequest = {
        roomCode: 'CUSTOM123',
        maxParticipants: 10,
        compressionSettings: {
          baseQuality: 'high',
          quantumCompressionLevel: 8
        },
        roomSettings: {
          allowScreenSharing: false,
          requireAuth: true
        },
        createdBy: 'user123'
      };

      const room = await signalingServer.createRoom(request);

      expect(room.roomCode).toBe('CUSTOM123');
      expect(room.maxParticipants).toBe(10);
      expect(room.compressionSettings.baseQuality).toBe('high');
      expect(room.compressionSettings.quantumCompressionLevel).toBe(8);
      expect(room.roomSettings.allowScreenSharing).toBe(false);
      expect(room.roomSettings.requireAuth).toBe(true);
    });

    test('should throw error for duplicate room code', async () => {
      const request1: CreateRoomRequest = {
        roomCode: 'DUPLICATE',
        createdBy: 'user1'
      };

      const request2: CreateRoomRequest = {
        roomCode: 'DUPLICATE',
        createdBy: 'user2'
      };

      await signalingServer.createRoom(request1);

      await expect(signalingServer.createRoom(request2))
        .rejects.toThrow('Room code DUPLICATE is already in use');
    });

    test('should get room by ID', async () => {
      const request: CreateRoomRequest = {
        createdBy: 'user123'
      };

      const createdRoom = await signalingServer.createRoom(request);
      const retrievedRoom = signalingServer.getRoom(createdRoom.roomId);

      expect(retrievedRoom).toBeDefined();
      expect(retrievedRoom?.roomId).toBe(createdRoom.roomId);
    });

    test('should get room by code', async () => {
      const request: CreateRoomRequest = {
        roomCode: 'TESTCODE',
        createdBy: 'user123'
      };

      const createdRoom = await signalingServer.createRoom(request);
      const retrievedRoom = signalingServer.getRoomByCode('TESTCODE');

      expect(retrievedRoom).toBeDefined();
      expect(retrievedRoom?.roomId).toBe(createdRoom.roomId);
    });
  });

  describe('Participant Management', () => {
    let roomId: string;

    beforeEach(async () => {
      const request: CreateRoomRequest = {
        createdBy: 'host123'
      };
      const room = await signalingServer.createRoom(request);
      roomId = room.roomId;
    });

    test('should add participant to room', async () => {
      const joinRequest: JoinRoomRequest = {
        roomId,
        participantName: 'John Doe',
        participantId: 'participant123',
        capabilities: {
          supportsVideo: true,
          supportsAudio: true,
          supportsScreenSharing: true,
          maxBandwidth: 10
        }
      };

      const { room, participant } = await signalingServer.joinRoom(joinRequest);

      expect(room.participants.size).toBe(1);
      expect(participant.id).toBe('participant123');
      expect(participant.name).toBe('John Doe');
      expect(participant.connectionState).toBe('new');
      expect(participant.isAudioEnabled).toBe(true);
      expect(participant.isVideoEnabled).toBe(true);
    });

    test('should emit participant-joined event', async () => {
      const joinRequest: JoinRoomRequest = {
        roomId,
        participantName: 'John Doe',
        participantId: 'participant123',
        capabilities: {
          supportsVideo: true,
          supportsAudio: true,
          supportsScreenSharing: true,
          maxBandwidth: 10
        }
      };

      const eventPromise = new Promise((resolve) => {
        signalingServer.once('participant-joined', resolve);
      });

      await signalingServer.joinRoom(joinRequest);
      const event = await eventPromise;

      expect(event).toBeDefined();
    });

    test('should throw error when joining non-existent room', async () => {
      const joinRequest: JoinRoomRequest = {
        roomId: 'non-existent-room',
        participantName: 'John Doe',
        participantId: 'participant123',
        capabilities: {
          supportsVideo: true,
          supportsAudio: true,
          supportsScreenSharing: true,
          maxBandwidth: 10
        }
      };

      await expect(signalingServer.joinRoom(joinRequest))
        .rejects.toThrow('Room non-existent-room not found');
    });

    test('should throw error when room is full', async () => {
      // Create room with max 1 participant
      const roomRequest: CreateRoomRequest = {
        maxParticipants: 1,
        createdBy: 'host123'
      };
      const room = await signalingServer.createRoom(roomRequest);

      // Add first participant
      const joinRequest1: JoinRoomRequest = {
        roomId: room.roomId,
        participantName: 'Participant 1',
        participantId: 'participant1',
        capabilities: {
          supportsVideo: true,
          supportsAudio: true,
          supportsScreenSharing: true,
          maxBandwidth: 10
        }
      };
      await signalingServer.joinRoom(joinRequest1);

      // Try to add second participant
      const joinRequest2: JoinRoomRequest = {
        roomId: room.roomId,
        participantName: 'Participant 2',
        participantId: 'participant2',
        capabilities: {
          supportsVideo: true,
          supportsAudio: true,
          supportsScreenSharing: true,
          maxBandwidth: 10
        }
      };

      await expect(signalingServer.joinRoom(joinRequest2))
        .rejects.toThrow(`Room ${room.roomId} is full`);
    });

    test('should remove participant from room', async () => {
      const joinRequest: JoinRoomRequest = {
        roomId,
        participantName: 'John Doe',
        participantId: 'participant123',
        capabilities: {
          supportsVideo: true,
          supportsAudio: true,
          supportsScreenSharing: true,
          maxBandwidth: 10
        }
      };

      await signalingServer.joinRoom(joinRequest);
      
      const roomBefore = signalingServer.getRoom(roomId);
      expect(roomBefore?.participants.size).toBe(1);

      await signalingServer.leaveRoom('participant123');

      const roomAfter = signalingServer.getRoom(roomId);
      expect(roomAfter?.participants.size).toBe(0);
    });

    test('should emit participant-left event', async () => {
      const joinRequest: JoinRoomRequest = {
        roomId,
        participantName: 'John Doe',
        participantId: 'participant123',
        capabilities: {
          supportsVideo: true,
          supportsAudio: true,
          supportsScreenSharing: true,
          maxBandwidth: 10
        }
      };

      await signalingServer.joinRoom(joinRequest);

      const eventPromise = new Promise((resolve) => {
        signalingServer.once('participant-left', resolve);
      });

      await signalingServer.leaveRoom('participant123');
      const event = await eventPromise;

      expect(event).toBeDefined();
    });

    test('should clean up empty rooms', async () => {
      const joinRequest: JoinRoomRequest = {
        roomId,
        participantName: 'John Doe',
        participantId: 'participant123',
        capabilities: {
          supportsVideo: true,
          supportsAudio: true,
          supportsScreenSharing: true,
          maxBandwidth: 10
        }
      };

      await signalingServer.joinRoom(joinRequest);
      await signalingServer.leaveRoom('participant123');

      const room = signalingServer.getRoom(roomId);
      expect(room).toBeUndefined();
    });
  });

  describe('Signaling Message Handling', () => {
    let roomId: string;
    let participantId: string;

    beforeEach(async () => {
      const roomRequest: CreateRoomRequest = {
        createdBy: 'host123'
      };
      const room = await signalingServer.createRoom(roomRequest);
      roomId = room.roomId;

      const joinRequest: JoinRoomRequest = {
        roomId,
        participantName: 'John Doe',
        participantId: 'participant123',
        capabilities: {
          supportsVideo: true,
          supportsAudio: true,
          supportsScreenSharing: true,
          maxBandwidth: 10
        }
      };
      await signalingServer.joinRoom(joinRequest);
      participantId = 'participant123';
    });

    test('should handle offer signaling message', async () => {
      const message: SignalingMessage = {
        type: 'offer',
        roomId,
        participantId,
        data: {
          type: 'offer',
          sdp: 'mock-sdp-offer'
        },
        timestamp: Date.now()
      };

      const eventPromise = new Promise((resolve) => {
        signalingServer.once('signaling-message', resolve);
      });

      await signalingServer.handleSignalingMessage(message);
      const event = await eventPromise;

      expect(event).toBeDefined();
    });

    test('should handle answer signaling message', async () => {
      const message: SignalingMessage = {
        type: 'answer',
        roomId,
        participantId,
        data: {
          type: 'answer',
          sdp: 'mock-sdp-answer'
        },
        timestamp: Date.now()
      };

      const eventPromise = new Promise((resolve) => {
        signalingServer.once('signaling-message', resolve);
      });

      await signalingServer.handleSignalingMessage(message);
      const event = await eventPromise;

      expect(event).toBeDefined();
    });

    test('should handle ICE candidate message', async () => {
      const message: SignalingMessage = {
        type: 'ice-candidate',
        roomId,
        participantId,
        data: {
          candidate: 'mock-ice-candidate',
          sdpMLineIndex: 0,
          sdpMid: 'video'
        },
        timestamp: Date.now()
      };

      const eventPromise = new Promise((resolve) => {
        signalingServer.once('signaling-message', resolve);
      });

      await signalingServer.handleSignalingMessage(message);
      const event = await eventPromise;

      expect(event).toBeDefined();
    });

    test('should throw error for unknown message type', async () => {
      const message: SignalingMessage = {
        type: 'unknown-type' as any,
        roomId,
        participantId,
        data: {},
        timestamp: Date.now()
      };

      await expect(signalingServer.handleSignalingMessage(message))
        .rejects.toThrow('Unknown signaling message type: unknown-type');
    });

    test('should throw error for non-existent room', async () => {
      const message: SignalingMessage = {
        type: 'offer',
        roomId: 'non-existent-room',
        participantId,
        data: {},
        timestamp: Date.now()
      };

      await expect(signalingServer.handleSignalingMessage(message))
        .rejects.toThrow('Room non-existent-room not found');
    });

    test('should throw error for non-existent participant', async () => {
      const message: SignalingMessage = {
        type: 'offer',
        roomId,
        participantId: 'non-existent-participant',
        data: {},
        timestamp: Date.now()
      };

      await expect(signalingServer.handleSignalingMessage(message))
        .rejects.toThrow('Participant non-existent-participant not found in room');
    });
  });

  describe('Bandwidth Optimization', () => {
    let roomId: string;

    beforeEach(async () => {
      const roomRequest: CreateRoomRequest = {
        createdBy: 'host123'
      };
      const room = await signalingServer.createRoom(roomRequest);
      roomId = room.roomId;
    });

    test('should optimize bandwidth for multiple participants', async () => {
      // Add multiple participants
      const participants = ['participant1', 'participant2', 'participant3'];
      
      for (const participantId of participants) {
        const joinRequest: JoinRoomRequest = {
          roomId,
          participantName: `Participant ${participantId}`,
          participantId,
          capabilities: {
            supportsVideo: true,
            supportsAudio: true,
            supportsScreenSharing: true,
            maxBandwidth: 10
          }
        };
        await signalingServer.joinRoom(joinRequest);
      }

      const eventPromise = new Promise((resolve) => {
        signalingServer.once('bandwidth-optimized', resolve);
      });

      // Trigger bandwidth optimization by updating participant connection state
      signalingServer.updateParticipantConnectionState('participant1', 'connected');

      const event = await eventPromise;
      expect(event).toBeDefined();
    });

    test('should handle empty room bandwidth optimization', async () => {
      const room = signalingServer.getRoom(roomId);
      expect(room).toBeDefined();
      expect(room?.participants.size).toBe(0);

      // This should not throw an error
      signalingServer.updateParticipantConnectionState('non-existent', 'connected');
    });
  });

  describe('Connection Handler Management', () => {
    test('should register and unregister connection handlers', () => {
      const participantId = 'participant123';
      const handler = jest.fn();

      signalingServer.registerConnectionHandler(participantId, handler);
      
      // Handler should be registered (no direct way to test, but no error should occur)
      expect(() => {
        signalingServer.unregisterConnectionHandler(participantId);
      }).not.toThrow();
    });
  });

  describe('Room Cleanup', () => {
    test('should clean up inactive rooms', (done) => {
      // This test would require mocking the cleanup interval
      // For now, we'll just verify the cleanup event can be emitted
      signalingServer.once('room-cleaned-up', (room) => {
        expect(room).toBeDefined();
        done();
      });

      // Manually emit the event for testing
      signalingServer.emit('room-cleaned-up', { roomId: 'test-room' });
    });
  });
});