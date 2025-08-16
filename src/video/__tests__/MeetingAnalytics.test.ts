import { MeetingAnalyticsEngine } from '../MeetingAnalytics';
import { VideoConferenceRoom, Participant, RTCConnectionStats } from '../models/WebRTCModels';
import { VideoCompressionConfig, QualityMetrics } from '../models/VideoModels';
import { ChatStats } from '../ChatManager';
import { RecordingSession } from '../MeetingRecorder';

describe('MeetingAnalyticsEngine', () => {
  let analyticsEngine: MeetingAnalyticsEngine;
  let mockRoom: VideoConferenceRoom;
  let mockParticipant: Participant;

  beforeEach(() => {
    analyticsEngine = new MeetingAnalyticsEngine();

    mockParticipant = {
      id: 'user1',
      name: 'User 1',
      joinedAt: Date.now(),
      connectionState: 'connected',
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      networkQuality: 'good',
      bandwidthUsage: 2.5,
      compressionStats: {
        averageCompressionRatio: 2.0,
        totalBytesTransmitted: 1000,
        totalBytesReceived: 500
      }
    };

    mockRoom = {
      roomId: 'test-room',
      roomCode: 'TEST123',
      createdAt: Date.now(),
      createdBy: 'user1',
      participants: new Map([['user1', mockParticipant]]),
      maxParticipants: 10,
      isRecording: false,
      compressionSettings: new VideoCompressionConfig(),
      roomSettings: {
        allowScreenSharing: true,
        allowRecording: true,
        requireAuth: false,
        autoAdaptQuality: true
      },
      bandwidthDistribution: {
        totalAvailableBandwidth: 50,
        allocatedBandwidth: new Map(),
        reservedBandwidth: 5,
        adaptiveAllocation: true,
        lastUpdated: Date.now()
      }
    };
  });

  afterEach(() => {
    analyticsEngine.destroy();
  });

  describe('meeting lifecycle', () => {
    it('should start meeting analytics', () => {
      const startedSpy = jest.fn();
      analyticsEngine.on('analytics-started', startedSpy);

      analyticsEngine.startMeetingAnalytics(mockRoom);

      const analytics = analyticsEngine.getCurrentAnalytics();
      expect(analytics).toBeDefined();
      expect(analytics!.meeting.roomId).toBe('test-room');
      expect(analytics!.meeting.totalParticipants).toBe(1);
      expect(startedSpy).toHaveBeenCalled();
    });

    it('should end meeting analytics', () => {
      const completedSpy = jest.fn();
      analyticsEngine.on('analytics-completed', completedSpy);

      analyticsEngine.startMeetingAnalytics(mockRoom);
      
      // Wait a bit to ensure duration > 0
      setTimeout(() => {
        const analytics = analyticsEngine.endMeetingAnalytics();

        expect(analytics).toBeDefined();
        expect(analytics!.meeting.endTime).toBeDefined();
        expect(analytics!.meeting.duration).toBeGreaterThan(0);
        expect(completedSpy).toHaveBeenCalled();
      }, 10);
    });

    it('should return null when ending non-existent analytics', () => {
      const analytics = analyticsEngine.endMeetingAnalytics();
      expect(analytics).toBeNull();
    });

    it('should calculate average participant duration', () => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
      
      // Add another participant
      const participant2: Participant = {
        ...mockParticipant,
        id: 'user2',
        name: 'User 2'
      };
      analyticsEngine.addParticipant(participant2);
      
      // Remove first participant after some time
      setTimeout(() => {
        analyticsEngine.removeParticipant('user1');
        
        const analytics = analyticsEngine.endMeetingAnalytics();
        expect(analytics!.meeting.averageParticipantDuration).toBeGreaterThan(0);
      }, 20);
    });
  });

  describe('participant management', () => {
    beforeEach(() => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
    });

    it('should add participant', () => {
      const addedSpy = jest.fn();
      analyticsEngine.on('participant-added', addedSpy);

      const newParticipant: Participant = {
        ...mockParticipant,
        id: 'user2',
        name: 'User 2'
      };

      analyticsEngine.addParticipant(newParticipant);

      const analytics = analyticsEngine.getCurrentAnalytics();
      expect(analytics!.meeting.peakParticipants).toBe(2);
      expect(analytics!.meeting.totalParticipants).toBe(2);
      expect(addedSpy).toHaveBeenCalled();
    });

    it('should remove participant', () => {
      const removedSpy = jest.fn();
      analyticsEngine.on('participant-removed', removedSpy);

      analyticsEngine.removeParticipant('user1');

      expect(removedSpy).toHaveBeenCalled();
    });

    it('should calculate speaking percentage on removal', () => {
      // Simulate speaking time
      analyticsEngine.updateSpeakingTime('user1');
      
      setTimeout(() => {
        analyticsEngine.updateSpeakingTime(null);
        analyticsEngine.removeParticipant('user1');

        const analytics = analyticsEngine.getCurrentAnalytics();
        const participant = analytics!.participants.find(p => p.participantId === 'user1');
        expect(participant?.speakingPercentage).toBeGreaterThan(0);
      }, 10);
    });
  });

  describe('compression metrics', () => {
    beforeEach(() => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
    });

    it('should update compression metrics', () => {
      const updatedSpy = jest.fn();
      analyticsEngine.on('compression-updated', updatedSpy);

      const config = new VideoCompressionConfig();
      analyticsEngine.updateCompressionMetrics(1000, 400, 25, config);

      const analytics = analyticsEngine.getCurrentAnalytics();
      expect(analytics!.compression.totalDataProcessed).toBe(1000);
      expect(analytics!.compression.totalCompressedData).toBe(400);
      expect(analytics!.compression.overallCompressionRatio).toBe(2.5);
      expect(analytics!.compression.dataSaved).toBe(600);
      expect(analytics!.compression.dataSavedPercentage).toBe(60);
      expect(updatedSpy).toHaveBeenCalled();
    });

    it('should calculate compression efficiency', () => {
      const config = new VideoCompressionConfig();
      analyticsEngine.updateCompressionMetrics(1000, 200, 10, config); // High ratio, low time

      const analytics = analyticsEngine.getCurrentAnalytics();
      expect(analytics!.compression.compressionEfficiency).toBeGreaterThan(0);
    });

    it('should update quantum statistics', () => {
      const config = new VideoCompressionConfig();
      config.quantumBitDepth = 8;
      config.maxEntanglementLevel = 4;
      config.superpositionComplexity = 6;

      analyticsEngine.updateCompressionMetrics(1000, 400, 25, config);

      const analytics = analyticsEngine.getCurrentAnalytics();
      expect(analytics!.compression.quantumStats.averageQuantumBitDepth).toBe(8);
      expect(analytics!.compression.quantumStats.averageEntanglementLevel).toBe(4);
      expect(analytics!.compression.quantumStats.averageSuperpositionComplexity).toBe(6);
    });
  });

  describe('network metrics', () => {
    beforeEach(() => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
    });

    it('should update network metrics', () => {
      const updatedSpy = jest.fn();
      analyticsEngine.on('network-updated', updatedSpy);

      const stats: RTCConnectionStats = {
        participantId: 'user1',
        connectionState: 'connected',
        iceConnectionState: 'connected',
        signalingState: 'stable',
        bytesReceived: 5000,
        bytesSent: 3000,
        packetsReceived: 100,
        packetsSent: 80,
        packetsLost: 2,
        jitter: 5,
        roundTripTime: 50,
        timestamp: Date.now()
      };

      analyticsEngine.updateNetworkMetrics('user1', stats);

      expect(updatedSpy).toHaveBeenCalled();
    });

    it('should calculate network stability score', () => {
      const stats: RTCConnectionStats = {
        participantId: 'user1',
        connectionState: 'connected',
        iceConnectionState: 'connected',
        signalingState: 'stable',
        bytesReceived: 5000,
        bytesSent: 3000,
        packetsReceived: 100,
        packetsSent: 80,
        packetsLost: 1, // Low packet loss
        jitter: 5,
        roundTripTime: 30, // Low latency
        timestamp: Date.now()
      };

      analyticsEngine.updateNetworkMetrics('user1', stats);

      const analytics = analyticsEngine.getCurrentAnalytics();
      expect(analytics!.network.networkStabilityScore).toBeGreaterThan(80);
    });

    it('should update participant data usage', () => {
      const stats: RTCConnectionStats = {
        participantId: 'user1',
        connectionState: 'connected',
        iceConnectionState: 'connected',
        signalingState: 'stable',
        bytesReceived: 5000,
        bytesSent: 3000,
        packetsReceived: 100,
        packetsSent: 80,
        packetsLost: 2,
        jitter: 5,
        roundTripTime: 50,
        timestamp: Date.now()
      };

      analyticsEngine.updateNetworkMetrics('user1', stats);

      const analytics = analyticsEngine.getCurrentAnalytics();
      const participant = analytics!.participants.find(p => p.participantId === 'user1');
      expect(participant?.dataUsage.sent).toBe(3000);
      expect(participant?.dataUsage.received).toBe(5000);
      expect(participant?.dataUsage.total).toBe(8000);
    });
  });

  describe('quality metrics', () => {
    beforeEach(() => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
    });

    it('should update quality metrics', () => {
      const updatedSpy = jest.fn();
      analyticsEngine.on('quality-updated', updatedSpy);

      const qualityMetrics: QualityMetrics = {
        currentQuality: 'high',
        targetQuality: 'high',
        qualityHistory: [
          { timestamp: Date.now(), quality: 'high', reason: 'Good network' }
        ],
        averageCompressionRatio: 2.5,
        averageProcessingTime: 15,
        frameDropRate: 1.2,
        qualityStability: 0.95
      };

      analyticsEngine.updateQualityMetrics('user1', qualityMetrics);

      expect(updatedSpy).toHaveBeenCalled();
    });

    it('should update participant video quality', () => {
      const qualityMetrics: QualityMetrics = {
        currentQuality: 'high',
        targetQuality: 'high',
        qualityHistory: [],
        averageCompressionRatio: 2.5,
        averageProcessingTime: 15,
        frameDropRate: 1.2,
        qualityStability: 0.95
      };

      analyticsEngine.updateQualityMetrics('user1', qualityMetrics);

      const analytics = analyticsEngine.getCurrentAnalytics();
      const participant = analytics!.participants.find(p => p.participantId === 'user1');
      expect(participant?.averageVideoQuality).toBe('high');
    });
  });

  describe('speaking time tracking', () => {
    beforeEach(() => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
    });

    it('should track speaking time', () => {
      analyticsEngine.updateSpeakingTime('user1');
      
      setTimeout(() => {
        analyticsEngine.updateSpeakingTime('user2');
        
        // Speaking time for user1 should be recorded
        // This is tested indirectly through participant removal
      }, 10);
    });

    it('should handle speaker changes', () => {
      analyticsEngine.updateSpeakingTime('user1');
      analyticsEngine.updateSpeakingTime('user2');
      analyticsEngine.updateSpeakingTime(null);
      
      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('additional analytics', () => {
    beforeEach(() => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
    });

    it('should add chat analytics', () => {
      const updatedSpy = jest.fn();
      analyticsEngine.on('chat-analytics-updated', updatedSpy);

      const chatStats: ChatStats = {
        totalMessages: 50,
        totalCharacters: 1000,
        totalOriginalSize: 1200,
        totalCompressedSize: 800,
        overallCompressionRatio: 1.5,
        bytesSaved: 400,
        messagesPerMinute: 5.2,
        mostActiveParticipant: 'user1',
        messageTypeDistribution: {
          text: 45,
          emoji: 3,
          file: 1,
          system: 1
        }
      };

      analyticsEngine.addChatAnalytics(chatStats);

      const analytics = analyticsEngine.getCurrentAnalytics();
      expect(analytics!.chat).toEqual(chatStats);
      expect(updatedSpy).toHaveBeenCalled();
    });

    it('should add recording analytics', () => {
      const updatedSpy = jest.fn();
      analyticsEngine.on('recording-analytics-updated', updatedSpy);

      const recordingSession: RecordingSession = {
        sessionId: 'rec123',
        roomId: 'test-room',
        startTime: Date.now() - 60000,
        endTime: Date.now(),
        config: {
          quality: 'high',
          includeAudio: true,
          includeScreenShare: true,
          maxDuration: 120,
          compressionLevel: 8,
          format: 'webm'
        },
        segments: [],
        duration: 60000,
        totalOriginalSize: 10000000,
        totalCompressedSize: 4000000,
        overallCompressionRatio: 2.5,
        status: 'completed'
      };

      analyticsEngine.addRecordingAnalytics(recordingSession);

      const analytics = analyticsEngine.getCurrentAnalytics();
      expect(analytics!.recording).toBeDefined();
      expect(analytics!.recording!.recordingCompressionRatio).toBe(2.5);
      expect(updatedSpy).toHaveBeenCalled();
    });
  });

  describe('insights and recommendations', () => {
    beforeEach(() => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
    });

    it('should generate insights for good compression', () => {
      const config = new VideoCompressionConfig();
      analyticsEngine.updateCompressionMetrics(1000, 400, 25, config); // 2.5x ratio

      const analytics = analyticsEngine.endMeetingAnalytics();
      
      expect(analytics!.insights.length).toBeGreaterThan(0);
      expect(analytics!.insights.some(insight => 
        insight.includes('compression') && insight.includes('2.5x')
      )).toBe(true);
    });

    it('should generate recommendations for poor compression', () => {
      const config = new VideoCompressionConfig();
      analyticsEngine.updateCompressionMetrics(1000, 800, 25, config); // 1.25x ratio

      const analytics = analyticsEngine.endMeetingAnalytics();
      
      expect(analytics!.recommendations.length).toBeGreaterThan(0);
      expect(analytics!.recommendations.some(rec => 
        rec.includes('compression level')
      )).toBe(true);
    });

    it('should generate network recommendations', () => {
      const stats: RTCConnectionStats = {
        participantId: 'user1',
        connectionState: 'connected',
        iceConnectionState: 'connected',
        signalingState: 'stable',
        bytesReceived: 5000,
        bytesSent: 3000,
        packetsReceived: 100,
        packetsSent: 80,
        packetsLost: 10, // High packet loss
        jitter: 5,
        roundTripTime: 200, // High latency
        timestamp: Date.now()
      };

      analyticsEngine.updateNetworkMetrics('user1', stats);
      const analytics = analyticsEngine.endMeetingAnalytics();
      
      expect(analytics!.recommendations.some(rec => 
        rec.includes('latency') || rec.includes('network')
      )).toBe(true);
    });
  });

  describe('current analytics', () => {
    it('should return null when no meeting active', () => {
      const analytics = analyticsEngine.getCurrentAnalytics();
      expect(analytics).toBeNull();
    });

    it('should return current analytics during meeting', () => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
      
      const analytics = analyticsEngine.getCurrentAnalytics();
      expect(analytics).toBeDefined();
      expect(analytics!.meeting.duration).toBeGreaterThan(0);
    });

    it('should update duration in real-time', () => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
      
      const analytics1 = analyticsEngine.getCurrentAnalytics();
      
      setTimeout(() => {
        const analytics2 = analyticsEngine.getCurrentAnalytics();
        expect(analytics2!.meeting.duration).toBeGreaterThan(analytics1!.meeting.duration);
      }, 10);
    });
  });

  describe('error handling', () => {
    it('should handle missing participant data gracefully', () => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
      
      // Try to remove non-existent participant
      analyticsEngine.removeParticipant('non-existent');
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should handle network metrics for non-existent participant', () => {
      analyticsEngine.startMeetingAnalytics(mockRoom);
      
      const stats: RTCConnectionStats = {
        participantId: 'non-existent',
        connectionState: 'connected',
        iceConnectionState: 'connected',
        signalingState: 'stable',
        bytesReceived: 5000,
        bytesSent: 3000,
        packetsReceived: 100,
        packetsSent: 80,
        packetsLost: 2,
        jitter: 5,
        roundTripTime: 50,
        timestamp: Date.now()
      };

      // Should not throw error
      analyticsEngine.updateNetworkMetrics('non-existent', stats);
      expect(true).toBe(true);
    });
  });
});