import React from 'react';
import { FrontendQuantumConfig } from '../types/FrontendTypes';
interface CompressionSettingsProps {
    config: FrontendQuantumConfig;
    onChange: (config: Partial<FrontendQuantumConfig>) => void;
    disabled: boolean;
}
export declare const CompressionSettings: React.FC<CompressionSettingsProps>;
export {};
//# sourceMappingURL=CompressionSettings.d.ts.map