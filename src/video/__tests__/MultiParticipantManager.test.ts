/**
 * Tests for Multi-Participant Manager
 */

import { MultiParticipantManager, BandwidthStrategy, ParticipantPriority } from '../MultiParticipantManager';
import { PeerConnectionManager } from '../PeerConnectionManager';
import { WebRTCSignalingServer } from '../WebRTCSignalingServer';
import { 
  VideoConferenceRoom, 
  Participant,
  BandwidthOptimizationResult
} from '../models/WebRTCModels';
import { VideoCompressionConfig, NetworkConditions } from '../models/VideoModels';

// Mock dependencies
jest.mock('../PeerConnectionManager');
jest.mock('../WebRTCSignalingServer');

describe('MultiParticipantManager', () => {
  let multiParticipantManager: MultiParticipantManager;
  let mockPeerConnectionManager: jest.Mocked<PeerConnectionManager>;
  let mockSignalingServer: jest.Mocked<WebRTCSignalingServer>;
  let mockRoom: VideoConferenceRoom;

  beforeEach(() => {
    mockPeerConnectionManager = new PeerConnectionManager() as jest.Mocked<PeerConnectionManager>;
    mockSignalingServer = new WebRTCSignalingServer() as jest.Mocked<WebRTCSignalingServer>;

    mockRoom = {
      roomId: 'test-room-123',
      roomCode: 'TEST123',
      createdAt: Date.now(),
      createdBy: 'host123',
      participants: new Map(),
      maxParticipants: 50,
      isRecording: false,
      compressionSettings: new VideoCompressionConfig(),
      roomSettings: {
        allowScreenSharing: true,
        allowRecording: true,
        requireAuth: false,
        autoAdaptQuality: true
      },
      bandwidthDistribution: {
        totalAvailableBandwidth: 100,
        allocatedBandwidth: new Map(),
        reservedBandwidth: 5,
        adaptiveAllocation: true,
        lastUpdated: Date.now()
      }
    };

    multiParticipantManager = new MultiParticipantManager(
      mockRoom,
      mockPeerConnectionManager,
      mockSignalingServer,
      {
        maxParticipants: 10,
        totalBandwidthLimit: 50,
        bandwidthStrategy: 'adaptive-quality'
      }
    );
  });

  afterEach(() => {
    multiParticipantManager.destroy();
  });

  describe('Participant Management', () => {
    test('should add participant to session', async () => {
      const participant: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);

      const eventPromise = new Promise((resolve) => {
        multiParticipantManager.once('participant-added', resolve);
      });

      const session = await multiParticipantManager.addParticipant(participant, 'normal');

      expect(session).toBeDefined();
      expect(session.participant.id).toBe('participant123');
      expect(session.priority).toBe('normal');
      expect(session.currentQuality).toBe('medium');
      expect(mockPeerConnectionManager.createPeerConnection).toHaveBeenCalled();

      const event = await eventPromise;
      expect(event).toBeDefined();
    });

    test('should throw error when exceeding max participants', async () => {
      const participant: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      // Create manager with max 1 participant
      const limitedManager = new MultiParticipantManager(
        mockRoom,
        mockPeerConnectionManager,
        mockSignalingServer,
        { maxParticipants: 1 }
      );

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);

      // Add first participant
      await limitedManager.addParticipant(participant, 'normal');

      // Try to add second participant
      const participant2: Participant = {
        ...participant,
        id: 'participant456',
        name: 'Jane Doe'
      };

      await expect(limitedManager.addParticipant(participant2, 'normal'))
        .rejects.toThrow('Maximum participants (1) reached');

      limitedManager.destroy();
    });

    test('should remove participant from session', async () => {
      const participant: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);
      mockPeerConnectionManager.closePeerConnection.mockResolvedValue();

      await multiParticipantManager.addParticipant(participant, 'normal');

      const eventPromise = new Promise((resolve) => {
        multiParticipantManager.once('participant-removed', resolve);
      });

      await multiParticipantManager.removeParticipant('participant123');

      expect(mockPeerConnectionManager.closePeerConnection).toHaveBeenCalledWith('participant123');

      const event = await eventPromise;
      expect(event).toBeDefined();
    });

    test('should handle removing non-existent participant', async () => {
      // Should not throw an error
      await expect(multiParticipantManager.removeParticipant('non-existent'))
        .resolves.toBeUndefined();
    });

    test('should update participant priority', async () => {
      const participant: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);

      await multiParticipantManager.addParticipant(participant, 'normal');

      const eventPromise = new Promise((resolve) => {
        multiParticipantManager.once('participant-priority-updated', resolve);
      });

      await multiParticipantManager.updateParticipantPriority('participant123', 'high');

      const session = multiParticipantManager.getParticipantSession('participant123');
      expect(session?.priority).toBe('high');

      const event = await eventPromise;
      expect(event).toBeDefined();
    });

    test('should handle presenter priority specially', async () => {
      const participant: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);

      await multiParticipantManager.addParticipant(participant, 'normal');

      const presenterEventPromise = new Promise((resolve) => {
        multiParticipantManager.once('presenter-changed', resolve);
      });

      await multiParticipantManager.updateParticipantPriority('participant123', 'presenter');

      const session = multiParticipantManager.getParticipantSession('participant123');
      expect(session?.priority).toBe('presenter');
      expect(session?.isPresenting).toBe(true);

      const event = await presenterEventPromise;
      expect(event).toBeDefined();
    });

    test('should throw error when updating priority for non-existent participant', async () => {
      await expect(
        multiParticipantManager.updateParticipantPriority('non-existent', 'high')
      ).rejects.toThrow('Participant non-existent not found');
    });
  });

  describe('Network Conditions Management', () => {
    let participantId: string;

    beforeEach(async () => {
      const participant: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      participantId = participant.id;
      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);
      await multiParticipantManager.addParticipant(participant, 'normal');
    });

    test('should update network conditions', () => {
      const conditions: NetworkConditions = {
        bandwidth: 10,
        latency: 30,
        packetLoss: 1,
        jitter: 5,
        stability: 0.9,
        timestamp: Date.now()
      };

      const eventPromise = new Promise((resolve) => {
        multiParticipantManager.once('network-conditions-updated', resolve);
      });

      multiParticipantManager.updateNetworkConditions(participantId, conditions);

      const session = multiParticipantManager.getParticipantSession(participantId);
      expect(session?.networkConditions.bandwidth).toBe(10);
      expect(session?.participant.networkQuality).toBe('excellent');

      return eventPromise.then((event) => {
        expect(event).toBeDefined();
      });
    });

    test('should handle updating conditions for non-existent participant', () => {
      const conditions: NetworkConditions = {
        bandwidth: 10,
        latency: 30,
        packetLoss: 1,
        jitter: 5,
        stability: 0.9,
        timestamp: Date.now()
      };

      // Should not throw an error
      expect(() => {
        multiParticipantManager.updateNetworkConditions('non-existent', conditions);
      }).not.toThrow();
    });
  });

  describe('Speaker Management', () => {
    let participantId1: string;
    let participantId2: string;

    beforeEach(async () => {
      const participant1: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      const participant2: Participant = {
        id: 'participant456',
        name: 'Jane Doe',
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

      participantId1 = participant1.id;
      participantId2 = participant2.id;

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);
      await multiParticipantManager.addParticipant(participant1, 'normal');
      await multiParticipantManager.addParticipant(participant2, 'normal');
    });

    test('should set current speaker', () => {
      const eventPromise = new Promise((resolve) => {
        multiParticipantManager.once('speaker-changed', resolve);
      });

      multiParticipantManager.setCurrentSpeaker(participantId1);

      const session1 = multiParticipantManager.getParticipantSession(participantId1);
      const session2 = multiParticipantManager.getParticipantSession(participantId2);

      expect(session1?.isSpeaking).toBe(true);
      expect(session2?.isSpeaking).toBe(false);

      return eventPromise.then((event) => {
        expect(event).toBeDefined();
      });
    });

    test('should change speaker', () => {
      multiParticipantManager.setCurrentSpeaker(participantId1);

      const eventPromise = new Promise((resolve) => {
        multiParticipantManager.once('speaker-changed', resolve);
      });

      multiParticipantManager.setCurrentSpeaker(participantId2);

      const session1 = multiParticipantManager.getParticipantSession(participantId1);
      const session2 = multiParticipantManager.getParticipantSession(participantId2);

      expect(session1?.isSpeaking).toBe(false);
      expect(session2?.isSpeaking).toBe(true);

      return eventPromise.then((event) => {
        expect(event).toBeDefined();
      });
    });

    test('should clear current speaker', () => {
      multiParticipantManager.setCurrentSpeaker(participantId1);
      multiParticipantManager.setCurrentSpeaker(null);

      const session1 = multiParticipantManager.getParticipantSession(participantId1);
      expect(session1?.isSpeaking).toBe(false);
    });

    test('should not emit event when setting same speaker', () => {
      multiParticipantManager.setCurrentSpeaker(participantId1);

      let eventEmitted = false;
      multiParticipantManager.once('speaker-changed', () => {
        eventEmitted = true;
      });

      multiParticipantManager.setCurrentSpeaker(participantId1);

      // Wait a bit to ensure no event is emitted
      setTimeout(() => {
        expect(eventEmitted).toBe(false);
      }, 100);
    });
  });

  describe('Bandwidth Optimization Strategies', () => {
    let participants: Participant[];

    beforeEach(async () => {
      participants = [
        {
          id: 'participant1',
          name: 'Participant 1',
          joinedAt: Date.now(),
          connectionState: 'connected',
          isAudioEnabled: true,
          isVideoEnabled: true,
          isScreenSharing: false,
          networkQuality: 'excellent',
          bandwidthUsage: 0,
          compressionStats: {
            averageCompressionRatio: 0,
            totalBytesTransmitted: 0,
            totalBytesReceived: 0
          }
        },
        {
          id: 'participant2',
          name: 'Participant 2',
          joinedAt: Date.now(),
          connectionState: 'connected',
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
        },
        {
          id: 'participant3',
          name: 'Participant 3',
          joinedAt: Date.now(),
          connectionState: 'connected',
          isAudioEnabled: true,
          isVideoEnabled: true,
          isScreenSharing: false,
          networkQuality: 'fair',
          bandwidthUsage: 0,
          compressionStats: {
            averageCompressionRatio: 0,
            totalBytesTransmitted: 0,
            totalBytesReceived: 0
          }
        }
      ];

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);

      for (const participant of participants) {
        await multiParticipantManager.addParticipant(participant, 'normal');
      }
    });

    test('should optimize bandwidth with equal distribution strategy', async () => {
      const equalDistributionManager = new MultiParticipantManager(
        mockRoom,
        mockPeerConnectionManager,
        mockSignalingServer,
        {
          bandwidthStrategy: 'equal-distribution',
          totalBandwidthLimit: 30
        }
      );

      // Add participants to the new manager
      for (const participant of participants) {
        await equalDistributionManager.addParticipant(participant, 'normal');
      }

      const eventPromise = new Promise<{ result: BandwidthOptimizationResult }>((resolve) => {
        equalDistributionManager.once('bandwidth-optimized', resolve);
      });

      const result = await equalDistributionManager.optimizeBandwidthDistribution();

      expect(result.optimizationStrategy).toBe('equal-distribution');
      expect(result.participantAllocations.size).toBe(3);
      expect(result.totalBandwidthUsed).toBeGreaterThan(0);

      const event = await eventPromise;
      expect(event.result).toBeDefined();

      equalDistributionManager.destroy();
    });

    test('should optimize bandwidth with priority-based strategy', async () => {
      const priorityBasedManager = new MultiParticipantManager(
        mockRoom,
        mockPeerConnectionManager,
        mockSignalingServer,
        {
          bandwidthStrategy: 'priority-based',
          totalBandwidthLimit: 30
        }
      );

      // Add participants with different priorities
      await priorityBasedManager.addParticipant(participants[0], 'high');
      await priorityBasedManager.addParticipant(participants[1], 'normal');
      await priorityBasedManager.addParticipant(participants[2], 'low');

      const result = await priorityBasedManager.optimizeBandwidthDistribution();

      expect(result.optimizationStrategy).toBe('priority-based');
      expect(result.participantAllocations.size).toBe(3);

      // High priority participant should get more bandwidth
      const highPriorityBandwidth = result.participantAllocations.get('participant1') || 0;
      const lowPriorityBandwidth = result.participantAllocations.get('participant3') || 0;
      expect(highPriorityBandwidth).toBeGreaterThan(lowPriorityBandwidth);

      priorityBasedManager.destroy();
    });

    test('should optimize bandwidth with adaptive quality strategy', async () => {
      const adaptiveQualityManager = new MultiParticipantManager(
        mockRoom,
        mockPeerConnectionManager,
        mockSignalingServer,
        {
          bandwidthStrategy: 'adaptive-quality',
          totalBandwidthLimit: 30
        }
      );

      // Add participants
      for (const participant of participants) {
        await adaptiveQualityManager.addParticipant(participant, 'normal');
      }

      const result = await adaptiveQualityManager.optimizeBandwidthDistribution();

      expect(result.optimizationStrategy).toBe('adaptive-quality');
      expect(result.participantAllocations.size).toBe(3);
      expect(result.qualityAdjustments.size).toBe(3);

      adaptiveQualityManager.destroy();
    });

    test('should optimize bandwidth with speaker-focus strategy', async () => {
      const speakerFocusManager = new MultiParticipantManager(
        mockRoom,
        mockPeerConnectionManager,
        mockSignalingServer,
        {
          bandwidthStrategy: 'speaker-focus',
          totalBandwidthLimit: 30
        }
      );

      // Add participants
      for (const participant of participants) {
        await speakerFocusManager.addParticipant(participant, 'normal');
      }

      // Set current speaker
      speakerFocusManager.setCurrentSpeaker('participant1');

      const result = await speakerFocusManager.optimizeBandwidthDistribution();

      expect(result.optimizationStrategy).toBe('speaker-focus');
      expect(result.participantAllocations.size).toBe(3);

      // Speaker should get more bandwidth
      const speakerBandwidth = result.participantAllocations.get('participant1') || 0;
      const otherBandwidth = result.participantAllocations.get('participant2') || 0;
      expect(speakerBandwidth).toBeGreaterThan(otherBandwidth);

      speakerFocusManager.destroy();
    });

    test('should handle empty participant list in optimization', async () => {
      const emptyManager = new MultiParticipantManager(
        mockRoom,
        mockPeerConnectionManager,
        mockSignalingServer
      );

      const result = await emptyManager.optimizeBandwidthDistribution();

      expect(result.participantAllocations.size).toBe(0);
      expect(result.totalBandwidthUsed).toBe(0);
      expect(result.estimatedSavings).toBe(0);

      emptyManager.destroy();
    });
  });

  describe('Session Data Retrieval', () => {
    test('should get participant session', async () => {
      const participant: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);
      await multiParticipantManager.addParticipant(participant, 'normal');

      const session = multiParticipantManager.getParticipantSession('participant123');
      expect(session).toBeDefined();
      expect(session?.participant.id).toBe('participant123');
    });

    test('should return undefined for non-existent participant session', () => {
      const session = multiParticipantManager.getParticipantSession('non-existent');
      expect(session).toBeUndefined();
    });

    test('should get all participant sessions', async () => {
      const participant: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);
      await multiParticipantManager.addParticipant(participant, 'normal');

      const allSessions = multiParticipantManager.getAllParticipantSessions();
      expect(allSessions).toBeInstanceOf(Map);
      expect(allSessions.size).toBe(1);
      expect(allSessions.has('participant123')).toBe(true);
    });

    test('should get current bandwidth distribution', () => {
      const distribution = multiParticipantManager.getCurrentBandwidthDistribution();
      expect(distribution).toBeDefined();
      expect(distribution.totalAvailableBandwidth).toBe(100);
    });
  });

  describe('Event Handling', () => {
    test('should handle peer connection manager events', async () => {
      const participant: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);
      await multiParticipantManager.addParticipant(participant, 'normal');

      // Simulate stats update event
      const mockStats = {
        participantId: 'participant123',
        connectionState: 'connected' as const,
        iceConnectionState: 'connected' as const,
        signalingState: 'stable' as const,
        bytesReceived: 1000,
        bytesSent: 2000,
        packetsReceived: 10,
        packetsSent: 20,
        packetsLost: 1,
        jitter: 5,
        roundTripTime: 0.05,
        timestamp: Date.now()
      };

      mockPeerConnectionManager.emit('stats-updated', {
        participantId: 'participant123',
        stats: mockStats
      });

      const session = multiParticipantManager.getParticipantSession('participant123');
      expect(session?.connectionStats).toEqual(mockStats);
    });

    test('should handle connection state change events', async () => {
      const participant: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);
      await multiParticipantManager.addParticipant(participant, 'normal');

      // Simulate connection state change event
      mockPeerConnectionManager.emit('connection-state-changed', {
        participantId: 'participant123',
        connectionState: 'connected'
      });

      const session = multiParticipantManager.getParticipantSession('participant123');
      expect(session?.participant.connectionState).toBe('connected');
    });
  });

  describe('Manager Destruction', () => {
    test('should clean up all resources on destroy', async () => {
      const participant: Participant = {
        id: 'participant123',
        name: 'John Doe',
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

      mockPeerConnectionManager.createPeerConnection.mockResolvedValue({} as any);
      await multiParticipantManager.addParticipant(participant, 'normal');

      multiParticipantManager.destroy();

      const allSessions = multiParticipantManager.getAllParticipantSessions();
      expect(allSessions.size).toBe(0);
    });
  });
});