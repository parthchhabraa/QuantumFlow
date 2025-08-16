import React from 'react';
import { ProgressState } from '../types/FrontendTypes';
interface FileUploadProps {
    onFilesSelected: (files: File[]) => Promise<void>;
    isProcessing: boolean;
    progressState?: ProgressState | null;
}
export declare const FileUploadComponent: React.FC<FileUploadProps>;
export {};
//# sourceMappingURL=FileUpload.d.ts.map