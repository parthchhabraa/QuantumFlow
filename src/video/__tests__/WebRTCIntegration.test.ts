/**
 * Integration tests for WebRTC video conferencing infrastructure
 */

import { WebRTCSignalingServer } from '../WebRTCSignalingServer';
import { PeerConnectionManager } from '../PeerConnectionManager';
import { MultiParticipantManager } from '../MultiParticipantManager';
import { 
  CreateRoomRequest, 
  JoinRoomRequest, 
  SignalingMessage,
  Participant,
  MediaStreamConfig
} from '../models/WebRTCModels';
import { VideoCompressionConfig, NetworkConditions } from '../models/VideoModels';

// Mock WebRTC APIs for integration testing
const mockRTCPeerConnection = {
  connectionState: 'new',
  iceConnectionState: 'new',
  signalingState: 'stable',
  iceGatheringState: 'new',
  addTrack: jest.fn(),
  createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-offer-sdp' }),
  createAnswer: jest.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-answer-sdp' }),
  setLocalDescription: jest.fn().mockResolvedValue(undefined),
  setRemoteDescription: jest.fn().mockResolvedValue(undefined),
  addIceCandidate: jest.fn().mockResolvedValue(undefined),
  getStats: jest.fn().mockResolvedValue(new Map()),
  close: jest.fn(),
  onicecandidate: jest.fn(),
  ontrack: jest.fn(),
  onconnectionstatechange: jest.fn(),
  oniceconnectionstatechange: jest.fn(),
  onsignalingstatechange: jest.fn(),
  onicegatheringstatechange: jest.fn()
};

const mockMediaStream: any = {
  getTracks: jest.fn(() => [
    { kind: 'video', stop: jest.fn() },
    { kind: 'audio', stop: jest.fn() }
  ]),
  clone: jest.fn(function(this: any) { return this; })
};

(global as any).RTCPeerConnection = jest.fn(() => mockRTCPeerConnection);

describe('WebRTC Infrastructure Integration', () => {
  let signalingServer: WebRTCSignalingServer;
  let peerConnectionManager: PeerConnectionManager;
  let multiParticipantManager: MultiParticipantManager;
  let roomId: string;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    signalingServer = new WebRTCSignalingServer();
    peerConnectionManager = new PeerConnectionManager();

    // Create a test room
    const roomRequest: CreateRoomRequest = {
      maxParticipants: 10,
      compressionSettings: {
        baseQuality: 'medium',
        quantumCompressionLevel: 5
      },
      createdBy: 'host123'
    };

    const room = await signalingServer.createRoom(roomRequest);
    roomId = room.roomId;

    multiParticipantManager = new MultiParticipantManager(
      room,
      peerConnectionManager,
      signalingServer,
      {
        maxParticipants: 10,
        totalBandwidthLimit: 50,
        bandwidthStrategy: 'adaptive-quality'
      }
    );
  });

  afterEach(() => {
    multiParticipantManager.destroy();
    peerConnectionManager.destroy();
    signalingServer.removeAllListeners();
  });

  describe('Complete Video Conference Flow', () => {
    test('should handle complete participant join and setup flow', async () => {
      // Step 1: Join room through signaling server
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

      // Step 2: Add participant to multi-participant manager
      const session = await multiParticipantManager.addParticipant(participant, 'normal');
      expect(session.participant.id).toBe('participant123');

      // Step 3: Create peer connection
      const peerConnection = await peerConnectionManager.createPeerConnection(
        'participant123',
        new VideoCompressionConfig(),
        true
      );
      expect(peerConnection).toBeDefined();

      // Step 4: Add media stream
      const streamConfig: MediaStreamConfig = {
        video: { enabled: true, width: 1280, height: 720, frameRate: 30 },
        audio: { enabled: true, echoCancellation: true },
        screen: { enabled: false }
      };

      await peerConnectionManager.addLocalStream(
        'participant123',
        mockMediaStream as any,
        streamConfig
      );

      expect(mockRTCPeerConnection.addTrack).toHaveBeenCalled();

      // Step 5: Create offer
      const offer = await peerConnectionManager.createOffer('participant123');
      expect(offer.type).toBe('offer');
      expect(offer.sdp).toBe('mock-offer-sdp');
    });

    test('should handle multiple participants joining and bandwidth optimization', async () => {
      const participants = [
        { id: 'participant1', name: 'John Doe' },
        { id: 'participant2', name: 'Jane Smith' },
        { id: 'participant3', name: 'Bob Johnson' }
      ];

      // Join all participants
      for (const participantData of participants) {
        const joinRequest: JoinRoomRequest = {
          roomId,
          participantName: participantData.name,
          participantId: participantData.id,
          capabilities: {
            supportsVideo: true,
            supportsAudio: true,
            supportsScreenSharing: true,
            maxBandwidth: 10
          }
        };

        const { participant } = await signalingServer.joinRoom(joinRequest);
        await multiParticipantManager.addParticipant(participant, 'normal');
        
        await peerConnectionManager.createPeerConnection(
          participantData.id,
          new VideoCompressionConfig(),
          false
        );
      }

      // Verify all participants are added
      const room = signalingServer.getRoom(roomId);
      expect(room?.participants.size).toBe(3);

      const allSessions = multiParticipantManager.getAllParticipantSessions();
      expect(allSessions.size).toBe(3);

      // Test bandwidth optimization
      const optimizationResult = await multiParticipantManager.optimizeBandwidthDistribution();
      expect(optimizationResult.participantAllocations.size).toBe(3);
      expect(optimizationResult.totalBandwidthUsed).toBeGreaterThan(0);
    });

    test('should handle signaling message flow between participants', async () => {
      // Add two participants
      const participant1Data = { id: 'participant1', name: 'John Doe' };
      const participant2Data = { id: 'participant2', name: 'Jane Smith' };

      for (const participantData of [participant1Data, participant2Data]) {
        const joinRequest: JoinRoomRequest = {
          roomId,
          participantName: participantData.name,
          participantId: participantData.id,
          capabilities: {
            supportsVideo: true,
            supportsAudio: true,
            supportsScreenSharing: true,
            maxBandwidth: 10
          }
        };

        const { participant } = await signalingServer.joinRoom(joinRequest);
        await multiParticipantManager.addParticipant(participant, 'normal');
      }

      // Register connection handlers
      const receivedMessages: SignalingMessage[] = [];
      
      signalingServer.registerConnectionHandler('participant1', (message) => {
        receivedMessages.push(message);
      });

      signalingServer.registerConnectionHandler('participant2', (message) => {
        receivedMessages.push(message);
      });

      // Send offer from participant1
      const offerMessage: SignalingMessage = {
        type: 'offer',
        roomId,
        participantId: 'participant1',
        data: {
          type: 'offer',
          sdp: 'mock-offer-sdp'
        },
        timestamp: Date.now()
      };

      await signalingServer.handleSignalingMessage(offerMessage);

      // Send answer from participant2
      const answerMessage: SignalingMessage = {
        type: 'answer',
        roomId,
        participantId: 'participant2',
        data: {
          type: 'answer',
          sdp: 'mock-answer-sdp'
        },
        timestamp: Date.now()
      };

      await signalingServer.handleSignalingMessage(answerMessage);

      // Verify messages were processed
      expect(receivedMessages.length).toBeGreaterThan(0);
    });

    test('should handle participant leaving and cleanup', async () => {
      // Add participant
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

      const { participant } = await signalingServer.joinRoom(joinRequest);
      await multiParticipantManager.addParticipant(participant, 'normal');
      
      await peerConnectionManager.createPeerConnection(
        'participant123',
        new VideoCompressionConfig(),
        false
      );

      // Verify participant is added
      let room = signalingServer.getRoom(roomId);
      expect(room?.participants.size).toBe(1);

      let session = multiParticipantManager.getParticipantSession('participant123');
      expect(session).toBeDefined();

      // Remove participant
      await multiParticipantManager.removeParticipant('participant123');
      await signalingServer.leaveRoom('participant123');

      // Verify cleanup
      room = signalingServer.getRoom(roomId);
      expect(room?.participants.size).toBe(0);

      session = multiParticipantManager.getParticipantSession('participant123');
      expect(session).toBeUndefined();

      expect(mockRTCPeerConnection.close).toHaveBeenCalled();
    });
  });

  describe('Network Conditions and Quality Adaptation', () => {
    test('should adapt quality based on network conditions', async () => {
      // Add participant
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

      const { participant } = await signalingServer.joinRoom(joinRequest);
      await multiParticipantManager.addParticipant(participant, 'normal');

      // Simulate poor network conditions
      const poorConditions: NetworkConditions = {
        bandwidth: 1, // Low bandwidth
        latency: 200, // High latency
        packetLoss: 5, // High packet loss
        jitter: 50,
        stability: 0.3, // Low stability
        timestamp: Date.now()
      };

      multiParticipantManager.updateNetworkConditions('participant123', poorConditions);

      // Optimize bandwidth
      const result = await multiParticipantManager.optimizeBandwidthDistribution();

      // Should allocate lower bandwidth and quality
      const allocation = result.participantAllocations.get('participant123');
      const quality = result.qualityAdjustments.get('participant123');

      expect(allocation).toBeLessThan(2); // Should get low bandwidth allocation
      expect(quality).toBe('low'); // Should get low quality

      // Simulate improved network conditions
      const goodConditions: NetworkConditions = {
        bandwidth: 10, // High bandwidth
        latency: 30, // Low latency
        packetLoss: 0.1, // Low packet loss
        jitter: 5,
        stability: 0.95, // High stability
        timestamp: Date.now()
      };

      multiParticipantManager.updateNetworkConditions('participant123', goodConditions);

      // Optimize bandwidth again
      const improvedResult = await multiParticipantManager.optimizeBandwidthDistribution();

      const improvedAllocation = improvedResult.participantAllocations.get('participant123');
      const improvedQuality = improvedResult.qualityAdjustments.get('participant123');

      expect(improvedAllocation).toBeGreaterThan(allocation || 0);
      expect(improvedQuality).not.toBe('low'); // Should get better quality
    });
  });

  describe('Speaker Focus and Priority Management', () => {
    test('should prioritize speaker in bandwidth allocation', async () => {
      // Create manager with speaker-focus strategy
      const room = signalingServer.getRoom(roomId);
      if (!room) throw new Error('Room not found');

      const speakerFocusManager = new MultiParticipantManager(
        room,
        peerConnectionManager,
        signalingServer,
        {
          bandwidthStrategy: 'speaker-focus',
          totalBandwidthLimit: 30
        }
      );

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

        const { participant } = await signalingServer.joinRoom(joinRequest);
        await speakerFocusManager.addParticipant(participant, 'normal');
      }

      // Set speaker
      speakerFocusManager.setCurrentSpeaker('participant1');

      // Optimize bandwidth
      const result = await speakerFocusManager.optimizeBandwidthDistribution();

      // Speaker should get more bandwidth
      const speakerBandwidth = result.participantAllocations.get('participant1') || 0;
      const otherBandwidth = result.participantAllocations.get('participant2') || 0;

      expect(speakerBandwidth).toBeGreaterThan(otherBandwidth);
      expect(result.qualityAdjustments.get('participant1')).toBe('high');

      speakerFocusManager.destroy();
    });

    test('should handle presenter priority', async () => {
      // Add participant
      const joinRequest: JoinRoomRequest = {
        roomId,
        participantName: 'Presenter',
        participantId: 'presenter123',
        capabilities: {
          supportsVideo: true,
          supportsAudio: true,
          supportsScreenSharing: true,
          maxBandwidth: 10
        }
      };

      const { participant } = await signalingServer.joinRoom(joinRequest);
      await multiParticipantManager.addParticipant(participant, 'normal');

      // Set as presenter
      await multiParticipantManager.updateParticipantPriority('presenter123', 'presenter');

      const session = multiParticipantManager.getParticipantSession('presenter123');
      expect(session?.priority).toBe('presenter');
      expect(session?.isPresenting).toBe(true);

      // Optimize bandwidth - presenter should get priority
      const result = await multiParticipantManager.optimizeBandwidthDistribution();
      const presenterAllocation = result.participantAllocations.get('presenter123') || 0;
      
      expect(presenterAllocation).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle room capacity limits', async () => {
      // Create room with capacity of 1
      const limitedRoomRequest: CreateRoomRequest = {
        maxParticipants: 1,
        createdBy: 'host123'
      };

      const limitedRoom = await signalingServer.createRoom(limitedRoomRequest);

      // Add first participant
      const joinRequest1: JoinRoomRequest = {
        roomId: limitedRoom.roomId,
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

      // Try to add second participant - should fail
      const joinRequest2: JoinRoomRequest = {
        roomId: limitedRoom.roomId,
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
        .rejects.toThrow(`Room ${limitedRoom.roomId} is full`);
    });

    test('should handle WebRTC connection failures gracefully', async () => {
      // Mock connection failure
      mockRTCPeerConnection.createOffer.mockRejectedValue(new Error('Connection failed'));

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

      const { participant } = await signalingServer.joinRoom(joinRequest);
      await multiParticipantManager.addParticipant(participant, 'normal');
      
      await peerConnectionManager.createPeerConnection(
        'participant123',
        new VideoCompressionConfig(),
        true
      );

      // Should handle offer creation failure
      await expect(peerConnectionManager.createOffer('participant123'))
        .rejects.toThrow('Failed to create offer: Connection failed');
    });

    test('should handle invalid signaling messages', async () => {
      const invalidMessage: SignalingMessage = {
        type: 'offer',
        roomId: 'non-existent-room',
        participantId: 'participant123',
        data: {},
        timestamp: Date.now()
      };

      await expect(signalingServer.handleSignalingMessage(invalidMessage))
        .rejects.toThrow('Room non-existent-room not found');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent operations', async () => {
      const participantCount = 5;
      const participants = Array.from({ length: participantCount }, (_, i) => ({
        id: `participant${i}`,
        name: `Participant ${i}`
      }));

      // Concurrently add all participants
      const joinPromises = participants.map(async (participantData) => {
        const joinRequest: JoinRoomRequest = {
          roomId,
          participantName: participantData.name,
          participantId: participantData.id,
          capabilities: {
            supportsVideo: true,
            supportsAudio: true,
            supportsScreenSharing: true,
            maxBandwidth: 10
          }
        };

        const { participant } = await signalingServer.joinRoom(joinRequest);
        await multiParticipantManager.addParticipant(participant, 'normal');
        
        return peerConnectionManager.createPeerConnection(
          participantData.id,
          new VideoCompressionConfig(),
          false
        );
      });

      // Wait for all operations to complete
      const results = await Promise.all(joinPromises);
      expect(results).toHaveLength(participantCount);

      // Verify all participants are properly added
      const room = signalingServer.getRoom(roomId);
      expect(room?.participants.size).toBe(participantCount);

      const allSessions = multiParticipantManager.getAllParticipantSessions();
      expect(allSessions.size).toBe(participantCount);

      // Test bandwidth optimization with all participants
      const optimizationResult = await multiParticipantManager.optimizeBandwidthDistribution();
      expect(optimizationResult.participantAllocations.size).toBe(participantCount);
    });

    test('should maintain performance with frequent network updates', async () => {
      // Add participant
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

      const { participant } = await signalingServer.joinRoom(joinRequest);
      await multiParticipantManager.addParticipant(participant, 'normal');

      // Simulate frequent network condition updates
      const updateCount = 10;
      const updatePromises = Array.from({ length: updateCount }, (_, i) => {
        const conditions: NetworkConditions = {
          bandwidth: 5 + Math.random() * 5,
          latency: 30 + Math.random() * 50,
          packetLoss: Math.random() * 2,
          jitter: 5 + Math.random() * 10,
          stability: 0.7 + Math.random() * 0.3,
          timestamp: Date.now() + i
        };

        return new Promise<void>((resolve) => {
          setTimeout(() => {
            multiParticipantManager.updateNetworkConditions('participant123', conditions);
            resolve();
          }, i * 10); // Stagger updates
        });
      });

      await Promise.all(updatePromises);

      // Should still be able to optimize bandwidth
      const result = await multiParticipantManager.optimizeBandwidthDistribution();
      expect(result.participantAllocations.size).toBe(1);
    });
  });
});