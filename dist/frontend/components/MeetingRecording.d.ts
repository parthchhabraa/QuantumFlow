import React from 'react';
import { MeetingRecorder } from '../../video/MeetingRecorder';
import { VideoConferenceRoom, Participant } from '../../video/models/WebRTCModels';
interface MeetingRecordingProps {
    recorder: MeetingRecorder;
    room: VideoConferenceRoom;
    participants: Map<string, Participant>;
    streams: Map<string, MediaStream>;
    onRecordingStateChange?: (isRecording: boolean) => void;
}
export declare const MeetingRecording: React.FC<MeetingRecordingProps>;
export {};
//# sourceMappingURL=MeetingRecording.d.ts.map