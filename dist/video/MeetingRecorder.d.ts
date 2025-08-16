/**
 * Meeting recording functionality with quantum-compressed storage
 */
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
export declare class MeetingRecorder extends EventEmitter {
    private compressionEngine;
    private currentSession;
    private mediaRecorders;
    private recordingStreams;
    private recordingChunks;
    private isRecording;
    constructor(compressionEngine: VideoCompressionEngine);
    /**
     * Start recording a meeting
     */
    startRecording(room: VideoConferenceRoom, participants: Map<string, Participant>, streams: Map<string, MediaStream>, config: RecordingConfig): Promise<string>;
    /**
     * Stop recording
     */
    stopRecording(): Promise<RecordingSession>;
    /**
     * Pause recording
     */
    pauseRecording(): void;
    /**
     * Resume recording
     */
    resumeRecording(): void;
    /**
     * Add participant to ongoing recording
     */
    addParticipantToRecording(participantId: string, stream: MediaStream): Promise<void>;
    /**
     * Remove participant from recording
     */
    removeParticipantFromRecording(participantId: string): void;
    /**
     * Get current recording session
     */
    getCurrentSession(): RecordingSession | null;
    /**
     * Get recording statistics
     */
    getRecordingStats(): {
        isRecording: boolean;
        duration: number;
        participantCount: number;
        totalSize: number;
        compressionRatio: number;
    };
    /**
     * Start recording for a specific participant
     */
    private startParticipantRecording;
    /**
     * Process recording for a specific participant
     */
    private processParticipantRecording;
    /**
     * Wait for all recordings to complete
     */
    private waitForRecordingsToComplete;
    /**
     * Process all recording segments
     */
    private processRecordingSegments;
    /**
     * Get video bitrate based on quality setting
     */
    private getVideoBitrate;
    /**
     * Generate unique session ID
     */
    private generateSessionId;
    /**
     * Generate unique segment ID
     */
    private generateSegmentId;
    /**
     * Clean up resources
     */
    destroy(): void;
}
//# sourceMappingURL=MeetingRecorder.d.ts.map