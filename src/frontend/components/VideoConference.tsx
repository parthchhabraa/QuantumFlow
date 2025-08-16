import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoConferenceRoom, Participant, CreateRoomRequest, JoinRoomRequest } from '../../video/models/WebRTCModels';
import { VideoCompressionConfig } from '../../video/models/VideoModels';
import { WebRTCSignalingServer } from '../../video/WebRTCSignalingServer';
import { MultiParticipantManager } from '../../video/MultiParticipantManager';
import { PeerConnectionManager } from '../../video/PeerConnectionManager';
import { VideoCompressionEngine } from '../../video/VideoCompressionEngine';
import { MeetingRecorder } from '../../video/MeetingRecorder';
import { ChatManager } from '../../video/ChatManager';
import { VirtualBackgroundProcessor } from '../../video/VirtualBackgroundProcessor';
import { MeetingAnalyticsEngine } from '../../video/MeetingAnalytics';
import { QuantumCompressionEngine } from '../../core/QuantumCompressionEngine';
import { VideoCallInterface } from './VideoCallInterface';
import { RoomCreation } from './RoomCreation';
import { RoomJoin } from './RoomJoin';
import { ParticipantList } from './ParticipantList';
import { ScreenShare } from './ScreenShare';
import { VideoSettings } from './VideoSettings';
import { MeetingRecording } from './MeetingRecording';
import { ChatInterface } from './ChatInterface';
import { VirtualBackgroundControls } from './VirtualBackgroundControls';
import { AnalyticsDashboard } from './AnalyticsDashboard';

export type VideoConferenceState = 'idle' | 'creating-room' | 'joining-room' | 'in-call' | 'error';

interface VideoConferenceProps {
  userId: string;
  userName: string;
  onError?: (error: Error) => void;
}

export const VideoConference: React.FC<VideoConferenceProps> = ({
  userId,
  userName,
  onError
}) => {
  const [state, setState] = useState<VideoConferenceState>('idle');
  const [currentRoom, setCurrentRoom] = useState<VideoConferenceRoom | null>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [compressionSettings, setCompressionSettings] = useState<VideoCompressionConfig>(
    VideoCompressionConfig.createDefault()
  );
  const [error, setError] = useState<string | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  // New feature states
  const [showRecording, setShowRecording] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showBackgroundControls, setShowBackgroundControls] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Refs for WebRTC components
  const signalingServerRef = useRef<WebRTCSignalingServer | null>(null);
  const participantManagerRef = useRef<MultiParticipantManager | null>(null);
  const peerConnectionManagerRef = useRef<PeerConnectionManager | null>(null);

  // Refs for new features
  const quantumEngineRef = useRef<QuantumCompressionEngine | null>(null);
  const videoCompressionEngineRef = useRef<VideoCompressionEngine | null>(null);
  const meetingRecorderRef = useRef<MeetingRecorder | null>(null);
  const chatManagerRef = useRef<ChatManager | null>(null);
  const backgroundProcessorRef = useRef<VirtualBackgroundProcessor | null>(null);
  const analyticsEngineRef = useRef<MeetingAnalyticsEngine | null>(null);

  // Initialize WebRTC components and new features
  useEffect(() => {
    // Initialize core components
    signalingServerRef.current = new WebRTCSignalingServer();
    peerConnectionManagerRef.current = new PeerConnectionManager();

    // Initialize new feature components
    quantumEngineRef.current = new QuantumCompressionEngine();
    videoCompressionEngineRef.current = new VideoCompressionEngine();
    meetingRecorderRef.current = new MeetingRecorder(videoCompressionEngineRef.current);
    chatManagerRef.current = new ChatManager(quantumEngineRef.current);
    backgroundProcessorRef.current = new VirtualBackgroundProcessor();
    analyticsEngineRef.current = new MeetingAnalyticsEngine();

    return () => {
      cleanup();
    };
  }, []);

  // Setup event handlers when room is created/joined
  useEffect(() => {
    if (currentRoom && signalingServerRef.current && peerConnectionManagerRef.current) {
      participantManagerRef.current = new MultiParticipantManager(
        currentRoom,
        peerConnectionManagerRef.current,
        signalingServerRef.current,
        {
          maxParticipants: currentRoom.maxParticipants,
          totalBandwidthLimit: 50, // 50 Mbps default
          bandwidthStrategy: 'adaptive-quality',
          enableAdaptiveQuality: true,
          enableSpeakerDetection: true
        }
      );

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

  const setupEventHandlers = useCallback(() => {
    if (!participantManagerRef.current || !signalingServerRef.current) return;

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
        chatManagerRef.current.addParticipant(currentRoom!.roomId, participant.id, participant.name);
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
        chatManagerRef.current.removeParticipant(currentRoom!.roomId, participantId, participant.name);
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

  const createRoom = useCallback(async (roomConfig: Partial<CreateRoomRequest>) => {
    if (!signalingServerRef.current) return;

    setState('creating-room');
    setError(null);

    try {
      const request: CreateRoomRequest = {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      setError(errorMessage);
      setState('error');
      onError?.(new Error(errorMessage));
    }
  }, [userId, compressionSettings, onError]);

  const joinRoom = useCallback(async (roomId: string, roomCode?: string) => {
    if (!signalingServerRef.current) return;

    setState('joining-room');
    setError(null);

    try {
      // Get user media first
      const stream = await getUserMedia();
      setLocalStream(stream);

      const joinRequest: JoinRoomRequest = {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join room';
      setError(errorMessage);
      setState('error');
      onError?.(new Error(errorMessage));
    }
  }, [userId, userName, onError]);

  const leaveRoom = useCallback(async () => {
    if (!signalingServerRef.current || !currentRoom) return;

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
    } catch (err) {
      console.error('Error leaving room:', err);
    }
  }, [userId, currentRoom, localStream]);

  const getUserMedia = useCallback(async (): Promise<MediaStream> => {
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
    } catch (err) {
      throw new Error('Failed to access camera and microphone');
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  const startScreenShare = useCallback(async () => {
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
    } catch (err) {
      console.error('Failed to start screen sharing:', err);
      setError('Failed to start screen sharing');
    }
  }, [localStream, userId]);

  const stopScreenShare = useCallback(async () => {
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
    } catch (err) {
      console.error('Failed to stop screen sharing:', err);
      setError('Failed to stop screen sharing');
    }
  }, [userId]);

  const updateCompressionSettings = useCallback((newSettings: Partial<VideoCompressionConfig>) => {
    const updatedSettings = new VideoCompressionConfig();
    updatedSettings.updateConfig(newSettings);
    setCompressionSettings(updatedSettings);

    // Update room compression settings if in a call
    if (currentRoom && participantManagerRef.current) {
      currentRoom.compressionSettings = updatedSettings;
    }
  }, [currentRoom]);

  const cleanup = useCallback(() => {
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
        return (
          <div className="video-conference-home">
            <div className="conference-header">
              <h1>QuantumFlow Video Conference</h1>
              <p>High-quality video calls with quantum compression</p>
            </div>
            
            <div className="conference-actions">
              <RoomCreation onCreateRoom={createRoom} />
              <RoomJoin onJoinRoom={joinRoom} />
            </div>

            <VideoSettings
              settings={compressionSettings}
              onSettingsChange={updateCompressionSettings}
            />
          </div>
        );

      case 'creating-room':
        return (
          <div className="conference-loading">
            <div className="loading-spinner"></div>
            <p>Creating room...</p>
          </div>
        );

      case 'joining-room':
        return (
          <div className="conference-loading">
            <div className="loading-spinner"></div>
            <p>Joining room...</p>
          </div>
        );

      case 'in-call':
        return currentRoom ? (
          <>
            <VideoCallInterface
              room={currentRoom}
              participants={participants}
              localStream={localStream}
              remoteStreams={remoteStreams}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              isScreenSharing={isScreenSharing}
              connectionQuality={connectionQuality}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onStartScreenShare={startScreenShare}
              onStopScreenShare={stopScreenShare}
              onLeaveRoom={leaveRoom}
              compressionSettings={compressionSettings}
              onUpdateCompressionSettings={updateCompressionSettings}
            />

            {/* New Feature Components */}
            {showRecording && meetingRecorderRef.current && (
              <MeetingRecording
                recorder={meetingRecorderRef.current}
                room={currentRoom}
                participants={participants}
                streams={remoteStreams}
                onRecordingStateChange={(isRecording) => {
                  // Handle recording state change if needed
                }}
              />
            )}

            {chatManagerRef.current && (
              <ChatInterface
                chatManager={chatManagerRef.current}
                roomId={currentRoom.roomId}
                participantId={userId}
                participantName={userName}
                isVisible={showChat}
                onToggleVisibility={() => setShowChat(!showChat)}
              />
            )}

            {backgroundProcessorRef.current && (
              <VirtualBackgroundControls
                processor={backgroundProcessorRef.current}
                onConfigChange={(config) => {
                  // Handle background config changes
                }}
                isVisible={showBackgroundControls}
                onToggleVisibility={() => setShowBackgroundControls(!showBackgroundControls)}
              />
            )}

            {analyticsEngineRef.current && (
              <AnalyticsDashboard
                analyticsEngine={analyticsEngineRef.current}
                isVisible={showAnalytics}
                onToggleVisibility={() => setShowAnalytics(!showAnalytics)}
              />
            )}

            {/* Feature Toggle Buttons */}
            <div className="feature-controls">
              <button
                className="feature-btn recording-btn"
                onClick={() => setShowRecording(!showRecording)}
                title="Recording"
              >
                📹
              </button>
            </div>
          </>
        ) : null;

      case 'error':
        return (
          <div className="conference-error">
            <div className="error-icon">⚠️</div>
            <h2>Connection Error</h2>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => {
                setError(null);
                setState('idle');
              }}
            >
              Try Again
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="video-conference">
      {renderContent()}
      
      <style>{`
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
      `}</style>
    </div>
  );
};