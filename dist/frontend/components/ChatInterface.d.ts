import React from 'react';
import { ChatManager } from '../../video/ChatManager';
interface ChatInterfaceProps {
    chatManager: ChatManager;
    roomId: string;
    participantId: string;
    participantName: string;
    isVisible: boolean;
    onToggleVisibility: () => void;
}
export declare const ChatInterface: React.FC<ChatInterfaceProps>;
export {};
//# sourceMappingURL=ChatInterface.d.ts.map