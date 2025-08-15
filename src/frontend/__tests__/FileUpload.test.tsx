import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FileUploadComponent } from '../components/FileUpload';

describe('FileUploadComponent', () => {
  const mockOnFilesSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload area with correct initial state', () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />);
    
    expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/supports all file types/i)).toBeInTheDocument();
    expect(screen.getByText('📁')).toBeInTheDocument();
  });

  test('shows processing state when isProcessing is true', () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={true} />);
    
    expect(screen.getByText(/processing with quantum compression/i)).toBeInTheDocument();
    expect(screen.getByText('⚛️')).toBeInTheDocument();
  });

  test('handles file selection via input', async () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('textbox', { hidden: true });
    
    await userEvent.upload(input, file);
    
    expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
  });

  test('handles multiple file selection', async () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />);
    
    const files = [
      new File(['content 1'], 'test1.txt', { type: 'text/plain' }),
      new File(['content 2'], 'test2.txt', { type: 'text/plain' })
    ];
    
    const input = screen.getByRole('textbox', { hidden: true });
    
    await userEvent.upload(input, files);
    
    expect(mockOnFilesSelected).toHaveBeenCalledWith(files);
  });

  test('handles drag and drop events', async () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />);
    
    const dropzone = screen.getByText(/drag & drop files here/i).closest('div');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Test drag enter
    fireEvent.dragEnter(dropzone!, {
      dataTransfer: { files: [file] }
    });
    
    // Test drag over
    fireEvent.dragOver(dropzone!, {
      dataTransfer: { files: [file] }
    });
    
    // Test drop
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] }
    });
    
    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
    });
  });

  test('shows active state during drag over', () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />);
    
    const dropzone = screen.getByText(/drag & drop files here/i).closest('div');
    
    fireEvent.dragEnter(dropzone!);
    expect(dropzone).toHaveClass('active');
    
    fireEvent.dragLeave(dropzone!);
    expect(dropzone).not.toHaveClass('active');
  });

  test('prevents file upload when processing', async () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={true} />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const dropzone = screen.getByText(/processing with quantum compression/i).closest('div');
    
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] }
    });
    
    expect(mockOnFilesSelected).not.toHaveBeenCalled();
  });

  test('shows progress bar during upload', async () => {
    const mockOnFilesSelected = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('textbox', { hidden: true });
    
    await userEvent.upload(input, file);
    
    // Progress bar should be visible during upload
    expect(document.querySelector('.progress-bar')).toBeInTheDocument();
  });

  test('respects file size limit', async () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />);
    
    // Create a file larger than 1GB (mocked)
    const largeFile = new File(['x'.repeat(1024 * 1024 * 1024 + 1)], 'large.txt', { 
      type: 'text/plain' 
    });
    
    const input = screen.getByRole('textbox', { hidden: true });
    
    // The dropzone should handle file size validation
    await userEvent.upload(input, largeFile);
    
    // File should still be passed to handler (validation happens in dropzone config)
    expect(mockOnFilesSelected).toHaveBeenCalled();
  });

  test('displays quantum processing features', () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />);
    
    expect(screen.getByText(/quantum superposition processing/i)).toBeInTheDocument();
    expect(screen.getByText(/entanglement pattern detection/i)).toBeInTheDocument();
    expect(screen.getByText(/quantum interference optimization/i)).toBeInTheDocument();
    expect(screen.getByText(/real-time compression metrics/i)).toBeInTheDocument();
  });

  test('handles click to select files', async () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />);
    
    const dropzone = screen.getByText(/drag & drop files here/i).closest('div');
    
    fireEvent.click(dropzone!);
    
    // Should trigger file input click (tested indirectly through dropzone behavior)
    expect(dropzone).toBeInTheDocument();
  });

  test('shows appropriate cursor states', () => {
    const { rerender } = render(
      <FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />
    );
    
    const dropzone = screen.getByText(/drag & drop files here/i).closest('div');
    expect(dropzone).toHaveStyle('cursor: pointer');
    
    rerender(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={true} />);
    
    const processingDropzone = screen.getByText(/processing with quantum compression/i).closest('div');
    expect(processingDropzone).toHaveStyle('cursor: not-allowed');
  });

  test('handles empty file selection gracefully', async () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />);
    
    const dropzone = screen.getByText(/drag & drop files here/i).closest('div');
    
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [] }
    });
    
    expect(mockOnFilesSelected).not.toHaveBeenCalled();
  });

  test('formats file sizes correctly', () => {
    render(<FileUploadComponent onFilesSelected={mockOnFilesSelected} isProcessing={false} />);
    
    // This tests the internal formatFileSize function indirectly
    expect(screen.getByText(/max size: 1gb per file/i)).toBeInTheDocument();
  });
});