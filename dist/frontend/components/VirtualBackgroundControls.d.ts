import React from 'react';
import { VirtualBackgroundProcessor, ProcessingConfig } from '../../video/VirtualBackgroundProcessor';
interface VirtualBackgroundControlsProps {
    processor: VirtualBackgroundProcessor;
    onConfigChange: (config: ProcessingConfig) => void;
    isVisible: boolean;
    onToggleVisibility: () => void;
}
export declare const VirtualBackgroundControls: React.FC<VirtualBackgroundControlsProps>;
export {};
//# sourceMappingURL=VirtualBackgroundControls.d.ts.map