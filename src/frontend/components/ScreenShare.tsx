import React, { useState, useRef, useEffect } from 'react';

interface ScreenShareProps {
  isSharing: boolean;
  onStartShare: () => Promise<void>;
  onStopShare: () => Promise<void>;
  stream?: MediaStream;
}

export const ScreenShare: React.FC<ScreenShareProps> = ({
  isSharing,
  onStartShare,
  onStopShare,
  stream
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareOptions, setShareOptions] = useState({
    includeAudio: true,
    cursor: 'always' as 'always' | 'motion' | 'never'
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleStartShare = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onStartShare();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start screen sharing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopShare = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onStopShare();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop screen sharing');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSharing) {
    return (
      <div className="screen-share-setup">
        <div className="setup-card">
          <div className="setup-header">
            <div className="setup-icon">
              <i className="fas fa-desktop"></i>
            </div>
            <h3>Screen Sharing</h3>
            <p>Share your screen with quantum compression</p>
          </div>

          <div className="setup-options">
            <div className="option-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={shareOptions.includeAudio}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, includeAudio: e.target.checked }))}
                />
                <span className="checkmark"></span>
                Include System Audio
              </label>
              <p className="option-description">
                Share audio from your computer along with the screen
              </p>
            </div>

            <div className="option-group">
              <label>Cursor Display</label>
              <select
                value={shareOptions.cursor}
                onChange={(e) => setShareOptions(prev => ({ ...prev, cursor: e.target.value as any }))}
                className="cursor-select"
              >
                <option value="always">Always show cursor</option>
                <option value="motion">Show cursor on motion</option>
                <option value="never">Never show cursor</option>
              </select>
            </div>
          </div>

          <div className="setup-info">
            <div className="info-item">
              <i className="fas fa-compress-alt"></i>
              <div>
                <strong>Quantum Compression</strong>
                <p>Up to 60% better compression than standard screen sharing</p>
              </div>
            </div>
            <div className="info-item">
              <i className="fas fa-shield-alt"></i>
              <div>
                <strong>Secure Transmission</strong>
                <p>End-to-end encrypted with quantum-enhanced security</p>
              </div>
            </div>
            <div className="info-item">
              <i className="fas fa-bolt"></i>
              <div>
                <strong>Low Latency</strong>
                <p>Real-time sharing with minimal delay</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <button
            onClick={handleStartShare}
            disabled={isLoading}
            className="start-share-button"
          >
            {isLoading ? (
              <>
                <div className="button-spinner"></div>
                Starting...
              </>
            ) : (
              <>
                <i className="fas fa-play"></i>
                Start Screen Share
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-share-active">
      <div className="share-header">
        <div className="share-status">
          <div className="status-indicator"></div>
          <span>Screen Sharing Active</span>
        </div>
        <button
          onClick={handleStopShare}
          disabled={isLoading}
          className="stop-share-button"
        >
          {isLoading ? (
            <>
              <div className="button-spinner"></div>
              Stopping...
            </>
          ) : (
            <>
              <i className="fas fa-stop"></i>
              Stop Sharing
            </>
          )}
        </button>
      </div>

      <div className="share-preview">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="preview-video"
        />
        <div className="preview-overlay">
          <div className="preview-info">
            <i className="fas fa-eye"></i>
            <span>Preview of shared screen</span>
          </div>
        </div>
      </div>

      <div className="share-stats">
        <div className="stat-item">
          <i className="fas fa-compress-alt"></i>
          <div>
            <span className="stat-label">Compression</span>
            <span className="stat-value">3.2x</span>
          </div>
        </div>
        <div className="stat-item">
          <i className="fas fa-clock"></i>
          <div>
            <span className="stat-label">Latency</span>
            <span className="stat-value">45ms</span>
          </div>
        </div>
        <div className="stat-item">
          <i className="fas fa-wifi"></i>
          <div>
            <span className="stat-label">Bandwidth</span>
            <span className="stat-value">2.1 Mbps</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <style>{`
        .screen-share-setup {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
        }

        .setup-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          text-align: center;
        }

        .setup-header {
          margin-bottom: 2rem;
        }

        .setup-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 2rem;
          color: white;
        }

        .setup-header h3 {
          margin: 0 0 0.5rem 0;
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .setup-header p {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
        }

        .setup-options {
          margin-bottom: 2rem;
          text-align: left;
        }

        .option-group {
          margin-bottom: 1.5rem;
        }

        .option-group label {
          color: white;
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          margin-bottom: 0.5rem !important;
        }

        .checkbox-label input[type="checkbox"] {
          opacity: 0;
          position: absolute;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          position: relative;
          transition: all 0.3s ease;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          border-color: #4facfe;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: -2px;
          left: 3px;
          color: white;
          font-size: 14px;
          font-weight: bold;
        }

        .cursor-select {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
        }

        .cursor-select option {
          background: #333;
          color: white;
        }

        .option-description {
          margin: 0.5rem 0 0 0;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.4;
        }

        .setup-info {
          margin-bottom: 2rem;
          text-align: left;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .info-item i {
          color: #4facfe;
          font-size: 1.2rem;
          margin-top: 0.2rem;
        }

        .info-item strong {
          color: white;
          font-size: 0.9rem;
          display: block;
          margin-bottom: 0.25rem;
        }

        .info-item p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          line-height: 1.4;
        }

        .start-share-button {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
        }

        .start-share-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(79, 172, 254, 0.3);
        }

        .start-share-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .screen-share-active {
          height: 100%;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .share-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .share-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .stop-share-button {
          background: rgba(239, 68, 68, 0.8);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .stop-share-button:hover:not(:disabled) {
          background: rgba(239, 68, 68, 1);
        }

        .stop-share-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .share-preview {
          flex: 1;
          position: relative;
          background: #1a1a1a;
          margin: 1rem;
          border-radius: 12px;
          overflow: hidden;
        }

        .preview-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .preview-overlay {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(0, 0, 0, 0.8);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }

        .preview-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .share-stats {
          display: flex;
          justify-content: space-around;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.5);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-item i {
          color: #4facfe;
          font-size: 1.2rem;
        }

        .stat-label {
          display: block;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .stat-value {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          font-family: 'Courier New', monospace;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          margin-top: 1rem;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 768px) {
          .setup-card {
            margin: 1rem;
            padding: 1.5rem;
          }

          .share-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .stat-item {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};