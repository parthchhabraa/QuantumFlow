"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomCreation = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const RoomCreation = ({ onCreateRoom }) => {
    const [isCreating, setIsCreating] = (0, react_1.useState)(false);
    const [showAdvanced, setShowAdvanced] = (0, react_1.useState)(false);
    const [roomConfig, setRoomConfig] = (0, react_1.useState)({
        roomCode: '',
        maxParticipants: 10,
        allowScreenSharing: true,
        allowRecording: true,
        requireAuth: false,
        autoAdaptQuality: true
    });
    const handleCreateRoom = async () => {
        setIsCreating(true);
        try {
            const config = {
                roomCode: roomConfig.roomCode || undefined,
                maxParticipants: roomConfig.maxParticipants,
                roomSettings: {
                    allowScreenSharing: roomConfig.allowScreenSharing,
                    allowRecording: roomConfig.allowRecording,
                    requireAuth: roomConfig.requireAuth,
                    autoAdaptQuality: roomConfig.autoAdaptQuality
                }
            };
            await onCreateRoom(config);
        }
        catch (error) {
            console.error('Failed to create room:', error);
        }
        finally {
            setIsCreating(false);
        }
    };
    const generateRoomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setRoomConfig(prev => ({ ...prev, roomCode: result }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "room-creation", children: [(0, jsx_runtime_1.jsxs)("div", { className: "creation-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "card-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "card-icon", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-plus-circle" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Create New Room" }), (0, jsx_runtime_1.jsx)("p", { children: "Start a new video conference" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "creation-form", children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "roomCode", children: "Room Code (Optional)" }), (0, jsx_runtime_1.jsxs)("div", { className: "input-with-button", children: [(0, jsx_runtime_1.jsx)("input", { id: "roomCode", type: "text", value: roomConfig.roomCode, onChange: (e) => setRoomConfig(prev => ({ ...prev, roomCode: e.target.value.toUpperCase() })), placeholder: "Leave empty for auto-generated", maxLength: 6, className: "room-code-input" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: generateRoomCode, className: "generate-button", title: "Generate random code", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-dice" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "maxParticipants", children: "Max Participants" }), (0, jsx_runtime_1.jsxs)("select", { id: "maxParticipants", value: roomConfig.maxParticipants, onChange: (e) => setRoomConfig(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) })), className: "participants-select", children: [(0, jsx_runtime_1.jsx)("option", { value: 2, children: "2 participants" }), (0, jsx_runtime_1.jsx)("option", { value: 5, children: "5 participants" }), (0, jsx_runtime_1.jsx)("option", { value: 10, children: "10 participants" }), (0, jsx_runtime_1.jsx)("option", { value: 25, children: "25 participants" }), (0, jsx_runtime_1.jsx)("option", { value: 50, children: "50 participants" })] })] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setShowAdvanced(!showAdvanced), className: "advanced-toggle", children: [(0, jsx_runtime_1.jsx)("i", { className: `fas fa-chevron-${showAdvanced ? 'up' : 'down'}` }), "Advanced Settings"] }), showAdvanced && ((0, jsx_runtime_1.jsx)("div", { className: "advanced-settings", children: (0, jsx_runtime_1.jsxs)("div", { className: "settings-grid", children: [(0, jsx_runtime_1.jsxs)("label", { className: "checkbox-label", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: roomConfig.allowScreenSharing, onChange: (e) => setRoomConfig(prev => ({ ...prev, allowScreenSharing: e.target.checked })) }), (0, jsx_runtime_1.jsx)("span", { className: "checkmark" }), "Allow Screen Sharing"] }), (0, jsx_runtime_1.jsxs)("label", { className: "checkbox-label", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: roomConfig.allowRecording, onChange: (e) => setRoomConfig(prev => ({ ...prev, allowRecording: e.target.checked })) }), (0, jsx_runtime_1.jsx)("span", { className: "checkmark" }), "Allow Recording"] }), (0, jsx_runtime_1.jsxs)("label", { className: "checkbox-label", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: roomConfig.requireAuth, onChange: (e) => setRoomConfig(prev => ({ ...prev, requireAuth: e.target.checked })) }), (0, jsx_runtime_1.jsx)("span", { className: "checkmark" }), "Require Authentication"] }), (0, jsx_runtime_1.jsxs)("label", { className: "checkbox-label", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: roomConfig.autoAdaptQuality, onChange: (e) => setRoomConfig(prev => ({ ...prev, autoAdaptQuality: e.target.checked })) }), (0, jsx_runtime_1.jsx)("span", { className: "checkmark" }), "Auto-Adapt Quality"] })] }) })), (0, jsx_runtime_1.jsx)("button", { onClick: handleCreateRoom, disabled: isCreating, className: "create-button", children: isCreating ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "button-spinner" }), "Creating Room..."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-video" }), "Create Room"] })) })] })] }), (0, jsx_runtime_1.jsx)("style", { children: `
        .room-creation {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .creation-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .card-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .card-header h3 {
          margin: 0;
          color: white;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .card-header p {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
        }

        .creation-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: white;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .input-with-button {
          display: flex;
          gap: 0.5rem;
        }

        .room-code-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
          font-family: 'Courier New', monospace;
          letter-spacing: 2px;
          text-align: center;
        }

        .room-code-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
          font-family: inherit;
          letter-spacing: normal;
        }

        .generate-button {
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .generate-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .participants-select {
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
        }

        .participants-select option {
          background: #333;
          color: white;
        }

        .advanced-toggle {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: white;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .advanced-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .advanced-settings {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          position: relative;
        }

        .checkbox-label input[type="checkbox"] {
          opacity: 0;
          position: absolute;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          position: relative;
          transition: all 0.3s ease;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          border-color: #4facfe;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: -2px;
          left: 2px;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .create-button {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .create-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(79, 172, 254, 0.3);
        }

        .create-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .creation-card {
            max-width: 100%;
            margin: 0 1rem;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      ` })] }));
};
exports.RoomCreation = RoomCreation;
//# sourceMappingURL=RoomCreation.js.map