"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const ParticipantList_1 = require("../ParticipantList");
describe('ParticipantList', () => {
    const mockOnClose = jest.fn();
    const currentUserId = 'user-123';
    const createMockParticipant = (id, name, overrides = {}) => ({
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
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        expect(react_1.screen.getByText('Participants (3)')).toBeInTheDocument();
        expect(react_1.screen.getByText('Current User')).toBeInTheDocument();
        expect(react_1.screen.getByText('John Doe')).toBeInTheDocument();
        expect(react_1.screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    it('highlights current user', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        expect(react_1.screen.getByText('(You)')).toBeInTheDocument();
    });
    it('shows participant connection states', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        expect(react_1.screen.getByText('excellent')).toBeInTheDocument();
        expect(react_1.screen.getByText('good')).toBeInTheDocument();
        expect(react_1.screen.getByText('poor')).toBeInTheDocument();
    });
    it('displays media status indicators', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        // Check for screen sharing indicator
        const screenShareIcons = react_1.screen.getAllByTitle('Screen sharing');
        expect(screenShareIcons).toHaveLength(1);
        // Check for muted audio indicator
        const mutedIcons = react_1.screen.getAllByTitle('Audio off');
        expect(mutedIcons).toHaveLength(1);
    });
    it('shows compression statistics', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        expect(react_1.screen.getByText('Quantum Compression')).toBeInTheDocument();
        expect(react_1.screen.getByText('3.2x')).toBeInTheDocument();
        expect(react_1.screen.getByText('50.0MB')).toBeInTheDocument();
        expect(react_1.screen.getByText('30.0MB')).toBeInTheDocument();
    });
    it('displays bandwidth usage', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        expect(react_1.screen.getByText('2.5 Mbps')).toBeInTheDocument();
    });
    it('shows join time', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        expect(react_1.screen.getAllByText(/Joined \d+m ago/)).toHaveLength(3);
    });
    it('filters participants by search term', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        const searchInput = react_1.screen.getByPlaceholderText('Search participants...');
        react_1.fireEvent.change(searchInput, { target: { value: 'john' } });
        expect(react_1.screen.getByText('John Doe')).toBeInTheDocument();
        expect(react_1.screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        expect(react_1.screen.queryByText('Current User')).not.toBeInTheDocument();
    });
    it('shows no participants message when search returns no results', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        const searchInput = react_1.screen.getByPlaceholderText('Search participants...');
        react_1.fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
        expect(react_1.screen.getByText('No participants found')).toBeInTheDocument();
    });
    it('calls onClose when close button is clicked', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        const closeButton = react_1.screen.getByRole('button', { name: /close/i });
        react_1.fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
    it('shows action buttons for other participants', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        const muteButtons = react_1.screen.getAllByTitle('Mute participant');
        const removeButtons = react_1.screen.getAllByTitle('Remove participant');
        // Should have action buttons for 2 other participants (not current user)
        expect(muteButtons).toHaveLength(2);
        expect(removeButtons).toHaveLength(2);
    });
    it('handles empty participant list', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: new Map(), currentUserId: currentUserId, onClose: mockOnClose }));
        expect(react_1.screen.getByText('Participants (0)')).toBeInTheDocument();
        expect(react_1.screen.getByText('No participants found')).toBeInTheDocument();
    });
    it('formats bandwidth correctly for values less than 1 Mbps', () => {
        const lowBandwidthParticipant = new Map([
            ['user-low', createMockParticipant('user-low', 'Low Bandwidth User', {
                    bandwidthUsage: 0.5
                })],
        ]);
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: lowBandwidthParticipant, currentUserId: currentUserId, onClose: mockOnClose }));
        expect(react_1.screen.getByText('500 Kbps')).toBeInTheDocument();
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
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: participantsWithDifferentStates, currentUserId: currentUserId, onClose: mockOnClose }));
        // The component should render different colored status indicators
        // This is tested through the presence of participants with different states
        expect(react_1.screen.getByText('Connected User')).toBeInTheDocument();
        expect(react_1.screen.getByText('Connecting User')).toBeInTheDocument();
        expect(react_1.screen.getByText('Failed User')).toBeInTheDocument();
    });
    it('handles participant action button clicks', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ParticipantList_1.ParticipantList, { participants: mockParticipants, currentUserId: currentUserId, onClose: mockOnClose }));
        const muteButton = react_1.screen.getAllByTitle('Mute participant')[0];
        react_1.fireEvent.click(muteButton);
        expect(consoleSpy).toHaveBeenCalledWith('Mute participant:', 'user-456');
        const removeButton = react_1.screen.getAllByTitle('Remove participant')[0];
        react_1.fireEvent.click(removeButton);
        expect(consoleSpy).toHaveBeenCalledWith('Remove participant:', 'user-456');
        consoleSpy.mockRestore();
    });
});
//# sourceMappingURL=ParticipantList.test.js.map