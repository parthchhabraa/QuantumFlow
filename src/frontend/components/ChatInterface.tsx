import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatManager, ChatMessage, ChatStats } from '../../video/ChatManager';

interface ChatInterfaceProps {
  chatManager: ChatManager;
  roomId: string;
  participantId: string;
  participantName: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatManager,
  roomId,
  participantId,
  participantName,
  isVisible,
  onToggleVisibility
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [chatStats, setChatStats] = useState<ChatStats | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load initial messages
  useEffect(() => {
    const initialMessages = chatManager.getRecentMessages(roomId, 50);
    setMessages(initialMessages);
  }, [chatManager, roomId]);

  // Listen for new messages
  useEffect(() => {
    const handleMessageAdded = ({ message }: { message: ChatMessage }) => {
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
  useEffect(() => {
    if (isVisible) {
      setUnreadCount(0);
    }
  }, [isVisible]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isVisible) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isVisible]);

  // Load chat stats
  useEffect(() => {
    if (showStats) {
      const stats = chatManager.getChatStats(roomId);
      setChatStats(stats);
    }
  }, [chatManager, roomId, showStats, messages]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    try {
      await chatManager.sendMessage(
        roomId,
        participantId,
        participantName,
        newMessage.trim()
      );
      setNewMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [chatManager, roomId, participantId, participantName, newMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await chatManager.searchMessages(roomId, searchQuery.trim(), 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  }, [chatManager, roomId, searchQuery]);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    chatManager.addReaction(roomId, messageId, participantId, emoji);
  }, [chatManager, roomId, participantId]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString();
  };

  const renderMessage = (message: ChatMessage) => {
    const isOwnMessage = message.senderId === participantId;
    const isSystemMessage = message.type === 'system';

    return (
      <div
        key={message.id}
        className={`message ${isOwnMessage ? 'own-message' : ''} ${isSystemMessage ? 'system-message' : ''}`}
      >
        {!isSystemMessage && (
          <div className="message-header">
            <span className="sender-name">{message.senderName}</span>
            <span className="message-time">{formatTimestamp(message.timestamp)}</span>
            {message.isCompressed && (
              <span className="compression-indicator" title={`Compressed ${message.compressionRatio?.toFixed(1)}x`}>
                🗜️
              </span>
            )}
          </div>
        )}
        
        <div className="message-content">
          {message.content}
        </div>

        {!isSystemMessage && (
          <div className="message-actions">
            <button
              className="reaction-btn"
              onClick={() => addReaction(message.id, '👍')}
              title="Like"
            >
              👍
            </button>
            <button
              className="reaction-btn"
              onClick={() => addReaction(message.id, '❤️')}
              title="Love"
            >
              ❤️
            </button>
            <button
              className="reaction-btn"
              onClick={() => addReaction(message.id, '😂')}
              title="Laugh"
            >
              😂
            </button>
          </div>
        )}

        {message.metadata?.reactions && message.metadata.reactions.size > 0 && (
          <div className="message-reactions">
            {Array.from(message.metadata.reactions.entries()).map(([emoji, participants]) => (
              <span key={emoji} className="reaction" title={`${participants.join(', ')}`}>
                {emoji} {participants.length}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isVisible) {
    return (
      <div className="chat-toggle">
        <button className="chat-toggle-btn" onClick={onToggleVisibility}>
          💬
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-title">
          <h3>Chat</h3>
          <span className="participant-count">{messages.length} messages</span>
        </div>
        
        <div className="chat-controls">
          <button
            className={`control-btn ${showSearch ? 'active' : ''}`}
            onClick={() => setShowSearch(!showSearch)}
            title="Search messages"
          >
            🔍
          </button>
          <button
            className={`control-btn ${showStats ? 'active' : ''}`}
            onClick={() => setShowStats(!showStats)}
            title="Chat statistics"
          >
            📊
          </button>
          <button
            className="control-btn"
            onClick={onToggleVisibility}
            title="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="search-section">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-btn">
              Search
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="search-results">
              <h4>Search Results ({searchResults.length})</h4>
              <div className="search-messages">
                {searchResults.map(renderMessage)}
              </div>
            </div>
          )}
        </div>
      )}

      {showStats && chatStats && (
        <div className="stats-section">
          <h4>Chat Statistics</h4>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-label">Messages:</span>
              <span className="stat-value">{chatStats.totalMessages}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Characters:</span>
              <span className="stat-value">{chatStats.totalCharacters.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Compression:</span>
              <span className="stat-value">{chatStats.overallCompressionRatio.toFixed(1)}x</span>
            </div>
            <div className="stat">
              <span className="stat-label">Saved:</span>
              <span className="stat-value">{(chatStats.bytesSaved / 1024).toFixed(1)} KB</span>
            </div>
            <div className="stat">
              <span className="stat-label">Rate:</span>
              <span className="stat-value">{chatStats.messagesPerMinute.toFixed(1)}/min</span>
            </div>
          </div>
        </div>
      )}

      <div className="messages-container">
        <div className="messages-list">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="message-input-container">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="message-input"
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="send-btn"
        >
          Send
        </button>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};