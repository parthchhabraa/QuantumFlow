"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoCallInterface = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ParticipantList_1 = require("./ParticipantList");
const VideoSettings_1 = require("./VideoSettings");
const VideoCallInterface = ({ room, participants, localStream, remoteStreams, isAudioEnabled, isVideoEnabled, isScreenSharing, connectionQuality, onToggleAudio, onToggleVideo, onStartScreenShare, onStopScreenShare, onLeaveRoom, compressionSettings, onUpdateCompressionSettings }) => {
    const [showParticipants, setShowParticipants] = (0, react_1.useState)(false);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    const [callDuration, setCallDuration] = (0, react_1.useState)(0);
    const [showControls, setShowControls] = (0, react_1.useState)(true);
    const localVideoRef = (0, react_1.useRef)(null);
    const remoteVideoRefs = (0, react_1.useRef)(new Map());
    const controlsTimeoutRef = (0, react_1.useRef)(null);
    // Update call duration
    (0, react_1.useEffect)(() => {
        const interval = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    // Setup local video stream
    (0, react_1.useEffect)(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);
    // Setup remote video streams
    (0, react_1.useEffect)(() => {
        remoteStreams.forEach((stream, participantId) => {
            const videoElement = remoteVideoRefs.current.get(participantId);
            if (videoElement) {
                videoElement.srcObject = stream;
            }
        });
    }, [remoteStreams]);
    // Auto-hide controls
    (0, react_1.useEffect)(() => {
        const resetControlsTimeout = () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            setShowControls(true);
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        };
        const handleMouseMove = () => resetControlsTimeout();
        const handleMouseLeave = () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            setShowControls(false);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        resetControlsTimeout();
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);
    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };
    const getQualityColor = (quality) => {
        switch (quality) {
            case 'excellent': return '#10b981';
            case 'good': return '#3b82f6';
            case 'fair': return '#f59e0b';
            case 'poor': return '#ef4444';
            default: return '#6b7280';
        }
    };
    const participantArray = Array.from(participants.values());
    const remoteParticipants = participantArray.filter(p => p.id !== room.createdBy);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "video-call-interface", children: [(0, jsx_runtime_1.jsxs)("div", { className: `call-header ${showControls ? 'visible' : 'hidden'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "header-left", children: (0, jsx_runtime_1.jsxs)("div", { className: "room-info", children: [(0, jsx_runtime_1.jsxs)("h2", { children: ["Room: ", room.roomCode] }), (0, jsx_runtime_1.jsxs)("div", { className: "call-stats", children: [(0, jsx_runtime_1.jsx)("span", { className: "duration", children: formatDuration(callDuration) }), (0, jsx_runtime_1.jsxs)("div", { className: "quality-indicator", children: [(0, jsx_runtime_1.jsx)("div", { className: "quality-dot", style: { backgroundColor: getQualityColor(connectionQuality) } }), (0, jsx_runtime_1.jsx)("span", { children: connectionQuality })] }), (0, jsx_runtime_1.jsxs)("span", { className: "participant-count", children: [participants.size, " participant", participants.size !== 1 ? 's' : ''] })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "header-right", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setShowParticipants(!showParticipants), className: `header-button ${showParticipants ? 'active' : ''}`, title: "Participants", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-users" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowSettings(!showSettings), className: `header-button ${showSettings ? 'active' : ''}`, title: "Settings", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-cog" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "video-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "video-container local-video", children: [(0, jsx_runtime_1.jsx)("video", { ref: localVideoRef, autoPlay: true, muted: true, playsInline: true, className: "video-element" }), (0, jsx_runtime_1.jsxs)("div", { className: "video-overlay", children: [(0, jsx_runtime_1.jsxs)("div", { className: "participant-name", children: ["You ", isScreenSharing && '(Screen)'] }), !isVideoEnabled && ((0, jsx_runtime_1.jsx)("div", { className: "video-disabled", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-video-slash" }) }))] })] }), remoteParticipants.map((participant) => ((0, jsx_runtime_1.jsxs)("div", { className: "video-container remote-video", children: [(0, jsx_runtime_1.jsx)("video", { ref: (el) => {
                                    if (el) {
                                        remoteVideoRefs.current.set(participant.id, el);
                                    }
                                    else {
                                        remoteVideoRefs.current.delete(participant.id);
                                    }
                                }, autoPlay: true, playsInline: true, className: "video-element" }), (0, jsx_runtime_1.jsxs)("div", { className: "video-overlay", children: [(0, jsx_runtime_1.jsxs)("div", { className: "participant-name", children: [participant.name, participant.isScreenSharing && ' (Screen)'] }), (0, jsx_runtime_1.jsxs)("div", { className: "participant-status", children: [!participant.isAudioEnabled && ((0, jsx_runtime_1.jsx)("i", { className: "fas fa-microphone-slash", title: "Muted" })), !participant.isVideoEnabled && ((0, jsx_runtime_1.jsx)("i", { className: "fas fa-video-slash", title: "Camera off" })), (0, jsx_runtime_1.jsx)("div", { className: "connection-indicator", style: { backgroundColor: getQualityColor(participant.networkQuality) }, title: `Connection: ${participant.networkQuality}` })] }), !participant.isVideoEnabled && ((0, jsx_runtime_1.jsx)("div", { className: "video-disabled", children: (0, jsx_runtime_1.jsx)("div", { className: "avatar", children: participant.name.charAt(0).toUpperCase() }) }))] })] }, participant.id)))] }), (0, jsx_runtime_1.jsxs)("div", { className: `call-controls ${showControls ? 'visible' : 'hidden'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "controls-group", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onToggleAudio, className: `control-button ${isAudioEnabled ? 'enabled' : 'disabled'}`, title: isAudioEnabled ? 'Mute' : 'Unmute', children: (0, jsx_runtime_1.jsx)("i", { className: `fas fa-${isAudioEnabled ? 'microphone' : 'microphone-slash'}` }) }), (0, jsx_runtime_1.jsx)("button", { onClick: onToggleVideo, className: `control-button ${isVideoEnabled ? 'enabled' : 'disabled'}`, title: isVideoEnabled ? 'Turn off camera' : 'Turn on camera', children: (0, jsx_runtime_1.jsx)("i", { className: `fas fa-${isVideoEnabled ? 'video' : 'video-slash'}` }) }), (0, jsx_runtime_1.jsx)("button", { onClick: isScreenSharing ? onStopScreenShare : onStartScreenShare, className: `control-button ${isScreenSharing ? 'active' : ''}`, title: isScreenSharing ? 'Stop sharing' : 'Share screen', children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-desktop" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setIsRecording(!isRecording), className: `control-button ${isRecording ? 'recording' : ''}`, title: isRecording ? 'Stop recording' : 'Start recording', children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-record-vinyl" }) })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: onLeaveRoom, className: "leave-button", title: "Leave call", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-phone-slash" }), "Leave"] })] }), showParticipants && ((0, jsx_runtime_1.jsx)("div", { className: "side-panel participants-panel", children: (0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: participants, currentUserId: room.createdBy, onClose: () => setShowParticipants(false) }) })), showSettings && ((0, jsx_runtime_1.jsx)("div", { className: "side-panel settings-panel", children: (0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: compressionSettings, onSettingsChange: onUpdateCompressionSettings, onClose: () => setShowSettings(false) }) })), (0, jsx_runtime_1.jsx)("style", { children: `
        .video-call-interface {
          width: 100%;
          height: 100vh;
          background: #1a1a1a;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .call-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .call-header.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .call-header.hidden {
          opacity: 0;
          transform: translateY(-100%);
        }

        .room-info h2 {
          color: white;
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .call-stats {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .duration {
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }

        .quality-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quality-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .header-right {
          display: flex;
          gap: 0.5rem;
        }

        .header-button {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .header-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .header-button.active {
          background: rgba(79, 172, 254, 0.3);
          color: #4facfe;
        }

        .video-grid {
          flex: 1;
          display: grid;
          gap: 0.5rem;
          padding: 0.5rem;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          grid-auto-rows: minmax(200px, 1fr);
        }

        .video-container {
          position: relative;
          background: #2a2a2a;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .local-video {
          border: 2px solid #4facfe;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .participant-name {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .participant-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .connection-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .video-disabled {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          font-size: 2rem;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 600;
          color: white;
        }

        .call-controls {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 20px 20px 0 0;
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
          z-index: 10;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .call-controls.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .call-controls.hidden {
          opacity: 0;
          transform: translateX(-50%) translateY(100%);
        }

        .controls-group {
          display: flex;
          gap: 1rem;
        }

        .control-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .control-button.enabled {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .control-button.disabled {
          background: rgba(239, 68, 68, 0.8);
          color: white;
        }

        .control-button.active {
          background: rgba(79, 172, 254, 0.8);
          color: white;
        }

        .control-button.recording {
          background: rgba(239, 68, 68, 0.8);
          color: white;
          animation: pulse 2s infinite;
        }

        .control-button:hover {
          transform: scale(1.1);
        }

        .leave-button {
          background: rgba(239, 68, 68, 0.8);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .leave-button:hover {
          background: rgba(239, 68, 68, 1);
          transform: scale(1.05);
        }

        .side-panel {
          position: absolute;
          top: 0;
          right: 0;
          width: 350px;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 20;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @media (max-width: 768px) {
          .call-header {
            padding: 1rem;
          }

          .call-stats {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .video-grid {
            grid-template-columns: 1fr;
            padding: 0.25rem;
          }

          .call-controls {
            padding: 1rem;
            gap: 1rem;
          }

          .controls-group {
            gap: 0.5rem;
          }

          .control-button {
            width: 45px;
            height: 45px;
            font-size: 1rem;
          }

          .side-panel {
            width: 100%;
          }
        }
      ` })] }));
};
exports.VideoCallInterface = VideoCallInterface;
//# sourceMappingURL=VideoCallInterface.js.map