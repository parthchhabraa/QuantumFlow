/**
 * Meeting recording functionality with quantum-compressed storage
 */

import { VideoFrame, VideoCompressionConfig } from './models/VideoModels';
import { VideoConferenceRoom, Participant } from './models/WebRTCModels';
import { VideoCompressionEngine } from './VideoCompressionEngine';
import { EventEmitter } from 'events';

export interface RecordingConfig {
  /** Video quality for recording */
  quality: 'low' | 'medium' | 'high';
  /** Enable audio recording */
  includeAudio: boolean;
  /** Enable screen share recording */
  includeScreenShare: boolean;
  /** Maximum recording duration in minutes */
  maxDuration: number;
  /** Quantum compression level for storage */
  compressionLevel: number;
  /** Output format */
  format: 'webm' | 'mp4';
}

export interface RecordingSegment {
  /** Segment identifier */
  id: string;
  /** Participant ID */
  participantId: string;
  /** Start timestamp */
  startTime: number;
  /** End timestamp */
  endTime: number;
  /** Compressed video data */
  videoData: Buffer;
  /** Compressed audio data */
  audioData?: Buffer;
  /** Compression ratio achieved */
  compressionRatio: number;
  /** Original size in bytes */
  originalSize: number;
  /** Compressed size in bytes */
  compressedSize: number;
}

export interface RecordingSession {
  /** Session identifier */
  sessionId: string;
  /** Room ID */
  roomId: string;
  /** Recording start time */
  startTime: number;
  /** Recording end time */
  endTime?: number;
  /** Recording configuration */
  config: RecordingConfig;
  /** Recording segments */
  segments: RecordingSegment[];
  /** Total duration in milliseconds */
  duration: number;
  /** Total original size */
  totalOriginalSize: number;
  /** Total compressed size */
  totalCompressedSize: number;
  /** Overall compression ratio */
  overallCompressionRatio: number;
  /** Recording status */
  status: 'recording' | 'paused' | 'stopped' | 'processing' | 'completed' | 'error';
  /** Error message if status is error */
  error?: string;
}

export class MeetingRecorder extends EventEmitter {
  private compressionEngine: VideoCompressionEngine;
  private currentSession: RecordingSession | null = null;
  private mediaRecorders: Map<string, MediaRecorder> = new Map();
  private recordingStreams: Map<string, MediaStream> = new Map();
  private recordingChunks: Map<string, Blob[]> = new Map();
  private isRecording = false;

  constructor(compressionEngine: VideoCompressionEngine) {
    super();
    this.compressionEngine = compressionEngine;
  }

  /**
   * Start recording a meeting
   */
  async startRecording(
    room: VideoConferenceRoom,
    participants: Map<string, Participant>,
    streams: Map<string, MediaStream>,
    config: RecordingConfig
  ): Promise<string> {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    const sessionId = this.generateSessionId();
    
    this.currentSession = {
      sessionId,
      roomId: room.roomId,
      startTime: Date.now(),
      config,
      segments: [],
      duration: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      overallCompressionRatio: 0,
      status: 'recording'
    };

    try {
      // Start recording for each participant
      for (const [participantId, stream] of streams) {
        await this.startParticipantRecording(participantId, stream, config);
      }

      this.isRecording = true;
      this.emit('recording-started', { sessionId, roomId: room.roomId });

      // Set up automatic stop after max duration
      if (config.maxDuration > 0) {
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, config.maxDuration * 60 * 1000);
      }

      return sessionId;
    } catch (error) {
      this.currentSession.status = 'error';
      this.currentSession.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<RecordingSession> {
    if (!this.isRecording || !this.currentSession) {
      throw new Error('No recording in progress');
    }

    this.currentSession.status = 'processing';
    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

    try {
      // Stop all media recorders
      for (const [participantId, recorder] of this.mediaRecorders) {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }

      // Wait for all recordings to complete
      await this.waitForRecordingsToComplete();

      // Process and compress all segments
      await this.processRecordingSegments();

      this.currentSession.status = 'completed';
      this.isRecording = false;

      const session = this.currentSession;
      this.currentSession = null;

      this.emit('recording-completed', { session });
      return session;
    } catch (error) {
      if (this.currentSession) {
        this.currentSession.status = 'error';
        this.currentSession.error = error instanceof Error ? error.message : 'Processing failed';
      }
      throw error;
    }
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (!this.isRecording || !this.currentSession) {
      throw new Error('No recording in progress');
    }

    for (const recorder of this.mediaRecorders.values()) {
      if (recorder.state === 'recording') {
        recorder.pause();
      }
    }

    this.currentSession.status = 'paused';
    this.emit('recording-paused', { sessionId: this.currentSession.sessionId });
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (!this.currentSession || this.currentSession.status !== 'paused') {
      throw new Error('No paused recording to resume');
    }

    for (const recorder of this.mediaRecorders.values()) {
      if (recorder.state === 'paused') {
        recorder.resume();
      }
    }

    this.currentSession.status = 'recording';
    this.emit('recording-resumed', { sessionId: this.currentSession.sessionId });
  }

  /**
   * Add participant to ongoing recording
   */
  async addParticipantToRecording(
    participantId: string,
    stream: MediaStream
  ): Promise<void> {
    if (!this.isRecording || !this.currentSession) {
      return;
    }

    await this.startParticipantRecording(participantId, stream, this.currentSession.config);
    this.emit('participant-added-to-recording', { participantId });
  }

  /**
   * Remove participant from recording
   */
  removeParticipantFromRecording(participantId: string): void {
    const recorder = this.mediaRecorders.get(participantId);
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }

    this.mediaRecorders.delete(participantId);
    this.recordingStreams.delete(participantId);
    this.recordingChunks.delete(participantId);

    this.emit('participant-removed-from-recording', { participantId });
  }

  /**
   * Get current recording session
   */
  getCurrentSession(): RecordingSession | null {
    return this.currentSession;
  }

  /**
   * Get recording statistics
   */
  getRecordingStats(): {
    isRecording: boolean;
    duration: number;
    participantCount: number;
    totalSize: number;
    compressionRatio: number;
  } {
    if (!this.currentSession) {
      return {
        isRecording: false,
        duration: 0,
        participantCount: 0,
        totalSize: 0,
        compressionRatio: 0
      };
    }

    const currentTime = Date.now();
    const duration = this.isRecording ? currentTime - this.currentSession.startTime : this.currentSession.duration;

    return {
      isRecording: this.isRecording,
      duration,
      participantCount: this.mediaRecorders.size,
      totalSize: this.currentSession.totalCompressedSize,
      compressionRatio: this.currentSession.overallCompressionRatio
    };
  }

  /**
   * Start recording for a specific participant
   */
  private async startParticipantRecording(
    participantId: string,
    stream: MediaStream,
    config: RecordingConfig
  ): Promise<void> {
    const mimeType = config.format === 'mp4' ? 'video/mp4' : 'video/webm';
    
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      throw new Error(`Recording format ${config.format} not supported`);
    }

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: this.getVideoBitrate(config.quality),
      audioBitsPerSecond: config.includeAudio ? 128000 : undefined
    });

    const chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      try {
        await this.processParticipantRecording(participantId, chunks);
      } catch (error) {
        console.error(`Error processing recording for participant ${participantId}:`, error);
      }
    };

    recorder.onerror = (event) => {
      console.error(`Recording error for participant ${participantId}:`, event);
      this.emit('recording-error', { participantId, error: event });
    };

    this.mediaRecorders.set(participantId, recorder);
    this.recordingStreams.set(participantId, stream);
    this.recordingChunks.set(participantId, chunks);

    recorder.start(1000); // Collect data every second
  }

  /**
   * Process recording for a specific participant
   */
  private async processParticipantRecording(
    participantId: string,
    chunks: Blob[]
  ): Promise<void> {
    if (!this.currentSession || chunks.length === 0) {
      return;
    }

    const blob = new Blob(chunks, { type: chunks[0].type });
    const arrayBuffer = await blob.arrayBuffer();
    const originalData = Buffer.from(arrayBuffer);

    // Apply quantum compression to the recording
    const compressionConfig = new VideoCompressionConfig();
    compressionConfig.quantumCompressionLevel = this.currentSession.config.compressionLevel;

    const compressedData = await this.compressionEngine.compressVideoBuffer(
      originalData,
      compressionConfig
    );

    const segment: RecordingSegment = {
      id: this.generateSegmentId(),
      participantId,
      startTime: this.currentSession.startTime,
      endTime: Date.now(),
      videoData: compressedData.compressedData,
      compressionRatio: compressedData.compressionRatio,
      originalSize: originalData.length,
      compressedSize: compressedData.compressedData.length
    };

    this.currentSession.segments.push(segment);
    this.currentSession.totalOriginalSize += segment.originalSize;
    this.currentSession.totalCompressedSize += segment.compressedSize;
    
    // Update overall compression ratio
    this.currentSession.overallCompressionRatio = 
      this.currentSession.totalOriginalSize / this.currentSession.totalCompressedSize;

    this.emit('segment-processed', { segment });
  }

  /**
   * Wait for all recordings to complete
   */
  private async waitForRecordingsToComplete(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [participantId, recorder] of this.mediaRecorders) {
      if (recorder.state !== 'inactive') {
        promises.push(new Promise((resolve) => {
          recorder.onstop = () => resolve();
        }));
      }
    }

    await Promise.all(promises);
  }

  /**
   * Process all recording segments
   */
  private async processRecordingSegments(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    // Additional processing can be added here
    // For example, merging segments, generating thumbnails, etc.
    
    this.emit('segments-processed', { 
      sessionId: this.currentSession.sessionId,
      segmentCount: this.currentSession.segments.length
    });
  }

  /**
   * Get video bitrate based on quality setting
   */
  private getVideoBitrate(quality: 'low' | 'medium' | 'high'): number {
    switch (quality) {
      case 'low':
        return 500000; // 500 kbps
      case 'medium':
        return 1500000; // 1.5 Mbps
      case 'high':
        return 4000000; // 4 Mbps
      default:
        return 1500000;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique segment ID
   */
  private generateSegmentId(): string {
    return `seg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.isRecording) {
      this.stopRecording().catch(console.error);
    }

    this.mediaRecorders.clear();
    this.recordingStreams.clear();
    this.recordingChunks.clear();
    this.removeAllListeners();
  }
}