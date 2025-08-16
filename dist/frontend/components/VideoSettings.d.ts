import React from 'react';
import { VideoCompressionConfig } from '../../video/models/VideoModels';
interface VideoSettingsProps {
    settings: VideoCompressionConfig;
    onSettingsChange: (settings: Partial<VideoCompressionConfig>) => void;
    onClose?: () => void;
}
export declare const VideoSettings: React.FC<VideoSettingsProps>;
export {};
//# sourceMappingURL=VideoSettings.d.ts.map