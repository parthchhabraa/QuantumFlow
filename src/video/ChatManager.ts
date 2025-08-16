/**
 * Real-time chat messaging with text compression optimization
 */

import { EventEmitter } from 'events';
import { QuantumCompressionEngine } from '../core/QuantumCompressionEngine';
import { QuantumConfig } from '../models/QuantumConfig';

export interface ChatMessage {
  /** Message ID */
  id: string;
  /** Room ID */
  roomId: string;
  /** Sender participant ID */
  senderId: string;
  /** Sender name */
  senderName: string;
  /** Message content */
  content: string;
  /** Message type */
  type: 'text' | 'emoji' | 'file' | 'system';
  /** Timestamp */
  timestamp: number;
  /** Whether message is compressed */
  isCompressed: boolean;
  /** Original size in bytes */
  originalSize?: number;
  /** Compressed size in bytes */
  compressedSize?: number;
  /** Compression ratio */
  compressionRatio?: number;
  /** Message metadata */
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyToId?: string;
    mentions?: string[];
    reactions?: Map<string, string[]>; // emoji -> participant IDs
  };
}

export interface ChatRoom {
  /** Room ID */
  roomId: string;
  /** Room participants */
  participants: Set<string>;
  /** Chat messages */
  messages: ChatMessage[];
  /** Message history limit */
  messageLimit: number;
  /** Total messages sent */
  totalMessages: number;
  /** Total bytes saved through compression */
  totalBytesSaved: number;
  /** Average compression ratio */
  averageCompressionRatio: number;
}

export interface ChatStats {
  /** Total messages */
  totalMessages: number;
  /** Total characters */
  totalCharacters: number;
  /** Total original size */
  totalOriginalSize: number;
  /** Total compressed size */
  totalCompressedSize: number;
  /** Overall compression ratio */
  overallCompressionRatio: number;
  /** Bytes saved */
  bytesSaved: number;
  /** Messages per minute */
  messagesPerMinute: number;
  /** Most active participant */
  mostActiveParticipant: string;
  /** Message type distribution */
  messageTypeDistribution: {
    text: number;
    emoji: number;
    file: number;
    system: number;
  };
}

export class ChatManager extends EventEmitter {
  private compressionEngine: QuantumCompressionEngine;
  private rooms: Map<string, ChatRoom> = new Map();
  private compressionConfig: QuantumConfig;
  private compressionThreshold = 50; // Compress messages longer than 50 characters

  constructor(compressionEngine: QuantumCompressionEngine) {
    super();
    this.compressionEngine = compressionEngine;
    
    // Optimized config for text compression
    this.compressionConfig = new QuantumConfig({
      quantumBitDepth: 4, // Lower bit depth for text
      maxEntanglementLevel: 3, // Moderate entanglement for text patterns
      superpositionComplexity: 6, // Higher complexity for text redundancy
      interferenceThreshold: 0.7 // Higher threshold for text optimization
    });
  }

  /**
   * Create or get chat room
   */
  getOrCreateRoom(roomId: string, messageLimit: number = 1000): ChatRoom {
    if (!this.rooms.has(roomId)) {
      const room: ChatRoom = {
        roomId,
        participants: new Set(),
        messages: [],
        messageLimit,
        totalMessages: 0,
        totalBytesSaved: 0,
        averageCompressionRatio: 1.0
      };
      this.rooms.set(roomId, room);
    }
    return this.rooms.get(roomId)!;
  }

  /**
   * Add participant to chat room
   */
  addParticipant(roomId: string, participantId: string, participantName: string): void {
    const room = this.getOrCreateRoom(roomId);
    
    if (!room.participants.has(participantId)) {
      room.participants.add(participantId);
      
      // Send system message
      const systemMessage = this.createSystemMessage(
        roomId,
        `${participantName} joined the chat`
      );
      this.addMessage(systemMessage);
    }
  }

  /**
   * Remove participant from chat room
   */
  removeParticipant(roomId: string, participantId: string, participantName: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.participants.has(participantId)) {
      room.participants.delete(participantId);
      
      // Send system message
      const systemMessage = this.createSystemMessage(
        roomId,
        `${participantName} left the chat`
      );
      this.addMessage(systemMessage);
    }
  }

  /**
   * Send a chat message
   */
  async sendMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: 'text' | 'emoji' | 'file' = 'text',
    metadata?: ChatMessage['metadata']
  ): Promise<ChatMessage> {
    const room = this.getOrCreateRoom(roomId);
    
    if (!room.participants.has(senderId)) {
      throw new Error('Participant not in room');
    }

    const message: ChatMessage = {
      id: this.generateMessageId(),
      roomId,
      senderId,
      senderName,
      content,
      type,
      timestamp: Date.now(),
      isCompressed: false,
      metadata
    };

    // Apply compression for text messages above threshold
    if (type === 'text' && content.length > this.compressionThreshold) {
      try {
        const originalBuffer = Buffer.from(content, 'utf8');
        const compressed = await this.compressionEngine.compress(originalBuffer, this.compressionConfig);
        
        message.content = compressed.toString('base64');
        message.isCompressed = true;
        message.originalSize = originalBuffer.length;
        message.compressedSize = compressed.length;
        message.compressionRatio = originalBuffer.length / compressed.length;

        // Update room statistics
        room.totalBytesSaved += (originalBuffer.length - compressed.length);
        this.updateAverageCompressionRatio(room, message.compressionRatio);
      } catch (error) {
        console.warn('Failed to compress message, sending uncompressed:', error);
      }
    }

    this.addMessage(message);
    return message;
  }

  /**
   * Get messages for a room
   */
  getMessages(roomId: string, limit?: number, offset?: number): ChatMessage[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    let messages = [...room.messages];
    
    if (offset) {
      messages = messages.slice(offset);
    }
    
    if (limit) {
      messages = messages.slice(0, limit);
    }

    return messages;
  }

  /**
   * Get recent messages
   */
  getRecentMessages(roomId: string, count: number = 50): ChatMessage[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return room.messages.slice(-count);
  }

  /**
   * Search messages
   */
  async searchMessages(
    roomId: string,
    query: string,
    limit: number = 20
  ): Promise<ChatMessage[]> {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const results: ChatMessage[] = [];
    const queryLower = query.toLowerCase();

    for (const message of room.messages) {
      if (results.length >= limit) break;

      let content = message.content;
      
      // Decompress if needed for search
      if (message.isCompressed) {
        try {
          const compressedBuffer = Buffer.from(message.content, 'base64');
          const decompressed = await this.compressionEngine.decompress(compressedBuffer);
          content = decompressed.toString('utf8');
        } catch (error) {
          console.warn('Failed to decompress message for search:', error);
          continue;
        }
      }

      if (content.toLowerCase().includes(queryLower) ||
          message.senderName.toLowerCase().includes(queryLower)) {
        // Return decompressed version for display
        const searchResult = { ...message };
        if (message.isCompressed) {
          searchResult.content = content;
          searchResult.isCompressed = false;
        }
        results.push(searchResult);
      }
    }

    return results;
  }

  /**
   * Add reaction to message
   */
  addReaction(roomId: string, messageId: string, participantId: string, emoji: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const message = room.messages.find(m => m.id === messageId);
    if (!message) return;

    if (!message.metadata) {
      message.metadata = {};
    }
    if (!message.metadata.reactions) {
      message.metadata.reactions = new Map();
    }

    const reactions = message.metadata.reactions;
    if (!reactions.has(emoji)) {
      reactions.set(emoji, []);
    }

    const participantReactions = reactions.get(emoji)!;
    if (!participantReactions.includes(participantId)) {
      participantReactions.push(participantId);
      this.emit('reaction-added', { roomId, messageId, participantId, emoji });
    }
  }

  /**
   * Remove reaction from message
   */
  removeReaction(roomId: string, messageId: string, participantId: string, emoji: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const message = room.messages.find(m => m.id === messageId);
    if (!message?.metadata?.reactions) return;

    const reactions = message.metadata.reactions;
    const participantReactions = reactions.get(emoji);
    
    if (participantReactions) {
      const index = participantReactions.indexOf(participantId);
      if (index > -1) {
        participantReactions.splice(index, 1);
        
        if (participantReactions.length === 0) {
          reactions.delete(emoji);
        }
        
        this.emit('reaction-removed', { roomId, messageId, participantId, emoji });
      }
    }
  }

  /**
   * Get decompressed message content
   */
  async getDecompressedContent(message: ChatMessage): Promise<string> {
    if (!message.isCompressed) {
      return message.content;
    }

    try {
      const compressedBuffer = Buffer.from(message.content, 'base64');
      const decompressed = await this.compressionEngine.decompress(compressedBuffer);
      return decompressed.toString('utf8');
    } catch (error) {
      console.error('Failed to decompress message:', error);
      return '[Message could not be decompressed]';
    }
  }

  /**
   * Get chat statistics for a room
   */
  getChatStats(roomId: string): ChatStats | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const stats: ChatStats = {
      totalMessages: room.messages.length,
      totalCharacters: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      overallCompressionRatio: 1.0,
      bytesSaved: room.totalBytesSaved,
      messagesPerMinute: 0,
      mostActiveParticipant: '',
      messageTypeDistribution: {
        text: 0,
        emoji: 0,
        file: 0,
        system: 0
      }
    };

    const participantMessageCount = new Map<string, number>();
    let oldestTimestamp = Date.now();

    for (const message of room.messages) {
      // Count characters
      stats.totalCharacters += message.content.length;
      
      // Count sizes
      if (message.originalSize) {
        stats.totalOriginalSize += message.originalSize;
        stats.totalCompressedSize += message.compressedSize || message.content.length;
      } else {
        const size = Buffer.from(message.content, 'utf8').length;
        stats.totalOriginalSize += size;
        stats.totalCompressedSize += size;
      }

      // Count message types
      stats.messageTypeDistribution[message.type]++;

      // Track participant activity
      const count = participantMessageCount.get(message.senderId) || 0;
      participantMessageCount.set(message.senderId, count + 1);

      // Track oldest message
      if (message.timestamp < oldestTimestamp) {
        oldestTimestamp = message.timestamp;
      }
    }

    // Calculate compression ratio
    if (stats.totalOriginalSize > 0) {
      stats.overallCompressionRatio = stats.totalOriginalSize / stats.totalCompressedSize;
    }

    // Calculate messages per minute
    const durationMinutes = (Date.now() - oldestTimestamp) / (1000 * 60);
    if (durationMinutes > 0) {
      stats.messagesPerMinute = stats.totalMessages / durationMinutes;
    }

    // Find most active participant
    let maxMessages = 0;
    for (const [participantId, count] of participantMessageCount) {
      if (count > maxMessages) {
        maxMessages = count;
        stats.mostActiveParticipant = participantId;
      }
    }

    return stats;
  }

  /**
   * Clear chat history for a room
   */
  clearChatHistory(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.messages = [];
    room.totalMessages = 0;
    room.totalBytesSaved = 0;
    room.averageCompressionRatio = 1.0;

    this.emit('chat-cleared', { roomId });
  }

  /**
   * Delete a room
   */
  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
    this.emit('room-deleted', { roomId });
  }

  /**
   * Add message to room
   */
  private addMessage(message: ChatMessage): void {
    const room = this.rooms.get(message.roomId);
    if (!room) return;

    room.messages.push(message);
    room.totalMessages++;

    // Enforce message limit
    if (room.messages.length > room.messageLimit) {
      room.messages.shift();
    }

    this.emit('message-added', { message });
  }

  /**
   * Create system message
   */
  private createSystemMessage(roomId: string, content: string): ChatMessage {
    return {
      id: this.generateMessageId(),
      roomId,
      senderId: 'system',
      senderName: 'System',
      content,
      type: 'system',
      timestamp: Date.now(),
      isCompressed: false
    };
  }

  /**
   * Update average compression ratio for room
   */
  private updateAverageCompressionRatio(room: ChatRoom, newRatio: number): void {
    const compressedMessages = room.messages.filter(m => m.isCompressed).length;
    if (compressedMessages === 0) {
      room.averageCompressionRatio = newRatio;
    } else {
      room.averageCompressionRatio = 
        (room.averageCompressionRatio * (compressedMessages - 1) + newRatio) / compressedMessages;
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.rooms.clear();
    this.removeAllListeners();
  }
}