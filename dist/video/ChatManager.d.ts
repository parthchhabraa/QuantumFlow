/**
 * Real-time chat messaging with text compression optimization
 */
import { EventEmitter } from 'events';
import { QuantumCompressionEngine } from '../core/QuantumCompressionEngine';
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
        reactions?: Map<string, string[]>;
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
export declare class ChatManager extends EventEmitter {
    private compressionEngine;
    private rooms;
    private compressionConfig;
    private compressionThreshold;
    constructor(compressionEngine: QuantumCompressionEngine);
    /**
     * Create or get chat room
     */
    getOrCreateRoom(roomId: string, messageLimit?: number): ChatRoom;
    /**
     * Add participant to chat room
     */
    addParticipant(roomId: string, participantId: string, participantName: string): void;
    /**
     * Remove participant from chat room
     */
    removeParticipant(roomId: string, participantId: string, participantName: string): void;
    /**
     * Send a chat message
     */
    sendMessage(roomId: string, senderId: string, senderName: string, content: string, type?: 'text' | 'emoji' | 'file', metadata?: ChatMessage['metadata']): Promise<ChatMessage>;
    /**
     * Get messages for a room
     */
    getMessages(roomId: string, limit?: number, offset?: number): ChatMessage[];
    /**
     * Get recent messages
     */
    getRecentMessages(roomId: string, count?: number): ChatMessage[];
    /**
     * Search messages
     */
    searchMessages(roomId: string, query: string, limit?: number): Promise<ChatMessage[]>;
    /**
     * Add reaction to message
     */
    addReaction(roomId: string, messageId: string, participantId: string, emoji: string): void;
    /**
     * Remove reaction from message
     */
    removeReaction(roomId: string, messageId: string, participantId: string, emoji: string): void;
    /**
     * Get decompressed message content
     */
    getDecompressedContent(message: ChatMessage): Promise<string>;
    /**
     * Get chat statistics for a room
     */
    getChatStats(roomId: string): ChatStats | null;
    /**
     * Clear chat history for a room
     */
    clearChatHistory(roomId: string): void;
    /**
     * Delete a room
     */
    deleteRoom(roomId: string): void;
    /**
     * Add message to room
     */
    private addMessage;
    /**
     * Create system message
     */
    private createSystemMessage;
    /**
     * Update average compression ratio for room
     */
    private updateAverageCompressionRatio;
    /**
     * Generate unique message ID
     */
    private generateMessageId;
    /**
     * Clean up resources
     */
    destroy(): void;
}
//# sourceMappingURL=ChatManager.d.ts.map