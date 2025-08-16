import React from 'react';
import { Participant } from '../../video/models/WebRTCModels';
interface ParticipantListProps {
    participants: Map<string, Participant>;
    currentUserId: string;
    onClose: () => void;
}
export declare const ParticipantList: React.FC<ParticipantListProps>;
export {};
//# sourceMappingURL=ParticipantList.d.ts.map