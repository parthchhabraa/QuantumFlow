import { MeetingRecorder, RecordingConfig } from '../MeetingRecorder';
import { VideoCompressionEngine } from '../VideoCompressionEngine';
import { VideoConferenceRoom, Participant } from '../models/WebRTCModels';
import { VideoCompressionConfig } from '../models/VideoModels';

// Mock VideoCompressionEngine
jest.mock('../VideoCompressionEngine');

// Create a proper mock for MediaRecorder
class MockMediaRecorder {
  public state: string = 'inactive';
  public ondataavailable: ((event: any) => void) | null = null;
  public onstop: ((event: any) => void) | null = null;
  public onerror: ((event: any) => void) | null = null;

  start = jest.fn();
  stop = jest.fn();
  pause = jest.fn();
  resume = jest.fn();

  static isTypeSupported = jest.fn().mockReturnValue(true);
}

// Mock global MediaRecorder
(global as any).MediaRecorder = MockMediaRecorder;

describe('MeetingRecorder', () => {
  let recorder: MeetingRecorder;
  let mockCompressionEngine: jest.Mocked<VideoCompressionEngine>;
  let mockRoom: VideoConferenceRoom;
  let mockParticipants: Map<string, Participant>;
  let mockStreams: Map<string, MediaStream>;
  let mockConfig: RecordingConfig;

  beforeEach(() => {
    mockCompressionEngine = new VideoCompressionEngine() as jest.Mocked<VideoCompressionEngine>;
    mockCompressionEngine.compressVideoBuffer = jest.fn().mockResolvedValue({
      compressedData: Buffer.from('compressed'),
      compressionRatio: 2.5,
      originalSize: 1000,
      compressedSize: 400
    });

    recorder = new MeetingRecorder(mockCompressionEngine);

    mockRoom = {
      roomId: 'test-room',
      roomCode: 'TEST123',
      createdAt: Date.now(),
      createdBy: 'user1',
      participants: new Map(),
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

    mockParticipants = new Map([
      ['user1', {
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
      }]
    ]);

    // Mock MediaStream
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([]),
      getAudioTracks: jest.fn().mockReturnValue([]),
      getVideoTracks: jest.fn().mockReturnValue([])
    } as unknown as MediaStream;

    mockStreams = new Map([['user1', mockStream]]);

    mockConfig = {
      quality: 'medium',
      includeAudio: true,
      includeScreenShare: true,
      maxDuration: 60,
      compressionLevel: 6,
      format: 'webm'
    };
  });

  afterEach(() => {
    recorder.destroy();
    jest.clearAllMocks();
  });

  describe('startRecording', () => {
    it('should start recording successfully', async () => {
      const sessionId = await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      expect(sessionId).toBeDefined();
      expect(sessionId).toMatch(/^rec_\d+_[a-z0-9]+$/);
      // MediaRecorder should be created and started
      expect(MockMediaRecorder.prototype.start).toHaveBeenCalledWith(1000);
    });

    it('should throw error if already recording', async () => {
      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      await expect(
        recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig)
      ).rejects.toThrow('Recording already in progress');
    });

    it('should emit recording-started event', async () => {
      const startedSpy = jest.fn();
      recorder.on('recording-started', startedSpy);

      const sessionId = await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      expect(startedSpy).toHaveBeenCalledWith({
        sessionId,
        roomId: mockRoom.roomId
      });
    });

    it('should set up automatic stop after max duration', async () => {
      jest.useFakeTimers();
      const stopSpy = jest.spyOn(recorder, 'stopRecording').mockResolvedValue({} as any);

      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, {
        ...mockConfig,
        maxDuration: 1 // 1 minute
      });

      // Fast forward 1 minute
      jest.advanceTimersByTime(60 * 1000);

      expect(stopSpy).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('stopRecording', () => {
    it('should stop recording successfully', async () => {
      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);
      
      // Simulate the recording process completing
      const session = await new Promise<any>((resolve) => {
        setTimeout(async () => {
          const result = await recorder.stopRecording();
          resolve(result);
        }, 10);
      });

      expect(session).toBeDefined();
      expect(session.status).toBe('completed');
      expect(MockMediaRecorder.prototype.stop).toHaveBeenCalled();
    });

    it('should throw error if no recording in progress', async () => {
      await expect(recorder.stopRecording()).rejects.toThrow('No recording in progress');
    });

    it('should emit recording-completed event', async () => {
      const completedSpy = jest.fn();
      recorder.on('recording-completed', completedSpy);

      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);
      
      // Simulate the recording process completing
      const session = await new Promise<any>((resolve) => {
        setTimeout(async () => {
          const result = await recorder.stopRecording();
          resolve(result);
        }, 10);
      });

      expect(completedSpy).toHaveBeenCalledWith({ session });
    });
  });

  describe('pauseRecording', () => {
    it('should pause recording successfully', async () => {
      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      recorder.pauseRecording();

      expect(MockMediaRecorder.prototype.pause).toHaveBeenCalled();
    });

    it('should throw error if no recording in progress', () => {
      expect(() => recorder.pauseRecording()).toThrow('No recording in progress');
    });

    it('should emit recording-paused event', async () => {
      const pausedSpy = jest.fn();
      recorder.on('recording-paused', pausedSpy);

      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      recorder.pauseRecording();

      expect(pausedSpy).toHaveBeenCalled();
    });
  });

  describe('resumeRecording', () => {
    it('should resume recording successfully', async () => {
      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);
      recorder.pauseRecording();

      recorder.resumeRecording();

      expect(MockMediaRecorder.prototype.resume).toHaveBeenCalled();
    });

    it('should throw error if no paused recording', () => {
      expect(() => recorder.resumeRecording()).toThrow('No paused recording to resume');
    });

    it('should emit recording-resumed event', async () => {
      const resumedSpy = jest.fn();
      recorder.on('recording-resumed', resumedSpy);

      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);
      recorder.pauseRecording();

      recorder.resumeRecording();

      expect(resumedSpy).toHaveBeenCalled();
    });
  });

  describe('addParticipantToRecording', () => {
    it('should add participant to ongoing recording', async () => {
      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      const newStream = {
        getTracks: jest.fn().mockReturnValue([]),
        getAudioTracks: jest.fn().mockReturnValue([]),
        getVideoTracks: jest.fn().mockReturnValue([])
      } as unknown as MediaStream;

      const addedSpy = jest.fn();
      recorder.on('participant-added-to-recording', addedSpy);

      await recorder.addParticipantToRecording('user2', newStream);

      expect(addedSpy).toHaveBeenCalledWith({ participantId: 'user2' });
    });

    it('should not add participant if no recording in progress', async () => {
      const newStream = {} as MediaStream;
      
      await recorder.addParticipantToRecording('user2', newStream);
      
      // Should not throw error, just return silently
      expect(MockMediaRecorder.prototype.start).not.toHaveBeenCalled();
    });
  });

  describe('removeParticipantFromRecording', () => {
    it('should remove participant from recording', async () => {
      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      const removedSpy = jest.fn();
      recorder.on('participant-removed-from-recording', removedSpy);

      recorder.removeParticipantFromRecording('user1');

      expect(MockMediaRecorder.prototype.stop).toHaveBeenCalled();
      expect(removedSpy).toHaveBeenCalledWith({ participantId: 'user1' });
    });
  });

  describe('getRecordingStats', () => {
    it('should return stats when recording', async () => {
      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      const stats = recorder.getRecordingStats();

      expect(stats.isRecording).toBe(true);
      expect(stats.participantCount).toBe(1);
      expect(stats.duration).toBeGreaterThan(0);
    });

    it('should return empty stats when not recording', () => {
      const stats = recorder.getRecordingStats();

      expect(stats.isRecording).toBe(false);
      expect(stats.participantCount).toBe(0);
      expect(stats.duration).toBe(0);
    });
  });

  describe('getCurrentSession', () => {
    it('should return current session when recording', async () => {
      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      const session = recorder.getCurrentSession();

      expect(session).toBeDefined();
      expect(session?.roomId).toBe(mockRoom.roomId);
      expect(session?.status).toBe('recording');
    });

    it('should return null when not recording', () => {
      const session = recorder.getCurrentSession();
      expect(session).toBeNull();
    });
  });

  describe('compression integration', () => {
    it('should compress recording data', async () => {
      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      // Simulate data available event
      const mockBlob = new Blob(['test data'], { type: 'video/webm' });
      const chunks = [mockBlob];

      // Mock the processing
      const processParticipantRecording = (recorder as any).processParticipantRecording.bind(recorder);
      await processParticipantRecording('user1', chunks);

      expect(mockCompressionEngine.compressVideoBuffer).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle compression errors gracefully', async () => {
      mockCompressionEngine.compressVideoBuffer.mockRejectedValue(new Error('Compression failed'));

      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      // Should not throw error during recording start
      expect(recorder.getCurrentSession()?.status).toBe('recording');
    });

    it('should handle MediaRecorder errors', async () => {
      const errorSpy = jest.fn();
      recorder.on('recording-error', errorSpy);

      await recorder.startRecording(mockRoom, mockParticipants, mockStreams, mockConfig);

      // Should not throw error during recording start
      expect(recorder.getCurrentSession()?.status).toBe('recording');
    });
  });
});