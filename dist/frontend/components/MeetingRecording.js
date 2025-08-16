"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingRecording = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MeetingRecording = ({ recorder, room, participants, streams, onRecordingStateChange }) => {
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    const [isPaused, setIsPaused] = (0, react_1.useState)(false);
    const [currentSession, setCurrentSession] = (0, react_1.useState)(null);
    const [recordingStats, setRecordingStats] = (0, react_1.useState)({
        duration: 0,
        participantCount: 0,
        totalSize: 0,
        compressionRatio: 0
    });
    const [config, setConfig] = (0, react_1.useState)({
        quality: 'medium',
        includeAudio: true,
        includeScreenShare: true,
        maxDuration: 120, // 2 hours
        compressionLevel: 6,
        format: 'webm'
    });
    const [error, setError] = (0, react_1.useState)(null);
    // Update recording stats periodically
    (0, react_1.useEffect)(() => {
        if (!isRecording)
            return;
        const interval = setInterval(() => {
            const stats = recorder.getRecordingStats();
            setRecordingStats(stats);
        }, 1000);
        return () => clearInterval(interval);
    }, [isRecording, recorder]);
    // Listen to recorder events
    (0, react_1.useEffect)(() => {
        const handleRecordingStarted = () => {
            setIsRecording(true);
            setError(null);
            onRecordingStateChange?.(true);
        };
        const handleRecordingCompleted = ({ session }) => {
            setIsRecording(false);
            setIsPaused(false);
            setCurrentSession(session);
            onRecordingStateChange?.(false);
        };
        const handleRecordingPaused = () => {
            setIsPaused(true);
        };
        const handleRecordingResumed = () => {
            setIsPaused(false);
        };
        const handleRecordingError = ({ error }) => {
            setError(error.message || 'Recording error occurred');
            setIsRecording(false);
            setIsPaused(false);
            onRecordingStateChange?.(false);
        };
        recorder.on('recording-started', handleRecordingStarted);
        recorder.on('recording-completed', handleRecordingCompleted);
        recorder.on('recording-paused', handleRecordingPaused);
        recorder.on('recording-resumed', handleRecordingResumed);
        recorder.on('recording-error', handleRecordingError);
        return () => {
            recorder.off('recording-started', handleRecordingStarted);
            recorder.off('recording-completed', handleRecordingCompleted);
            recorder.off('recording-paused', handleRecordingPaused);
            recorder.off('recording-resumed', handleRecordingResumed);
            recorder.off('recording-error', handleRecordingError);
        };
    }, [recorder, onRecordingStateChange]);
    const startRecording = (0, react_1.useCallback)(async () => {
        try {
            setError(null);
            await recorder.startRecording(room, participants, streams, config);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start recording');
        }
    }, [recorder, room, participants, streams, config]);
    const stopRecording = (0, react_1.useCallback)(async () => {
        try {
            await recorder.stopRecording();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to stop recording');
        }
    }, [recorder]);
    const pauseRecording = (0, react_1.useCallback)(() => {
        try {
            recorder.pauseRecording();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to pause recording');
        }
    }, [recorder]);
    const resumeRecording = (0, react_1.useCallback)(() => {
        try {
            recorder.resumeRecording();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resume recording');
        }
    }, [recorder]);
    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        }
        return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    };
    const formatFileSize = (bytes) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "meeting-recording", children: [(0, jsx_runtime_1.jsxs)("div", { className: "recording-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Meeting Recording" }), isRecording && ((0, jsx_runtime_1.jsxs)("div", { className: "recording-indicator", children: [(0, jsx_runtime_1.jsx)("div", { className: "recording-dot" }), (0, jsx_runtime_1.jsx)("span", { children: "Recording" })] }))] }), error && ((0, jsx_runtime_1.jsxs)("div", { className: "recording-error", children: [(0, jsx_runtime_1.jsx)("span", { className: "error-icon", children: "\u26A0\uFE0F" }), (0, jsx_runtime_1.jsx)("span", { children: error })] })), !isRecording && !currentSession && ((0, jsx_runtime_1.jsxs)("div", { className: "recording-config", children: [(0, jsx_runtime_1.jsxs)("div", { className: "config-section", children: [(0, jsx_runtime_1.jsx)("label", { children: "Recording Quality:" }), (0, jsx_runtime_1.jsxs)("select", { value: config.quality, onChange: (e) => setConfig(prev => ({
                                    ...prev,
                                    quality: e.target.value
                                })), children: [(0, jsx_runtime_1.jsx)("option", { value: "low", children: "Low (500 kbps)" }), (0, jsx_runtime_1.jsx)("option", { value: "medium", children: "Medium (1.5 Mbps)" }), (0, jsx_runtime_1.jsx)("option", { value: "high", children: "High (4 Mbps)" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "config-section", children: [(0, jsx_runtime_1.jsx)("label", { children: "Compression Level:" }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: "1", max: "10", value: config.compressionLevel, onChange: (e) => setConfig(prev => ({
                                    ...prev,
                                    compressionLevel: parseInt(e.target.value)
                                })) }), (0, jsx_runtime_1.jsxs)("span", { children: [config.compressionLevel, "/10"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "config-section", children: [(0, jsx_runtime_1.jsx)("label", { children: "Max Duration (minutes):" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "5", max: "480", value: config.maxDuration, onChange: (e) => setConfig(prev => ({
                                    ...prev,
                                    maxDuration: parseInt(e.target.value)
                                })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "config-checkboxes", children: [(0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: config.includeAudio, onChange: (e) => setConfig(prev => ({
                                            ...prev,
                                            includeAudio: e.target.checked
                                        })) }), "Include Audio"] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: config.includeScreenShare, onChange: (e) => setConfig(prev => ({
                                            ...prev,
                                            includeScreenShare: e.target.checked
                                        })) }), "Include Screen Share"] })] }), (0, jsx_runtime_1.jsxs)("button", { className: "start-recording-btn", onClick: startRecording, children: [(0, jsx_runtime_1.jsx)("span", { className: "record-icon", children: "\u23FA" }), "Start Recording"] })] })), isRecording && ((0, jsx_runtime_1.jsxs)("div", { className: "recording-controls", children: [(0, jsx_runtime_1.jsxs)("div", { className: "recording-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Duration:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: formatDuration(recordingStats.duration) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Participants:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: recordingStats.participantCount })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Size:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: formatFileSize(recordingStats.totalSize) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Compression:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [recordingStats.compressionRatio.toFixed(1), "x"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "recording-buttons", children: [!isPaused ? ((0, jsx_runtime_1.jsxs)("button", { className: "pause-btn", onClick: pauseRecording, children: [(0, jsx_runtime_1.jsx)("span", { children: "\u23F8" }), "Pause"] })) : ((0, jsx_runtime_1.jsxs)("button", { className: "resume-btn", onClick: resumeRecording, children: [(0, jsx_runtime_1.jsx)("span", { children: "\u25B6\uFE0F" }), "Resume"] })), (0, jsx_runtime_1.jsxs)("button", { className: "stop-btn", onClick: stopRecording, children: [(0, jsx_runtime_1.jsx)("span", { children: "\u23F9" }), "Stop Recording"] })] })] })), currentSession && ((0, jsx_runtime_1.jsxs)("div", { className: "recording-completed", children: [(0, jsx_runtime_1.jsxs)("div", { className: "completion-header", children: [(0, jsx_runtime_1.jsx)("span", { className: "success-icon", children: "\u2705" }), (0, jsx_runtime_1.jsx)("h4", { children: "Recording Completed" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "session-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Duration:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: formatDuration(currentSession.duration) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Segments:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: currentSession.segments.length })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Original Size:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: formatFileSize(currentSession.totalOriginalSize) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Compressed Size:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: formatFileSize(currentSession.totalCompressedSize) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Compression Ratio:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [currentSession.overallCompressionRatio.toFixed(1), "x"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Space Saved:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [formatFileSize(currentSession.totalOriginalSize - currentSession.totalCompressedSize), "(", (((currentSession.totalOriginalSize - currentSession.totalCompressedSize) / currentSession.totalOriginalSize) * 100).toFixed(1), "%)"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "recording-actions", children: [(0, jsx_runtime_1.jsxs)("button", { className: "download-btn", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u2B07\uFE0F" }), "Download Recording"] }), (0, jsx_runtime_1.jsxs)("button", { className: "new-recording-btn", onClick: () => setCurrentSession(null), children: [(0, jsx_runtime_1.jsx)("span", { children: "\u23FA" }), "New Recording"] })] })] })), (0, jsx_runtime_1.jsx)("style", { children: `
        .meeting-recording {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .recording-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .recording-header h3 {
          color: white;
          margin: 0;
          font-size: 1.2rem;
        }

        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ff4757;
          font-weight: 600;
        }

        .recording-dot {
          width: 12px;
          height: 12px;
          background: #ff4757;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .recording-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 71, 87, 0.2);
          border: 1px solid #ff4757;
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 1rem;
          color: #ff4757;
        }

        .recording-config {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .config-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .config-section label {
          color: white;
          font-weight: 500;
          min-width: 120px;
        }

        .config-section select,
        .config-section input[type="number"] {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          padding: 0.5rem;
          color: white;
          font-size: 0.9rem;
        }

        .config-section input[type="range"] {
          flex: 1;
          max-width: 150px;
        }

        .config-checkboxes {
          display: flex;
          gap: 1rem;
        }

        .config-checkboxes label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          cursor: pointer;
          min-width: auto;
        }

        .start-recording-btn {
          background: linear-gradient(135deg, #ff4757, #ff3742);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .start-recording-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 71, 87, 0.3);
        }

        .recording-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recording-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }

        .recording-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .pause-btn, .resume-btn, .stop-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .stop-btn {
          background: linear-gradient(135deg, #ff4757, #ff3742);
          border: none;
        }

        .pause-btn:hover, .resume-btn:hover, .stop-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
        }

        .recording-completed {
          text-align: center;
        }

        .completion-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .completion-header h4 {
          color: white;
          margin: 0;
          font-size: 1.2rem;
        }

        .session-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .recording-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .download-btn, .new-recording-btn {
          background: linear-gradient(135deg, #5f27cd, #341f97);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .new-recording-btn {
          background: linear-gradient(135deg, #00d2d3, #54a0ff);
        }

        .download-btn:hover, .new-recording-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(95, 39, 205, 0.3);
        }

        @media (max-width: 768px) {
          .recording-stats,
          .session-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .recording-buttons,
          .recording-actions {
            flex-direction: column;
          }
        }
      ` })] }));
};
exports.MeetingRecording = MeetingRecording;
//# sourceMappingURL=MeetingRecording.js.map