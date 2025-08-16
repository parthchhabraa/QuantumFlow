import React, { useState } from 'react';
import { Participant } from '../../video/models/WebRTCModels';

interface ParticipantListProps {
  participants: Map<string, Participant>;
  currentUserId: string;
  onClose: () => void;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  currentUserId,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const participantArray = Array.from(participants.values());
  const filteredParticipants = participantArray.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConnectionStatusColor = (state: string): string => {
    switch (state) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'disconnected': return '#ef4444';
      case 'failed': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getNetworkQualityIcon = (quality: string): string => {
    switch (quality) {
      case 'excellent': return 'fas fa-signal';
      case 'good': return 'fas fa-signal';
      case 'fair': return 'fas fa-signal';
      case 'poor': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-question-circle';
    }
  };

  const formatBandwidth = (bandwidth: number): string => {
    if (bandwidth < 1) {
      return `${(bandwidth * 1000).toFixed(0)} Kbps`;
    }
    return `${bandwidth.toFixed(1)} Mbps`;
  };

  const formatJoinTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <div className="participant-list">
      <div className="panel-header">
        <h3>
          <i className="fas fa-users"></i>
          Participants ({participants.size})
        </h3>
        <button onClick={onClose} className="close-button">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="participants-container">
        {filteredParticipants.length === 0 ? (
          <div className="no-participants">
            <i className="fas fa-user-slash"></i>
            <p>No participants found</p>
          </div>
        ) : (
          filteredParticipants.map((participant) => (
            <div
              key={participant.id}
              className={`participant-item ${participant.id === currentUserId ? 'current-user' : ''}`}
            >
              <div className="participant-avatar">
                <div className="avatar-circle">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div
                  className="status-indicator"
                  style={{ backgroundColor: getConnectionStatusColor(participant.connectionState) }}
                  title={`Connection: ${participant.connectionState}`}
                ></div>
              </div>

              <div className="participant-info">
                <div className="participant-name">
                  {participant.name}
                  {participant.id === currentUserId && <span className="you-label">(You)</span>}
                </div>
                
                <div className="participant-details">
                  <div className="detail-row">
                    <i className={getNetworkQualityIcon(participant.networkQuality)}></i>
                    <span className="network-quality" style={{ color: getConnectionStatusColor(participant.networkQuality) }}>
                      {participant.networkQuality}
                    </span>
                    <span className="bandwidth">
                      {formatBandwidth(participant.bandwidthUsage)}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <i className="fas fa-clock"></i>
                    <span className="join-time">
                      Joined {formatJoinTime(participant.joinedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="participant-controls">
                <div className="media-status">
                  <div
                    className={`media-indicator ${participant.isAudioEnabled ? 'enabled' : 'disabled'}`}
                    title={participant.isAudioEnabled ? 'Audio on' : 'Audio off'}
                  >
                    <i className={`fas fa-${participant.isAudioEnabled ? 'microphone' : 'microphone-slash'}`}></i>
                  </div>
                  
                  <div
                    className={`media-indicator ${participant.isVideoEnabled ? 'enabled' : 'disabled'}`}
                    title={participant.isVideoEnabled ? 'Video on' : 'Video off'}
                  >
                    <i className={`fas fa-${participant.isVideoEnabled ? 'video' : 'video-slash'}`}></i>
                  </div>
                  
                  {participant.isScreenSharing && (
                    <div className="media-indicator sharing" title="Screen sharing">
                      <i className="fas fa-desktop"></i>
                    </div>
                  )}
                </div>

                {participant.id !== currentUserId && (
                  <div className="action-buttons">
                    <button
                      className="action-button"
                      title="Mute participant"
                      onClick={() => console.log('Mute participant:', participant.id)}
                    >
                      <i className="fas fa-volume-mute"></i>
                    </button>
                    
                    <button
                      className="action-button"
                      title="Remove participant"
                      onClick={() => console.log('Remove participant:', participant.id)}
                    >
                      <i className="fas fa-user-times"></i>
                    </button>
                  </div>
                )}
              </div>

              {/* Compression Stats */}
              <div className="compression-stats">
                <div className="stats-header">
                  <i className="fas fa-chart-line"></i>
                  <span>Quantum Compression</span>
                </div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Ratio</span>
                    <span className="stat-value">
                      {participant.compressionStats.averageCompressionRatio.toFixed(1)}x
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Sent</span>
                    <span className="stat-value">
                      {(participant.compressionStats.totalBytesTransmitted / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Received</span>
                    <span className="stat-value">
                      {(participant.compressionStats.totalBytesReceived / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .participant-list {
          height: 100%;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .panel-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .search-container {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-input:focus {
          outline: none;
          border-color: #4facfe;
          background: rgba(255, 255, 255, 0.15);
        }

        .participants-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0;
        }

        .no-participants {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
        }

        .no-participants i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .participant-item {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background-color 0.3s ease;
        }

        .participant-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .participant-item.current-user {
          background: rgba(79, 172, 254, 0.1);
          border-left: 3px solid #4facfe;
        }

        .participant-avatar {
          position: relative;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .avatar-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
        }

        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid rgba(0, 0, 0, 0.8);
        }

        .participant-info {
          margin-bottom: 1rem;
        }

        .participant-name {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .you-label {
          font-size: 0.8rem;
          color: #4facfe;
          font-weight: 500;
        }

        .participant-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .detail-row i {
          width: 12px;
          text-align: center;
          font-size: 0.8rem;
        }

        .network-quality {
          text-transform: capitalize;
          font-weight: 500;
        }

        .bandwidth {
          margin-left: auto;
          font-family: 'Courier New', monospace;
        }

        .join-time {
          color: rgba(255, 255, 255, 0.6);
        }

        .participant-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .media-status {
          display: flex;
          gap: 0.5rem;
        }

        .media-indicator {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }

        .media-indicator.enabled {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .media-indicator.disabled {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .media-indicator.sharing {
          background: rgba(79, 172, 254, 0.2);
          color: #4facfe;
        }

        .action-buttons {
          display: flex;
          gap: 0.25rem;
        }

        .action-button {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }

        .action-button:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .compression-stats {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1rem;
        }

        .stats-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: #4facfe;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.25rem;
        }

        .stat-value {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          font-family: 'Courier New', monospace;
        }

        /* Scrollbar styling */
        .participants-container::-webkit-scrollbar {
          width: 6px;
        }

        .participants-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .participants-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .participants-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .participant-controls {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};