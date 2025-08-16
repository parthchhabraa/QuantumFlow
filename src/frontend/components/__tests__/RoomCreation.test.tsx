import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoomCreation } from '../RoomCreation';

describe('RoomCreation', () => {
  const mockOnCreateRoom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders room creation form correctly', () => {
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    expect(screen.getByText('Create New Room')).toBeInTheDocument();
    expect(screen.getByText('Start a new video conference')).toBeInTheDocument();
    expect(screen.getByLabelText('Room Code (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Max Participants')).toBeInTheDocument();
    expect(screen.getByText('Create Room')).toBeInTheDocument();
  });

  it('allows entering custom room code', () => {
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    const roomCodeInput = screen.getByPlaceholderText('Leave empty for auto-generated');
    fireEvent.change(roomCodeInput, { target: { value: 'custom' } });
    
    expect(roomCodeInput).toHaveValue('CUSTOM');
  });

  it('limits room code to 6 characters and uppercase', () => {
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    const roomCodeInput = screen.getByPlaceholderText('Leave empty for auto-generated');
    fireEvent.change(roomCodeInput, { target: { value: 'toolongcode' } });
    
    expect(roomCodeInput).toHaveValue('TOOLO');
  });

  it('generates random room code when generate button is clicked', () => {
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    const generateButton = screen.getByTitle('Generate random code');
    const roomCodeInput = screen.getByPlaceholderText('Leave empty for auto-generated') as HTMLInputElement;
    
    fireEvent.click(generateButton);
    
    expect(roomCodeInput.value).toHaveLength(6);
    expect(roomCodeInput.value).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('allows selecting max participants', () => {
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    const participantsSelect = screen.getByLabelText('Max Participants');
    fireEvent.change(participantsSelect, { target: { value: '25' } });
    
    expect(participantsSelect).toHaveValue('25');
  });

  it('shows advanced settings when toggle is clicked', () => {
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    const advancedToggle = screen.getByText('Advanced Settings');
    fireEvent.click(advancedToggle);
    
    expect(screen.getByText('Allow Screen Sharing')).toBeInTheDocument();
    expect(screen.getByText('Allow Recording')).toBeInTheDocument();
    expect(screen.getByText('Require Authentication')).toBeInTheDocument();
    expect(screen.getByText('Auto-Adapt Quality')).toBeInTheDocument();
  });

  it('toggles advanced settings checkboxes', () => {
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    const advancedToggle = screen.getByText('Advanced Settings');
    fireEvent.click(advancedToggle);
    
    const screenSharingCheckbox = screen.getByLabelText('Allow Screen Sharing') as HTMLInputElement;
    expect(screenSharingCheckbox.checked).toBe(true);
    
    fireEvent.click(screenSharingCheckbox);
    expect(screenSharingCheckbox.checked).toBe(false);
  });

  it('calls onCreateRoom with correct configuration', async () => {
    mockOnCreateRoom.mockResolvedValue(undefined);
    
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    // Set room code
    const roomCodeInput = screen.getByPlaceholderText('Leave empty for auto-generated');
    fireEvent.change(roomCodeInput, { target: { value: 'TEST12' } });
    
    // Set max participants
    const participantsSelect = screen.getByLabelText('Max Participants');
    fireEvent.change(participantsSelect, { target: { value: '25' } });
    
    // Open advanced settings and modify them
    const advancedToggle = screen.getByText('Advanced Settings');
    fireEvent.click(advancedToggle);
    
    const recordingCheckbox = screen.getByLabelText('Allow Recording');
    fireEvent.click(recordingCheckbox);
    
    // Create room
    const createButton = screen.getByText('Create Room');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockOnCreateRoom).toHaveBeenCalledWith({
        roomCode: 'TEST12',
        maxParticipants: 25,
        roomSettings: {
          allowScreenSharing: true,
          allowRecording: false,
          requireAuth: false,
          autoAdaptQuality: true,
        },
      });
    });
  });

  it('shows loading state during room creation', async () => {
    let resolveCreate: () => void;
    const createPromise = new Promise<void>((resolve) => {
      resolveCreate = resolve;
    });
    mockOnCreateRoom.mockReturnValue(createPromise);
    
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    const createButton = screen.getByText('Create Room');
    fireEvent.click(createButton);
    
    expect(screen.getByText('Creating Room...')).toBeInTheDocument();
    expect(createButton).toBeDisabled();
    
    resolveCreate!();
    await waitFor(() => {
      expect(screen.getByText('Create Room')).toBeInTheDocument();
    });
  });

  it('handles room creation errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockOnCreateRoom.mockRejectedValue(new Error('Room creation failed'));
    
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    const createButton = screen.getByText('Create Room');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to create room:', expect.any(Error));
    });
    
    consoleError.mockRestore();
  });

  it('creates room with default settings when no custom settings are provided', async () => {
    mockOnCreateRoom.mockResolvedValue(undefined);
    
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    const createButton = screen.getByText('Create Room');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockOnCreateRoom).toHaveBeenCalledWith({
        roomCode: undefined,
        maxParticipants: 10,
        roomSettings: {
          allowScreenSharing: true,
          allowRecording: true,
          requireAuth: false,
          autoAdaptQuality: true,
        },
      });
    });
  });

  it('has proper accessibility attributes', () => {
    render(<RoomCreation onCreateRoom={mockOnCreateRoom} />);
    
    const roomCodeInput = screen.getByLabelText('Room Code (Optional)');
    expect(roomCodeInput).toHaveAttribute('maxLength', '6');
    
    const participantsSelect = screen.getByLabelText('Max Participants');
    expect(participantsSelect).toBeInTheDocument();
    
    const generateButton = screen.getByTitle('Generate random code');
    expect(generateButton).toHaveAttribute('title', 'Generate random code');
  });
});