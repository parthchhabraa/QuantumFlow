import React from 'react';
interface ScreenShareProps {
    isSharing: boolean;
    onStartShare: () => Promise<void>;
    onStopShare: () => Promise<void>;
    stream?: MediaStream;
}
export declare const ScreenShare: React.FC<ScreenShareProps>;
export {};
//# sourceMappingURL=ScreenShare.d.ts.map