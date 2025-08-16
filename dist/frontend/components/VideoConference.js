"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoConference = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const VideoModels_1 = require("../../video/models/VideoModels");
const WebRTCSignalingServer_1 = require("../../video/WebRTCSignalingServer");
const MultiParticipantManager_1 = require("../../video/MultiParticipantManager");
const PeerConnectionManager_1 = require("../../video/PeerConnectionManager");
const VideoCompressionEngine_1 = require("../../video/VideoCompressionEngine");
const MeetingRecorder_1 = require("../../video/MeetingRecorder");
const ChatManager_1 = require("../../video/ChatManager");
const VirtualBackgroundProcessor_1 = require("../../video/VirtualBackgroundProcessor");
const MeetingAnalytics_1 = require("../../video/MeetingAnalytics");
const QuantumCompressionEngine_1 = require("../../core/QuantumCompressionEngine");
const VideoCallInterface_1 = require("./VideoCallInterface");
const RoomCreation_1 = require("./RoomCreation");
const RoomJoin_1 = require("./RoomJoin");
const VideoSettings_1 = require("./VideoSettings");
const MeetingRecording_1 = require("./MeetingRecording");
const ChatInterface_1 = require("./ChatInterface");
const VirtualBackgroundControls_1 = require("./VirtualBackgroundControls");
const AnalyticsDashboard_1 = require("./AnalyticsDashboard");
const VideoConference = ({ userId, userName, onError }) => {
    const [state, setState] = (0, react_1.useState)('idle');
    const [currentRoom, setCurrentRoom] = (0, react_1.useState)(null);
    const [participants, setParticipants] = (0, react_1.useState)(new Map());
    const [localStream, setLocalStream] = (0, react_1.useState)(null);
    const [remoteStreams, setRemoteStreams] = (0, react_1.useState)(new Map());
    const [isAudioEnabled, setIsAudioEnabled] = (0, react_1.useState)(true);
    const [isVideoEnabled, setIsVideoEnabled] = (0, react_1.useState)(true);
    const [isScreenSharing, setIsScreenSharing] = (0, react_1.useState)(false);
    const [compressionSettings, setCompressionSettings] = (0, react_1.useState)(VideoModels_1.VideoCompressionConfig.createDefault());
    const [error, setError] = (0, react_1.useState)(null);
    const [connectionQuality, setConnectionQuality] = (0, react_1.useState)('good');
    // New feature states
    const [showRecording, setShowRecording] = (0, react_1.useState)(false);
    const [showChat, setShowChat] = (0, react_1.useState)(false);
    const [showBackgroundControls, setShowBackgroundControls] = (0, react_1.useState)(false);
    const [showAnalytics, setShowAnalytics] = (0, react_1.useState)(false);
    // Refs for WebRTC components
    const signalingServerRef = (0, react_1.useRef)(null);
    const participantManagerRef = (0, react_1.useRef)(null);
    const peerConnectionManagerRef = (0, react_1.useRef)(null);
    // Refs for new features
    const quantumEngineRef = (0, react_1.useRef)(null);
    const videoCompressionEngineRef = (0, react_1.useRef)(null);
    const meetingRecorderRef = (0, react_1.useRef)(null);
    const chatManagerRef = (0, react_1.useRef)(null);
    const backgroundProcessorRef = (0, react_1.useRef)(null);
    const analyticsEngineRef = (0, react_1.useRef)(null);
    // Initialize WebRTC components and new features
    (0, react_1.useEffect)(() => {
        // Initialize core components
        signalingServerRef.current = new WebRTCSignalingServer_1.WebRTCSignalingServer();
        peerConnectionManagerRef.current = new PeerConnectionManager_1.PeerConnectionManager();
        // Initialize new feature components
        quantumEngineRef.current = new QuantumCompressionEngine_1.QuantumCompressionEngine();
        videoCompressionEngineRef.current = new VideoCompressionEngine_1.VideoCompressionEngine();
        meetingRecorderRef.current = new MeetingRecorder_1.MeetingRecorder(videoCompressionEngineRef.current);
        chatManagerRef.current = new ChatManager_1.ChatManager(quantumEngineRef.current);
        backgroundProcessorRef.current = new VirtualBackgroundProcessor_1.VirtualBackgroundProcessor();
        analyticsEngineRef.current = new MeetingAnalytics_1.MeetingAnalyticsEngine();
        return () => {
            cleanup();
        };
    }, []);
    // Setup event handlers when room is created/joined
    (0, react_1.useEffect)(() => {
        if (currentRoom && signalingServerRef.current && peerConnectionManagerRef.current) {
            participantManagerRef.current = new MultiParticipantManager_1.MultiParticipantManager(currentRoom, peerConnectionManagerRef.current, signalingServerRef.current, {
                maxParticipants: currentRoom.maxParticipants,
                totalBandwidthLimit: 50, // 50 Mbps default
                bandwidthStrategy: 'adaptive-quality',
                enableAdaptiveQuality: true,
                enableSpeakerDetection: true
            });
            setupEventHandlers();
            // Initialize analytics for the room
            if (analyticsEngineRef.current) {
                analyticsEngineRef.current.startMeetingAnalytics(currentRoom);
            }
            // Set up chat room
            if (chatManagerRef.current) {
                chatManagerRef.current.getOrCreateRoom(currentRoom.roomId);
            }
        }
        return () => {
            if (participantManagerRef.current) {
                participantManagerRef.current.destroy();
                participantManagerRef.current = null;
            }
            // End analytics
            if (analyticsEngineRef.current) {
                analyticsEngineRef.current.endMeetingAnalytics();
            }
        };
    }, [currentRoom]);
    const setupEventHandlers = (0, react_1.useCallback)(() => {
        if (!participantManagerRef.current || !signalingServerRef.current)
            return;
        // Participant events
        participantManagerRef.current.on('participant-added', ({ session }) => {
            const participant = session.participant;
            setParticipants(prev => new Map(prev.set(participant.id, participant)));
            // Add to analytics
            if (analyticsEngineRef.current) {
                analyticsEngineRef.current.addParticipant(participant);
            }
            // Add to chat
            if (chatManagerRef.current) {
                chatManagerRef.current.addParticipant(currentRoom.roomId, participant.id, participant.name);
            }
        });
        participantManagerRef.current.on('participant-removed', ({ participantId }) => {
            const participant = participants.get(participantId);
            setParticipants(prev => {
                const newMap = new Map(prev);
                newMap.delete(participantId);
                return newMap;
            });
            setRemoteStreams(prev => {
                const newMap = new Map(prev);
                newMap.delete(participantId);
                return newMap;
            });
            // Remove from analytics
            if (analyticsEngineRef.current) {
                analyticsEngineRef.current.removeParticipant(participantId);
            }
            // Remove from chat
            if (chatManagerRef.current && participant) {
                chatManagerRef.current.removeParticipant(currentRoom.roomId, participantId, participant.name);
            }
        });
        participantManagerRef.current.on('speaker-changed', ({ currentSpeaker }) => {
            // Update UI to highlight current speaker
            console.log('Current speaker:', currentSpeaker);
        });
        // Signaling events
        signalingServerRef.current.on('participant-joined', ({ participant }) => {
            setParticipants(prev => new Map(prev.set(participant.id, participant)));
        });
        signalingServerRef.current.on('participant-left', ({ participantId }) => {
            setParticipants(prev => {
                const newMap = new Map(prev);
                newMap.delete(participantId);
                return newMap;
            });
        });
        // Peer connection events
        if (peerConnectionManagerRef.current) {
            peerConnectionManagerRef.current.on('remote-stream', ({ participantId, stream }) => {
                setRemoteStreams(prev => new Map(prev.set(participantId, stream)));
            });
            peerConnectionManagerRef.current.on('connection-quality-changed', ({ participantId, quality }) => {
                if (participantId === userId) {
                    setConnectionQuality(quality);
                }
            });
        }
    }, [userId]);
    const createRoom = (0, react_1.useCallback)(async (roomConfig) => {
        if (!signalingServerRef.current)
            return;
        setState('creating-room');
        setError(null);
        try {
            const request = {
                createdBy: userId,
                maxParticipants: roomConfig.maxParticipants || 10,
                compressionSettings: compressionSettings.toObject(),
                roomSettings: {
                    allowScreenSharing: true,
                    allowRecording: true,
                    requireAuth: false,
                    autoAdaptQuality: true,
                    ...roomConfig.roomSettings
                },
                ...roomConfig
            };
            const room = await signalingServerRef.current.createRoom(request);
            setCurrentRoom(room);
            // Join the room as the creator
            await joinRoom(room.roomId, room.roomCode);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
            setError(errorMessage);
            setState('error');
            onError?.(new Error(errorMessage));
        }
    }, [userId, compressionSettings, onError]);
    const joinRoom = (0, react_1.useCallback)(async (roomId, roomCode) => {
        if (!signalingServerRef.current)
            return;
        setState('joining-room');
        setError(null);
        try {
            // Get user media first
            const stream = await getUserMedia();
            setLocalStream(stream);
            const joinRequest = {
                roomId,
                participantName: userName,
                participantId: userId,
                capabilities: {
                    supportsVideo: true,
                    supportsAudio: true,
                    supportsScreenSharing: true,
                    maxBandwidth: 10 // 10 Mbps
                }
            };
            const { room, participant } = await signalingServerRef.current.joinRoom(joinRequest);
            setCurrentRoom(room);
            setParticipants(new Map(room.participants));
            setState('in-call');
            // Add local participant to manager
            if (participantManagerRef.current) {
                await participantManagerRef.current.addParticipant(participant, 'normal');
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to join room';
            setError(errorMessage);
            setState('error');
            onError?.(new Error(errorMessage));
        }
    }, [userId, userName, onError]);
    const leaveRoom = (0, react_1.useCallback)(async () => {
        if (!signalingServerRef.current || !currentRoom)
            return;
        try {
            await signalingServerRef.current.leaveRoom(userId);
            // Stop local stream
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                setLocalStream(null);
            }
            // Clear state
            setCurrentRoom(null);
            setParticipants(new Map());
            setRemoteStreams(new Map());
            setIsScreenSharing(false);
            setState('idle');
        }
        catch (err) {
            console.error('Error leaving room:', err);
        }
    }, [userId, currentRoom, localStream]);
    const getUserMedia = (0, react_1.useCallback)(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            return stream;
        }
        catch (err) {
            throw new Error('Failed to access camera and microphone');
        }
    }, []);
    const toggleAudio = (0, react_1.useCallback)(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    }, [localStream]);
    const toggleVideo = (0, react_1.useCallback)(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    }, [localStream]);
    const startScreenShare = (0, react_1.useCallback)(async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always'
                },
                audio: true
            });
            // Replace video track with screen share
            if (localStream && peerConnectionManagerRef.current) {
                const videoTrack = screenStream.getVideoTracks()[0];
                await peerConnectionManagerRef.current.replaceVideoTrack(userId, videoTrack);
                // Update local stream
                const newStream = new MediaStream([
                    videoTrack,
                    ...localStream.getAudioTracks()
                ]);
                setLocalStream(newStream);
                setIsScreenSharing(true);
                // Handle screen share end
                videoTrack.onended = () => {
                    stopScreenShare();
                };
            }
        }
        catch (err) {
            console.error('Failed to start screen sharing:', err);
            setError('Failed to start screen sharing');
        }
    }, [localStream, userId]);
    const stopScreenShare = (0, react_1.useCallback)(async () => {
        try {
            // Get camera stream again
            const cameraStream = await getUserMedia();
            if (peerConnectionManagerRef.current) {
                const videoTrack = cameraStream.getVideoTracks()[0];
                await peerConnectionManagerRef.current.replaceVideoTrack(userId, videoTrack);
                // Update local stream
                setLocalStream(cameraStream);
                setIsScreenSharing(false);
            }
        }
        catch (err) {
            console.error('Failed to stop screen sharing:', err);
            setError('Failed to stop screen sharing');
        }
    }, [userId]);
    const updateCompressionSettings = (0, react_1.useCallback)((newSettings) => {
        const updatedSettings = new VideoModels_1.VideoCompressionConfig();
        updatedSettings.updateConfig(newSettings);
        setCompressionSettings(updatedSettings);
        // Update room compression settings if in a call
        if (currentRoom && participantManagerRef.current) {
            currentRoom.compressionSettings = updatedSettings;
        }
    }, [currentRoom]);
    const cleanup = (0, react_1.useCallback)(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (participantManagerRef.current) {
            participantManagerRef.current.destroy();
        }
        if (peerConnectionManagerRef.current) {
            peerConnectionManagerRef.current.destroy();
        }
        // Cleanup new features
        if (meetingRecorderRef.current) {
            meetingRecorderRef.current.destroy();
        }
        if (chatManagerRef.current) {
            chatManagerRef.current.destroy();
        }
        if (backgroundProcessorRef.current) {
            backgroundProcessorRef.current.destroy();
        }
        if (analyticsEngineRef.current) {
            analyticsEngineRef.current.destroy();
        }
    }, [localStream]);
    // Render different states
    const renderContent = () => {
        switch (state) {
            case 'idle':
                return ((0, jsx_runtime_1.jsxs)("div", { className: "video-conference-home", children: [(0, jsx_runtime_1.jsxs)("div", { className: "conference-header", children: [(0, jsx_runtime_1.jsx)("h1", { children: "QuantumFlow Video Conference" }), (0, jsx_runtime_1.jsx)("p", { children: "High-quality video calls with quantum compression" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "conference-actions", children: [(0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: createRoom }), (0, jsx_runtime_1.jsx)(RoomJoin_1.RoomJoin, { onJoinRoom: joinRoom })] }), (0, jsx_runtime_1.jsx)(VideoSettings_1.VideoSettings, { settings: compressionSettings, onSettingsChange: updateCompressionSettings })] }));
            case 'creating-room':
                return ((0, jsx_runtime_1.jsxs)("div", { className: "conference-loading", children: [(0, jsx_runtime_1.jsx)("div", { className: "loading-spinner" }), (0, jsx_runtime_1.jsx)("p", { children: "Creating room..." })] }));
            case 'joining-room':
                return ((0, jsx_runtime_1.jsxs)("div", { className: "conference-loading", children: [(0, jsx_runtime_1.jsx)("div", { className: "loading-spinner" }), (0, jsx_runtime_1.jsx)("p", { children: "Joining room..." })] }));
            case 'in-call':
                return currentRoom ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(VideoCallInterface_1.VideoCallInterface, { room: currentRoom, participants: participants, localStream: localStream, remoteStreams: remoteStreams, isAudioEnabled: isAudioEnabled, isVideoEnabled: isVideoEnabled, isScreenSharing: isScreenSharing, connectionQuality: connectionQuality, onToggleAudio: toggleAudio, onToggleVideo: toggleVideo, onStartScreenShare: startScreenShare, onStopScreenShare: stopScreenShare, onLeaveRoom: leaveRoom, compressionSettings: compressionSettings, onUpdateCompressionSettings: updateCompressionSettings }), showRecording && meetingRecorderRef.current && ((0, jsx_runtime_1.jsx)(MeetingRecording_1.MeetingRecording, { recorder: meetingRecorderRef.current, room: currentRoom, participants: participants, streams: remoteStreams, onRecordingStateChange: (isRecording) => {
                                // Handle recording state change if needed
                            } })), chatManagerRef.current && ((0, jsx_runtime_1.jsx)(ChatInterface_1.ChatInterface, { chatManager: chatManagerRef.current, roomId: currentRoom.roomId, participantId: userId, participantName: userName, isVisible: showChat, onToggleVisibility: () => setShowChat(!showChat) })), backgroundProcessorRef.current && ((0, jsx_runtime_1.jsx)(VirtualBackgroundControls_1.VirtualBackgroundControls, { processor: backgroundProcessorRef.current, onConfigChange: (config) => {
                                // Handle background config changes
                            }, isVisible: showBackgroundControls, onToggleVisibility: () => setShowBackgroundControls(!showBackgroundControls) })), analyticsEngineRef.current && ((0, jsx_runtime_1.jsx)(AnalyticsDashboard_1.AnalyticsDashboard, { analyticsEngine: analyticsEngineRef.current, isVisible: showAnalytics, onToggleVisibility: () => setShowAnalytics(!showAnalytics) })), (0, jsx_runtime_1.jsx)("div", { className: "feature-controls", children: (0, jsx_runtime_1.jsx)("button", { className: "feature-btn recording-btn", onClick: () => setShowRecording(!showRecording), title: "Recording", children: "\uD83D\uDCF9" }) })] })) : null;
            case 'error':
                return ((0, jsx_runtime_1.jsxs)("div", { className: "conference-error", children: [(0, jsx_runtime_1.jsx)("div", { className: "error-icon", children: "\u26A0\uFE0F" }), (0, jsx_runtime_1.jsx)("h2", { children: "Connection Error" }), (0, jsx_runtime_1.jsx)("p", { children: error }), (0, jsx_runtime_1.jsx)("button", { className: "retry-button", onClick: () => {
                                setError(null);
                                setState('idle');
                            }, children: "Try Again" })] }));
            default:
                return null;
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "video-conference", children: [renderContent(), (0, jsx_runtime_1.jsx)("style", { children: `
        .video-conference {
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .video-conference-home {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
          text-align: center;
        }

        .conference-header h1 {
          font-size: 3rem;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .conference-header p {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 3rem;
        }

        .conference-actions {
          display: flex;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .conference-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: white;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .conference-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: white;
          text-align: center;
          padding: 2rem;
        }

        .error-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .conference-error h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .conference-error p {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .retry-button {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
        }

        .feature-controls {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
          z-index: 999;
        }

        .feature-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }

        .feature-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
        }

        .recording-btn {
          background: linear-gradient(135deg, #ff4757, #ff3742);
        }

        @media (max-width: 768px) {
          .conference-header h1 {
            font-size: 2rem;
          }
          
          .conference-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .feature-controls {
            bottom: 1rem;
            gap: 0.5rem;
          }

          .feature-btn {
            width: 45px;
            height: 45px;
            font-size: 1rem;
          }
        }
      ` })] }));
};
exports.VideoConference = VideoConference;
//# sourceMappingURL=VideoConference.js.map