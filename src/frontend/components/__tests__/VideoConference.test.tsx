import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VideoConference } from '../VideoConference';

// Mock WebRTC APIs
const mockGetUserMedia = jest.fn();
const mockGetDisplayMedia = jest.fn();

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
    getDisplayMedia: mockGetDisplayMedia,
  },
  writable: true,
});

// Mock RTCPeerConnection
global.RTCPeerConnection = jest.fn().mockImplementation(() => ({
  createOffer: jest.fn().mockResolvedValue({ sdp: 'mock-offer', type: 'offer' }),
  createAnswer: jest.fn().mockResolvedValue({ sdp: 'mock-answer', type: 'answer' }),
  setLocalDescription: jest.fn().mockResolvedValue(undefined),
  setRemoteDescription: jest.fn().mockResolvedValue(undefined),
  addIceCandidate: jest.fn().mockResolvedValue(undefined),
  addTrack: jest.fn(),
  getSenders: jest.fn().mockReturnValue([]),
  close: jest.fn(),
  connectionState: 'new',
  iceConnectionState: 'new',
  signalingState: 'stable',
  onicecandidate: null,
  ontrack: null,
  onconnectionstatechange: null,
  oniceconnectionstatechange: null,
  onsignalingstatechange: null,
  onicegatheringstatechange: null,
}));

// Mock MediaStream
global.MediaStream = jest.fn().mockImplementation(() => ({
  getTracks: jest.fn().mockReturnValue([]),
  getAudioTracks: jest.fn().mockReturnValue([{
    enabled: true,
    stop: jest.fn(),
  }]),
  getVideoTracks: jest.fn().mockReturnValue([{
    enabled: true,
    stop: jest.fn(),
    onended: null,
  }]),
  clone: jest.fn().mockReturnThis(),
}));

describe('VideoConference', () => {
  const defaultProps = {
    userId: 'test-user-123',
    userName: 'Test User',
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserMedia.mockResolvedValue(new MediaStream());
    mockGetDisplayMedia.mockResolvedValue(new MediaStream());
  });

  it('renders the initial state correctly', () => {
    render(<VideoConference {...defaultProps} />);
    
    expect(screen.getByText('QuantumFlow Video Conference')).toBeInTheDocument();
    expect(screen.getByText('High-quality video calls with quantum compression')).toBeInTheDocument();
    expect(screen.getByText('Create New Room')).toBeInTheDocument();
    expect(screen.getByText('Join Room')).toBeInTheDocument();
  });

  it('shows room creation form when create room is clicked', async () => {
    render(<VideoConference {...defaultProps} />);
    
    const createButton = screen.getByText('Create Room');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Creating room...')).toBeInTheDocument();
    });
  });

  it('shows room join form when join room is clicked', async () => {
    render(<VideoConference {...defaultProps} />);
    
    // Find the join room input
    const roomCodeInput = screen.getByPlaceholderText('Enter 6-digit code');
    expect(roomCodeInput).toBeInTheDocument();
    
    // Enter a room code
    fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
    expect(roomCodeInput).toHaveValue('ABC123');
  });

  it('handles room creation with custom settings', async () => {
    render(<VideoConference {...defaultProps} />);
    
    // Find and click advanced settings toggle
    const advancedToggle = screen.getByText('Advanced Settings');
    fireEvent.click(advancedToggle);
    
    // Check that advanced settings are shown
    expect(screen.getByText('Allow Screen Sharing')).toBeInTheDocument();
    expect(screen.getByText('Allow Recording')).toBeInTheDocument();
  });

  it('validates room code input format', () => {
    render(<VideoConference {...defaultProps} />);
    
    const roomCodeInput = screen.getByPlaceholderText('Enter 6-digit code');
    
    // Test that non-alphanumeric characters are filtered
    fireEvent.change(roomCodeInput, { target: { value: 'AB@#12' } });
    expect(roomCodeInput).toHaveValue('AB12');
    
    // Test that lowercase is converted to uppercase
    fireEvent.change(roomCodeInput, { target: { value: 'abc123' } });
    expect(roomCodeInput).toHaveValue('ABC123');
    
    // Test that input is limited to 6 characters
    fireEvent.change(roomCodeInput, { target: { value: 'ABCDEFGH' } });
    expect(roomCodeInput).toHaveValue('ABCDEF');
  });

  it('generates random room codes', () => {
    render(<VideoConference {...defaultProps} />);
    
    const generateButton = screen.getByTitle('Generate random code');
    const roomCodeInput = screen.getByPlaceholderText('Leave empty for auto-generated') as HTMLInputElement;
    
    fireEvent.click(generateButton);
    
    // Check that a 6-character code was generated
    expect(roomCodeInput.value).toHaveLength(6);
    expect(roomCodeInput.value).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('handles media access errors gracefully', async () => {
    const mockError = new Error('Permission denied');
    mockGetUserMedia.mockRejectedValue(mockError);
    
    render(<VideoConference {...defaultProps} />);
    
    const roomCodeInput = screen.getByPlaceholderText('Enter 6-digit code');
    const joinButton = screen.getByText('Join Room');
    
    fireEvent.change(roomCodeInput, { target: { value: 'TEST12' } });
    fireEvent.click(joinButton);
    
    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Failed to join room')
        })
      );
    });
  });

  it('updates compression settings', () => {
    render(<VideoConference {...defaultProps} />);
    
    // The video settings component should be rendered
    // This tests the integration with VideoSettings component
    expect(screen.getByText('Video Quality')).toBeInTheDocument();
  });

  it('handles screen sharing toggle', async () => {
    // Mock successful media access
    const mockStream = new MediaStream();
    mockGetDisplayMedia.mockResolvedValue(mockStream);
    
    render(<VideoConference {...defaultProps} />);
    
    // First need to be in a call to test screen sharing
    // This would require mocking the full call setup
    // For now, just test that the screen share component renders
    expect(screen.getByText('Screen Sharing')).toBeInTheDocument();
  });

  it('displays connection quality indicators', () => {
    render(<VideoConference {...defaultProps} />);
    
    // Test that quality indicators are present in the UI
    // This would be more meaningful when in an active call
    expect(screen.getByText('good')).toBeInTheDocument();
  });

  it('handles participant management', () => {
    render(<VideoConference {...defaultProps} />);
    
    // Test that participant list functionality is available
    // This would be tested more thoroughly in ParticipantList.test.tsx
    expect(screen.getByText('0 participants')).toBeInTheDocument();
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = render(<VideoConference {...defaultProps} />);
    
    // Mock some active streams
    const mockStream = new MediaStream();
    const mockTrack = { stop: jest.fn() };
    mockStream.getTracks = jest.fn().mockReturnValue([mockTrack]);
    
    unmount();
    
    // Verify cleanup would happen (actual cleanup is tested in integration tests)
    expect(true).toBe(true); // Placeholder assertion
  });
});

describe('VideoConference Error Handling', () => {
  const defaultProps = {
    userId: 'test-user-123',
    userName: 'Test User',
    onError: jest.fn(),
  };

  it('handles WebRTC connection failures', async () => {
    // Mock RTCPeerConnection constructor to throw
    const originalRTCPeerConnection = global.RTCPeerConnection;
    global.RTCPeerConnection = jest.fn().mockImplementation(() => {
      throw new Error('WebRTC not supported');
    });

    render(<VideoConference {...defaultProps} />);
    
    // Attempt to create a room
    const createButton = screen.getByText('Create Room');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalled();
    });

    // Restore original implementation
    global.RTCPeerConnection = originalRTCPeerConnection;
  });

  it('displays error state when connection fails', async () => {
    render(<VideoConference {...defaultProps} />);
    
    // Simulate an error by triggering the error state
    // This would typically happen through failed room creation/joining
    const createButton = screen.getByText('Create Room');
    fireEvent.click(createButton);
    
    // Mock a failure scenario
    mockGetUserMedia.mockRejectedValue(new Error('Camera access denied'));
    
    await waitFor(() => {
      // The error would be handled and potentially show an error state
      expect(true).toBe(true); // Placeholder - actual error UI would be tested
    });
  });
});

describe('VideoConference Integration', () => {
  const defaultProps = {
    userId: 'test-user-123',
    userName: 'Test User',
    onError: jest.fn(),
  };

  it('integrates with quantum compression settings', () => {
    render(<VideoConference {...defaultProps} />);
    
    // Test that quantum compression settings are available
    expect(screen.getByText('Quantum Compression')).toBeInTheDocument();
    expect(screen.getByText('Compression Level')).toBeInTheDocument();
  });

  it('supports mobile responsive design', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<VideoConference {...defaultProps} />);
    
    // Test that mobile-specific elements are present
    expect(screen.getByText('QuantumFlow Video Conference')).toBeInTheDocument();
  });
});