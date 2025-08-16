import React from 'react';
import { CreateRoomRequest } from '../../video/models/WebRTCModels';
interface RoomCreationProps {
    onCreateRoom: (config: Partial<CreateRoomRequest>) => Promise<void>;
}
export declare const RoomCreation: React.FC<RoomCreationProps>;
export {};
//# sourceMappingURL=RoomCreation.d.ts.map