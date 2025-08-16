import React, { useState, useEffect, useCallback } from 'react';
import { MeetingRecorder, RecordingConfig, RecordingSession } from '../../video/MeetingRecorder';
import { VideoConferenceRoom, Participant } from '../../video/models/WebRTCModels';

interface MeetingRecordingProps {
  recorder: MeetingRecorder;
  room: VideoConferenceRoom;
  participants: Map<string, Participant>;
  streams: Map<string, MediaStream>;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export const MeetingRecording: React.FC<MeetingRecordingProps> = ({
  recorder,
  room,
  participants,
  streams,
  onRecordingStateChange
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSession, setCurrentSession] = useState<RecordingSession | null>(null);
  const [recordingStats, setRecordingStats] = useState({
    duration: 0,
    participantCount: 0,
    totalSize: 0,
    compressionRatio: 0
  });
  const [config, setConfig] = useState<RecordingConfig>({
    quality: 'medium',
    includeAudio: true,
    includeScreenShare: true,
    maxDuration: 120, // 2 hours
    compressionLevel: 6,
    format: 'webm'
  });
  const [error, setError] = useState<string | null>(null);

  // Update recording stats periodically
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      const stats = recorder.getRecordingStats();
      setRecordingStats(stats);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, recorder]);

  // Listen to recorder events
  useEffect(() => {
    const handleRecordingStarted = () => {
      setIsRecording(true);
      setError(null);
      onRecordingStateChange?.(true);
    };

    const handleRecordingCompleted = ({ session }: { session: RecordingSession }) => {
      setIsRecording(false);
      setIsPaused(false);
      setCurrentSession(session);
      onRecordingStateChange?.(false);
    };

    const handleRecordingPaused = () => {
      setIsPaused(true);
    };

    const handleRecordingResumed = () => {
      setIsPaused(false);
    };

    const handleRecordingError = ({ error }: { error: any }) => {
      setError(error.message || 'Recording error occurred');
      setIsRecording(false);
      setIsPaused(false);
      onRecordingStateChange?.(false);
    };

    recorder.on('recording-started', handleRecordingStarted);
    recorder.on('recording-completed', handleRecordingCompleted);
    recorder.on('recording-paused', handleRecordingPaused);
    recorder.on('recording-resumed', handleRecordingResumed);
    recorder.on('recording-error', handleRecordingError);

    return () => {
      recorder.off('recording-started', handleRecordingStarted);
      recorder.off('recording-completed', handleRecordingCompleted);
      recorder.off('recording-paused', handleRecordingPaused);
      recorder.off('recording-resumed', handleRecordingResumed);
      recorder.off('recording-error', handleRecordingError);
    };
  }, [recorder, onRecordingStateChange]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      await recorder.startRecording(room, participants, streams, config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [recorder, room, participants, streams, config]);

  const stopRecording = useCallback(async () => {
    try {
      await recorder.stopRecording();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
    }
  }, [recorder]);

  const pauseRecording = useCallback(() => {
    try {
      recorder.pauseRecording();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause recording');
    }
  }, [recorder]);

  const resumeRecording = useCallback(() => {
    try {
      recorder.resumeRecording();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume recording');
    }
  }, [recorder]);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="meeting-recording">
      <div className="recording-header">
        <h3>Meeting Recording</h3>
        {isRecording && (
          <div className="recording-indicator">
            <div className="recording-dot"></div>
            <span>Recording</span>
          </div>
        )}
      </div>

      {error && (
        <div className="recording-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!isRecording && !currentSession && (
        <div className="recording-config">
          <div className="config-section">
            <label>Recording Quality:</label>
            <select
              value={config.quality}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                quality: e.target.value as 'low' | 'medium' | 'high' 
              }))}
            >
              <option value="low">Low (500 kbps)</option>
              <option value="medium">Medium (1.5 Mbps)</option>
              <option value="high">High (4 Mbps)</option>
            </select>
          </div>

          <div className="config-section">
            <label>Compression Level:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={config.compressionLevel}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                compressionLevel: parseInt(e.target.value) 
              }))}
            />
            <span>{config.compressionLevel}/10</span>
          </div>

          <div className="config-section">
            <label>Max Duration (minutes):</label>
            <input
              type="number"
              min="5"
              max="480"
              value={config.maxDuration}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                maxDuration: parseInt(e.target.value) 
              }))}
            />
          </div>

          <div className="config-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={config.includeAudio}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  includeAudio: e.target.checked 
                }))}
              />
              Include Audio
            </label>
            <label>
              <input
                type="checkbox"
                checked={config.includeScreenShare}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  includeScreenShare: e.target.checked 
                }))}
              />
              Include Screen Share
            </label>
          </div>

          <button className="start-recording-btn" onClick={startRecording}>
            <span className="record-icon">⏺</span>
            Start Recording
          </button>
        </div>
      )}

      {isRecording && (
        <div className="recording-controls">
          <div className="recording-stats">
            <div className="stat">
              <span className="stat-label">Duration:</span>
              <span className="stat-value">{formatDuration(recordingStats.duration)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Participants:</span>
              <span className="stat-value">{recordingStats.participantCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Size:</span>
              <span className="stat-value">{formatFileSize(recordingStats.totalSize)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Compression:</span>
              <span className="stat-value">{recordingStats.compressionRatio.toFixed(1)}x</span>
            </div>
          </div>

          <div className="recording-buttons">
            {!isPaused ? (
              <button className="pause-btn" onClick={pauseRecording}>
                <span>⏸</span>
                Pause
              </button>
            ) : (
              <button className="resume-btn" onClick={resumeRecording}>
                <span>▶️</span>
                Resume
              </button>
            )}
            <button className="stop-btn" onClick={stopRecording}>
              <span>⏹</span>
              Stop Recording
            </button>
          </div>
        </div>
      )}

      {currentSession && (
        <div className="recording-completed">
          <div className="completion-header">
            <span className="success-icon">✅</span>
            <h4>Recording Completed</h4>
          </div>
          
          <div className="session-stats">
            <div className="stat">
              <span className="stat-label">Duration:</span>
              <span className="stat-value">{formatDuration(currentSession.duration)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Segments:</span>
              <span className="stat-value">{currentSession.segments.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Original Size:</span>
              <span className="stat-value">{formatFileSize(currentSession.totalOriginalSize)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Compressed Size:</span>
              <span className="stat-value">{formatFileSize(currentSession.totalCompressedSize)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Compression Ratio:</span>
              <span className="stat-value">{currentSession.overallCompressionRatio.toFixed(1)}x</span>
            </div>
            <div className="stat">
              <span className="stat-label">Space Saved:</span>
              <span className="stat-value">
                {formatFileSize(currentSession.totalOriginalSize - currentSession.totalCompressedSize)}
                ({(((currentSession.totalOriginalSize - currentSession.totalCompressedSize) / currentSession.totalOriginalSize) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="recording-actions">
            <button className="download-btn">
              <span>⬇️</span>
              Download Recording
            </button>
            <button className="new-recording-btn" onClick={() => setCurrentSession(null)}>
              <span>⏺</span>
              New Recording
            </button>
          </div>
        </div>
      )}

      <style>{`
        .meeting-recording {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .recording-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .recording-header h3 {
          color: white;
          margin: 0;
          font-size: 1.2rem;
        }

        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ff4757;
          font-weight: 600;
        }

        .recording-dot {
          width: 12px;
          height: 12px;
          background: #ff4757;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .recording-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 71, 87, 0.2);
          border: 1px solid #ff4757;
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 1rem;
          color: #ff4757;
        }

        .recording-config {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .config-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .config-section label {
          color: white;
          font-weight: 500;
          min-width: 120px;
        }

        .config-section select,
        .config-section input[type="number"] {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          padding: 0.5rem;
          color: white;
          font-size: 0.9rem;
        }

        .config-section input[type="range"] {
          flex: 1;
          max-width: 150px;
        }

        .config-checkboxes {
          display: flex;
          gap: 1rem;
        }

        .config-checkboxes label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          cursor: pointer;
          min-width: auto;
        }

        .start-recording-btn {
          background: linear-gradient(135deg, #ff4757, #ff3742);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .start-recording-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 71, 87, 0.3);
        }

        .recording-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recording-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }

        .recording-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .pause-btn, .resume-btn, .stop-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .stop-btn {
          background: linear-gradient(135deg, #ff4757, #ff3742);
          border: none;
        }

        .pause-btn:hover, .resume-btn:hover, .stop-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
        }

        .recording-completed {
          text-align: center;
        }

        .completion-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .completion-header h4 {
          color: white;
          margin: 0;
          font-size: 1.2rem;
        }

        .session-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .recording-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .download-btn, .new-recording-btn {
          background: linear-gradient(135deg, #5f27cd, #341f97);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .new-recording-btn {
          background: linear-gradient(135deg, #00d2d3, #54a0ff);
        }

        .download-btn:hover, .new-recording-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(95, 39, 205, 0.3);
        }

        @media (max-width: 768px) {
          .recording-stats,
          .session-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .recording-buttons,
          .recording-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};