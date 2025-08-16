import React from 'react';
import { ProgressState } from '../types/FrontendTypes';
interface FileDecompressProps {
    onFilesSelected: (files: File[]) => Promise<void>;
    isProcessing: boolean;
    progressState?: ProgressState | null;
}
export declare const FileDecompressComponent: React.FC<FileDecompressProps>;
export {};
//# sourceMappingURL=FileDecompress.d.ts.map