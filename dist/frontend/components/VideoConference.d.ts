import React from 'react';
export type VideoConferenceState = 'idle' | 'creating-room' | 'joining-room' | 'in-call' | 'error';
interface VideoConferenceProps {
    userId: string;
    userName: string;
    onError?: (error: Error) => void;
}
export declare const VideoConference: React.FC<VideoConferenceProps>;
export {};
//# sourceMappingURL=VideoConference.d.ts.map