import React, { useState } from 'react';

interface RoomJoinProps {
  onJoinRoom: (roomId: string, roomCode?: string) => Promise<void>;
}

export const RoomJoin: React.FC<RoomJoinProps> = ({ onJoinRoom }) => {
  const [isJoining, setIsJoining] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // For simplicity, we'll use the room code as room ID
      // In a real implementation, you'd look up the room ID by code
      await onJoinRoom(roomCode.trim().toUpperCase(), roomCode.trim().toUpperCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isJoining) {
      handleJoinRoom();
    }
  };

  const formatRoomCode = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    // Limit to 6 characters
    return cleaned.slice(0, 6);
  };

  return (
    <div className="room-join">
      <div className="join-card">
        <div className="card-header">
          <div className="card-icon">
            <i className="fas fa-sign-in-alt"></i>
          </div>
          <div>
            <h3>Join Room</h3>
            <p>Enter a room code to join</p>
          </div>
        </div>

        <div className="join-form">
          <div className="form-group">
            <label htmlFor="joinRoomCode">Room Code</label>
            <input
              id="joinRoomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(formatRoomCode(e.target.value))}
              onKeyPress={handleKeyPress}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="room-code-input"
              disabled={isJoining}
            />
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={isJoining || !roomCode.trim()}
            className="join-button"
          >
            {isJoining ? (
              <>
                <div className="button-spinner"></div>
                Joining...
              </>
            ) : (
              <>
                <i className="fas fa-door-open"></i>
                Join Room
              </>
            )}
          </button>

          <div className="join-help">
            <div className="help-item">
              <i className="fas fa-info-circle"></i>
              <span>Room codes are 6 characters long</span>
            </div>
            <div className="help-item">
              <i className="fas fa-shield-alt"></i>
              <span>All calls use quantum compression</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .room-join {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .join-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .card-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #a8edea, #fed6e3);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          font-size: 1.5rem;
        }

        .card-header h3 {
          margin: 0;
          color: white;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .card-header p {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
        }

        .join-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: white;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .room-code-input {
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1.2rem;
          font-family: 'Courier New', monospace;
          letter-spacing: 4px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .room-code-input:focus {
          outline: none;
          border-color: #a8edea;
          box-shadow: 0 0 0 3px rgba(168, 237, 234, 0.2);
          background: rgba(255, 255, 255, 0.15);
        }

        .room-code-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 2px;
        }

        .room-code-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ff6b6b;
          font-size: 0.9rem;
          background: rgba(255, 107, 107, 0.1);
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .join-button {
          background: linear-gradient(135deg, #a8edea, #fed6e3);
          color: #333;
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
          margin-top: 1rem;
        }

        .join-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(168, 237, 234, 0.3);
        }

        .join-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(51, 51, 51, 0.3);
          border-top: 2px solid #333;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .join-help {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .help-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
        }

        .help-item i {
          color: #a8edea;
          width: 16px;
          text-align: center;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .join-card {
            max-width: 100%;
            margin: 0 1rem;
          }

          .room-code-input {
            font-size: 1.1rem;
            letter-spacing: 3px;
          }
        }
      `}</style>
    </div>
  );
};