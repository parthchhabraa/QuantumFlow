import React from 'react';
import { VideoConferenceRoom, Participant } from '../../video/models/WebRTCModels';
import { VideoCompressionConfig } from '../../video/models/VideoModels';
interface VideoCallInterfaceProps {
    room: VideoConferenceRoom;
    participants: Map<string, Participant>;
    localStream: MediaStream | null;
    remoteStreams: Map<string, MediaStream>;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onStartScreenShare: () => void;
    onStopScreenShare: () => void;
    onLeaveRoom: () => void;
    compressionSettings: VideoCompressionConfig;
    onUpdateCompressionSettings: (settings: Partial<VideoCompressionConfig>) => void;
}
export declare const VideoCallInterface: React.FC<VideoCallInterfaceProps>;
export {};
//# sourceMappingURL=VideoCallInterface.d.ts.map