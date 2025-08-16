"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInterface = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ChatInterface = ({ chatManager, roomId, participantId, participantName, isVisible, onToggleVisibility }) => {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [newMessage, setNewMessage] = (0, react_1.useState)('');
    const [isTyping, setIsTyping] = (0, react_1.useState)(false);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [searchResults, setSearchResults] = (0, react_1.useState)([]);
    const [showSearch, setShowSearch] = (0, react_1.useState)(false);
    const [chatStats, setChatStats] = (0, react_1.useState)(null);
    const [showStats, setShowStats] = (0, react_1.useState)(false);
    const [unreadCount, setUnreadCount] = (0, react_1.useState)(0);
    const messagesEndRef = (0, react_1.useRef)(null);
    const inputRef = (0, react_1.useRef)(null);
    const typingTimeoutRef = (0, react_1.useRef)();
    // Load initial messages
    (0, react_1.useEffect)(() => {
        const initialMessages = chatManager.getRecentMessages(roomId, 50);
        setMessages(initialMessages);
    }, [chatManager, roomId]);
    // Listen for new messages
    (0, react_1.useEffect)(() => {
        const handleMessageAdded = ({ message }) => {
            if (message.roomId === roomId) {
                setMessages(prev => [...prev, message]);
                // Increment unread count if chat is not visible and message is not from current user
                if (!isVisible && message.senderId !== participantId) {
                    setUnreadCount(prev => prev + 1);
                }
            }
        };
        chatManager.on('message-added', handleMessageAdded);
        return () => chatManager.off('message-added', handleMessageAdded);
    }, [chatManager, roomId, isVisible, participantId]);
    // Clear unread count when chat becomes visible
    (0, react_1.useEffect)(() => {
        if (isVisible) {
            setUnreadCount(0);
        }
    }, [isVisible]);
    // Auto-scroll to bottom when new messages arrive
    (0, react_1.useEffect)(() => {
        if (isVisible) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isVisible]);
    // Load chat stats
    (0, react_1.useEffect)(() => {
        if (showStats) {
            const stats = chatManager.getChatStats(roomId);
            setChatStats(stats);
        }
    }, [chatManager, roomId, showStats, messages]);
    const sendMessage = (0, react_1.useCallback)(async () => {
        if (!newMessage.trim())
            return;
        try {
            await chatManager.sendMessage(roomId, participantId, participantName, newMessage.trim());
            setNewMessage('');
            setIsTyping(false);
        }
        catch (error) {
            console.error('Failed to send message:', error);
        }
    }, [chatManager, roomId, participantId, participantName, newMessage]);
    const handleKeyPress = (0, react_1.useCallback)((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);
    const handleInputChange = (0, react_1.useCallback)((e) => {
        setNewMessage(e.target.value);
        // Handle typing indicator
        if (!isTyping) {
            setIsTyping(true);
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 1000);
    }, [isTyping]);
    const handleSearch = (0, react_1.useCallback)(async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const results = await chatManager.searchMessages(roomId, searchQuery.trim(), 20);
            setSearchResults(results);
        }
        catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        }
    }, [chatManager, roomId, searchQuery]);
    const addReaction = (0, react_1.useCallback)((messageId, emoji) => {
        chatManager.addReaction(roomId, messageId, participantId, emoji);
    }, [chatManager, roomId, participantId]);
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1)
            return 'now';
        if (diffMins < 60)
            return `${diffMins}m`;
        if (diffHours < 24)
            return `${diffHours}h`;
        if (diffDays < 7)
            return `${diffDays}d`;
        return date.toLocaleDateString();
    };
    const renderMessage = (message) => {
        const isOwnMessage = message.senderId === participantId;
        const isSystemMessage = message.type === 'system';
        return ((0, jsx_runtime_1.jsxs)("div", { className: `message ${isOwnMessage ? 'own-message' : ''} ${isSystemMessage ? 'system-message' : ''}`, children: [!isSystemMessage && ((0, jsx_runtime_1.jsxs)("div", { className: "message-header", children: [(0, jsx_runtime_1.jsx)("span", { className: "sender-name", children: message.senderName }), (0, jsx_runtime_1.jsx)("span", { className: "message-time", children: formatTimestamp(message.timestamp) }), message.isCompressed && ((0, jsx_runtime_1.jsx)("span", { className: "compression-indicator", title: `Compressed ${message.compressionRatio?.toFixed(1)}x`, children: "\uD83D\uDDDC\uFE0F" }))] })), (0, jsx_runtime_1.jsx)("div", { className: "message-content", children: message.content }), !isSystemMessage && ((0, jsx_runtime_1.jsxs)("div", { className: "message-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "reaction-btn", onClick: () => addReaction(message.id, '👍'), title: "Like", children: "\uD83D\uDC4D" }), (0, jsx_runtime_1.jsx)("button", { className: "reaction-btn", onClick: () => addReaction(message.id, '❤️'), title: "Love", children: "\u2764\uFE0F" }), (0, jsx_runtime_1.jsx)("button", { className: "reaction-btn", onClick: () => addReaction(message.id, '😂'), title: "Laugh", children: "\uD83D\uDE02" })] })), message.metadata?.reactions && message.metadata.reactions.size > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "message-reactions", children: Array.from(message.metadata.reactions.entries()).map(([emoji, participants]) => ((0, jsx_runtime_1.jsxs)("span", { className: "reaction", title: `${participants.join(', ')}`, children: [emoji, " ", participants.length] }, emoji))) }))] }, message.id));
    };
    if (!isVisible) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "chat-toggle", children: (0, jsx_runtime_1.jsxs)("button", { className: "chat-toggle-btn", onClick: onToggleVisibility, children: ["\uD83D\uDCAC", unreadCount > 0 && ((0, jsx_runtime_1.jsx)("span", { className: "unread-badge", children: unreadCount > 99 ? '99+' : unreadCount }))] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "chat-interface", children: [(0, jsx_runtime_1.jsxs)("div", { className: "chat-header", children: [(0, jsx_runtime_1.jsxs)("div", { className: "chat-title", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Chat" }), (0, jsx_runtime_1.jsxs)("span", { className: "participant-count", children: [messages.length, " messages"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "chat-controls", children: [(0, jsx_runtime_1.jsx)("button", { className: `control-btn ${showSearch ? 'active' : ''}`, onClick: () => setShowSearch(!showSearch), title: "Search messages", children: "\uD83D\uDD0D" }), (0, jsx_runtime_1.jsx)("button", { className: `control-btn ${showStats ? 'active' : ''}`, onClick: () => setShowStats(!showStats), title: "Chat statistics", children: "\uD83D\uDCCA" }), (0, jsx_runtime_1.jsx)("button", { className: "control-btn", onClick: onToggleVisibility, title: "Close chat", children: "\u2715" })] })] }), showSearch && ((0, jsx_runtime_1.jsxs)("div", { className: "search-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "search-input-container", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Search messages...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleSearch(), className: "search-input" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSearch, className: "search-btn", children: "Search" })] }), searchResults.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "search-results", children: [(0, jsx_runtime_1.jsxs)("h4", { children: ["Search Results (", searchResults.length, ")"] }), (0, jsx_runtime_1.jsx)("div", { className: "search-messages", children: searchResults.map(renderMessage) })] }))] })), showStats && chatStats && ((0, jsx_runtime_1.jsxs)("div", { className: "stats-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Chat Statistics" }), (0, jsx_runtime_1.jsxs)("div", { className: "stats-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Messages:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: chatStats.totalMessages })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Characters:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: chatStats.totalCharacters.toLocaleString() })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Compression:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [chatStats.overallCompressionRatio.toFixed(1), "x"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Saved:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [(chatStats.bytesSaved / 1024).toFixed(1), " KB"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Rate:" }), (0, jsx_runtime_1.jsxs)("span", { className: "stat-value", children: [chatStats.messagesPerMinute.toFixed(1), "/min"] })] })] })] })), (0, jsx_runtime_1.jsx)("div", { className: "messages-container", children: (0, jsx_runtime_1.jsxs)("div", { className: "messages-list", children: [messages.map(renderMessage), (0, jsx_runtime_1.jsx)("div", { ref: messagesEndRef })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "message-input-container", children: [(0, jsx_runtime_1.jsx)("input", { ref: inputRef, type: "text", placeholder: "Type a message...", value: newMessage, onChange: handleInputChange, onKeyPress: handleKeyPress, className: "message-input" }), (0, jsx_runtime_1.jsx)("button", { onClick: sendMessage, disabled: !newMessage.trim(), className: "send-btn", children: "Send" })] }), (0, jsx_runtime_1.jsx)("style", { children: `
        .chat-toggle {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
        }

        .chat-toggle-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          position: relative;
        }

        .chat-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
        }

        .unread-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .chat-interface {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 350px;
          height: 500px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 16px 16px 0 0;
        }

        .chat-title h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .participant-count {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .chat-controls {
          display: flex;
          gap: 0.5rem;
        }

        .control-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .control-btn:hover,
        .control-btn.active {
          background: rgba(255, 255, 255, 0.3);
        }

        .search-section,
        .stats-section {
          padding: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(102, 126, 234, 0.05);
        }

        .search-input-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .search-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .search-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .search-results h4,
        .stats-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #333;
        }

        .search-messages {
          max-height: 150px;
          overflow-y: auto;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 6px;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #666;
        }

        .stat-value {
          font-weight: 600;
          color: #333;
        }

        .messages-container {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .message.own-message {
          align-items: flex-end;
        }

        .message.system-message {
          align-items: center;
        }

        .message.system-message .message-content {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          font-style: italic;
          text-align: center;
          padding: 0.5rem;
          border-radius: 12px;
          font-size: 0.9rem;
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .own-message .message-header {
          flex-direction: row-reverse;
        }

        .sender-name {
          font-weight: 600;
          color: #667eea;
        }

        .message-time {
          color: #999;
        }

        .compression-indicator {
          font-size: 0.7rem;
          opacity: 0.7;
        }

        .message-content {
          background: #f8f9fa;
          padding: 0.75rem;
          border-radius: 12px;
          max-width: 80%;
          word-wrap: break-word;
          color: #333;
          line-height: 1.4;
        }

        .own-message .message-content {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .message-actions {
          display: flex;
          gap: 0.25rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .message:hover .message-actions {
          opacity: 1;
        }

        .reaction-btn {
          background: none;
          border: none;
          font-size: 0.8rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .reaction-btn:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .message-reactions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .reaction {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .message-input-container {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.8);
          border-radius: 0 0 16px 16px;
        }

        .message-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          font-size: 0.9rem;
          outline: none;
        }

        .message-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }

        .send-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .chat-interface {
            width: calc(100vw - 2rem);
            height: calc(100vh - 4rem);
            bottom: 1rem;
            right: 1rem;
          }
        }
      ` })] }));
};
exports.ChatInterface = ChatInterface;
//# sourceMappingURL=ChatInterface.js.map