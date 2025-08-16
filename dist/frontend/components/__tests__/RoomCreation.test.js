"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const RoomCreation_1 = require("../RoomCreation");
describe('RoomCreation', () => {
    const mockOnCreateRoom = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('renders room creation form correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        expect(react_1.screen.getByText('Create New Room')).toBeInTheDocument();
        expect(react_1.screen.getByText('Start a new video conference')).toBeInTheDocument();
        expect(react_1.screen.getByLabelText('Room Code (Optional)')).toBeInTheDocument();
        expect(react_1.screen.getByLabelText('Max Participants')).toBeInTheDocument();
        expect(react_1.screen.getByText('Create Room')).toBeInTheDocument();
    });
    it('allows entering custom room code', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        const roomCodeInput = react_1.screen.getByPlaceholderText('Leave empty for auto-generated');
        react_1.fireEvent.change(roomCodeInput, { target: { value: 'custom' } });
        expect(roomCodeInput).toHaveValue('CUSTOM');
    });
    it('limits room code to 6 characters and uppercase', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        const roomCodeInput = react_1.screen.getByPlaceholderText('Leave empty for auto-generated');
        react_1.fireEvent.change(roomCodeInput, { target: { value: 'toolongcode' } });
        expect(roomCodeInput).toHaveValue('TOOLO');
    });
    it('generates random room code when generate button is clicked', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        const generateButton = react_1.screen.getByTitle('Generate random code');
        const roomCodeInput = react_1.screen.getByPlaceholderText('Leave empty for auto-generated');
        react_1.fireEvent.click(generateButton);
        expect(roomCodeInput.value).toHaveLength(6);
        expect(roomCodeInput.value).toMatch(/^[A-Z0-9]{6}$/);
    });
    it('allows selecting max participants', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        const participantsSelect = react_1.screen.getByLabelText('Max Participants');
        react_1.fireEvent.change(participantsSelect, { target: { value: '25' } });
        expect(participantsSelect).toHaveValue('25');
    });
    it('shows advanced settings when toggle is clicked', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        const advancedToggle = react_1.screen.getByText('Advanced Settings');
        react_1.fireEvent.click(advancedToggle);
        expect(react_1.screen.getByText('Allow Screen Sharing')).toBeInTheDocument();
        expect(react_1.screen.getByText('Allow Recording')).toBeInTheDocument();
        expect(react_1.screen.getByText('Require Authentication')).toBeInTheDocument();
        expect(react_1.screen.getByText('Auto-Adapt Quality')).toBeInTheDocument();
    });
    it('toggles advanced settings checkboxes', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        const advancedToggle = react_1.screen.getByText('Advanced Settings');
        react_1.fireEvent.click(advancedToggle);
        const screenSharingCheckbox = react_1.screen.getByLabelText('Allow Screen Sharing');
        expect(screenSharingCheckbox.checked).toBe(true);
        react_1.fireEvent.click(screenSharingCheckbox);
        expect(screenSharingCheckbox.checked).toBe(false);
    });
    it('calls onCreateRoom with correct configuration', async () => {
        mockOnCreateRoom.mockResolvedValue(undefined);
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        // Set room code
        const roomCodeInput = react_1.screen.getByPlaceholderText('Leave empty for auto-generated');
        react_1.fireEvent.change(roomCodeInput, { target: { value: 'TEST12' } });
        // Set max participants
        const participantsSelect = react_1.screen.getByLabelText('Max Participants');
        react_1.fireEvent.change(participantsSelect, { target: { value: '25' } });
        // Open advanced settings and modify them
        const advancedToggle = react_1.screen.getByText('Advanced Settings');
        react_1.fireEvent.click(advancedToggle);
        const recordingCheckbox = react_1.screen.getByLabelText('Allow Recording');
        react_1.fireEvent.click(recordingCheckbox);
        // Create room
        const createButton = react_1.screen.getByText('Create Room');
        react_1.fireEvent.click(createButton);
        await (0, react_1.waitFor)(() => {
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
        let resolveCreate;
        const createPromise = new Promise((resolve) => {
            resolveCreate = resolve;
        });
        mockOnCreateRoom.mockReturnValue(createPromise);
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        const createButton = react_1.screen.getByText('Create Room');
        react_1.fireEvent.click(createButton);
        expect(react_1.screen.getByText('Creating Room...')).toBeInTheDocument();
        expect(createButton).toBeDisabled();
        resolveCreate();
        await (0, react_1.waitFor)(() => {
            expect(react_1.screen.getByText('Create Room')).toBeInTheDocument();
        });
    });
    it('handles room creation errors gracefully', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
        mockOnCreateRoom.mockRejectedValue(new Error('Room creation failed'));
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        const createButton = react_1.screen.getByText('Create Room');
        react_1.fireEvent.click(createButton);
        await (0, react_1.waitFor)(() => {
            expect(consoleError).toHaveBeenCalledWith('Failed to create room:', expect.any(Error));
        });
        consoleError.mockRestore();
    });
    it('creates room with default settings when no custom settings are provided', async () => {
        mockOnCreateRoom.mockResolvedValue(undefined);
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        const createButton = react_1.screen.getByText('Create Room');
        react_1.fireEvent.click(createButton);
        await (0, react_1.waitFor)(() => {
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
        (0, react_1.render)((0, jsx_runtime_1.jsx)(RoomCreation_1.RoomCreation, { onCreateRoom: mockOnCreateRoom }));
        const roomCodeInput = react_1.screen.getByLabelText('Room Code (Optional)');
        expect(roomCodeInput).toHaveAttribute('maxLength', '6');
        const participantsSelect = react_1.screen.getByLabelText('Max Participants');
        expect(participantsSelect).toBeInTheDocument();
        const generateButton = react_1.screen.getByTitle('Generate random code');
        expect(generateButton).toHaveAttribute('title', 'Generate random code');
    });
});
//# sourceMappingURL=RoomCreation.test.js.map