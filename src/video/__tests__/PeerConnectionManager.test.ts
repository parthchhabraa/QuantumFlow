/**
 * Tests for Peer Connection Manager
 */

import { PeerConnectionManager } from '../PeerConnectionManager';
import { 
  RTCConfiguration, 
  SessionDescription, 
  ICECandidate,
  MediaStreamConfig,
  WebRTCError
} from '../models/WebRTCModels';
import { VideoCompressionConfig } from '../models/VideoModels';

// Mock WebRTC APIs
const mockRTCPeerConnection = {
  connectionState: 'new',
  iceConnectionState: 'new',
  signalingState: 'stable',
  iceGatheringState: 'new',
  addTrack: jest.fn(),
  createOffer: jest.fn(),
  createAnswer: jest.fn(),
  setLocalDescription: jest.fn(),
  setRemoteDescription: jest.fn(),
  addIceCandidate: jest.fn(),
  getStats: jest.fn(),
  close: jest.fn(),
  onicecandidate: jest.fn(),
  ontrack: jest.fn(),
  onconnectionstatechange: jest.fn(),
  oniceconnectionstatechange: jest.fn(),
  onsignalingstatechange: jest.fn(),
  onicegatheringstatechange: jest.fn()
};

// Mock MediaStream
const mockMediaStream: any = {
  getTracks: jest.fn(() => [
    { kind: 'video', stop: jest.fn() },
    { kind: 'audio', stop: jest.fn() }
  ]),
  clone: jest.fn(function(this: any) { return this; })
};

// Mock global RTCPeerConnection
(global as any).RTCPeerConnection = jest.fn(() => mockRTCPeerConnection);

describe('PeerConnectionManager', () => {
  let peerConnectionManager: PeerConnectionManager;
  let compressionConfig: VideoCompressionConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    compressionConfig = new VideoCompressionConfig();
    peerConnectionManager = new PeerConnectionManager();
  });

  afterEach(() => {
    peerConnectionManager.destroy();
  });

  describe('Peer Connection Creation', () => {
    test('should create a new peer connection', async () => {
      const participantId = 'participant123';

      const peerConnection = await peerConnectionManager.createPeerConnection(
        participantId,
        compressionConfig,
        true
      );

      expect(peerConnection).toBeDefined();
      expect(RTCPeerConnection).toHaveBeenCalledWith(expect.any(Object));
    });

    test('should emit peer-connection-created event', async () => {
      const participantId = 'participant123';

      const eventPromise = new Promise((resolve) => {
        peerConnectionManager.once('peer-connection-created', resolve);
      });

      await peerConnectionManager.createPeerConnection(
        participantId,
        compressionConfig,
        true
      );

      const event = await eventPromise;
      expect(event).toBeDefined();
    });

    test('should throw error for duplicate peer connection', async () => {
      const participantId = 'participant123';

      await peerConnectionManager.createPeerConnection(
        participantId,
        compressionConfig,
        true
      );

      await expect(
        peerConnectionManager.createPeerConnection(participantId, compressionConfig, true)
      ).rejects.toThrow('Peer connection already exists for participant participant123');
    });

    test('should use custom RTC configuration', () => {
      const customConfig: RTCConfiguration = {
        iceServers: [{ urls: 'stun:custom-stun-server.com:3478' }],
        iceCandidatePoolSize: 5
      };

      const customManager = new PeerConnectionManager(customConfig);
      
      expect(customManager).toBeDefined();
      customManager.destroy();
    });
  });

  describe('Media Stream Management', () => {
    let participantId: string;

    beforeEach(async () => {
      participantId = 'participant123';
      await peerConnectionManager.createPeerConnection(
        participantId,
        compressionConfig,
        true
      );
    });

    test('should add local stream to peer connection', async () => {
      const streamConfig: MediaStreamConfig = {
        video: { enabled: true, width: 1280, height: 720, frameRate: 30 },
        audio: { enabled: true, echoCancellation: true },
        screen: { enabled: false }
      };

      const eventPromise = new Promise((resolve) => {
        peerConnectionManager.once('local-stream-added', resolve);
      });

      await peerConnectionManager.addLocalStream(
        participantId,
        mockMediaStream as any,
        streamConfig
      );

      expect(mockRTCPeerConnection.addTrack).toHaveBeenCalled();
      
      const event = await eventPromise;
      expect(event).toBeDefined();
    });

    test('should throw error when adding stream to non-existent peer connection', async () => {
      const streamConfig: MediaStreamConfig = {
        video: { enabled: true },
        audio: { enabled: true },
        screen: { enabled: false }
      };

      await expect(
        peerConnectionManager.addLocalStream(
          'non-existent-participant',
          mockMediaStream as any,
          streamConfig
        )
      ).rejects.toThrow('No peer connection found for participant non-existent-participant');
    });
  });

  describe('Offer/Answer Handling', () => {
    let participantId: string;

    beforeEach(async () => {
      participantId = 'participant123';
      await peerConnectionManager.createPeerConnection(
        participantId,
        compressionConfig,
        true
      );
    });

    test('should create and return offer', async () => {
      const mockOffer = {
        type: 'offer' as const,
        sdp: 'mock-sdp-offer'
      };

      mockRTCPeerConnection.createOffer.mockResolvedValue(mockOffer);
      mockRTCPeerConnection.setLocalDescription.mockResolvedValue(undefined);

      const eventPromise = new Promise((resolve) => {
        peerConnectionManager.once('offer-created', resolve);
      });

      const offer = await peerConnectionManager.createOffer(participantId);

      expect(offer.type).toBe('offer');
      expect(offer.sdp).toBe('mock-sdp-offer');
      expect(mockRTCPeerConnection.createOffer).toHaveBeenCalled();
      expect(mockRTCPeerConnection.setLocalDescription).toHaveBeenCalledWith(mockOffer);

      const event = await eventPromise;
      expect(event).toBeDefined();
    });

    test('should create and return answer', async () => {
      const mockAnswer = {
        type: 'answer' as const,
        sdp: 'mock-sdp-answer'
      };

      const offer: SessionDescription = {
        type: 'offer',
        sdp: 'mock-sdp-offer'
      };

      mockRTCPeerConnection.setRemoteDescription.mockResolvedValue(undefined);
      mockRTCPeerConnection.createAnswer.mockResolvedValue(mockAnswer);
      mockRTCPeerConnection.setLocalDescription.mockResolvedValue(undefined);

      const eventPromise = new Promise((resolve) => {
        peerConnectionManager.once('answer-created', resolve);
      });

      const answer = await peerConnectionManager.createAnswer(participantId, offer);

      expect(answer.type).toBe('answer');
      expect(answer.sdp).toBe('mock-sdp-answer');
      expect(mockRTCPeerConnection.setRemoteDescription).toHaveBeenCalled();
      expect(mockRTCPeerConnection.createAnswer).toHaveBeenCalled();
      expect(mockRTCPeerConnection.setLocalDescription).toHaveBeenCalledWith(mockAnswer);

      const event = await eventPromise;
      expect(event).toBeDefined();
    });

    test('should handle received answer', async () => {
      const answer: SessionDescription = {
        type: 'answer',
        sdp: 'mock-sdp-answer'
      };

      mockRTCPeerConnection.setRemoteDescription.mockResolvedValue(undefined);

      const eventPromise = new Promise((resolve) => {
        peerConnectionManager.once('answer-handled', resolve);
      });

      await peerConnectionManager.handleAnswer(participantId, answer);

      expect(mockRTCPeerConnection.setRemoteDescription).toHaveBeenCalledWith({
        type: 'answer',
        sdp: 'mock-sdp-answer'
      });

      const event = await eventPromise;
      expect(event).toBeDefined();
    });

    test('should throw error when creating offer for non-existent peer connection', async () => {
      await expect(
        peerConnectionManager.createOffer('non-existent-participant')
      ).rejects.toThrow('No peer connection found for participant non-existent-participant');
    });

    test('should handle offer creation failure', async () => {
      mockRTCPeerConnection.createOffer.mockRejectedValue(new Error('Offer creation failed'));

      await expect(
        peerConnectionManager.createOffer(participantId)
      ).rejects.toThrow('Failed to create offer: Offer creation failed');
    });
  });

  describe('ICE Candidate Handling', () => {
    let participantId: string;

    beforeEach(async () => {
      participantId = 'participant123';
      await peerConnectionManager.createPeerConnection(
        participantId,
        compressionConfig,
        true
      );
    });

    test('should add ICE candidate', async () => {
      const candidate: ICECandidate = {
        candidate: 'mock-ice-candidate',
        sdpMLineIndex: 0,
        sdpMid: 'video'
      };

      mockRTCPeerConnection.addIceCandidate.mockResolvedValue(undefined);

      const eventPromise = new Promise((resolve) => {
        peerConnectionManager.once('ice-candidate-added', resolve);
      });

      await peerConnectionManager.addIceCandidate(participantId, candidate);

      expect(mockRTCPeerConnection.addIceCandidate).toHaveBeenCalledWith({
        candidate: 'mock-ice-candidate',
        sdpMLineIndex: 0,
        sdpMid: 'video'
      });

      const event = await eventPromise;
      expect(event).toBeDefined();
    });

    test('should throw error when adding ICE candidate to non-existent peer connection', async () => {
      const candidate: ICECandidate = {
        candidate: 'mock-ice-candidate',
        sdpMLineIndex: 0,
        sdpMid: 'video'
      };

      await expect(
        peerConnectionManager.addIceCandidate('non-existent-participant', candidate)
      ).rejects.toThrow('No peer connection found for participant non-existent-participant');
    });

    test('should handle ICE candidate addition failure', async () => {
      const candidate: ICECandidate = {
        candidate: 'mock-ice-candidate',
        sdpMLineIndex: 0,
        sdpMid: 'video'
      };

      mockRTCPeerConnection.addIceCandidate.mockRejectedValue(new Error('ICE candidate failed'));

      await expect(
        peerConnectionManager.addIceCandidate(participantId, candidate)
      ).rejects.toThrow('Failed to add ICE candidate: ICE candidate failed');
    });
  });

  describe('Connection Statistics', () => {
    let participantId: string;

    beforeEach(async () => {
      participantId = 'participant123';
      await peerConnectionManager.createPeerConnection(
        participantId,
        compressionConfig,
        true
      );
    });

    test('should get connection statistics', () => {
      const stats = peerConnectionManager.getConnectionStats(participantId);

      expect(stats).toBeDefined();
      expect(stats?.participantId).toBe(participantId);
      expect(stats?.connectionState).toBe('new');
    });

    test('should get all connection statistics', () => {
      const allStats = peerConnectionManager.getAllConnectionStats();

      expect(allStats).toBeInstanceOf(Map);
      expect(allStats.has(participantId)).toBe(true);
    });

    test('should return undefined for non-existent participant stats', () => {
      const stats = peerConnectionManager.getConnectionStats('non-existent-participant');
      expect(stats).toBeUndefined();
    });

    test('should collect WebRTC statistics', async () => {
      const mockStats = new Map([
        ['inbound-rtp-1', {
          type: 'inbound-rtp',
          bytesReceived: 1000,
          packetsReceived: 10,
          packetsLost: 1,
          jitter: 5
        }],
        ['outbound-rtp-1', {
          type: 'outbound-rtp',
          bytesSent: 2000,
          packetsSent: 20
        }],
        ['candidate-pair-1', {
          type: 'candidate-pair',
          state: 'succeeded',
          currentRoundTripTime: 0.05
        }]
      ]);

      mockRTCPeerConnection.getStats.mockResolvedValue(mockStats);

      // Wait for stats collection interval
      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = peerConnectionManager.getConnectionStats(participantId);
      expect(stats).toBeDefined();
    });
  });

  describe('Peer Connection Cleanup', () => {
    let participantId: string;

    beforeEach(async () => {
      participantId = 'participant123';
      await peerConnectionManager.createPeerConnection(
        participantId,
        compressionConfig,
        true
      );
    });

    test('should close peer connection', async () => {
      const eventPromise = new Promise((resolve) => {
        peerConnectionManager.once('peer-connection-closed', resolve);
      });

      await peerConnectionManager.closePeerConnection(participantId);

      expect(mockRTCPeerConnection.close).toHaveBeenCalled();
      
      const event = await eventPromise;
      expect(event).toBeDefined();
    });

    test('should handle closing non-existent peer connection', async () => {
      // Should not throw an error
      await expect(
        peerConnectionManager.closePeerConnection('non-existent-participant')
      ).resolves.toBeUndefined();
    });
  });

  describe('Event Handling', () => {
    let participantId: string;

    beforeEach(async () => {
      participantId = 'participant123';
      await peerConnectionManager.createPeerConnection(
        participantId,
        compressionConfig,
        true
      );
    });

    test('should handle ICE candidate events', () => {
      const mockCandidate = {
        candidate: 'mock-ice-candidate',
        sdpMLineIndex: 0,
        sdpMid: 'video'
      };

      const eventPromise = new Promise((resolve) => {
        peerConnectionManager.once('ice-candidate', resolve);
      });

      // Simulate ICE candidate event
      const iceCandidateHandler = mockRTCPeerConnection.onicecandidate as jest.Mock;
      if (iceCandidateHandler) {
        iceCandidateHandler({ candidate: mockCandidate } as any);
      }

      return eventPromise.then((event) => {
        expect(event).toBeDefined();
      });
    });

    test('should handle track events', () => {
      const mockStream = mockMediaStream;

      const eventPromise = new Promise((resolve) => {
        peerConnectionManager.once('remote-stream-added', resolve);
      });

      // Simulate track event
      const trackHandler = mockRTCPeerConnection.ontrack as jest.Mock;
      if (trackHandler) {
        trackHandler({ streams: [mockStream] } as any);
      }

      return eventPromise.then((event) => {
        expect(event).toBeDefined();
      });
    });

    test('should handle connection state change events', () => {
      const eventPromise = new Promise((resolve) => {
        peerConnectionManager.once('connection-state-changed', resolve);
      });

      // Simulate connection state change
      mockRTCPeerConnection.connectionState = 'connected';
      const connectionStateHandler = mockRTCPeerConnection.onconnectionstatechange as jest.Mock;
      if (connectionStateHandler) {
        connectionStateHandler({} as any);
      }

      return eventPromise.then((event) => {
        expect(event).toBeDefined();
      });
    });
  });

  describe('RTC Configuration Updates', () => {
    test('should update RTC configuration', () => {
      const newConfig: RTCConfiguration = {
        iceServers: [{ urls: 'stun:new-stun-server.com:3478' }]
      };

      const eventPromise = new Promise((resolve) => {
        peerConnectionManager.once('rtc-configuration-updated', resolve);
      });

      peerConnectionManager.updateRTCConfiguration(newConfig);

      return eventPromise.then((event) => {
        expect(event).toBeDefined();
      });
    });
  });

  describe('Manager Destruction', () => {
    test('should clean up all resources on destroy', async () => {
      const participantId = 'participant123';
      await peerConnectionManager.createPeerConnection(
        participantId,
        compressionConfig,
        true
      );

      peerConnectionManager.destroy();

      expect(mockRTCPeerConnection.close).toHaveBeenCalled();
    });
  });
});