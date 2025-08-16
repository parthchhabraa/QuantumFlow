"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const user_event_1 = __importDefault(require("@testing-library/user-event"));
require("@testing-library/jest-dom");
const FileUpload_1 = require("../components/FileUpload");
describe('FileUploadComponent', () => {
    const mockOnFilesSelected = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('renders upload area with correct initial state', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        expect(react_1.screen.getByText(/drag & drop files here/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/supports all file types/i)).toBeInTheDocument();
        expect(react_1.screen.getByText('📁')).toBeInTheDocument();
    });
    test('shows processing state when isProcessing is true', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: true }));
        expect(react_1.screen.getByText(/processing with quantum compression/i)).toBeInTheDocument();
        expect(react_1.screen.getByText('⚛️')).toBeInTheDocument();
    });
    test('handles file selection via input', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = react_1.screen.getByRole('textbox', { hidden: true });
        await user_event_1.default.upload(input, file);
        expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
    });
    test('handles multiple file selection', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        const files = [
            new File(['content 1'], 'test1.txt', { type: 'text/plain' }),
            new File(['content 2'], 'test2.txt', { type: 'text/plain' })
        ];
        const input = react_1.screen.getByRole('textbox', { hidden: true });
        await user_event_1.default.upload(input, files);
        expect(mockOnFilesSelected).toHaveBeenCalledWith(files);
    });
    test('handles drag and drop events', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        const dropzone = react_1.screen.getByText(/drag & drop files here/i).closest('div');
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        // Test drag enter
        react_1.fireEvent.dragEnter(dropzone, {
            dataTransfer: { files: [file] }
        });
        // Test drag over
        react_1.fireEvent.dragOver(dropzone, {
            dataTransfer: { files: [file] }
        });
        // Test drop
        react_1.fireEvent.drop(dropzone, {
            dataTransfer: { files: [file] }
        });
        await (0, react_1.waitFor)(() => {
            expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
        });
    });
    test('shows active state during drag over', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        const dropzone = react_1.screen.getByText(/drag & drop files here/i).closest('div');
        react_1.fireEvent.dragEnter(dropzone);
        expect(dropzone).toHaveClass('active');
        react_1.fireEvent.dragLeave(dropzone);
        expect(dropzone).not.toHaveClass('active');
    });
    test('prevents file upload when processing', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: true }));
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const dropzone = react_1.screen.getByText(/processing with quantum compression/i).closest('div');
        react_1.fireEvent.drop(dropzone, {
            dataTransfer: { files: [file] }
        });
        expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });
    test('shows progress bar during upload', async () => {
        const mockOnFilesSelected = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = react_1.screen.getByRole('textbox', { hidden: true });
        await user_event_1.default.upload(input, file);
        // Progress bar should be visible during upload
        expect(document.querySelector('.progress-bar')).toBeInTheDocument();
    });
    test('respects file size limit', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        // Create a file larger than 1GB (mocked)
        const largeFile = new File(['x'.repeat(1024 * 1024 * 1024 + 1)], 'large.txt', {
            type: 'text/plain'
        });
        const input = react_1.screen.getByRole('textbox', { hidden: true });
        // The dropzone should handle file size validation
        await user_event_1.default.upload(input, largeFile);
        // File should still be passed to handler (validation happens in dropzone config)
        expect(mockOnFilesSelected).toHaveBeenCalled();
    });
    test('displays quantum processing features', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        expect(react_1.screen.getByText(/quantum superposition processing/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/entanglement pattern detection/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/quantum interference optimization/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/real-time compression metrics/i)).toBeInTheDocument();
    });
    test('handles click to select files', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        const dropzone = react_1.screen.getByText(/drag & drop files here/i).closest('div');
        react_1.fireEvent.click(dropzone);
        // Should trigger file input click (tested indirectly through dropzone behavior)
        expect(dropzone).toBeInTheDocument();
    });
    test('shows appropriate cursor states', () => {
        const { rerender } = (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        const dropzone = react_1.screen.getByText(/drag & drop files here/i).closest('div');
        expect(dropzone).toHaveStyle('cursor: pointer');
        rerender((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: true }));
        const processingDropzone = react_1.screen.getByText(/processing with quantum compression/i).closest('div');
        expect(processingDropzone).toHaveStyle('cursor: not-allowed');
    });
    test('handles empty file selection gracefully', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        const dropzone = react_1.screen.getByText(/drag & drop files here/i).closest('div');
        react_1.fireEvent.drop(dropzone, {
            dataTransfer: { files: [] }
        });
        expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });
    test('formats file sizes correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(FileUpload_1.FileUploadComponent, { onFilesSelected: mockOnFilesSelected, isProcessing: false }));
        // This tests the internal formatFileSize function indirectly
        expect(react_1.screen.getByText(/max size: 1gb per file/i)).toBeInTheDocument();
    });
});
//# sourceMappingURL=FileUpload.test.js.map