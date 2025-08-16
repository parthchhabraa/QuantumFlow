import { ChatManager } from '../ChatManager';
import { QuantumCompressionEngine } from '../../core/QuantumCompressionEngine';

// Mock QuantumCompressionEngine
jest.mock('../../core/QuantumCompressionEngine');

describe('ChatManager', () => {
  let chatManager: ChatManager;
  let mockCompressionEngine: jest.Mocked<QuantumCompressionEngine>;

  beforeEach(() => {
    mockCompressionEngine = new QuantumCompressionEngine() as jest.Mocked<QuantumCompressionEngine>;
    mockCompressionEngine.compress = jest.fn().mockResolvedValue(Buffer.from('compressed'));
    mockCompressionEngine.decompress = jest.fn().mockResolvedValue(Buffer.from('decompressed'));

    chatManager = new ChatManager(mockCompressionEngine);
  });

  afterEach(() => {
    chatManager.destroy();
    jest.clearAllMocks();
  });

  describe('room management', () => {
    it('should create a new room', () => {
      const room = chatManager.getOrCreateRoom('test-room');

      expect(room.roomId).toBe('test-room');
      expect(room.participants.size).toBe(0);
      expect(room.messages.length).toBe(0);
    });

    it('should return existing room', () => {
      const room1 = chatManager.getOrCreateRoom('test-room');
      const room2 = chatManager.getOrCreateRoom('test-room');

      expect(room1).toBe(room2);
    });

    it('should use custom message limit', () => {
      const room = chatManager.getOrCreateRoom('test-room', 500);

      expect(room.messageLimit).toBe(500);
    });
  });

  describe('participant management', () => {
    it('should add participant to room', () => {
      const messageAddedSpy = jest.fn();
      chatManager.on('message-added', messageAddedSpy);

      chatManager.addParticipant('test-room', 'user1', 'User 1');

      const room = chatManager.getOrCreateRoom('test-room');
      expect(room.participants.has('user1')).toBe(true);
      expect(messageAddedSpy).toHaveBeenCalled();
      
      const systemMessage = messageAddedSpy.mock.calls[0][0].message;
      expect(systemMessage.type).toBe('system');
      expect(systemMessage.content).toContain('User 1 joined the chat');
    });

    it('should not add duplicate participants', () => {
      chatManager.addParticipant('test-room', 'user1', 'User 1');
      chatManager.addParticipant('test-room', 'user1', 'User 1');

      const room = chatManager.getOrCreateRoom('test-room');
      expect(room.participants.size).toBe(1);
    });

    it('should remove participant from room', () => {
      const messageAddedSpy = jest.fn();
      chatManager.on('message-added', messageAddedSpy);

      chatManager.addParticipant('test-room', 'user1', 'User 1');
      messageAddedSpy.mockClear();

      chatManager.removeParticipant('test-room', 'user1', 'User 1');

      const room = chatManager.getOrCreateRoom('test-room');
      expect(room.participants.has('user1')).toBe(false);
      expect(messageAddedSpy).toHaveBeenCalled();
      
      const systemMessage = messageAddedSpy.mock.calls[0][0].message;
      expect(systemMessage.content).toContain('User 1 left the chat');
    });
  });

  describe('message sending', () => {
    beforeEach(() => {
      chatManager.addParticipant('test-room', 'user1', 'User 1');
    });

    it('should send text message', async () => {
      const messageAddedSpy = jest.fn();
      chatManager.on('message-added', messageAddedSpy);

      const message = await chatManager.sendMessage(
        'test-room',
        'user1',
        'User 1',
        'Hello world!'
      );

      expect(message.content).toBe('Hello world!');
      expect(message.type).toBe('text');
      expect(message.senderId).toBe('user1');
      expect(message.senderName).toBe('User 1');
      expect(message.isCompressed).toBe(false);
      expect(messageAddedSpy).toHaveBeenCalled();
    });

    it('should compress long messages', async () => {
      const longMessage = 'A'.repeat(100); // Above compression threshold
      
      const message = await chatManager.sendMessage(
        'test-room',
        'user1',
        'User 1',
        longMessage
      );

      expect(message.isCompressed).toBe(true);
      expect(message.originalSize).toBe(100);
      expect(message.compressionRatio).toBeGreaterThan(1);
      expect(mockCompressionEngine.compress).toHaveBeenCalled();
    });

    it('should not compress short messages', async () => {
      const shortMessage = 'Hi!';
      
      const message = await chatManager.sendMessage(
        'test-room',
        'user1',
        'User 1',
        shortMessage
      );

      expect(message.isCompressed).toBe(false);
      expect(mockCompressionEngine.compress).not.toHaveBeenCalled();
    });

    it('should handle compression failure gracefully', async () => {
      mockCompressionEngine.compress.mockRejectedValue(new Error('Compression failed'));
      const longMessage = 'A'.repeat(100);
      
      const message = await chatManager.sendMessage(
        'test-room',
        'user1',
        'User 1',
        longMessage
      );

      expect(message.isCompressed).toBe(false);
      expect(message.content).toBe(longMessage);
    });

    it('should throw error for non-participant', async () => {
      await expect(
        chatManager.sendMessage('test-room', 'user2', 'User 2', 'Hello')
      ).rejects.toThrow('Participant not in room');
    });

    it('should send emoji message', async () => {
      const message = await chatManager.sendMessage(
        'test-room',
        'user1',
        'User 1',
        '😀',
        'emoji'
      );

      expect(message.type).toBe('emoji');
      expect(message.content).toBe('😀');
    });

    it('should send message with metadata', async () => {
      const metadata = {
        replyToId: 'msg123',
        mentions: ['user2']
      };

      const message = await chatManager.sendMessage(
        'test-room',
        'user1',
        'User 1',
        'Hello @user2',
        'text',
        metadata
      );

      expect(message.metadata).toEqual(metadata);
    });
  });

  describe('message retrieval', () => {
    beforeEach(async () => {
      chatManager.addParticipant('test-room', 'user1', 'User 1');
      
      // Send some test messages
      for (let i = 1; i <= 5; i++) {
        await chatManager.sendMessage('test-room', 'user1', 'User 1', `Message ${i}`);
      }
    });

    it('should get all messages', () => {
      const messages = chatManager.getMessages('test-room');
      
      // 5 messages + 1 system message (user joined)
      expect(messages.length).toBe(6);
    });

    it('should get messages with limit', () => {
      const messages = chatManager.getMessages('test-room', 3);
      
      expect(messages.length).toBe(3);
    });

    it('should get messages with offset', () => {
      const messages = chatManager.getMessages('test-room', undefined, 2);
      
      expect(messages.length).toBe(4); // 6 total - 2 offset
    });

    it('should get recent messages', () => {
      const messages = chatManager.getRecentMessages('test-room', 3);
      
      expect(messages.length).toBe(3);
      expect(messages[messages.length - 1].content).toBe('Message 5');
    });

    it('should return empty array for non-existent room', () => {
      const messages = chatManager.getMessages('non-existent');
      
      expect(messages).toEqual([]);
    });
  });

  describe('message search', () => {
    beforeEach(async () => {
      chatManager.addParticipant('test-room', 'user1', 'User 1');
      
      await chatManager.sendMessage('test-room', 'user1', 'User 1', 'Hello world');
      await chatManager.sendMessage('test-room', 'user1', 'User 1', 'How are you?');
      await chatManager.sendMessage('test-room', 'user1', 'User 1', 'Goodbye world');
    });

    it('should search messages by content', async () => {
      const results = await chatManager.searchMessages('test-room', 'world');
      
      expect(results.length).toBe(2);
      expect(results[0].content).toContain('world');
      expect(results[1].content).toContain('world');
    });

    it('should search messages by sender name', async () => {
      const results = await chatManager.searchMessages('test-room', 'User 1');
      
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', async () => {
      const results = await chatManager.searchMessages('test-room', 'WORLD');
      
      expect(results.length).toBe(2);
    });

    it('should limit search results', async () => {
      const results = await chatManager.searchMessages('test-room', 'world', 1);
      
      expect(results.length).toBe(1);
    });

    it('should decompress messages for search', async () => {
      // Send a long message that will be compressed
      const longMessage = 'world '.repeat(20);
      await chatManager.sendMessage('test-room', 'user1', 'User 1', longMessage);
      
      const results = await chatManager.searchMessages('test-room', 'world');
      
      expect(results.length).toBeGreaterThan(2);
      expect(mockCompressionEngine.decompress).toHaveBeenCalled();
    });

    it('should handle decompression errors', async () => {
      mockCompressionEngine.decompress.mockRejectedValue(new Error('Decompression failed'));
      
      // Send a long message that will be compressed
      const longMessage = 'world '.repeat(20);
      await chatManager.sendMessage('test-room', 'user1', 'User 1', longMessage);
      
      const results = await chatManager.searchMessages('test-room', 'world');
      
      // Should still return uncompressed messages
      expect(results.length).toBe(2);
    });
  });

  describe('reactions', () => {
    let messageId: string;

    beforeEach(async () => {
      chatManager.addParticipant('test-room', 'user1', 'User 1');
      chatManager.addParticipant('test-room', 'user2', 'User 2');
      
      const message = await chatManager.sendMessage('test-room', 'user1', 'User 1', 'Hello!');
      messageId = message.id;
    });

    it('should add reaction to message', () => {
      const reactionAddedSpy = jest.fn();
      chatManager.on('reaction-added', reactionAddedSpy);

      chatManager.addReaction('test-room', messageId, 'user2', '👍');

      expect(reactionAddedSpy).toHaveBeenCalledWith({
        roomId: 'test-room',
        messageId,
        participantId: 'user2',
        emoji: '👍'
      });

      const messages = chatManager.getMessages('test-room');
      const message = messages.find(m => m.id === messageId);
      expect(message?.metadata?.reactions?.get('👍')).toContain('user2');
    });

    it('should not add duplicate reactions', () => {
      chatManager.addReaction('test-room', messageId, 'user2', '👍');
      chatManager.addReaction('test-room', messageId, 'user2', '👍');

      const messages = chatManager.getMessages('test-room');
      const message = messages.find(m => m.id === messageId);
      expect(message?.metadata?.reactions?.get('👍')?.length).toBe(1);
    });

    it('should remove reaction from message', () => {
      const reactionRemovedSpy = jest.fn();
      chatManager.on('reaction-removed', reactionRemovedSpy);

      chatManager.addReaction('test-room', messageId, 'user2', '👍');
      chatManager.removeReaction('test-room', messageId, 'user2', '👍');

      expect(reactionRemovedSpy).toHaveBeenCalledWith({
        roomId: 'test-room',
        messageId,
        participantId: 'user2',
        emoji: '👍'
      });

      const messages = chatManager.getMessages('test-room');
      const message = messages.find(m => m.id === messageId);
      expect(message?.metadata?.reactions?.has('👍')).toBe(false);
    });
  });

  describe('message decompression', () => {
    beforeEach(() => {
      chatManager.addParticipant('test-room', 'user1', 'User 1');
    });

    it('should decompress compressed message', async () => {
      const longMessage = 'A'.repeat(100);
      const message = await chatManager.sendMessage('test-room', 'user1', 'User 1', longMessage);
      
      const decompressed = await chatManager.getDecompressedContent(message);
      
      expect(mockCompressionEngine.decompress).toHaveBeenCalled();
      expect(decompressed).toBe('decompressed');
    });

    it('should return original content for uncompressed message', async () => {
      const message = await chatManager.sendMessage('test-room', 'user1', 'User 1', 'Hello');
      
      const content = await chatManager.getDecompressedContent(message);
      
      expect(content).toBe('Hello');
      expect(mockCompressionEngine.decompress).not.toHaveBeenCalled();
    });

    it('should handle decompression errors', async () => {
      mockCompressionEngine.decompress.mockRejectedValue(new Error('Decompression failed'));
      
      const longMessage = 'A'.repeat(100);
      const message = await chatManager.sendMessage('test-room', 'user1', 'User 1', longMessage);
      
      const content = await chatManager.getDecompressedContent(message);
      
      expect(content).toBe('[Message could not be decompressed]');
    });
  });

  describe('chat statistics', () => {
    beforeEach(async () => {
      chatManager.addParticipant('test-room', 'user1', 'User 1');
      chatManager.addParticipant('test-room', 'user2', 'User 2');
      
      await chatManager.sendMessage('test-room', 'user1', 'User 1', 'Hello');
      await chatManager.sendMessage('test-room', 'user2', 'User 2', '👍', 'emoji');
      await chatManager.sendMessage('test-room', 'user1', 'User 1', 'A'.repeat(100)); // Compressed
    });

    it('should calculate chat statistics', () => {
      const stats = chatManager.getChatStats('test-room');
      
      expect(stats).toBeDefined();
      expect(stats!.totalMessages).toBe(5); // 3 messages + 2 system messages
      expect(stats!.messageTypeDistribution.text).toBe(2);
      expect(stats!.messageTypeDistribution.emoji).toBe(1);
      expect(stats!.messageTypeDistribution.system).toBe(2);
      expect(stats!.overallCompressionRatio).toBeGreaterThan(1);
    });

    it('should return null for non-existent room', () => {
      const stats = chatManager.getChatStats('non-existent');
      
      expect(stats).toBeNull();
    });

    it('should calculate messages per minute', () => {
      const stats = chatManager.getChatStats('test-room');
      
      expect(stats!.messagesPerMinute).toBeGreaterThan(0);
    });

    it('should identify most active participant', () => {
      const stats = chatManager.getChatStats('test-room');
      
      expect(stats!.mostActiveParticipant).toBe('user1'); // 2 messages vs 1
    });
  });

  describe('room management', () => {
    beforeEach(async () => {
      chatManager.addParticipant('test-room', 'user1', 'User 1');
      await chatManager.sendMessage('test-room', 'user1', 'User 1', 'Hello');
    });

    it('should clear chat history', () => {
      const chatClearedSpy = jest.fn();
      chatManager.on('chat-cleared', chatClearedSpy);

      chatManager.clearChatHistory('test-room');

      const room = chatManager.getOrCreateRoom('test-room');
      expect(room.messages.length).toBe(0);
      expect(room.totalMessages).toBe(0);
      expect(chatClearedSpy).toHaveBeenCalledWith({ roomId: 'test-room' });
    });

    it('should delete room', () => {
      const roomDeletedSpy = jest.fn();
      chatManager.on('room-deleted', roomDeletedSpy);

      chatManager.deleteRoom('test-room');

      expect(roomDeletedSpy).toHaveBeenCalledWith({ roomId: 'test-room' });
      
      // Creating room again should start fresh
      const newRoom = chatManager.getOrCreateRoom('test-room');
      expect(newRoom.messages.length).toBe(0);
    });
  });

  describe('message limits', () => {
    beforeEach(() => {
      chatManager.addParticipant('test-room', 'user1', 'User 1');
    });

    it('should enforce message limit', async () => {
      const room = chatManager.getOrCreateRoom('test-room', 3); // Limit to 3 messages
      
      // Send 5 messages
      for (let i = 1; i <= 5; i++) {
        await chatManager.sendMessage('test-room', 'user1', 'User 1', `Message ${i}`);
      }

      expect(room.messages.length).toBe(3);
      // Should keep the most recent messages
      expect(room.messages[room.messages.length - 1].content).toBe('Message 5');
    });
  });
});