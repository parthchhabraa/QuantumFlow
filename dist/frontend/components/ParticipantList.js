"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ParticipantList = ({ participants, currentUserId, onClose }) => {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const participantArray = Array.from(participants.values());
    const filteredParticipants = participantArray.filter(participant => participant.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const getConnectionStatusColor = (state) => {
        switch (state) {
            case 'connected': return '#10b981';
            case 'connecting': return '#f59e0b';
            case 'disconnected': return '#ef4444';
            case 'failed': return '#dc2626';
            default: return '#6b7280';
        }
    };
    const getNetworkQualityIcon = (quality) => {
        switch (quality) {
            case 'excellent': return 'fas fa-signal';
            case 'good': return 'fas fa-signal';
            case 'fair': return 'fas fa-signal';
            case 'poor': return 'fas fa-exclamation-triangle';
            default: return 'fas fa-question-circle';
        }
    };
    const formatBandwidth = (bandwidth) => {
        if (bandwidth < 1) {
            return `${(bandwidth * 1000).toFixed(0)} Kbps`;
        }
        return `${bandwidth.toFixed(1)} Mbps`;
    };
    const formatJoinTime = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ago`;
        }
        return `${minutes}m ago`;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "participant-list", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-header", children: [(0, jsx_runtime_1.jsxs)("h3", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-users" }), "Participants (", participants.size, ")"] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "close-button", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-times" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "search-container", children: (0, jsx_runtime_1.jsxs)("div", { className: "search-input-wrapper", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-search search-icon" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Search participants...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "search-input" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "participants-container", children: filteredParticipants.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "no-participants", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-user-slash" }), (0, jsx_runtime_1.jsx)("p", { children: "No participants found" })] })) : (filteredParticipants.map((participant) => ((0, jsx_runtime_1.jsxs)("div", { className: `participant-item ${participant.id === currentUserId ? 'current-user' : ''}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "participant-avatar", children: [(0, jsx_runtime_1.jsx)("div", { className: "avatar-circle", children: participant.name.charAt(0).toUpperCase() }), (0, jsx_runtime_1.jsx)("div", { className: "status-indicator", style: { backgroundColor: getConnectionStatusColor(participant.connectionState) }, title: `Connection: ${participant.connectionState}` })] }), (0, jsx_runtime_1.jsxs)("div", { className: "participant-info", children: [(0, jsx_runtime_1.jsxs)("div", { className: "participant-name", children: [participant.name, participant.id === currentUserId && (0, jsx_runtime_1.jsx)("span", { className: "you-label", children: "(You)" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "participant-details", children: [(0, jsx_runtime_1.jsxs)("div", { className: "detail-row", children: [(0, jsx_runtime_1.jsx)("i", { className: getNetworkQualityIcon(participant.networkQuality) }), (0, jsx_runtime_1.jsx)("span", { className: "network-quality", style: { color: getConnectionStatusColor(participant.networkQuality) }, children: participant.networkQuality }), (0, jsx_runtime_1.jsx)("span", { className: "bandwidth", children: formatBandwidth(participant.bandwidthUsage) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-row", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-clock" }), (0, jsx_runtime_1.jsxs)("span", { className: "join-time", children: ["Joined ", formatJoinTime(participant.joinedAt)] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "participant-controls", children: [(0, jsx_runtime_1.jsxs)("div", { className: "media-status", children: [(0, jsx_runtime_1.jsx)("div", { className: `media-indicator ${participant.isAudioEnabled ? 'enabled' : 'disabled'}`, title: participant.isAudioEnabled ? 'Audio on' : 'Audio off', children: (0, jsx_runtime_1.jsx)("i", { className: `fas fa-${participant.isAudioEnabled ? 'microphone' : 'microphone-slash'}` }) }), (0, jsx_runtime_1.jsx)("div", { className: `media-indicator ${participant.isVideoEnabled ? 'enabled' : 'disabled'}`, title: participant.isVideoEnabled ? 'Video on' : 'Video off', children: (0, jsx_runtime_1.jsx)("i", { className: `fas fa-${participant.isVideoEnabled ? 'video' : 'video-slash'}` }) }), participant.isScreenSharing && ((0, jsx_runtime_1.jsx)("div", { className: "media-indicator sharing", title: "Screen sharing", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-desktop" }) }))] }), participant.id !== currentUserId && ((0, jsx_runtime_1.jsxs)("div", { className: "action-buttons", children: [(0, jsx_runtime_1.jsx)("button", { className: "action-button", title: "Mute participant", onClick: () => console.log('Mute participant:', participant.id), children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-volume-mute" }) }), (0, jsx_runtime_1.jsx)("button", { className: "action-button", title: "Remove participant", onClick: () => console.log('Remove participant:', participant.id), children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-user-times" }) })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "compression-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stats-header", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-chart-line" }), (0, jsx_runtime_1.jsx)("span", { children: "Quantum Compression" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stats-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Ratio" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [participant.compressionStats.averageCompressionRatio.toFixed(1), "x"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Sent" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [(participant.compressionStats.totalBytesTransmitted / 1024 / 1024).toFixed(1), "MB"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Received" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [(participant.compressionStats.totalBytesReceived / 1024 / 1024).toFixed(1), "MB"] })] })] })] })] }, participant.id)))) }), (0, jsx_runtime_1.jsx)("style", { children: `
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
      ` })] }));
};
exports.ParticipantList = ParticipantList;
//# sourceMappingURL=ParticipantList.js.map