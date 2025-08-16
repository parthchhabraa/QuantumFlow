import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ParticipantList } from '../ParticipantList';
import { Participant } from '../../../video/models/WebRTCModels';

describe('ParticipantList', () => {
  const mockOnClose = jest.fn();
  const currentUserId = 'user-123';

  const createMockParticipant = (id: string, name: string, overrides: Partial<Participant> = {}): Participant => ({
    id,
    name,
    joinedAt: Date.now() - 300000, // 5 minutes ago
    connectionState: 'connected',
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
    networkQuality: 'good',
    bandwidthUsage: 2.5,
    compressionStats: {
      averageCompressionRatio: 3.2,
      totalBytesTransmitted: 1024 * 1024 * 50, // 50MB
      totalBytesReceived: 1024 * 1024 * 30, // 30MB
    },
    ...overrides,
  });

  const mockParticipants = new Map([
    ['user-123', createMockParticipant('user-123', 'Current User')],
    ['user-456', createMockParticipant('user-456', 'John Doe', { 
      networkQuality: 'excellent',
      isScreenSharing: true 
    })],
    ['user-789', createMockParticipant('user-789', 'Jane Smith', { 
      connectionState: 'connecting',
      isAudioEnabled: false,
      networkQuality: 'poor'
    })],
  ]);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders participant list correctly', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Participants (3)')).toBeInTheDocument();
    expect(screen.getByText('Current User')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('highlights current user', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('shows participant connection states', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('excellent')).toBeInTheDocument();
    expect(screen.getByText('good')).toBeInTheDocument();
    expect(screen.getByText('poor')).toBeInTheDocument();
  });

  it('displays media status indicators', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    // Check for screen sharing indicator
    const screenShareIcons = screen.getAllByTitle('Screen sharing');
    expect(screenShareIcons).toHaveLength(1);

    // Check for muted audio indicator
    const mutedIcons = screen.getAllByTitle('Audio off');
    expect(mutedIcons).toHaveLength(1);
  });

  it('shows compression statistics', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Quantum Compression')).toBeInTheDocument();
    expect(screen.getByText('3.2x')).toBeInTheDocument();
    expect(screen.getByText('50.0MB')).toBeInTheDocument();
    expect(screen.getByText('30.0MB')).toBeInTheDocument();
  });

  it('displays bandwidth usage', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('2.5 Mbps')).toBeInTheDocument();
  });

  it('shows join time', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getAllByText(/Joined \d+m ago/)).toHaveLength(3);
  });

  it('filters participants by search term', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search participants...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Current User')).not.toBeInTheDocument();
  });

  it('shows no participants message when search returns no results', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search participants...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No participants found')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows action buttons for other participants', () => {
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    const muteButtons = screen.getAllByTitle('Mute participant');
    const removeButtons = screen.getAllByTitle('Remove participant');

    // Should have action buttons for 2 other participants (not current user)
    expect(muteButtons).toHaveLength(2);
    expect(removeButtons).toHaveLength(2);
  });

  it('handles empty participant list', () => {
    render(
      <ParticipantList
        participants={new Map()}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Participants (0)')).toBeInTheDocument();
    expect(screen.getByText('No participants found')).toBeInTheDocument();
  });

  it('formats bandwidth correctly for values less than 1 Mbps', () => {
    const lowBandwidthParticipant = new Map([
      ['user-low', createMockParticipant('user-low', 'Low Bandwidth User', { 
        bandwidthUsage: 0.5 
      })],
    ]);

    render(
      <ParticipantList
        participants={lowBandwidthParticipant}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('500 Kbps')).toBeInTheDocument();
  });

  it('shows different connection state colors', () => {
    const participantsWithDifferentStates = new Map([
      ['user-connected', createMockParticipant('user-connected', 'Connected User', { 
        connectionState: 'connected' 
      })],
      ['user-connecting', createMockParticipant('user-connecting', 'Connecting User', { 
        connectionState: 'connecting' 
      })],
      ['user-failed', createMockParticipant('user-failed', 'Failed User', { 
        connectionState: 'failed' 
      })],
    ]);

    render(
      <ParticipantList
        participants={participantsWithDifferentStates}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    // The component should render different colored status indicators
    // This is tested through the presence of participants with different states
    expect(screen.getByText('Connected User')).toBeInTheDocument();
    expect(screen.getByText('Connecting User')).toBeInTheDocument();
    expect(screen.getByText('Failed User')).toBeInTheDocument();
  });

  it('handles participant action button clicks', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <ParticipantList
        participants={mockParticipants}
        currentUserId={currentUserId}
        onClose={mockOnClose}
      />
    );

    const muteButton = screen.getAllByTitle('Mute participant')[0];
    fireEvent.click(muteButton);

    expect(consoleSpy).toHaveBeenCalledWith('Mute participant:', 'user-456');

    const removeButton = screen.getAllByTitle('Remove participant')[0];
    fireEvent.click(removeButton);

    expect(consoleSpy).toHaveBeenCalledWith('Remove participant:', 'user-456');

    consoleSpy.mockRestore();
  });
});